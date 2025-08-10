import { Pool, PoolConfig } from "pg";
import { createClient } from "redis";
import logger from "./logger";

// Database configuration with connection pooling optimization
const getDatabaseConfig = (): PoolConfig => {
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "sportapp",
    user: process.env.DB_USER || "sportapp_user",
    password: process.env.DB_PASSWORD,

    // Connection pool optimization for production
    max: parseInt(process.env.DB_POOL_MAX || "20"), // Maximum connections
    min: parseInt(process.env.DB_POOL_MIN || "2"), // Minimum connections

    // Connection timeout
    connectionTimeoutMillis: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || "5000"
    ),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),

    // SSL configuration for production
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false, // Set to true with proper certificates in production
          }
        : false,
  };
};

// Optimized PostgreSQL pool
export const pool = new Pool(getDatabaseConfig());

// Enhanced pool event handling
pool.on("connect", (client) => {
  logger.debug("Database client connected");
});

pool.on("acquire", (client) => {
  logger.debug("Database client acquired from pool");
});

pool.on("remove", (client) => {
  logger.debug("Database client removed from pool");
});

pool.on("error", (err, client) => {
  logger.error("Database pool error:", err);
});

// Redis configuration for caching
const getRedisConfig = () => {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),

    // Connection settings
    connectTimeout: 5000,
    lazyConnect: true,

    // Retry strategy
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,

    // Keep alive
    keepAlive: 30000,
  };
};

// Redis client for caching
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB || "0"),
});

// Redis connection handling
redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("ready", () => {
  logger.info("Redis client ready");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error:", err);
});

redisClient.on("end", () => {
  logger.info("Redis client disconnected");
});

// Initialize Redis connection
export const initRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("✅ Redis connected successfully");
    return true;
  } catch (error) {
    logger.error("❌ Redis connection failed:", error);
    return false;
  }
};

// Graceful shutdown
export const closeConnections = async () => {
  try {
    await pool.end();
    logger.info("Database pool closed");

    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info("Redis connection closed");
    }
  } catch (error) {
    logger.error("Error closing connections:", error);
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
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

// Redis health check
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    if (!redisClient.isOpen) return false;
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error("Redis health check failed:", error);
    return false;
  }
};

export default pool;
