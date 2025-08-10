import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Get all programs (predefined + user's custom)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT p.*, 
               CASE WHEN p.created_by = $1 THEN true ELSE false END as is_mine,
               COUNT(pt.id) as total_days
        FROM programs p
        LEFT JOIN program_templates pt ON p.id = pt.program_id
        WHERE p.is_predefined = true OR p.created_by = $1
        GROUP BY p.id
        ORDER BY p.is_predefined DESC, p.created_at DESC
      `,
        [req.user!.id]
      );

      res.json({
        success: true,
        message: "Programmes récupérés",
        data: result.rows,
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des programmes",
    } as ApiResponse);
  }
});

// Get program details with templates and exercises
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const programId = parseInt(req.params.id);
    if (isNaN(programId)) {
      return res.status(400).json({
        success: false,
        message: "ID de programme invalide",
      } as ApiResponse);
    }

    const client = await pool.connect();
    try {
      // Get program details
      const programResult = await client.query(
        `
        SELECT p.*, 
               CASE WHEN p.created_by = $2 THEN true ELSE false END as is_mine
        FROM programs p
        WHERE p.id = $1 AND (p.is_predefined = true OR p.created_by = $2)
      `,
        [programId, req.user!.id]
      );

      if (programResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Programme non trouvé",
        } as ApiResponse);
      }

      // Get program templates with exercises
      const templatesResult = await client.query(
        `
        SELECT pt.*, 
               json_agg(
                 json_build_object(
                   'id', te.id,
                   'exercise_id', te.exercise_id,
                   'exercise_name', e.nom,
                   'muscle_principal', e.muscle_principal,
                   'equipement', e.equipement,
                   'exercise_order', te.exercise_order,
                   'target_sets', te.target_sets,
                   'target_reps_min', te.target_reps_min,
                   'target_reps_max', te.target_reps_max,
                   'target_weight_percentage', te.target_weight_percentage,
                   'rest_seconds', te.rest_seconds,
                   'notes', te.notes
                 ) ORDER BY te.exercise_order
               ) FILTER (WHERE te.id IS NOT NULL) as exercises
        FROM program_templates pt
        LEFT JOIN template_exercises te ON pt.id = te.template_id
        LEFT JOIN exercises e ON te.exercise_id = e.id
        WHERE pt.program_id = $1
        GROUP BY pt.id
        ORDER BY pt.day_number
      `,
        [programId]
      );

      const program = {
        ...programResult.rows[0],
        templates: templatesResult.rows,
      };

      res.json({
        success: true,
        message: "Programme récupéré",
        data: program,
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du programme",
    } as ApiResponse);
  }
});

// Subscribe to a program
router.post(
  "/:id/subscribe",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const programId = parseInt(req.params.id);
      if (isNaN(programId)) {
        return res.status(400).json({
          success: false,
          message: "ID de programme invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Check if program exists
        const programExists = await client.query(
          "SELECT id FROM programs WHERE id = $1 AND (is_predefined = true OR created_by = $2)",
          [programId, req.user!.id]
        );

        if (programExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Programme non trouvé",
          } as ApiResponse);
        }

        // Deactivate any current active programs
        await client.query(
          "UPDATE user_programs SET active = false WHERE user_id = $1 AND active = true",
          [req.user!.id]
        );

        // Subscribe to new program
        const result = await client.query(
          `
        INSERT INTO user_programs (user_id, program_id, start_date, active) 
        VALUES ($1, $2, CURRENT_DATE, true) 
        ON CONFLICT (user_id, program_id, start_date) 
        DO UPDATE SET active = true, current_week = 1, current_day = 1
        RETURNING *
      `,
          [req.user!.id, programId]
        );

        res.status(201).json({
          success: true,
          message: "Abonnement au programme réussi",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'abonnement au programme",
      } as ApiResponse);
    }
  }
);

// Get user's current active program
router.get(
  "/user/current",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT up.*, p.nom, p.description, p.difficulty_level, 
               p.duration_weeks, p.sessions_per_week,
               pt.nom as current_day_name, pt.description as current_day_description,
               pt.rest_day
        FROM user_programs up
        JOIN programs p ON up.program_id = p.id
        LEFT JOIN program_templates pt ON p.id = pt.program_id AND pt.day_number = up.current_day
        WHERE up.user_id = $1 AND up.active = true
        ORDER BY up.start_date DESC
        LIMIT 1
      `,
          [req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.json({
            success: true,
            message: "Aucun programme actif",
            data: null,
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Programme actuel récupéré",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du programme actuel",
      } as ApiResponse);
    }
  }
);

// Update program progress (move to next day/week)
router.put(
  "/user/progress",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { completed_training } = req.body;

      const client = await pool.connect();
      try {
        // Get current active program
        const currentProgram = await client.query(
          `
        SELECT up.*, p.sessions_per_week, p.duration_weeks,
               (SELECT COUNT(*) FROM program_templates WHERE program_id = up.program_id) as total_days
        FROM user_programs up
        JOIN programs p ON up.program_id = p.id
        WHERE up.user_id = $1 AND up.active = true
      `,
          [req.user!.id]
        );

        if (currentProgram.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Aucun programme actif trouvé",
          } as ApiResponse);
        }

        const program = currentProgram.rows[0];
        let newDay = program.current_day;
        let newWeek = program.current_week;

        if (completed_training) {
          // Move to next day
          newDay = program.current_day + 1;

          // If we've completed all days, move to next week
          if (newDay > program.total_days) {
            newDay = 1;
            newWeek = program.current_week + 1;
          }
        }

        // Update progress
        const result = await client.query(
          `
        UPDATE user_programs 
        SET current_day = $1, current_week = $2,
            active = CASE WHEN $2 > $3 THEN false ELSE true END
        WHERE user_id = $4 AND active = true
        RETURNING *
      `,
          [newDay, newWeek, program.duration_weeks, req.user!.id]
        );

        res.json({
          success: true,
          message:
            newWeek > program.duration_weeks
              ? "Programme terminé !"
              : "Progression mise à jour",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour de la progression",
      } as ApiResponse);
    }
  }
);

export default router;
