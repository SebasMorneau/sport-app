import { Request, Response, NextFunction } from "express";
import {
  body,
  param,
  query,
  validationResult,
  ValidationChain,
} from "express-validator";
import {
  sanitizeInput,
  validateSqlInput,
  detectSuspiciousActivity,
} from "../config/security";
import logger, { logSecurity } from "../config/logger";

// Enhanced validation middleware with security checks
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious activity first
    if (detectSuspiciousActivity(req)) {
      logSecurity("Suspicious activity detected", {
        ip: req.ip,
        url: req.url,
        body: req.body,
        userAgent: req.get("User-Agent"),
      });
      return res.status(400).json({
        success: false,
        message: "Invalid request detected",
      });
    }

    // Sanitize input data
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);

    // Run validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurity("Validation failed", {
        errors: errors.array(),
        ip: req.ip,
        url: req.url,
        userId: (req as any).user?.id,
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    next();
  };
};

// Common validation rules
export const commonValidations = {
  // User registration
  userRegistration: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage("Email must be valid and less than 255 characters"),
    body("password")
      .isLength({ min: 8, max: 128 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must be 8-128 characters with uppercase, lowercase, number, and special character"
      ),
    body("nom")
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage(
        "Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes"
      ),
  ],

  // User login
  userLogin: [
    body("email").isEmail().normalizeEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  // Exercise creation
  exerciseCreation: [
    body("nom")
      .isLength({ min: 2, max: 255 })
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage("Exercise name must be 2-255 characters"),
    body("muscle_principal")
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage("Muscle group must be valid"),
    body("equipement")
      .isLength({ min: 2, max: 100 })
      .withMessage("Equipment must be specified"),
    body("description_fr")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("instructions")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Instructions must be less than 2000 characters"),
  ],

  // Training creation
  trainingCreation: [
    body("nom")
      .isLength({ min: 2, max: 255 })
      .withMessage("Training name must be 2-255 characters"),
    body("notes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Notes must be less than 1000 characters"),
  ],

  // Set creation
  setCreation: [
    body("exercise_id")
      .isInt({ min: 1 })
      .withMessage("Exercise ID must be a positive integer"),
    body("reps")
      .isInt({ min: 1, max: 1000 })
      .withMessage("Reps must be between 1 and 1000"),
    body("weight_kg")
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage("Weight must be between 0 and 1000 kg"),
    body("rest_seconds")
      .optional()
      .isInt({ min: 0, max: 3600 })
      .withMessage("Rest time must be between 0 and 3600 seconds"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],

  // Nutrition entry
  nutritionEntry: [
    body("food_id")
      .isInt({ min: 1 })
      .withMessage("Food ID must be a positive integer"),
    body("quantity_g")
      .isFloat({ min: 0.1, max: 10000 })
      .withMessage("Quantity must be between 0.1g and 10kg"),
    body("meal_type")
      .optional()
      .isIn(["breakfast", "lunch", "dinner", "snack", "other"])
      .withMessage("Meal type must be valid"),
  ],

  // Body measurements
  bodyMeasurements: [
    body("weight_kg")
      .optional()
      .isFloat({ min: 20, max: 300 })
      .withMessage("Weight must be between 20 and 300 kg"),
    body("height_cm")
      .optional()
      .isFloat({ min: 100, max: 250 })
      .withMessage("Height must be between 100 and 250 cm"),
    body("body_fat_percentage")
      .optional()
      .isFloat({ min: 1, max: 50 })
      .withMessage("Body fat must be between 1% and 50%"),
    body("chest_cm")
      .optional()
      .isFloat({ min: 50, max: 200 })
      .withMessage("Chest measurement must be between 50 and 200 cm"),
    body("waist_cm")
      .optional()
      .isFloat({ min: 40, max: 200 })
      .withMessage("Waist measurement must be between 40 and 200 cm"),
  ],

  // ID parameter validation
  idParam: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  // Pagination validation
  pagination: [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be non-negative"),
  ],

  // Search validation
  search: [
    query("q")
      .optional()
      .isLength({ min: 1, max: 100 })
      .custom((value) => {
        if (!validateSqlInput(value)) {
          throw new Error("Invalid search query");
        }
        return true;
      })
      .withMessage(
        "Search query must be 1-100 characters and contain valid characters"
      ),
  ],

  // Date validation
  dateParam: [
    param("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be in ISO format (YYYY-MM-DD)"),
  ],

  // Rating validation
  rating: [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],
};

// Request size validation middleware
export const validateRequestSize = (maxSize: number = 1024 * 1024) => {
  // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get("content-length") || "0");

    if (contentLength > maxSize) {
      logSecurity("Request too large", {
        contentLength,
        maxSize,
        ip: req.ip,
        url: req.url,
      });

      return res.status(413).json({
        success: false,
        message: "Request too large",
      });
    }

    next();
  };
};

// Custom validation for specific business rules
export const businessValidations = {
  // Validate training date is not in the future beyond reasonable limit
  trainingDate: body("date")
    .optional()
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const maxFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      if (date > maxFuture) {
        throw new Error(
          "Training date cannot be more than 24 hours in the future"
        );
      }

      const minPast = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      if (date < minPast) {
        throw new Error("Training date cannot be more than 1 year in the past");
      }

      return true;
    }),

  // Validate workout duration is reasonable
  workoutDuration: body("duration")
    .optional()
    .isInt({ min: 1, max: 480 }) // 1 minute to 8 hours
    .withMessage("Workout duration must be between 1 and 480 minutes"),

  // Validate age for user profile
  userAge: body("age")
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage("Age must be between 13 and 120 years"),
};

export default {
  validate,
  commonValidations,
  validateRequestSize,
  businessValidations,
};
