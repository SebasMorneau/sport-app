import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface RequiredEnvVars {
  // Required
  JWT_SECRET: string;
  DB_PASSWORD: string;

  // Optional with defaults
  NODE_ENV?: string;
  PORT?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_NAME?: string;
  DB_USER?: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  CORS_ORIGINS?: string;
  BCRYPT_ROUNDS?: string;
  LOG_LEVEL?: string;
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;

  private constructor() {}

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  public validate(): RequiredEnvVars {
    const requiredVars = ["JWT_SECRET", "DB_PASSWORD"];
    const missingVars: string[] = [];

    // Check required variables
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}\n` +
          "Please set these in your .env file or environment."
      );
    }

    // Validate specific formats
    if (process.env.DB_PORT && isNaN(parseInt(process.env.DB_PORT))) {
      throw new Error("DB_PORT must be a valid number");
    }

    if (process.env.REDIS_PORT && isNaN(parseInt(process.env.REDIS_PORT))) {
      throw new Error("REDIS_PORT must be a valid number");
    }

    if (
      process.env.BCRYPT_ROUNDS &&
      isNaN(parseInt(process.env.BCRYPT_ROUNDS))
    ) {
      throw new Error("BCRYPT_ROUNDS must be a valid number");
    }

    // Validate NODE_ENV
    const validEnvironments = ["development", "test", "production"];
    if (
      process.env.NODE_ENV &&
      !validEnvironments.includes(process.env.NODE_ENV)
    ) {
      // Invalid NODE_ENV value, using 'development' as default
    }

    // Return validated environment variables
    return {
      JWT_SECRET: process.env.JWT_SECRET!,
      DB_PASSWORD: process.env.DB_PASSWORD!,
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "3500",
      DB_HOST: process.env.DB_HOST || "localhost",
      DB_PORT: process.env.DB_PORT || "5432",
      DB_NAME: process.env.DB_NAME || "sportapp",
      DB_USER: process.env.DB_USER || "sportapp_user",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      JWT_REFRESH_SECRET:
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
      REDIS_HOST: process.env.REDIS_HOST || "localhost",
      REDIS_PORT: process.env.REDIS_PORT || "6379",
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      CORS_ORIGINS: process.env.CORS_ORIGINS,
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || "12",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
    };
  }

  public logConfiguration(): void {
    // Configuration logging removed for production
  }
}

export const envValidator = EnvironmentValidator.getInstance();
export const env = envValidator.validate();

// Export validated environment variables
export default env;
