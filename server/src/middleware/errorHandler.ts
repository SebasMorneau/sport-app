import { Request, Response, NextFunction } from "express";
import logger, { logError } from "../config/logger";

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types for better handling
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHZ_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT");
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = "External service unavailable") {
    super(message, 503, "EXTERNAL_SERVICE_ERROR");
  }
}

// Handle different types of errors
const handleDatabaseError = (error: any): AppError => {
  if (error.code === "23505") {
    // Unique violation
    return new ConflictError("Resource already exists");
  }
  if (error.code === "23503") {
    // Foreign key violation
    return new ValidationError("Referenced resource does not exist");
  }
  if (error.code === "23502") {
    // Not null violation
    return new ValidationError("Required field missing");
  }
  if (error.code === "22001") {
    // String data too long
    return new ValidationError("Input data too long");
  }
  if (error.code === "08006") {
    // Connection failure
    return new ExternalServiceError("Database connection failed");
  }

  return new DatabaseError("Database operation failed");
};

const handleJWTError = (error: any): AppError => {
  if (error.name === "TokenExpiredError") {
    return new AuthenticationError("Token expired");
  }
  if (error.name === "JsonWebTokenError") {
    return new AuthenticationError("Invalid token");
  }
  if (error.name === "NotBeforeError") {
    return new AuthenticationError("Token not active");
  }

  return new AuthenticationError("Authentication failed");
};

const handleValidationError = (error: any): AppError => {
  const message = error.details
    ? error.details[0].message
    : "Validation failed";
  return new ValidationError(message);
};

// Development error response
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code,
  });
};

// Production error response
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("Unknown error:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      code: "INTERNAL_ERROR",
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for monitoring
  logError(err, req);

  // Handle different error types
  if (err.name === "ValidationError" || err.isJoi) {
    error = handleValidationError(err);
  } else if (err.name && err.name.includes("JWT")) {
    error = handleJWTError(err);
  } else if (err.code && typeof err.code === "string") {
    error = handleDatabaseError(err);
  } else if (err.type === "entity.too.large") {
    error = new ValidationError("Request payload too large");
  } else if (err.type === "entity.parse.failed") {
    error = new ValidationError("Invalid JSON payload");
  } else if (!err.statusCode) {
    error = new AppError("Internal server error", 500, "INTERNAL_ERROR");
  }

  // Ensure error is an instance of AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
  }

  // Send error response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error as AppError, res);
  } else {
    sendErrorProd(error as AppError, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new NotFoundError(
    `Can't find ${req.originalUrl} on this server!`
  );
  next(err);
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  // Close server & exit process
  process.exit(1);
});

// Graceful shutdown handler
export const gracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
      logger.info("HTTP server closed.");

      // Close database connections
      // This should be implemented in your database module

      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 30000);
  };

  // Listen for termination signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

// Health check error handling
export const healthCheckHandler = async (req: Request, res: Response) => {
  try {
    // Import here to avoid circular dependencies
    const { checkDatabaseHealth, checkRedisHealth } = await import(
      "../config/database"
    );

    const dbHealth = await checkDatabaseHealth();
    const redisHealth = await checkRedisHealth();

    const isHealthy = dbHealth && redisHealth;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? "Server is healthy" : "Server has issues",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  globalErrorHandler,
  catchAsync,
  notFoundHandler,
  gracefulShutdown,
  healthCheckHandler,
};
