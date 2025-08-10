import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { createExerciseSchema, searchExercisesSchema } from "../validation";
import {
  CreateExerciseRequest,
  SearchExercisesRequest,
  Exercise,
  ApiResponse,
} from "../types";

const router = Router();

// Get all exercises with search/filter
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = searchExercisesSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as ApiResponse);
    }

    const {
      search,
      muscle_principal,
      equipement,
      limit,
      offset,
    }: SearchExercisesRequest = value;

    let query = `
      SELECT e.*, 
             CASE WHEN ue.id IS NOT NULL THEN ue.custom_name ELSE e.nom END as display_name,
             ue.custom_notes
      FROM exercises e
      LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = $1
      WHERE 1=1
    `;
    const params: any[] = [req.user!.id];
    let paramIndex = 2;

    if (search) {
      query += ` AND (LOWER(e.nom) LIKE LOWER($${paramIndex}) OR LOWER(e.description_fr) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (muscle_principal) {
      query += ` AND LOWER(e.muscle_principal) = LOWER($${paramIndex})`;
      params.push(muscle_principal);
      paramIndex++;
    }

    if (equipement) {
      query += ` AND LOWER(e.equipement) = LOWER($${paramIndex})`;
      params.push(equipement);
      paramIndex++;
    }

    query += ` ORDER BY e.muscle_principal, e.nom LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      // Also get muscle groups and equipment for filters
      const musclesResult = await client.query(
        "SELECT DISTINCT muscle_principal FROM exercises ORDER BY muscle_principal"
      );
      const equipmentResult = await client.query(
        "SELECT DISTINCT equipement FROM exercises ORDER BY equipement"
      );

      res.json({
        success: true,
        message: "Exercices récupérés",
        data: {
          exercises: result.rows,
          filters: {
            muscles: musclesResult.rows.map((row) => row.muscle_principal),
            equipment: equipmentResult.rows.map((row) => row.equipement),
          },
          pagination: {
            limit,
            offset,
            total: result.rows.length,
          },
        },
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des exercices",
    } as ApiResponse);
  }
});

// Get exercise by ID
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'exercice invalide",
      } as ApiResponse);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT e.*, 
                CASE WHEN ue.id IS NOT NULL THEN ue.custom_name ELSE e.nom END as display_name,
                ue.custom_notes
         FROM exercises e
         LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = $1
         WHERE e.id = $2`,
        [req.user!.id, exerciseId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Exercice non trouvé",
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: "Exercice récupéré",
        data: result.rows[0],
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'exercice",
    } as ApiResponse);
  }
});

// Create custom exercise
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = createExerciseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as ApiResponse);
    }

    const {
      nom,
      muscle_principal,
      equipement,
      description_fr,
      instructions,
    }: CreateExerciseRequest = value;

    const client = await pool.connect();
    try {
      // Check if exercise with same name already exists for this user
      const existingExercise = await client.query(
        `SELECT e.id FROM exercises e
         LEFT JOIN user_exercises ue ON e.id = ue.exercise_id AND ue.user_id = $1
         WHERE LOWER(e.nom) = LOWER($2) OR LOWER(ue.custom_name) = LOWER($2)`,
        [req.user!.id, nom]
      );

      if (existingExercise.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Un exercice avec ce nom existe déjà",
        } as ApiResponse);
      }

      // Create the exercise
      const result = await client.query(
        `INSERT INTO exercises (nom, muscle_principal, equipement, description_fr, instructions, is_predefined) 
         VALUES ($1, $2, $3, $4, $5, false) 
         RETURNING *`,
        [nom, muscle_principal, equipement, description_fr, instructions]
      );

      const exercise = result.rows[0];

      // Link it to the user
      await client.query(
        `INSERT INTO user_exercises (user_id, exercise_id) VALUES ($1, $2)`,
        [req.user!.id, exercise.id]
      );

      res.status(201).json({
        success: true,
        message: "Exercice créé avec succès",
        data: exercise,
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de l'exercice",
    } as ApiResponse);
  }
});

// Update custom exercise or add custom name to predefined exercise
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "ID d'exercice invalide",
      } as ApiResponse);
    }

    const client = await pool.connect();
    try {
      // Check if exercise exists
      const exerciseResult = await client.query(
        "SELECT * FROM exercises WHERE id = $1",
        [exerciseId]
      );

      if (exerciseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Exercice non trouvé",
        } as ApiResponse);
      }

      const exercise = exerciseResult.rows[0];

      if (exercise.is_predefined) {
        // For predefined exercises, only allow custom name and notes
        const { custom_name, custom_notes } = req.body;

        await client.query(
          `INSERT INTO user_exercises (user_id, exercise_id, custom_name, custom_notes) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, exercise_id) 
           DO UPDATE SET custom_name = $3, custom_notes = $4`,
          [req.user!.id, exerciseId, custom_name, custom_notes]
        );

        res.json({
          success: true,
          message: "Exercice personnalisé",
          data: { ...exercise, custom_name, custom_notes },
        } as ApiResponse);
      } else {
        // For custom exercises, validate and update the exercise itself
        const { error, value } = createExerciseSchema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          } as ApiResponse);
        }

        const {
          nom,
          muscle_principal,
          equipement,
          description_fr,
          instructions,
        } = value;

        const result = await client.query(
          `UPDATE exercises 
           SET nom = $1, muscle_principal = $2, equipement = $3, 
               description_fr = $4, instructions = $5
           WHERE id = $6 AND is_predefined = false
           RETURNING *`,
          [
            nom,
            muscle_principal,
            equipement,
            description_fr,
            instructions,
            exerciseId,
          ]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: "Impossible de modifier cet exercice",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Exercice modifié avec succès",
          data: result.rows[0],
        } as ApiResponse);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification de l'exercice",
    } as ApiResponse);
  }
});

// Delete custom exercise
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.id);
      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          message: "ID d'exercice invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Only allow deletion of non-predefined exercises
        const result = await client.query(
          "DELETE FROM exercises WHERE id = $1 AND is_predefined = false RETURNING *",
          [exerciseId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Exercice non trouvé ou impossible à supprimer",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Exercice supprimé avec succès",
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression de l'exercice",
      } as ApiResponse);
    }
  }
);

export default router;
