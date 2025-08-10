import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Add progress photo (URL-based for now)
router.post(
  "/photos",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        photo_url,
        photo_type,
        description,
        weight_kg,
        body_fat_percentage,
      } = req.body;

      if (!photo_url) {
        return res.status(400).json({
          success: false,
          message: "URL de la photo requise",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        INSERT INTO progress_photos (user_id, photo_url, photo_type, description, weight_kg, body_fat_percentage) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `,
          [
            req.user!.id,
            photo_url,
            photo_type || "progress",
            description,
            weight_kg ? parseFloat(weight_kg) : null,
            body_fat_percentage ? parseFloat(body_fat_percentage) : null,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Photo de progression ajoutée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'ajout de la photo",
      } as ApiResponse);
    }
  }
);

// Get user's progress photos
router.get(
  "/photos",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { photo_type, limit = 20, offset = 0 } = req.query;

      const client = await pool.connect();
      try {
        let query = `
        SELECT * FROM progress_photos 
        WHERE user_id = $1
      `;
        const params: any[] = [req.user!.id];
        let paramIndex = 2;

        if (photo_type) {
          query += ` AND photo_type = $${paramIndex}`;
          params.push(photo_type);
          paramIndex++;
        }

        query += ` ORDER BY taken_at DESC LIMIT $${paramIndex} OFFSET $${
          paramIndex + 1
        }`;
        params.push(parseInt(limit as string), parseInt(offset as string));

        const result = await client.query(query, params);

        res.json({
          success: true,
          message: "Photos de progression récupérées",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des photos",
      } as ApiResponse);
    }
  }
);

// Delete progress photo
router.delete(
  "/photos/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const photoId = parseInt(req.params.id);
      if (isNaN(photoId)) {
        return res.status(400).json({
          success: false,
          message: "ID de photo invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          "DELETE FROM progress_photos WHERE id = $1 AND user_id = $2 RETURNING *",
          [photoId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Photo non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Photo supprimée avec succès",
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression de la photo",
      } as ApiResponse);
    }
  }
);

// Add body measurement
router.post(
  "/measurements",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        weight_kg,
        height_cm,
        body_fat_percentage,
        muscle_mass_kg,
        chest_cm,
        waist_cm,
        hips_cm,
        bicep_cm,
        thigh_cm,
        notes,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        INSERT INTO body_measurements (
          user_id, weight_kg, height_cm, body_fat_percentage, muscle_mass_kg,
          chest_cm, waist_cm, hips_cm, bicep_cm, thigh_cm, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *
      `,
          [
            req.user!.id,
            weight_kg,
            height_cm,
            body_fat_percentage,
            muscle_mass_kg,
            chest_cm,
            waist_cm,
            hips_cm,
            bicep_cm,
            thigh_cm,
            notes,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Mesures corporelles ajoutées",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'ajout des mesures",
      } as ApiResponse);
    }
  }
);

// Get user's body measurements
router.get(
  "/measurements",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT * FROM body_measurements 
        WHERE user_id = $1 
        ORDER BY measured_at DESC 
        LIMIT $2 OFFSET $3
      `,
          [req.user!.id, parseInt(limit as string), parseInt(offset as string)]
        );

        res.json({
          success: true,
          message: "Mesures corporelles récupérées",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des mesures",
      } as ApiResponse);
    }
  }
);

// Get measurement trends
router.get(
  "/measurements/trends",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { days = 90 } = req.query;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT 
          DATE(measured_at) as date,
          AVG(weight_kg) as avg_weight,
          AVG(body_fat_percentage) as avg_body_fat,
          AVG(muscle_mass_kg) as avg_muscle_mass,
          AVG(waist_cm) as avg_waist,
          COUNT(*) as measurement_count
        FROM body_measurements 
        WHERE user_id = $1 
          AND measured_at >= NOW() - INTERVAL '${parseInt(days as string)} days'
        GROUP BY DATE(measured_at)
        ORDER BY date DESC
      `,
          [req.user!.id]
        );

        // Calculate trends (compare latest vs oldest in period)
        const trends = {
          weight_change: 0,
          body_fat_change: 0,
          muscle_mass_change: 0,
          waist_change: 0,
        };

        if (result.rows.length >= 2) {
          const latest = result.rows[0];
          const oldest = result.rows[result.rows.length - 1];

          trends.weight_change = latest.avg_weight - oldest.avg_weight;
          trends.body_fat_change = latest.avg_body_fat - oldest.avg_body_fat;
          trends.muscle_mass_change =
            latest.avg_muscle_mass - oldest.avg_muscle_mass;
          trends.waist_change = latest.avg_waist - oldest.avg_waist;
        }

        res.json({
          success: true,
          message: "Tendances des mesures récupérées",
          data: {
            daily_measurements: result.rows,
            trends,
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des tendances",
      } as ApiResponse);
    }
  }
);

export default router;
