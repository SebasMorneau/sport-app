import { Router, Request, Response } from "express";
import { pool } from "../database";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
} from "../auth";
import { userRegistrationSchema, userLoginSchema } from "../validation";
import { CreateUserRequest, LoginRequest, AuthResponse } from "../types";

const router = Router();

// Registration endpoint
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = userRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as AuthResponse);
    }

    const { email, password, nom }: CreateUserRequest = value;

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Un compte avec cet email existe déjà",
        } as AuthResponse);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, nom) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, nom, created_at`,
        [email.toLowerCase(), passwordHash, nom]
      );

      const user = result.rows[0];
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: "Compte créé avec succès",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          created_at: user.created_at,
          updated_at: user.created_at,
        },
        token,
      } as AuthResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du compte",
    } as AuthResponse);
  }
});

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as AuthResponse);
    }

    const { email, password }: LoginRequest = value;

    const client = await pool.connect();
    try {
      // Get user from database
      const result = await client.query(
        "SELECT id, email, password_hash, nom, created_at, updated_at FROM users WHERE email = $1",
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        } as AuthResponse);
      }

      const user = result.rows[0];

      // Check password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        } as AuthResponse);
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: "Connexion réussie",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        token,
      } as AuthResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    } as AuthResponse);
  }
});

// Get current user profile (protected route)
router.get(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Profil utilisateur",
      user: req.user,
    } as AuthResponse);
  }
);

export default router;
