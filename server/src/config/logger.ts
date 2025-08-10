import winston from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  // File transport for errors
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: "logs/combined.log",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from "fs";
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Add production-specific configuration
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/production.log",
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Structured logging helpers
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.http(
    `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`,
    {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      userId: req.user?.id,
    }
  );
};

export const logError = (error: Error, req?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    userId: req?.user?.id,
    ip: req?.ip,
  });
};

export const logSecurity = (event: string, details: any) => {
  logger.warn(`SECURITY: ${event}`, details);
};

export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: any
) => {
  logger.info(`PERFORMANCE: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...metadata,
  });
};

export default logger;
