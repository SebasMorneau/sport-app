import { redisClient } from "./database";
import logger from "./logger";

// Cache interface
interface CacheOptions {
  ttl: number; // Time to live in seconds
  prefix?: string;
}

// Default cache TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
  EXERCISES: 60 * 60, // 1 hour (exercises don't change often)
  PROGRAMS: 2 * 60 * 60, // 2 hours (programs are relatively static)
  USER_PROFILE: 15 * 60, // 15 minutes
  STATS: 10 * 60, // 10 minutes
  RECOMMENDATIONS: 30 * 60, // 30 minutes
  FOOD_DB: 2 * 60 * 60, // 2 hours (food database is stable)
};

export class CacheService {
  private static instance: CacheService;

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateKey(key: string, prefix?: string): string {
    const env = process.env.NODE_ENV || "development";
    return `sportapp:${env}:${prefix ? prefix + ":" : ""}${key}`;
  }

  async get<T>(key: string, options?: { prefix?: string }): Promise<T | null> {
    try {
      if (!redisClient.isOpen) {
        logger.warn("Redis not connected, cache miss");
        return null;
      }

      const cacheKey = this.generateKey(key, options?.prefix);
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }

      logger.debug(`Cache miss: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        logger.warn("Redis not connected, skipping cache set");
        return false;
      }

      const cacheKey = this.generateKey(key, options.prefix);
      const serialized = JSON.stringify(value);

      await redisClient.setEx(cacheKey, options.ttl, serialized);
      logger.debug(`Cache set: ${cacheKey} (TTL: ${options.ttl}s)`);

      return true;
    } catch (error) {
      logger.error("Cache set error:", error);
      return false;
    }
  }

  async del(key: string, options?: { prefix?: string }): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }

      const cacheKey = this.generateKey(key, options?.prefix);
      const result = await redisClient.del(cacheKey);

      logger.debug(`Cache delete: ${cacheKey}`);
      return result > 0;
    } catch (error) {
      logger.error("Cache delete error:", error);
      return false;
    }
  }

  async exists(key: string, options?: { prefix?: string }): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }

      const cacheKey = this.generateKey(key, options?.prefix);
      const result = await redisClient.exists(cacheKey);

      return result === 1;
    } catch (error) {
      logger.error("Cache exists error:", error);
      return false;
    }
  }

  async invalidatePattern(
    pattern: string,
    options?: { prefix?: string }
  ): Promise<number> {
    try {
      if (!redisClient.isOpen) {
        return 0;
      }

      const searchPattern = this.generateKey(pattern, options?.prefix);
      const keys = await redisClient.keys(searchPattern);

      if (keys.length > 0) {
        const result = await redisClient.del(keys);
        logger.debug(
          `Cache invalidated ${result} keys matching: ${searchPattern}`
        );
        return result;
      }

      return 0;
    } catch (error) {
      logger.error("Cache invalidate pattern error:", error);
      return 0;
    }
  }

  async increment(
    key: string,
    options?: { prefix?: string; ttl?: number }
  ): Promise<number> {
    try {
      if (!redisClient.isOpen) {
        return 0;
      }

      const cacheKey = this.generateKey(key, options?.prefix);
      const result = await redisClient.incr(cacheKey);

      if (options?.ttl && result === 1) {
        await redisClient.expire(cacheKey, options.ttl);
      }

      return result;
    } catch (error) {
      logger.error("Cache increment error:", error);
      return 0;
    }
  }

  // Cache warming functions for critical data
  async warmExercisesCache(): Promise<void> {
    try {
      // This would be called from the database service
      logger.info("Warming exercises cache...");
      // Implementation would fetch and cache exercises
    } catch (error) {
      logger.error("Error warming exercises cache:", error);
    }
  }

  async warmProgramsCache(): Promise<void> {
    try {
      logger.info("Warming programs cache...");
      // Implementation would fetch and cache programs
    } catch (error) {
      logger.error("Error warming programs cache:", error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!redisClient.isOpen) {
        return false;
      }

      const testKey = "health:check";
      await this.set(testKey, { timestamp: Date.now() }, { ttl: 10 });
      const result = await this.get(testKey);
      await this.del(testKey);

      return result !== null;
    } catch (error) {
      logger.error("Cache health check failed:", error);
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<any> {
    try {
      if (!redisClient.isOpen) {
        return null;
      }

      const info = await redisClient.info("memory");
      const keyspace = await redisClient.info("keyspace");

      return {
        memory: info,
        keyspace: keyspace,
        connected: redisClient.isOpen,
      };
    } catch (error) {
      logger.error("Error getting cache stats:", error);
      return null;
    }
  }
}

// Export singleton instance
export const cache = CacheService.getInstance();

// Middleware for caching HTTP responses
export const cacheMiddleware = (ttl: number, prefix?: string) => {
  return async (req: any, res: any, next: any) => {
    const cacheKey = `${req.method}:${req.originalUrl}:${
      req.user?.id || "anonymous"
    }`;

    try {
      const cached = await cache.get(cacheKey, { prefix });

      if (cached) {
        logger.debug(`Response cache hit: ${cacheKey}`);
        return res.json(cached);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data: any) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          cache.set(cacheKey, data, { ttl, prefix });
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      next();
    }
  };
};

export default cache;
