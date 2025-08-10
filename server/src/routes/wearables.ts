import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Register wearable device
router.post(
  "/devices",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        device_type,
        device_id,
        device_name,
        access_token,
        refresh_token,
      } = req.body;

      if (!device_type || !device_id) {
        return res.status(400).json({
          success: false,
          message: "Type et ID de l'appareil requis",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        INSERT INTO wearable_devices (user_id, device_type, device_id, device_name, access_token, refresh_token) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (user_id, device_type, device_id) 
        DO UPDATE SET 
          device_name = $4,
          access_token = $5,
          refresh_token = $6,
          connected = true,
          last_sync = CURRENT_TIMESTAMP
        RETURNING *
      `,
          [
            req.user!.id,
            device_type,
            device_id,
            device_name,
            access_token,
            refresh_token,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Appareil connecté",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la connexion de l'appareil",
      } as ApiResponse);
    }
  }
);

// Get user's connected devices
router.get(
  "/devices",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT wd.*, 
               COUNT(hrd.id) as heart_rate_entries,
               COUNT(sd.id) as sleep_entries,
               MAX(hrd.recorded_at) as last_heart_rate_sync,
               MAX(sd.sleep_end) as last_sleep_sync
        FROM wearable_devices wd
        LEFT JOIN heart_rate_data hrd ON wd.id = hrd.device_id
        LEFT JOIN sleep_data sd ON wd.id = sd.device_id
        WHERE wd.user_id = $1
        GROUP BY wd.id
        ORDER BY wd.last_sync DESC
      `,
          [req.user!.id]
        );

        res.json({
          success: true,
          message: "Appareils récupérés",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des appareils",
      } as ApiResponse);
    }
  }
);

// Disconnect device
router.delete(
  "/devices/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE wearable_devices SET connected = false WHERE id = $1 AND user_id = $2 RETURNING *",
          [deviceId, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Appareil non trouvé",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Appareil déconnecté",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la déconnexion de l'appareil",
      } as ApiResponse);
    }
  }
);

// Sync heart rate data
router.post(
  "/heart-rate/sync",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { device_id, heart_rate_data } = req.body;

      if (!device_id || !Array.isArray(heart_rate_data)) {
        return res.status(400).json({
          success: false,
          message: "ID d'appareil et données de fréquence cardiaque requis",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Verify device belongs to user
        const deviceCheck = await client.query(
          "SELECT id FROM wearable_devices WHERE id = $1 AND user_id = $2 AND connected = true",
          [device_id, req.user!.id]
        );

        if (deviceCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Appareil non trouvé ou non connecté",
          } as ApiResponse);
        }

        // Insert heart rate data
        const insertedData = [];
        for (const data of heart_rate_data) {
          try {
            const result = await client.query(
              `
            INSERT INTO heart_rate_data (user_id, device_id, heart_rate, recorded_at, context) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (user_id, device_id, recorded_at) DO NOTHING
            RETURNING *
          `,
              [
                req.user!.id,
                device_id,
                data.heart_rate,
                data.recorded_at,
                data.context || "general",
              ]
            );

            if (result.rows.length > 0) {
              insertedData.push(result.rows[0]);
            }
          } catch (entryError) {}
        }

        // Update device last sync
        await client.query(
          "UPDATE wearable_devices SET last_sync = CURRENT_TIMESTAMP WHERE id = $1",
          [device_id]
        );

        res.status(201).json({
          success: true,
          message: `${insertedData.length} entrées de fréquence cardiaque synchronisées`,
          data: { inserted_count: insertedData.length },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la synchronisation des données",
      } as ApiResponse);
    }
  }
);

// Get heart rate data
router.get(
  "/heart-rate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { days = 7, context } = req.query;

      const client = await pool.connect();
      try {
        let query = `
        SELECT hrd.*, wd.device_name, wd.device_type
        FROM heart_rate_data hrd
        JOIN wearable_devices wd ON hrd.device_id = wd.id
        WHERE hrd.user_id = $1 
          AND hrd.recorded_at >= NOW() - INTERVAL '${parseInt(
            days as string
          )} days'
      `;
        const params: any[] = [req.user!.id];
        let paramIndex = 2;

        if (context) {
          query += ` AND hrd.context = $${paramIndex}`;
          params.push(context);
          paramIndex++;
        }

        query += ` ORDER BY hrd.recorded_at DESC LIMIT 1000`;

        const result = await client.query(query, params);

        // Calculate stats
        const heartRates = result.rows.map((row) => row.heart_rate);
        const stats = {
          count: heartRates.length,
          avg:
            heartRates.length > 0
              ? Math.round(
                  heartRates.reduce((a, b) => a + b, 0) / heartRates.length
                )
              : 0,
          min: heartRates.length > 0 ? Math.min(...heartRates) : 0,
          max: heartRates.length > 0 ? Math.max(...heartRates) : 0,
          resting_avg: 0,
          workout_avg: 0,
        };

        // Calculate context-specific averages
        const restingRates = result.rows
          .filter((row) => row.context === "resting")
          .map((row) => row.heart_rate);
        const workoutRates = result.rows
          .filter((row) => row.context === "workout")
          .map((row) => row.heart_rate);

        stats.resting_avg =
          restingRates.length > 0
            ? Math.round(
                restingRates.reduce((a, b) => a + b, 0) / restingRates.length
              )
            : 0;
        stats.workout_avg =
          workoutRates.length > 0
            ? Math.round(
                workoutRates.reduce((a, b) => a + b, 0) / workoutRates.length
              )
            : 0;

        res.json({
          success: true,
          message: "Données de fréquence cardiaque récupérées",
          data: {
            entries: result.rows,
            stats,
          },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des données",
      } as ApiResponse);
    }
  }
);

// Sync sleep data
router.post(
  "/sleep/sync",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { device_id, sleep_data } = req.body;

      if (!device_id || !Array.isArray(sleep_data)) {
        return res.status(400).json({
          success: false,
          message: "ID d'appareil et données de sommeil requis",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Verify device belongs to user
        const deviceCheck = await client.query(
          "SELECT id FROM wearable_devices WHERE id = $1 AND user_id = $2 AND connected = true",
          [device_id, req.user!.id]
        );

        if (deviceCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Appareil non trouvé ou non connecté",
          } as ApiResponse);
        }

        // Insert sleep data
        const insertedData = [];
        for (const data of sleep_data) {
          try {
            const result = await client.query(
              `
            INSERT INTO sleep_data (
              user_id, device_id, sleep_start, sleep_end, duration_minutes,
              deep_sleep_minutes, light_sleep_minutes, rem_sleep_minutes,
              awake_minutes, sleep_quality_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            ON CONFLICT (user_id, device_id, sleep_start) DO NOTHING
            RETURNING *
          `,
              [
                req.user!.id,
                device_id,
                data.sleep_start,
                data.sleep_end,
                data.duration_minutes,
                data.deep_sleep_minutes,
                data.light_sleep_minutes,
                data.rem_sleep_minutes,
                data.awake_minutes,
                data.sleep_quality_score,
              ]
            );

            if (result.rows.length > 0) {
              insertedData.push(result.rows[0]);
            }
          } catch (entryError) {}
        }

        // Update device last sync
        await client.query(
          "UPDATE wearable_devices SET last_sync = CURRENT_TIMESTAMP WHERE id = $1",
          [device_id]
        );

        res.status(201).json({
          success: true,
          message: `${insertedData.length} entrées de sommeil synchronisées`,
          data: { inserted_count: insertedData.length },
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la synchronisation du sommeil",
      } as ApiResponse);
    }
  }
);

// Get sleep data
router.get("/sleep", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT sd.*, wd.device_name, wd.device_type
        FROM sleep_data sd
        JOIN wearable_devices wd ON sd.device_id = wd.id
        WHERE sd.user_id = $1 
          AND sd.sleep_start >= NOW() - INTERVAL '${parseInt(
            days as string
          )} days'
        ORDER BY sd.sleep_start DESC
      `,
        [req.user!.id]
      );

      // Calculate sleep stats
      const sleepEntries = result.rows;
      const stats = {
        total_nights: sleepEntries.length,
        avg_duration: 0,
        avg_deep_sleep: 0,
        avg_rem_sleep: 0,
        avg_quality_score: 0,
        best_quality_score: 0,
        consistency_score: 0,
      };

      if (sleepEntries.length > 0) {
        stats.avg_duration = Math.round(
          sleepEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) /
            sleepEntries.length
        );
        stats.avg_deep_sleep = Math.round(
          sleepEntries.reduce(
            (sum, entry) => sum + (entry.deep_sleep_minutes || 0),
            0
          ) / sleepEntries.length
        );
        stats.avg_rem_sleep = Math.round(
          sleepEntries.reduce(
            (sum, entry) => sum + (entry.rem_sleep_minutes || 0),
            0
          ) / sleepEntries.length
        );

        const qualityScores = sleepEntries
          .filter((entry) => entry.sleep_quality_score !== null)
          .map((entry) => entry.sleep_quality_score);
        if (qualityScores.length > 0) {
          stats.avg_quality_score = Math.round(
            qualityScores.reduce((sum, score) => sum + score, 0) /
              qualityScores.length
          );
          stats.best_quality_score = Math.max(...qualityScores);
        }

        // Calculate consistency (based on sleep time variance)
        const sleepTimes = sleepEntries.map((entry) => {
          const sleepTime = new Date(entry.sleep_start);
          return sleepTime.getHours() * 60 + sleepTime.getMinutes();
        });

        if (sleepTimes.length > 1) {
          const avgSleepTime =
            sleepTimes.reduce((sum, time) => sum + time, 0) / sleepTimes.length;
          const variance =
            sleepTimes.reduce(
              (sum, time) => sum + Math.pow(time - avgSleepTime, 2),
              0
            ) / sleepTimes.length;
          const stdDev = Math.sqrt(variance);
          stats.consistency_score = Math.max(0, Math.round(100 - stdDev / 2)); // Convert to 0-100 scale
        }
      }

      res.json({
        success: true,
        message: "Données de sommeil récupérées",
        data: {
          entries: sleepEntries,
          stats,
        },
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des données de sommeil",
    } as ApiResponse);
  }
});

export default router;
