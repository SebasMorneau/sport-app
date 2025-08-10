import { Router, Request, Response } from "express";
import { pool } from "../database";
import { authenticateToken } from "../auth";
import { ApiResponse } from "../types";

const router = Router();

// Get user profile
router.get(
  "/profile/:userId?",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId
        ? parseInt(req.params.userId)
        : req.user!.id;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT u.id, u.nom, u.email, u.created_at,
               up.bio, up.profile_photo_url, up.fitness_level, up.goals,
               up.privacy_level, up.show_progress, up.show_workouts,
               CASE WHEN u.id = $1 THEN true ELSE false END as is_own_profile,
               CASE WHEN f.status = 'accepted' THEN true ELSE false END as is_friend,
               CASE WHEN f.status = 'pending' AND f.requester_id = $1 THEN 'sent' 
                    WHEN f.status = 'pending' AND f.addressee_id = $1 THEN 'received'
                    ELSE f.status END as friendship_status
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN friendships f ON (
          (f.requester_id = $1 AND f.addressee_id = u.id) OR
          (f.addressee_id = $1 AND f.requester_id = u.id)
        )
        WHERE u.id = $2
      `,
          [req.user!.id, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Utilisateur non trouvé",
          } as ApiResponse);
        }

        const profile = result.rows[0];

        // Check privacy settings
        if (!profile.is_own_profile && profile.privacy_level === "private") {
          return res.status(403).json({
            success: false,
            message: "Profil privé",
          } as ApiResponse);
        }

        if (
          !profile.is_own_profile &&
          profile.privacy_level === "friends" &&
          !profile.is_friend
        ) {
          return res.status(403).json({
            success: false,
            message: "Profil accessible aux amis uniquement",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message: "Profil récupéré",
          data: profile,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du profil",
      } as ApiResponse);
    }
  }
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const {
        bio,
        fitness_level,
        goals,
        privacy_level,
        show_progress,
        show_workouts,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        INSERT INTO user_profiles (user_id, bio, fitness_level, goals, privacy_level, show_progress, show_workouts, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          bio = $2,
          fitness_level = $3,
          goals = $4,
          privacy_level = $5,
          show_progress = $6,
          show_workouts = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
          [
            req.user!.id,
            bio,
            fitness_level,
            goals,
            privacy_level || "public",
            show_progress !== undefined ? show_progress : true,
            show_workouts !== undefined ? show_workouts : true,
          ]
        );

        res.json({
          success: true,
          message: "Profil mis à jour",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour du profil",
      } as ApiResponse);
    }
  }
);

// Search users
router.get(
  "/users/search",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { q, limit = 20, offset = 0 } = req.query;

      if (!q || (q as string).length < 2) {
        return res.status(400).json({
          success: false,
          message: "Terme de recherche trop court (minimum 2 caractères)",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT u.id, u.nom, u.email, up.profile_photo_url, up.fitness_level,
               CASE WHEN f.status = 'accepted' THEN true ELSE false END as is_friend
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN friendships f ON (
          (f.requester_id = $1 AND f.addressee_id = u.id) OR
          (f.addressee_id = $1 AND f.requester_id = u.id)
        ) AND f.status = 'accepted'
        WHERE u.id != $1 
          AND (up.privacy_level = 'public' OR up.privacy_level IS NULL)
          AND LOWER(u.nom) LIKE LOWER($2)
        ORDER BY u.nom
        LIMIT $3 OFFSET $4
      `,
          [
            req.user!.id,
            `%${q}%`,
            parseInt(limit as string),
            parseInt(offset as string),
          ]
        );

        res.json({
          success: true,
          message: "Utilisateurs trouvés",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la recherche d'utilisateurs",
      } as ApiResponse);
    }
  }
);

// Send friend request
router.post(
  "/friends/request",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;

      if (user_id === req.user!.id) {
        return res.status(400).json({
          success: false,
          message: "Vous ne pouvez pas vous ajouter vous-même",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        // Check if friendship already exists
        const existingFriendship = await client.query(
          `
        SELECT * FROM friendships 
        WHERE (requester_id = $1 AND addressee_id = $2) 
           OR (requester_id = $2 AND addressee_id = $1)
      `,
          [req.user!.id, user_id]
        );

        if (existingFriendship.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Demande d'amitié déjà existante",
          } as ApiResponse);
        }

        const result = await client.query(
          `
        INSERT INTO friendships (requester_id, addressee_id, status) 
        VALUES ($1, $2, 'pending') 
        RETURNING *
      `,
          [req.user!.id, user_id]
        );

        res.status(201).json({
          success: true,
          message: "Demande d'amitié envoyée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'envoi de la demande d'amitié",
      } as ApiResponse);
    }
  }
);

// Respond to friend request
router.put(
  "/friends/respond",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { friendship_id, status } = req.body;

      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Statut invalide",
        } as ApiResponse);
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        UPDATE friendships 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND addressee_id = $3 AND status = 'pending'
        RETURNING *
      `,
          [status, friendship_id, req.user!.id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Demande d'amitié non trouvée",
          } as ApiResponse);
        }

        res.json({
          success: true,
          message:
            status === "accepted"
              ? "Demande d'amitié acceptée"
              : "Demande d'amitié refusée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la réponse à la demande d'amitié",
      } as ApiResponse);
    }
  }
);

// Get friends list
router.get(
  "/friends",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { status = "accepted" } = req.query;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
        SELECT f.*, 
               CASE WHEN f.requester_id = $1 THEN u2.nom ELSE u1.nom END as friend_name,
               CASE WHEN f.requester_id = $1 THEN u2.id ELSE u1.id END as friend_id,
               CASE WHEN f.requester_id = $1 THEN up2.profile_photo_url ELSE up1.profile_photo_url END as friend_photo,
               CASE WHEN f.requester_id = $1 THEN up2.fitness_level ELSE up1.fitness_level END as friend_fitness_level
        FROM friendships f
        JOIN users u1 ON f.requester_id = u1.id
        JOIN users u2 ON f.addressee_id = u2.id
        LEFT JOIN user_profiles up1 ON u1.id = up1.user_id
        LEFT JOIN user_profiles up2 ON u2.id = up2.user_id
        WHERE (f.requester_id = $1 OR f.addressee_id = $1) 
          AND f.status = $2
        ORDER BY f.updated_at DESC
      `,
          [req.user!.id, status]
        );

        res.json({
          success: true,
          message: "Liste d'amis récupérée",
          data: result.rows,
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des amis",
      } as ApiResponse);
    }
  }
);

// Share workout
router.post(
  "/workouts/share",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { training_id, caption, visibility = "friends" } = req.body;

      const client = await pool.connect();
      try {
        // Verify training belongs to user
        const trainingCheck = await client.query(
          "SELECT id FROM trainings WHERE id = $1 AND user_id = $2",
          [training_id, req.user!.id]
        );

        if (trainingCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Séance non trouvée",
          } as ApiResponse);
        }

        const result = await client.query(
          `
        INSERT INTO workout_shares (training_id, shared_by, caption, visibility) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `,
          [training_id, req.user!.id, caption, visibility]
        );

        res.status(201).json({
          success: true,
          message: "Séance partagée",
          data: result.rows[0],
        } as ApiResponse);
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors du partage de la séance",
      } as ApiResponse);
    }
  }
);

// Get workout feed
router.get("/feed", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT ws.*, u.nom as shared_by_name, up.profile_photo_url,
               t.nom as training_name, t.date as training_date, t.duration,
               ws.likes_count, ws.comments_count,
               EXISTS(SELECT 1 FROM workout_likes wl WHERE wl.share_id = ws.id AND wl.user_id = $1) as user_liked
        FROM workout_shares ws
        JOIN users u ON ws.shared_by = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        JOIN trainings t ON ws.training_id = t.id
        WHERE (
          ws.visibility = 'public' OR
          (ws.visibility = 'friends' AND EXISTS(
            SELECT 1 FROM friendships f 
            WHERE ((f.requester_id = $1 AND f.addressee_id = ws.shared_by) OR 
                   (f.addressee_id = $1 AND f.requester_id = ws.shared_by))
              AND f.status = 'accepted'
          )) OR
          ws.shared_by = $1
        )
        ORDER BY ws.created_at DESC
        LIMIT $2 OFFSET $3
      `,
        [req.user!.id, parseInt(limit as string), parseInt(offset as string)]
      );

      res.json({
        success: true,
        message: "Feed récupéré",
        data: result.rows,
      } as ApiResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du feed",
    } as ApiResponse);
  }
});

// Like/unlike workout
router.post(
  "/workouts/:shareId/like",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const shareId = parseInt(req.params.shareId);

      const client = await pool.connect();
      try {
        // Check if already liked
        const existingLike = await client.query(
          "SELECT id FROM workout_likes WHERE share_id = $1 AND user_id = $2",
          [shareId, req.user!.id]
        );

        if (existingLike.rows.length > 0) {
          // Unlike
          await client.query(
            "DELETE FROM workout_likes WHERE share_id = $1 AND user_id = $2",
            [shareId, req.user!.id]
          );
          await client.query(
            "UPDATE workout_shares SET likes_count = likes_count - 1 WHERE id = $1",
            [shareId]
          );

          res.json({
            success: true,
            message: "Like retiré",
            data: { liked: false },
          } as ApiResponse);
        } else {
          // Like
          await client.query(
            "INSERT INTO workout_likes (share_id, user_id) VALUES ($1, $2)",
            [shareId, req.user!.id]
          );
          await client.query(
            "UPDATE workout_shares SET likes_count = likes_count + 1 WHERE id = $1",
            [shareId]
          );

          res.json({
            success: true,
            message: "Like ajouté",
            data: { liked: true },
          } as ApiResponse);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors du like",
      } as ApiResponse);
    }
  }
);

export default router;
