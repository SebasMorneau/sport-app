import express from "express";
import cors from "cors";
import path from "path";
import { envValidator } from "./config/validateEnv";
import { initDatabase } from "./database";
import { initRedis } from "./config/database";
import logger, { logPerformance } from "./config/logger";
import { cache } from "./config/cache";
import { pool } from "./database"; // Added import for pool

// Validate environment variables before starting the server
try {
  envValidator.validate();
  envValidator.logConfiguration();
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  process.exit(1);
}
import {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  speedLimiter,
  helmetConfig,
  corsOptions,
} from "./config/security";
import {
  globalErrorHandler,
  notFoundHandler,
  gracefulShutdown,
  healthCheckHandler,
} from "./middleware/errorHandler";
import { validateRequestSize } from "./middleware/validation";
import authRoutes from "./routes/auth";
import exerciseRoutes from "./routes/exercises";
import trainingRoutes from "./routes/trainings";
import programRoutes from "./routes/programs";
import progressRoutes from "./routes/progress";
import socialRoutes from "./routes/social";
import nutritionRoutes from "./routes/nutrition";
import aiRoutes from "./routes/ai";
import wearablesRoutes from "./routes/wearables";
import syncRoutes from "./routes/sync";

const app = express();
const PORT = process.env.PORT || 3500;

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Apply helmet security headers
app.use(helmetConfig);

// Apply rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// CORS configuration with enhanced security
app.use(cors(corsOptions));

// Request size validation
app.use(validateRequestSize(10 * 1024 * 1024)); // 10MB limit

// Body parsing with enhanced security
app.use(
  express.json({
    limit: "10mb",
    type: "application/json",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 1000,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: (req as any).user?.id,
    });

    // Log slow requests
    if (duration > 1000) {
      logPerformance("SLOW_REQUEST", duration, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });
    }
  });
  next();
});

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes with specific rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/progress", uploadLimiter, progressRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/wearables", wearablesRoutes);
app.use("/api/sync", syncRoutes);

// Health check endpoint
app.get("/api/health", healthCheckHandler);

// Detailed health check with system info
app.get("/api/health/detailed", async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const cacheHealth = await cache.healthCheck();
    const cacheStats = await cache.getStats();

    res.json({
      status: "OK",
      message: "SportApp Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      health: {
        database: dbHealth,
        cache: cacheHealth,
      },
      cache: cacheStats,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
    });
  } catch (error) {
    logger.error("Detailed health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Database health check function
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch (error) {
    logger.error("Database health check failed:", error);
    return false;
  }
};

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Initialize database and start server
const startServer = async () => {
  const startTime = Date.now();

  try {
    logger.info("Starting SportApp server...", {
      environment: process.env.NODE_ENV || "development",
      port: PORT,
    });

    // Initialize database
    logger.info("Initializing database...");
    await initDatabase();
    logger.info("Database initialized successfully");

    // Initialize Redis
    logger.info("Initializing Redis cache...");
    await initRedis();
    logger.info("Redis cache initialized successfully");

    // Start server
    const server = app.listen(PORT, () => {
      const startupTime = Date.now() - startTime;
      logger.info(`Server started successfully in ${startupTime}ms`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        startupTime: `${startupTime}ms`,
      });
    });

    // Setup graceful shutdown
    gracefulShutdown(server);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
