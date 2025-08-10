import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Search foods
router.get(
  "/foods/search",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { q, category, limit = 20, offset = 0 } = req.query;

      const client = await pool.connect();
      try {
        let query = `
        SELECT * FROM foods 
        WHERE 1=1
      `;
        const params: any[] = [];
        let paramIndex = 1;

        if (q) {
          query += ` AND (LOWER(nom) LIKE LOWER($${paramIndex}) OR LOWER(brand) LIKE LOWER($${paramIndex}))`;
          params.push(`%${q}%`);
          paramIndex++;
        }

        if (category) {
          query += ` AND LOWER(category) = LOWER($${paramIndex})`;
          params.push(category);
          paramIndex++;
        }

        query += ` ORDER BY is_verified DESC, nom LIMIT $${paramIndex} OFFSET $${
          paramIndex + 1
        }`;
        params.push(parseInt(limit as string), parseInt(offset as string));

        const result = await client.query(query, params);

        // Get available categories
        const categoriesResult = await client.query(
          "SELECT DISTINCT category FROM foods WHERE category IS NOT NULL ORDER BY category"
        );

        res.json({
          success: true,
          message: "Aliments trouvés",
          data: {
            foods: result.rows,
            categories: categoriesResult.rows.map((row) => row.category),
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la recherche d'aliments",
      } as ApiResponse);
    }
  }
);

// Get food by ID
router.get(
  "/foods/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const foodId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM foods WHERE id = $1", [
          foodId,
        ]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Aliment non trouvé",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Aliment récupéré",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération de l'aliment",
      } as ApiResponse);
    }
  }
);

// Add nutrition entry
router.post(
  "/entries",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        food_id,
        quantity_g,
        meal_type = "other",
        consumed_at,
      } = req.body;

      if (!food_id || !quantity_g) {
        return res.status(400).json({
          success: false,
          message: "ID d'aliment et quantité requis",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Get food details for calculation
        const foodResult = await client.query(
          "SELECT * FROM foods WHERE id = $1",
          [food_id]
        );

        if (foodResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Aliment non trouvé",
          } as ApiResponse);
        }

        const food = foodResult.rows[0];
        const factor = quantity_g / 100; // Convert per 100g to actual quantity

        const result = await client.query(
          `
        INSERT INTO nutrition_entries (user_id, food_id, quantity_g, meal_type, consumed_at) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *, 
          (SELECT nom FROM foods WHERE id = $2) as food_name,
          ${food.calories_per_100g} * $3 / 100 as calories,
          ${food.protein_per_100g} * $3 / 100 as protein,
          ${food.carbs_per_100g} * $3 / 100 as carbs,
          ${food.fat_per_100g} * $3 / 100 as fat
      `,
          [
            req.user!.id,
            food_id,
            quantity_g,
            meal_type,
            consumed_at || new Date(),
          ]
        );

        res.status(201).json({
          success: true,
          message: "Entrée nutritionnelle ajoutée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'ajout de l'entrée nutritionnelle",
      } as ApiResponse);
    }
  }
);

// Get nutrition entries for a day
router.get(
  "/entries/day/:date?",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const date = req.params.date || new Date().toISOString().split("T")[0];

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT ne.*, f.nom as food_name, f.category,
               f.calories_per_100g * ne.quantity_g / 100 as calories,
               f.protein_per_100g * ne.quantity_g / 100 as protein,
               f.carbs_per_100g * ne.quantity_g / 100 as carbs,
               f.fat_per_100g * ne.quantity_g / 100 as fat,
               f.fiber_per_100g * ne.quantity_g / 100 as fiber
        FROM nutrition_entries ne
        JOIN foods f ON ne.food_id = f.id
        WHERE ne.user_id = $1 
          AND DATE(ne.consumed_at) = $2
        ORDER BY ne.consumed_at DESC
      `,
          [req.user!.id, date]
        );

        // Calculate daily totals
        const totals = result.rows.reduce(
          (acc, entry) => ({
            calories: acc.calories + parseFloat(entry.calories || 0),
            protein: acc.protein + parseFloat(entry.protein || 0),
            carbs: acc.carbs + parseFloat(entry.carbs || 0),
            fat: acc.fat + parseFloat(entry.fat || 0),
            fiber: acc.fiber + parseFloat(entry.fiber || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
        );

        // Group by meal type
        const byMealType = result.rows.reduce((acc, entry) => {
          if (!acc[entry.meal_type]) {
            acc[entry.meal_type] = [];
          }
          acc[entry.meal_type].push(entry);
          return acc;
        }, {} as any);

        res.json({
          success: true,
          message: "Entrées nutritionnelles récupérées",
          data: {
            date,
            entries: result.rows,
            by_meal_type: byMealType,
            daily_totals: totals,
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur lors de la récupération des entrées nutritionnelles",
      } as ApiResponse);
    }
  }
);

// Get nutrition summary for a period
router.get(
  "/summary",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { days = 7 } = req.query;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT 
          DATE(ne.consumed_at) as date,
          SUM(f.calories_per_100g * ne.quantity_g / 100) as daily_calories,
          SUM(f.protein_per_100g * ne.quantity_g / 100) as daily_protein,
          SUM(f.carbs_per_100g * ne.quantity_g / 100) as daily_carbs,
          SUM(f.fat_per_100g * ne.quantity_g / 100) as daily_fat,
          COUNT(DISTINCT ne.food_id) as food_variety
        FROM nutrition_entries ne
        JOIN foods f ON ne.food_id = f.id
        WHERE ne.user_id = $1 
          AND ne.consumed_at >= CURRENT_DATE - INTERVAL '${parseInt(
            days as string
          )} days'
        GROUP BY DATE(ne.consumed_at)
        ORDER BY date DESC
      `,
          [req.user!.id]
        );

        // Calculate averages
        const averages = result.rows.reduce(
          (acc, day) => ({
            avg_calories:
              acc.avg_calories + parseFloat(day.daily_calories || 0),
            avg_protein: acc.avg_protein + parseFloat(day.daily_protein || 0),
            avg_carbs: acc.avg_carbs + parseFloat(day.daily_carbs || 0),
            avg_fat: acc.avg_fat + parseFloat(day.daily_fat || 0),
            avg_variety: acc.avg_variety + parseInt(day.food_variety || 0),
          }),
          {
            avg_calories: 0,
            avg_protein: 0,
            avg_carbs: 0,
            avg_fat: 0,
            avg_variety: 0,
          }
        );

        const dayCount = result.rows.length || 1;
        Object.keys(averages).forEach((key) => {
          averages[key as keyof typeof averages] =
            Math.round(
              (averages[key as keyof typeof averages] / dayCount) * 100
            ) / 100;
        });

        res.json({
          success: true,
          message: "Résumé nutritionnel récupéré",
          data: {
            daily_breakdown: result.rows,
            averages,
            period_days: parseInt(days as string),
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur lors de la récupération du résumé nutritionnel",
      } as ApiResponse);
    }
  }
);

// Create meal plan
router.post(
  "/meal-plans",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        nom,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        INSERT INTO meal_plans (user_id, nom, description, target_calories, target_protein, target_carbs, target_fat) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `,
          [
            req.user!.id,
            nom,
            description,
            target_calories,
            target_protein,
            target_carbs,
            target_fat,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Plan de repas créé",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la création du plan de repas",
      } as ApiResponse);
    }
  }
);

// Get user's meal plans
router.get(
  "/meal-plans",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT mp.*, 
               COUNT(mpe.id) as total_entries,
               SUM(f.calories_per_100g * mpe.quantity_g / 100) as total_calories
        FROM meal_plans mp
        LEFT JOIN meal_plan_entries mpe ON mp.id = mpe.meal_plan_id
        LEFT JOIN foods f ON mpe.food_id = f.id
        WHERE mp.user_id = $1
        GROUP BY mp.id
        ORDER BY mp.active DESC, mp.created_at DESC
      `,
          [req.user!.id]
        );

        res.json({
          success: true,
          message: "Plans de repas récupérés",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des plans de repas",
      } as ApiResponse);
    }
  }
);

// Activate meal plan
router.put(
  "/meal-plans/:id/activate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const mealPlanId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        // Deactivate all other meal plans
        await client.query(
          "UPDATE meal_plans SET active = false WHERE user_id = $1",
          [req.user!.id]
        );

        // Activate the selected meal plan
        const result = await client.query(
          "UPDATE meal_plans SET active = true WHERE id = $1 AND user_id = $2 RETURNING *",
          [mealPlanId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Plan de repas non trouvé",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Plan de repas activé",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'activation du plan de repas",
      } as ApiResponse);
    }
  }
);

export default router;
