import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Generate AI recommendations
router.post(
  "/recommendations/generate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { recommendation_type } = req.body;

      if (
        !["exercise", "program", "nutrition", "recovery"].includes(
          recommendation_type
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Type de recommandation invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        let recommendations: any[] = [];

        switch (recommendation_type) {
          case "exercise":
            recommendations = await generateExerciseRecommendations(
              client,
              req.user!.id
            );
            break;
          case "program":
            recommendations = await generateProgramRecommendations(
              client,
              req.user!.id
            );
            break;
          case "nutrition":
            recommendations = await generateNutritionRecommendations(
              client,
              req.user!.id
            );
            break;
          case "recovery":
            recommendations = await generateRecoveryRecommendations(
              client,
              req.user!.id
            );
            break;
        }

        // Store recommendations in database
        const storedRecommendations: any[] = [];
        for (const rec of recommendations) {
          const result = await client.query(
            `
          INSERT INTO ai_recommendations (user_id, recommendation_type, content, confidence_score, expires_at) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *
        `,
            [
              req.user!.id,
              recommendation_type,
              JSON.stringify(rec.content),
              rec.confidence_score,
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
            ]
          );
          storedRecommendations.push(result.rows[0]);
        }

        res.status(201).json({
          success: true,
          message: "Recommandations générées",
          data: storedRecommendations,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la génération des recommandations",
      } as ApiResponse);
    }
  }
);

// Get user's recommendations
router.get(
  "/recommendations",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { recommendation_type, viewed, limit = 10 } = req.query;

      const client = await pool.connect();
      try {
        let query = `
        SELECT * FROM ai_recommendations 
        WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
      `;
        const params: any[] = [req.user!.id];
        let paramIndex = 2;

        if (recommendation_type) {
          query += ` AND recommendation_type = $${paramIndex}`;
          params.push(recommendation_type);
          paramIndex++;
        }

        if (viewed !== undefined) {
          query += ` AND viewed = $${paramIndex}`;
          params.push(viewed === "true");
          paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
        params.push(parseInt(limit as string));

        const result = await client.query(query, params);

        res.json({
          success: true,
          message: "Recommandations récupérées",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des recommandations",
      } as ApiResponse);
    }
  }
);

// Mark recommendation as viewed
router.put(
  "/recommendations/:id/viewed",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const recommendationId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE ai_recommendations SET viewed = true WHERE id = $1 AND user_id = $2 RETURNING *",
          [recommendationId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Recommandation non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Recommandation marquée comme vue",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour de la recommandation",
      } as ApiResponse);
    }
  }
);

// Apply recommendation
router.put(
  "/recommendations/:id/apply",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const recommendationId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE ai_recommendations SET applied = true WHERE id = $1 AND user_id = $2 RETURNING *",
          [recommendationId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Recommandation non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Recommandation appliquée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'application de la recommandation",
      } as ApiResponse);
    }
  }
);

// Rate recommendation
router.put(
  "/recommendations/:id/rate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Note invalide (1-5)",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE ai_recommendations SET feedback_rating = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
          [rating, recommendationId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Recommandation non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Recommandation notée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la notation de la recommandation",
      } as ApiResponse);
    }
  }
);

// Helper functions for generating recommendations
async function generateExerciseRecommendations(client: any, userId: number) {
  // Analyze user's exercise history
  const userExercises = await client.query(
    `
    SELECT e.muscle_principal, COUNT(*) as usage_count
    FROM sets s
    JOIN exercises e ON s.exercise_id = e.id
    JOIN trainings t ON s.training_id = t.id
    WHERE t.user_id = $1
    GROUP BY e.muscle_principal
    ORDER BY usage_count ASC
  `,
    [userId]
  );

  const recommendations = [];

  // Recommend exercises for underworked muscle groups
  if (userExercises.rows.length > 0) {
    const leastWorkedMuscle = userExercises.rows[0].muscle_principal;

    const suggestedExercises = await client.query(
      `
      SELECT * FROM exercises 
      WHERE muscle_principal = $1 AND is_predefined = true
      ORDER BY RANDOM()
      LIMIT 3
    `,
      [leastWorkedMuscle]
    );

    recommendations.push({
      content: {
        title: `Travaillez plus votre ${leastWorkedMuscle}`,
        description: `Vous avez peu travaillé ce groupe musculaire récemment`,
        exercises: suggestedExercises.rows,
        reason: "muscle_balance",
      },
      confidence_score: 0.8,
    });
  }

  // Recommend new exercises based on current favorites
  const favoriteExercises = await client.query(
    `
    SELECT e.*, COUNT(*) as usage_count
    FROM sets s
    JOIN exercises e ON s.exercise_id = e.id
    JOIN trainings t ON s.training_id = t.id
    WHERE t.user_id = $1
    GROUP BY e.id, e.nom, e.muscle_principal, e.equipement
    ORDER BY usage_count DESC
    LIMIT 3
  `,
    [userId]
  );

  if (favoriteExercises.rows.length > 0) {
    const primaryMuscle = favoriteExercises.rows[0].muscle_principal;

    const similarExercises = await client.query(
      `
      SELECT * FROM exercises 
      WHERE muscle_principal = $1 
        AND is_predefined = true 
        AND id NOT IN (
          SELECT DISTINCT exercise_id 
          FROM sets s JOIN trainings t ON s.training_id = t.id 
          WHERE t.user_id = $2
        )
      ORDER BY RANDOM()
      LIMIT 2
    `,
      [primaryMuscle, userId]
    );

    if (similarExercises.rows.length > 0) {
      recommendations.push({
        content: {
          title: `Nouveaux exercices pour ${primaryMuscle}`,
          description: `Variez vos entraînements avec ces nouveaux exercices`,
          exercises: similarExercises.rows,
          reason: "variety",
        },
        confidence_score: 0.7,
      });
    }
  }

  return recommendations;
}

async function generateProgramRecommendations(client: any, userId: number) {
  const recommendations = [];

  // Check if user has no active program
  const activeProgram = await client.query(
    "SELECT * FROM user_programs WHERE user_id = $1 AND active = true",
    [userId]
  );

  if (activeProgram.rows.length === 0) {
    // Recommend a program based on user's fitness level or training frequency
    const recentTrainings = await client.query(
      `
      SELECT COUNT(*) as training_count
      FROM trainings 
      WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'
    `,
      [userId]
    );

    const trainingCount = parseInt(recentTrainings.rows[0].training_count);
    let recommendedProgram;

    if (trainingCount < 8) {
      // Beginner level
      recommendedProgram = await client.query(
        "SELECT * FROM programs WHERE difficulty_level = $1 AND is_predefined = true ORDER BY RANDOM() LIMIT 1",
        ["beginner"]
      );
    } else if (trainingCount < 16) {
      // Intermediate level
      recommendedProgram = await client.query(
        "SELECT * FROM programs WHERE difficulty_level = $1 AND is_predefined = true ORDER BY RANDOM() LIMIT 1",
        ["intermediate"]
      );
    } else {
      // Advanced level
      recommendedProgram = await client.query(
        "SELECT * FROM programs WHERE difficulty_level = $1 AND is_predefined = true ORDER BY RANDOM() LIMIT 1",
        ["advanced"]
      );
    }

    if (recommendedProgram.rows.length > 0) {
      recommendations.push({
        content: {
          title: "Programme d'entraînement recommandé",
          description: `Basé sur votre niveau d'activité récente`,
          program: recommendedProgram.rows[0],
          reason: "fitness_level",
        },
        confidence_score: 0.8,
      });
    }
  }

  return recommendations;
}

async function generateNutritionRecommendations(client: any, userId: number) {
  const recommendations = [];

  // Analyze recent nutrition
  const recentNutrition = await client.query(
    `
    SELECT 
      AVG(daily_calories) as avg_calories,
      AVG(daily_protein) as avg_protein,
      AVG(daily_carbs) as avg_carbs,
      AVG(daily_fat) as avg_fat
    FROM (
      SELECT 
        DATE(ne.consumed_at) as date,
        SUM(f.calories_per_100g * ne.quantity_g / 100) as daily_calories,
        SUM(f.protein_per_100g * ne.quantity_g / 100) as daily_protein,
        SUM(f.carbs_per_100g * ne.quantity_g / 100) as daily_carbs,
        SUM(f.fat_per_100g * ne.quantity_g / 100) as daily_fat
      FROM nutrition_entries ne
      JOIN foods f ON ne.food_id = f.id
      WHERE ne.user_id = $1 AND ne.consumed_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(ne.consumed_at)
    ) daily_stats
  `,
    [userId]
  );

  if (recentNutrition.rows.length > 0) {
    const nutrition = recentNutrition.rows[0];

    // Check protein intake
    if (parseFloat(nutrition.avg_protein) < 80) {
      const proteinFoods = await client.query(`
        SELECT * FROM foods 
        WHERE protein_per_100g > 20 AND is_verified = true
        ORDER BY protein_per_100g DESC
        LIMIT 5
      `);

      recommendations.push({
        content: {
          title: "Augmentez votre apport en protéines",
          description: `Votre moyenne est de ${Math.round(
            nutrition.avg_protein
          )}g par jour`,
          suggested_foods: proteinFoods.rows,
          target: "1.6-2.2g par kg de poids corporel",
          reason: "low_protein",
        },
        confidence_score: 0.85,
      });
    }

    // Check calorie balance
    if (parseFloat(nutrition.avg_calories) < 1500) {
      recommendations.push({
        content: {
          title: "Apport calorique faible",
          description: `Moyenne de ${Math.round(
            nutrition.avg_calories
          )} calories par jour`,
          suggestion:
            "Considérez augmenter vos apports pour maintenir votre métabolisme",
          reason: "low_calories",
        },
        confidence_score: 0.7,
      });
    }
  }

  return recommendations;
}

async function generateRecoveryRecommendations(client: any, userId: number) {
  const recommendations = [];

  // Analyze training frequency and intensity
  const recentTrainings = await client.query(
    `
    SELECT COUNT(*) as training_count,
           AVG(duration) as avg_duration,
           COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
    FROM trainings 
    WHERE user_id = $1 AND date >= NOW() - INTERVAL '7 days'
  `,
    [userId]
  );

  if (recentTrainings.rows.length > 0) {
    const stats = recentTrainings.rows[0];
    const trainingCount = parseInt(stats.training_count);

    if (trainingCount > 5) {
      recommendations.push({
        content: {
          title: "Jour de repos recommandé",
          description: `Vous avez fait ${trainingCount} séances cette semaine`,
          suggestion:
            "Accordez-vous un jour de repos complet pour optimiser la récupération",
          tips: [
            "Hydratez-vous bien",
            "Dormez 7-9 heures",
            "Consommez des protéines de qualité",
            "Pratiquez des étirements légers",
          ],
          reason: "high_frequency",
        },
        confidence_score: 0.9,
      });
    }

    if (parseFloat(stats.avg_duration) > 90) {
      recommendations.push({
        content: {
          title: "Séances longues détectées",
          description: `Durée moyenne de ${Math.round(
            stats.avg_duration
          )} minutes`,
          suggestion:
            "Considérez raccourcir vos séances pour éviter le surentraînement",
          reason: "long_sessions",
        },
        confidence_score: 0.7,
      });
    }
  }

  return recommendations;
}

export default router;
