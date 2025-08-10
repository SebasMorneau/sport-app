import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { pool } from "./database";
import { User } from "./types";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  } as any);
};

export const verifyToken = (token: string): { userId: number } => {
  return jwt.verify(token, JWT_SECRET!) as { userId: number };
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token d'accès requis",
    });
  }

  try {
    const decoded = verifyToken(token);

    // Get user from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, email, nom, created_at, updated_at FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      req.user = result.rows[0] as User;
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token invalide",
    });
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
