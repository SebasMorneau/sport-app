import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { cache, CACHE_TTL } from "../config/cache";
import logger, { logSecurity } from "../config/logger";

interface JwtPayload {
  userId: number;
  iat: number;
  exp: number;
}

interface AuthUser {
  id: number;
  email: string;
  nom: string;
  role?: string;
  isActive?: boolean;
}

interface AuthRequest extends Omit<Request, "user"> {
  user?: AuthUser;
}

// Security audit logging
const auditLog = (
  action: string,
  userId: number | undefined,
  details: any,
  req: AuthRequest
) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
    details,
  });
};

// Enhanced JWT verification with caching
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      logSecurity("Missing authentication token", {
        ip: req.ip,
        url: req.url,
        userAgent: req.get("User-Agent"),
      });
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    // Check cache first for user data
    let user = await cache.get(`user:${decoded.userId}`, { prefix: "auth" });

    if (!user) {
      // Fetch user from database
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT id, email, nom, created_at FROM users WHERE id = $1",
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          throw new Error("User not found");
        }

        user = result.rows[0];

        // Cache user data for 15 minutes
        await cache.set(`user:${decoded.userId}`, user, {
          ttl: CACHE_TTL.USER_PROFILE,
          prefix: "auth",
        });
      } finally {
        client.release();
      }
    }

    // Check if user account is active (you can add this field to users table)
    if ((user as any).isActive === false) {
      logSecurity("Inactive user attempted access", {
        userId: (user as any).id,
        ip: req.ip,
        url: req.url,
      });
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    // Add user to request
    req.user = {
      id: (user as any).id,
      email: (user as any).email,
      nom: (user as any).nom,
      role: (user as any).role || "user",
      isActive: (user as any).isActive !== false,
    };

    // Log successful authentication for audit
    auditLog("AUTH_SUCCESS", (user as any).id, { endpoint: req.url }, req);

    next();
  } catch (error: any) {
    logSecurity("Authentication failed", {
      error: error.message,
      ip: req.ip,
      url: req.url,
      userAgent: req.get("User-Agent"),
    });

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentification échouée",
      code: "AUTH_FAILED",
    });
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== "admin") {
      logSecurity("Insufficient permissions", {
        userId: req.user.id,
        requiredRole,
        userRole: req.user.role,
        ip: req.ip,
        url: req.url,
      });

      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
      });
    }

    next();
  };
};

// Resource ownership validation
export const requireOwnership = (
  resourceIdParam: string = "id",
  resourceType: string = "resource"
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID required",
        });
      }

      // Admin can access any resource
      if (req.user.role === "admin") {
        return next();
      }

      // Check ownership based on resource type
      const client = await pool.connect();
      try {
        let query = "";
        let params: any[] = [];

        switch (resourceType) {
          case "training":
            query = "SELECT user_id FROM trainings WHERE id = $1";
            params = [resourceId];
            break;
          case "exercise":
            query =
              "SELECT created_by FROM exercises WHERE id = $1 AND is_predefined = false";
            params = [resourceId];
            break;
          case "program":
            query =
              "SELECT created_by FROM programs WHERE id = $1 AND is_predefined = false";
            params = [resourceId];
            break;
          case "progress_photo":
            query = "SELECT user_id FROM progress_photos WHERE id = $1";
            params = [resourceId];
            break;
          case "body_measurement":
            query = "SELECT user_id FROM body_measurements WHERE id = $1";
            params = [resourceId];
            break;
          default:
            // Generic check for user_id column
            query = `SELECT user_id FROM ${resourceType} WHERE id = $1`;
            params = [resourceId];
        }

        const result = await client.query(query, params);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Resource not found",
          });
        }

        const ownerId = result.rows[0].user_id || result.rows[0].created_by;
        if (ownerId !== req.user.id) {
          logSecurity("Unauthorized resource access attempt", {
            userId: req.user.id,
            resourceType,
            resourceId,
            ownerId,
            ip: req.ip,
            url: req.url,
          });

          return res.status(403).json({
            success: false,
            message: "Access denied",
          });
        }

        next();
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Ownership check failed:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Optional authentication (for public endpoints that can show different content for authenticated users)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  if (!token) {
    return next(); // Continue without authentication
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (decoded.userId) {
      // Try to get user data (but don't fail if it doesn't exist)
      let user = await cache.get(`user:${decoded.userId}`, { prefix: "auth" });

      if (!user) {
        const client = await pool.connect();
        try {
          const result = await client.query(
            "SELECT id, email, nom FROM users WHERE id = $1",
            [decoded.userId]
          );

          if (result.rows.length > 0) {
            user = result.rows[0];
            await cache.set(`user:${decoded.userId}`, user, {
              ttl: CACHE_TTL.USER_PROFILE,
              prefix: "auth",
            });
          }
        } finally {
          client.release();
        }
      }

      if (user) {
        req.user = {
          id: (user as any).id,
          email: (user as any).email,
          nom: (user as any).nom,
          role: (user as any).role || "user",
        };
      }
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug("Optional auth failed (ignored):", error);
  }

  next();
};

// Session management
export const invalidateUserSessions = async (userId: number) => {
  try {
    // Clear user cache
    await cache.del(`user:${userId}`, { prefix: "auth" });

    // In a production system, you might also want to maintain a blacklist of tokens
    // or use a different token management strategy
    logger.info(`Invalidated sessions for user ${userId}`);
  } catch (error) {
    logger.error("Failed to invalidate user sessions:", error);
  }
};

// Token refresh endpoint helper
export const generateTokens = (userId: number) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error("JWT secrets not configured");
  }

  const accessToken = jwt.sign({ userId }, jwtSecret!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as any);

  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    jwtRefreshSecret!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" } as any
  );

  return { accessToken, refreshToken };
};

export default {
  authenticateToken,
  requireRole,
  requireOwnership,
  optionalAuth,
  invalidateUserSessions,
  generateTokens,
};
