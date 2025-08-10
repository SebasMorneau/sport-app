import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Queue offline data for sync
router.post(
  "/queue",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { operations } = req.body;

      if (!Array.isArray(operations)) {
        return res.status(400).json({
          success: false,
          message: "Operations array required",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const queuedOperations = [];

        for (const operation of operations) {
          const { table_name, operation_type, data } = operation;

          if (!table_name || !operation_type || !data) {
            continue; // Skip invalid operations
          }

          const result = await client.query(
            `
          INSERT INTO offline_data_queue (user_id, table_name, operation, data, sync_status) 
          VALUES ($1, $2, $3, $4, 'pending') 
          RETURNING *
        `,
            [req.user!.id, table_name, operation_type, JSON.stringify(data)]
          );

          queuedOperations.push(result.rows[0]);
        }

        res.status(201).json({
          success: true,
          message: `${queuedOperations.length} opérations mises en file d'attente`,
          data: queuedOperations,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise en file d'attente",
      } as ApiResponse);
    }
  }
);

// Process sync queue
router.post(
  "/process",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        // Get pending sync operations for user
        const pendingOperations = await client.query(
          `
        SELECT * FROM offline_data_queue 
        WHERE user_id = $1 AND sync_status = 'pending'
        ORDER BY created_at ASC
        LIMIT 50
      `,
          [req.user!.id]
        );

        const processedOperations = [];
        const failedOperations = [];

        for (const operation of pendingOperations.rows) {
          try {
            const success = await processOperation(client, operation);

            if (success) {
              // Mark as synced
              await client.query(
                "UPDATE offline_data_queue SET sync_status = $1, last_attempt = CURRENT_TIMESTAMP WHERE id = $2",
                ["synced", operation.id]
              );
              processedOperations.push(operation);
            } else {
              // Mark as failed and increment retry count
              await client.query(
                "UPDATE offline_data_queue SET sync_status = $1, retry_count = retry_count + 1, last_attempt = CURRENT_TIMESTAMP WHERE id = $2",
                ["failed", operation.id]
              );
              failedOperations.push(operation);
            }
          } catch (operationError) {
            // Check for conflicts
            const errorMessage =
              operationError instanceof Error
                ? operationError.message
                : String(operationError);
            if (
              errorMessage.includes("conflict") ||
              errorMessage.includes("duplicate")
            ) {
              await client.query(
                "UPDATE offline_data_queue SET sync_status = $1, retry_count = retry_count + 1, last_attempt = CURRENT_TIMESTAMP WHERE id = $2",
                ["conflict", operation.id]
              );
            } else {
              await client.query(
                "UPDATE offline_data_queue SET sync_status = $1, retry_count = retry_count + 1, last_attempt = CURRENT_TIMESTAMP WHERE id = $2",
                ["failed", operation.id]
              );
            }
            failedOperations.push(operation);
          }
        }

        res.json({
          success: true,
          message: "Synchronisation traitée",
          data: {
            processed: processedOperations.length,
            failed: failedOperations.length,
            total: pendingOperations.rows.length,
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors du traitement de la synchronisation",
      } as ApiResponse);
    }
  }
);

// Get sync status
router.get(
  "/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT 
          sync_status,
          COUNT(*) as count,
          MAX(last_attempt) as last_attempt
        FROM offline_data_queue 
        WHERE user_id = $1
        GROUP BY sync_status
      `,
          [req.user!.id]
        );

        const statusCounts = result.rows.reduce((acc, row) => {
          acc[row.sync_status] = {
            count: parseInt(row.count),
            last_attempt: row.last_attempt,
          };
          return acc;
        }, {} as any);

        // Get conflicts that need user resolution
        const conflicts = await client.query(
          `
        SELECT * FROM offline_data_queue 
        WHERE user_id = $1 AND sync_status = 'conflict'
        ORDER BY created_at ASC
        LIMIT 10
      `,
          [req.user!.id]
        );

        res.json({
          success: true,
          message: "Statut de synchronisation récupéré",
          data: {
            status_counts: statusCounts,
            conflicts: conflicts.rows,
            last_sync: await getLastSyncTime(client, req.user!.id),
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du statut",
      } as ApiResponse);
    }
  }
);

// Resolve conflicts
router.put(
  "/conflicts/:id/resolve",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const conflictId = parseInt(req.params.id);
      const { resolution, resolved_data } = req.body;

      if (!["use_local", "use_server", "merge"].includes(resolution)) {
        return res.status(400).json({
          success: false,
          message: "Résolution invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Get conflict details
        const conflict = await client.query(
          "SELECT * FROM offline_data_queue WHERE id = $1 AND user_id = $2 AND sync_status = $3",
          [conflictId, req.user!.id, "conflict"]
        );

        if (conflict.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Conflit non trouvé",
          } as ApiResponse);
        }

        let finalData = conflict.rows[0].data;

        switch (resolution) {
          case "use_local":
            // Keep original offline data
            break;
          case "use_server":
            // Skip this operation (server version wins)
            await client.query(
              "UPDATE offline_data_queue SET sync_status = $1 WHERE id = $2",
              ["synced", conflictId]
            );
            return res.json({
              success: true,
              message: "Conflit résolu (version serveur utilisée)",
            } as ApiResponse);
          case "merge":
            if (!resolved_data) {
              return res.status(400).json({
                success: false,
                message: "Données fusionnées requises",
              } as ApiResponse);
            }
            finalData = resolved_data;
            break;
        }

        // Update the operation with resolved data and retry
        await client.query(
          "UPDATE offline_data_queue SET data = $1, sync_status = $2, retry_count = 0 WHERE id = $3",
          [JSON.stringify(finalData), "pending", conflictId]
        );

        res.json({
          success: true,
          message: "Conflit résolu",
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la résolution du conflit",
      } as ApiResponse);
    }
  }
);

// Clear synced operations
router.delete(
  "/cleanup",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { older_than_days = 7 } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        DELETE FROM offline_data_queue 
        WHERE user_id = $1 
          AND sync_status = 'synced' 
          AND last_attempt < NOW() - INTERVAL '${parseInt(
            older_than_days
          )} days'
      `,
          [req.user!.id]
        );

        res.json({
          success: true,
          message: `${result.rowCount} opérations nettoyées`,
          data: { cleaned_count: result.rowCount },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors du nettoyage",
      } as ApiResponse);
    }
  }
);

// Helper function to process individual operations
async function processOperation(client: any, operation: any): Promise<boolean> {
  const { table_name, operation: op, data } = operation;

  try {
    switch (op.toUpperCase()) {
      case "INSERT":
        return await processInsert(client, table_name, data, operation.user_id);
      case "UPDATE":
        return await processUpdate(client, table_name, data, operation.user_id);
      case "DELETE":
        return await processDelete(client, table_name, data, operation.user_id);
      default:
        return false;
    }
  } catch (error) {
    throw error;
  }
}

async function processInsert(
  client: any,
  tableName: string,
  data: any,
  userId: number
): Promise<boolean> {
  // Map table names to their insert logic
  switch (tableName) {
    case "trainings":
      await client.query(
        `
        INSERT INTO trainings (user_id, nom, date, duration, notes, completed) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [userId, data.nom, data.date, data.duration, data.notes, data.completed]
      );
      return true;

    case "sets":
      await client.query(
        `
        INSERT INTO sets (training_id, exercise_id, reps, weight_kg, rest_seconds, set_order, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          data.training_id,
          data.exercise_id,
          data.reps,
          data.weight_kg,
          data.rest_seconds,
          data.set_order,
          data.notes,
        ]
      );
      return true;

    case "nutrition_entries":
      await client.query(
        `
        INSERT INTO nutrition_entries (user_id, food_id, quantity_g, meal_type, consumed_at) 
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          userId,
          data.food_id,
          data.quantity_g,
          data.meal_type,
          data.consumed_at,
        ]
      );
      return true;

    case "body_measurements":
      await client.query(
        `
        INSERT INTO body_measurements (user_id, weight_kg, height_cm, body_fat_percentage, muscle_mass_kg, chest_cm, waist_cm, hips_cm, bicep_cm, thigh_cm, notes, measured_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
        [
          userId,
          data.weight_kg,
          data.height_cm,
          data.body_fat_percentage,
          data.muscle_mass_kg,
          data.chest_cm,
          data.waist_cm,
          data.hips_cm,
          data.bicep_cm,
          data.thigh_cm,
          data.notes,
          data.measured_at,
        ]
      );
      return true;

    default:
      return false;
  }
}

async function processUpdate(
  client: any,
  tableName: string,
  data: any,
  userId: number
): Promise<boolean> {
  switch (tableName) {
    case "trainings":
      await client.query(
        `
        UPDATE trainings 
        SET nom = $1, duration = $2, notes = $3, completed = $4
        WHERE id = $5 AND user_id = $6
      `,
        [data.nom, data.duration, data.notes, data.completed, data.id, userId]
      );
      return true;

    case "user_profiles":
      await client.query(
        `
        UPDATE user_profiles 
        SET bio = $1, fitness_level = $2, goals = $3, privacy_level = $4, show_progress = $5, show_workouts = $6, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
      `,
        [
          data.bio,
          data.fitness_level,
          data.goals,
          data.privacy_level,
          data.show_progress,
          data.show_workouts,
          userId,
        ]
      );
      return true;

    default:
      return false;
  }
}

async function processDelete(
  client: any,
  tableName: string,
  data: any,
  userId: number
): Promise<boolean> {
  switch (tableName) {
    case "trainings":
      await client.query(
        "DELETE FROM trainings WHERE id = $1 AND user_id = $2",
        [data.id, userId]
      );
      return true;

    case "sets":
      // Verify the set belongs to a training owned by the user
      await client.query(
        `
        DELETE FROM sets 
        WHERE id = $1 AND training_id IN (
          SELECT id FROM trainings WHERE user_id = $2
        )
      `,
        [data.id, userId]
      );
      return true;

    case "nutrition_entries":
      await client.query(
        "DELETE FROM nutrition_entries WHERE id = $1 AND user_id = $2",
        [data.id, userId]
      );
      return true;

    default:
      return false;
  }
}

async function getLastSyncTime(
  client: any,
  userId: number
): Promise<string | null> {
  const result = await client.query(
    "SELECT MAX(last_attempt) as last_sync FROM offline_data_queue WHERE user_id = $1 AND sync_status = $2",
    [userId, "synced"]
  );

  return result.rows[0]?.last_sync || null;
}

export default router;
