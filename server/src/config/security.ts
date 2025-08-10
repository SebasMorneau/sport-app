import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import helmet from "helmet";
import { Request, Response } from "express";
import logger, { logSecurity } from "./logger";

// Rate limiting configurations
export const createRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logSecurity("Rate limit exceeded", {
        ip: req.ip,
        url: req.url,
        userAgent: req.get("User-Agent"),
        userId: (req as any).user?.id,
      });
      res.status(429).json({ error: message });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks in production
      return req.url === "/api/health" && process.env.NODE_ENV === "production";
    },
  });
};

// Different rate limits for different endpoints
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  "Too many requests from this IP, please try again later."
);

export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs for auth endpoints
  "Too many authentication attempts, please try again later."
);

export const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit uploads
  "Too many uploads, please try again later."
);

export const aiLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // limit AI requests
  "Too many AI requests, please try again later."
);

// Slow down middleware for progressive delays
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // maximum delay of 5 seconds
  skipFailedRequests: true,
  skipSuccessfulRequests: false,
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow for mobile app integration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration with security considerations
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : [
          "http://localhost:8081",
          "http://10.0.2.2:8081",
          "http://localhost:8088",
        ];

    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logSecurity("CORS violation", { origin, allowedOrigins });
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  maxAge: 86400, // 24 hours
};

// Input sanitization functions
export const sanitizeInput = (input: any): any => {
  if (typeof input === "string") {
    // Remove potential XSS attacks
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
};

// SQL injection prevention for dynamic queries
export const validateSqlInput = (input: string): boolean => {
  const sqlInjectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b|;|--|\/\*|\*\/|xp_|sp_)/i;
  return !sqlInjectionPattern.test(input);
};

// Security audit logging
export const auditLog = (
  action: string,
  userId: number | undefined,
  details: any,
  req: Request
) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
    details,
  });
};

// Detect suspicious patterns
export const detectSuspiciousActivity = (req: Request): boolean => {
  const suspiciousPatterns = [
    /\b(eval|exec|system|shell_exec|passthru)\b/i,
    /\b(union|select|insert|update|delete|drop)\b.*\b(from|into|table)\b/i,
    /<script|javascript:|on\w+\s*=/i,
    /\.\.(\/|\\)/,
    /\x00/,
  ];

  const checkContent =
    JSON.stringify(req.body) + req.url + JSON.stringify(req.query);

  return suspiciousPatterns.some((pattern) => pattern.test(checkContent));
};

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  speedLimiter,
  helmetConfig,
  corsOptions,
  sanitizeInput,
  validateSqlInput,
  auditLog,
  detectSuspiciousActivity,
};
