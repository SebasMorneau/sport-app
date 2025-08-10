import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { createTrainingSchema, createSetSchema } from "../validation";
import {
  CreateTrainingRequest,
  CreateSetRequest,
  Training,
  Set,
  ApiResponse,
} from "../types";

const router = Router();

// Get user's trainings with pagination
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const completed = req.query.completed;

    let query = `
      SELECT t.*, 
             COUNT(DISTINCT s.id) as total_sets,
             COUNT(DISTINCT s.exercise_id) as total_exercises,
             SUM(s.reps * COALESCE(s.weight_kg, 0)) as total_volume
      FROM trainings t
      LEFT JOIN sets s ON t.id = s.training_id
      WHERE t.user_id = $1
    `;
    const params: any[] = [req.user!.id];
    let paramIndex = 2;

    if (completed !== undefined) {
      query += ` AND t.completed = $${paramIndex}`;
      params.push(completed === "true");
      paramIndex++;
    }

    query += ` GROUP BY t.id ORDER BY t.date DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
    params.push(limit, offset);

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);

      res.json({
        success: true,
        message: "Séances récupérées",
        data: {
          trainings: result.rows,
          pagination: { limit, offset, total: result.rows.length },
        },
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des séances",
    } as ApiResponse);
  }
});

// Get training by ID with all sets
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const trainingId = parseInt(req.params.id);
    if (isNaN(trainingId)) {
      return res.status(400).json({
        success: false,
        message: "ID de séance invalide",
      } as ApiResponse);
    }

    const client = await pool.connect();
    try {
      // Get training details
      const trainingResult = await client.query(
        "SELECT * FROM trainings WHERE id = $1 AND user_id = $2",
        [trainingId, req.user!.id]
      );

      if (trainingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Séance non trouvée",
        } as ApiResponse);
      }

      // Get all sets with exercise details
      const setsResult = await client.query(
        `SELECT s.*, e.nom as exercise_name, e.muscle_principal, e.equipement
         FROM sets s
         JOIN exercises e ON s.exercise_id = e.id
         WHERE s.training_id = $1
         ORDER BY s.set_order`,
        [trainingId]
      );

      const training = {
        ...trainingResult.rows[0],
        sets: setsResult.rows,
      };

      res.json({
        success: true,
        message: "Séance récupérée",
        data: training,
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de la séance",
    } as ApiResponse);
  }
});

// Create new training session
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = createTrainingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      } as ApiResponse);
    }

    const { nom, notes }: CreateTrainingRequest = value;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO trainings (user_id, nom, notes) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [req.user!.id, nom, notes]
      );

      res.status(201).json({
        success: true,
        message: "Séance créée avec succès",
        data: result.rows[0],
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de la séance",
    } as ApiResponse);
  }
});

// Add set to training
router.post(
  "/:id/sets",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const trainingId = parseInt(req.params.id);
      if (isNaN(trainingId)) {
        return res.status(400).json({
          success: false,
          message: "ID de séance invalide",
        } as ApiResponse);
      }

      const { error, value } = createSetSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        } as ApiResponse);
      }

      const {
        exercise_id,
        reps,
        weight_kg,
        rest_seconds,
        notes,
      }: CreateSetRequest = value;

      const client = await pool.connect();
      try {
        // Verify training belongs to user
        const trainingResult = await client.query(
          "SELECT id FROM trainings WHERE id = $1 AND user_id = $2",
          [trainingId, req.user!.id]
        );

        if (trainingResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Séance non trouvée",
          } as ApiResponse);
        }

        // Verify exercise exists
        const exerciseResult = await client.query(
          "SELECT id FROM exercises WHERE id = $1",
          [exercise_id]
        );

        if (exerciseResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Exercice non trouvé",
          } as ApiResponse);
        }

        // Get next set order
        const orderResult = await client.query(
          "SELECT COALESCE(MAX(set_order), 0) + 1 as next_order FROM sets WHERE training_id = $1",
          [trainingId]
        );
        const setOrder = orderResult.rows[0].next_order;

        // Create the set
        const result = await client.query(
          `INSERT INTO sets (training_id, exercise_id, reps, weight_kg, rest_seconds, set_order, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
          [
            trainingId,
            exercise_id,
            reps,
            weight_kg,
            rest_seconds,
            setOrder,
            notes,
          ]
        );

        // Get set with exercise details
        const setWithExercise = await client.query(
          `SELECT s.*, e.nom as exercise_name, e.muscle_principal, e.equipement
         FROM sets s
         JOIN exercises e ON s.exercise_id = e.id
         WHERE s.id = $1`,
          [result.rows[0].id]
        );

        res.status(201).json({
          success: true,
          message: "Série ajoutée avec succès",
          data: setWithExercise.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'ajout de la série",
      } as ApiResponse);
    }
  }
);

// Update training (complete it, add notes, etc.)
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const trainingId = parseInt(req.params.id);
    if (isNaN(trainingId)) {
      return res.status(400).json({
        success: false,
        message: "ID de séance invalide",
      } as ApiResponse);
    }

    const { completed, notes, duration } = req.body;

    const client = await pool.connect();
    try {
      let query = "UPDATE trainings SET ";
      const params: any[] = [];
      const updates: string[] = [];
      let paramIndex = 1;

      if (completed !== undefined) {
        updates.push(`completed = $${paramIndex}`);
        params.push(completed);
        paramIndex++;
      }

      if (notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        params.push(notes);
        paramIndex++;
      }

      if (duration !== undefined) {
        updates.push(`duration = $${paramIndex}`);
        params.push(duration);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Aucune mise à jour fournie",
        } as ApiResponse);
      }

      query += updates.join(", ");
      query += ` WHERE id = $${paramIndex} AND user_id = $${
        paramIndex + 1
      } RETURNING *`;
      params.push(trainingId, req.user!.id);

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Séance non trouvée",
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: "Séance mise à jour avec succès",
        data: result.rows[0],
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de la séance",
    } as ApiResponse);
  }
});

// Delete training
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const trainingId = parseInt(req.params.id);
      if (isNaN(trainingId)) {
        return res.status(400).json({
          success: false,
          message: "ID de séance invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          "DELETE FROM trainings WHERE id = $1 AND user_id = $2 RETURNING *",
          [trainingId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Séance non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Séance supprimée avec succès",
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression de la séance",
      } as ApiResponse);
    }
  }
);

// Get user's training statistics for POC 5
router.get(
  "/stats/summary",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        // Get overall stats
        const statsResult = await client.query(
          `SELECT 
           COUNT(*) as total_trainings,
           COUNT(CASE WHEN completed = true THEN 1 END) as completed_trainings,
           SUM(duration) as total_duration,
           COUNT(DISTINCT DATE(date)) as training_days
         FROM trainings 
         WHERE user_id = $1`,
          [req.user!.id]
        );

        // Get most used exercises
        const exercisesResult = await client.query(
          `SELECT 
           e.nom,
           e.muscle_principal,
           COUNT(*) as usage_count,
           AVG(s.weight_kg) as avg_weight,
           MAX(s.weight_kg) as max_weight
         FROM sets s
         JOIN exercises e ON s.exercise_id = e.id
         JOIN trainings t ON s.training_id = t.id
         WHERE t.user_id = $1
         GROUP BY e.id, e.nom, e.muscle_principal
         ORDER BY usage_count DESC
         LIMIT 10`,
          [req.user!.id]
        );

        // Get training frequency by week
        const frequencyResult = await client.query(
          `SELECT 
           DATE_TRUNC('week', date) as week,
           COUNT(*) as trainings_count
         FROM trainings
         WHERE user_id = $1 AND date >= NOW() - INTERVAL '12 weeks'
         GROUP BY DATE_TRUNC('week', date)
         ORDER BY week DESC`,
          [req.user!.id]
        );

        res.json({
          success: true,
          message: "Statistiques récupérées",
          data: {
            overview: statsResult.rows[0],
            topExercises: exercisesResult.rows,
            weeklyFrequency: frequencyResult.rows,
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des statistiques",
      } as ApiResponse);
    }
  }
);

export default router;
