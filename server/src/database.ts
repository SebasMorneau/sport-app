import { Pool } from "pg";

const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  throw new Error("DB_PASSWORD environment variable is required");
}

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "sportapp",
  user: process.env.DB_USER || "sportapp_user",
  password: dbPassword,
});

export const initDatabase = async () => {
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nom VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create exercises table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        muscle_principal VARCHAR(100) NOT NULL,
        equipement VARCHAR(100) NOT NULL,
        description_fr TEXT,
        instructions TEXT,
        is_predefined BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user custom exercises
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_exercises (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        custom_name VARCHAR(255),
        custom_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, exercise_id)
      )
    `);

    // Create training sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER, -- in minutes
        notes TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sets (individual exercise sets within a training)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sets (
        id SERIAL PRIMARY KEY,
        training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        reps INTEGER NOT NULL,
        weight_kg DECIMAL(5,2),
        rest_seconds INTEGER,
        set_order INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create workout programs table (POC 6)
    await client.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty_level VARCHAR(50) DEFAULT 'intermediate',
        duration_weeks INTEGER DEFAULT 4,
        sessions_per_week INTEGER DEFAULT 3,
        is_predefined BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create program templates (days in a program)
    await client.query(`
      CREATE TABLE IF NOT EXISTS program_templates (
        id SERIAL PRIMARY KEY,
        program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        rest_day BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create template exercises (exercises in a program day)
    await client.query(`
      CREATE TABLE IF NOT EXISTS template_exercises (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES program_templates(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        exercise_order INTEGER NOT NULL,
        target_sets INTEGER DEFAULT 3,
        target_reps_min INTEGER,
        target_reps_max INTEGER,
        target_weight_percentage DECIMAL(4,2),
        rest_seconds INTEGER DEFAULT 60,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user program subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_programs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
        start_date DATE DEFAULT CURRENT_DATE,
        current_week INTEGER DEFAULT 1,
        current_day INTEGER DEFAULT 1,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, program_id, start_date)
      )
    `);

    // Create progress photos table (POC 7)
    await client.query(`
      CREATE TABLE IF NOT EXISTS progress_photos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        photo_url VARCHAR(500) NOT NULL,
        photo_type VARCHAR(50) DEFAULT 'progress', -- 'progress', 'before', 'after'
        description TEXT,
        weight_kg DECIMAL(5,2),
        body_fat_percentage DECIMAL(4,2),
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create body measurements table (POC 7)
    await client.query(`
      CREATE TABLE IF NOT EXISTS body_measurements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        weight_kg DECIMAL(5,2),
        height_cm DECIMAL(5,2),
        body_fat_percentage DECIMAL(4,2),
        muscle_mass_kg DECIMAL(5,2),
        chest_cm DECIMAL(5,2),
        waist_cm DECIMAL(5,2),
        hips_cm DECIMAL(5,2),
        bicep_cm DECIMAL(5,2),
        thigh_cm DECIMAL(5,2),
        notes TEXT,
        measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user profiles table (POC 8)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        bio TEXT,
        profile_photo_url VARCHAR(500),
        fitness_level VARCHAR(50) DEFAULT 'intermediate',
        goals TEXT[],
        privacy_level VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
        show_progress BOOLEAN DEFAULT true,
        show_workouts BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create friendships table (POC 8)
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, addressee_id)
      )
    `);

    // Create workout shares table (POC 8)
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_shares (
        id SERIAL PRIMARY KEY,
        training_id INTEGER REFERENCES trainings(id) ON DELETE CASCADE,
        shared_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        caption TEXT,
        visibility VARCHAR(20) DEFAULT 'friends', -- 'public', 'friends', 'private'
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create workout likes table (POC 8)
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_likes (
        id SERIAL PRIMARY KEY,
        share_id INTEGER REFERENCES workout_shares(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(share_id, user_id)
      )
    `);

    // Create workout comments table (POC 8)
    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_comments (
        id SERIAL PRIMARY KEY,
        share_id INTEGER REFERENCES workout_shares(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create food database table (POC 9)
    await client.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        barcode VARCHAR(50),
        calories_per_100g INTEGER NOT NULL,
        protein_per_100g DECIMAL(5,2) NOT NULL,
        carbs_per_100g DECIMAL(5,2) NOT NULL,
        fat_per_100g DECIMAL(5,2) NOT NULL,
        fiber_per_100g DECIMAL(5,2) DEFAULT 0,
        sugar_per_100g DECIMAL(5,2) DEFAULT 0,
        sodium_per_100g DECIMAL(5,2) DEFAULT 0,
        serving_size_g DECIMAL(6,2) DEFAULT 100,
        category VARCHAR(100),
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create nutrition tracking table (POC 9)
    await client.query(`
      CREATE TABLE IF NOT EXISTS nutrition_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
        quantity_g DECIMAL(6,2) NOT NULL,
        meal_type VARCHAR(50) DEFAULT 'other', -- 'breakfast', 'lunch', 'dinner', 'snack', 'other'
        consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create meal plans table (POC 9)
    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        target_calories INTEGER,
        target_protein DECIMAL(5,2),
        target_carbs DECIMAL(5,2),
        target_fat DECIMAL(5,2),
        active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create meal plan entries table (POC 9)
    await client.query(`
      CREATE TABLE IF NOT EXISTS meal_plan_entries (
        id SERIAL PRIMARY KEY,
        meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
        food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
        quantity_g DECIMAL(6,2) NOT NULL,
        meal_type VARCHAR(50) NOT NULL,
        day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create AI recommendations table (POC 10)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recommendation_type VARCHAR(50) NOT NULL, -- 'exercise', 'program', 'nutrition', 'recovery'
        content JSONB NOT NULL,
        confidence_score DECIMAL(3,2) DEFAULT 0.5,
        viewed BOOLEAN DEFAULT false,
        applied BOOLEAN DEFAULT false,
        feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    // Create wearable devices table (POC 11)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wearable_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_type VARCHAR(50) NOT NULL, -- 'fitbit', 'apple_watch', 'garmin', 'polar'
        device_id VARCHAR(255) NOT NULL,
        device_name VARCHAR(255),
        connected BOOLEAN DEFAULT true,
        last_sync TIMESTAMP,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, device_type, device_id)
      )
    `);

    // Create heart rate data table (POC 11)
    await client.query(`
      CREATE TABLE IF NOT EXISTS heart_rate_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES wearable_devices(id) ON DELETE CASCADE,
        heart_rate INTEGER NOT NULL,
        recorded_at TIMESTAMP NOT NULL,
        context VARCHAR(50), -- 'resting', 'workout', 'recovery', 'sleep'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sleep data table (POC 11)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sleep_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id INTEGER REFERENCES wearable_devices(id) ON DELETE CASCADE,
        sleep_start TIMESTAMP NOT NULL,
        sleep_end TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL,
        deep_sleep_minutes INTEGER,
        light_sleep_minutes INTEGER,
        rem_sleep_minutes INTEGER,
        awake_minutes INTEGER,
        sleep_quality_score INTEGER CHECK (sleep_quality_score >= 0 AND sleep_quality_score <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create offline data queue table (POC 12)
    await client.query(`
      CREATE TABLE IF NOT EXISTS offline_data_queue (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        table_name VARCHAR(100) NOT NULL,
        operation VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
        data JSONB NOT NULL,
        sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'synced', 'failed', 'conflict'
        retry_count INTEGER DEFAULT 0,
        last_attempt TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_principal)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_exercises_equipement ON exercises(equipement)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_trainings_user_date ON trainings(user_id, date)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_sets_training ON sets(training_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_sets_exercise ON sets(exercise_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_programs_predefined ON programs(is_predefined)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_program_templates_program ON program_templates(program_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_template_exercises_template ON template_exercises(template_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_user_programs_user ON user_programs(user_id, active)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_progress_photos_user ON progress_photos(user_id, taken_at)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON body_measurements(user_id, measured_at)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_workout_shares_visibility ON workout_shares(visibility, created_at)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date ON nutrition_entries(user_id, consumed_at)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(nom)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user ON ai_recommendations(user_id, viewed)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_wearable_devices_user ON wearable_devices(user_id, connected)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_heart_rate_user_date ON heart_rate_data(user_id, recorded_at)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_sleep_data_user_date ON sleep_data(user_id, sleep_start)`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_offline_queue_sync ON offline_data_queue(sync_status, created_at)`
    );

    // Seed predefined exercises if empty
    const exerciseCount = await client.query(
      "SELECT COUNT(*) FROM exercises WHERE is_predefined = true"
    );
    if (parseInt(exerciseCount.rows[0].count) === 0) {
      await seedExercises(client);
    }

    // Seed predefined programs if empty (POC 6)
    const programCount = await client.query(
      "SELECT COUNT(*) FROM programs WHERE is_predefined = true"
    );
    if (parseInt(programCount.rows[0].count) === 0) {
      await seedPrograms(client);
    }

    // Seed foods database if empty (POC 9)
    const foodCount = await client.query("SELECT COUNT(*) FROM foods");
    if (parseInt(foodCount.rows[0].count) === 0) {
      await seedFoods(client);
    }

    // Database tables initialized successfully
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const seedExercises = async (client: any) => {
  const exercises = [
    // Pectoraux
    {
      nom: "Développé couché",
      muscle_principal: "Pectoraux",
      equipement: "Barre",
      description_fr: "Exercice de base pour les pectoraux",
      instructions:
        "Allongé sur un banc, descendez la barre vers la poitrine puis poussez vers le haut.",
    },
    {
      nom: "Développé incliné",
      muscle_principal: "Pectoraux",
      equipement: "Barre",
      description_fr: "Développé sur banc incliné",
      instructions:
        "Sur banc incliné à 30-45°, même mouvement que le développé couché.",
    },
    {
      nom: "Développé avec haltères",
      muscle_principal: "Pectoraux",
      equipement: "Haltères",
      description_fr: "Développé couché avec haltères",
      instructions:
        "Même mouvement qu'avec la barre, mais avec plus d'amplitude.",
    },
    {
      nom: "Écarté couché",
      muscle_principal: "Pectoraux",
      equipement: "Haltères",
      description_fr: "Écarté allongé sur banc",
      instructions: "Bras écartés, descendez les haltères en arc de cercle.",
    },
    {
      nom: "Pompes",
      muscle_principal: "Pectoraux",
      equipement: "Poids du corps",
      description_fr: "Exercice au poids du corps",
      instructions: "Position planche, descendez vers le sol puis remontez.",
    },
    {
      nom: "Dips",
      muscle_principal: "Pectoraux",
      equipement: "Barres parallèles",
      description_fr: "Exercice aux barres parallèles",
      instructions:
        "Suspendez-vous aux barres et descendez en fléchissant les bras.",
    },

    // Dos
    {
      nom: "Tractions",
      muscle_principal: "Dos",
      equipement: "Barre de traction",
      description_fr: "Exercice de traction au poids du corps",
      instructions:
        "Suspendez-vous à la barre et tirez votre corps vers le haut.",
    },
    {
      nom: "Rowing barre",
      muscle_principal: "Dos",
      equipement: "Barre",
      description_fr: "Tirage horizontal avec barre",
      instructions: "Penché vers l'avant, tirez la barre vers le ventre.",
    },
    {
      nom: "Rowing haltère",
      muscle_principal: "Dos",
      equipement: "Haltères",
      description_fr: "Tirage unilatéral avec haltère",
      instructions: "Appuyé sur un banc, tirez l'haltère vers la hanche.",
    },
    {
      nom: "Tirage vertical",
      muscle_principal: "Dos",
      equipement: "Poulie",
      description_fr: "Tirage à la poulie haute",
      instructions: "Assis, tirez la barre vers la poitrine.",
    },
    {
      nom: "Soulevé de terre",
      muscle_principal: "Dos",
      equipement: "Barre",
      description_fr: "Exercice complet dos et jambes",
      instructions: "Soulevez la barre du sol en gardant le dos droit.",
    },

    // Épaules
    {
      nom: "Développé militaire",
      muscle_principal: "Épaules",
      equipement: "Barre",
      description_fr: "Développé debout avec barre",
      instructions: "Debout, poussez la barre au-dessus de la tête.",
    },
    {
      nom: "Développé assis haltères",
      muscle_principal: "Épaules",
      equipement: "Haltères",
      description_fr: "Développé assis avec haltères",
      instructions: "Assis, poussez les haltères au-dessus de la tête.",
    },
    {
      nom: "Élévations latérales",
      muscle_principal: "Épaules",
      equipement: "Haltères",
      description_fr: "Élévations sur les côtés",
      instructions: "Bras tendus, montez les haltères sur les côtés.",
    },
    {
      nom: "Élévations frontales",
      muscle_principal: "Épaules",
      equipement: "Haltères",
      description_fr: "Élévations vers l'avant",
      instructions: "Bras tendus, montez les haltères devant vous.",
    },
    {
      nom: "Oiseau",
      muscle_principal: "Épaules",
      equipement: "Haltères",
      description_fr: "Exercice pour deltoïdes postérieurs",
      instructions: "Penché, écartez les bras sur les côtés.",
    },

    // Bras - Biceps
    {
      nom: "Curl biceps",
      muscle_principal: "Biceps",
      equipement: "Haltères",
      description_fr: "Flexion des biceps avec haltères",
      instructions: "Bras le long du corps, fléchissez l'avant-bras.",
    },
    {
      nom: "Curl barre",
      muscle_principal: "Biceps",
      equipement: "Barre",
      description_fr: "Flexion des biceps avec barre",
      instructions: "Tenez la barre, fléchissez les avant-bras.",
    },
    {
      nom: "Curl marteau",
      muscle_principal: "Biceps",
      equipement: "Haltères",
      description_fr: "Curl en prise neutre",
      instructions: "Paumes face à face, fléchissez les avant-bras.",
    },

    // Bras - Triceps
    {
      nom: "Extension triceps couché",
      muscle_principal: "Triceps",
      equipement: "Barre",
      description_fr: "Extension allongé sur banc",
      instructions: "Allongé, descendez la barre vers le front puis remontez.",
    },
    {
      nom: "Extension triceps debout",
      muscle_principal: "Triceps",
      equipement: "Haltères",
      description_fr: "Extension au-dessus de la tête",
      instructions: "Bras levés, descendez l'haltère derrière la tête.",
    },

    // Jambes
    {
      nom: "Squat",
      muscle_principal: "Quadriceps",
      equipement: "Barre",
      description_fr: "Flexion des jambes avec barre",
      instructions:
        "Barre sur les épaules, descendez en fléchissant les jambes.",
    },
    {
      nom: "Fentes",
      muscle_principal: "Quadriceps",
      equipement: "Haltères",
      description_fr: "Fentes avec haltères",
      instructions: "Un pied en avant, descendez en fléchissant les jambes.",
    },
    {
      nom: "Presse à cuisses",
      muscle_principal: "Quadriceps",
      equipement: "Machine",
      description_fr: "Presse horizontale pour les jambes",
      instructions: "Assis sur la machine, poussez la charge avec les jambes.",
    },
    {
      nom: "Extension quadriceps",
      muscle_principal: "Quadriceps",
      equipement: "Machine",
      description_fr: "Isolation des quadriceps",
      instructions: "Assis, étendez les jambes contre la résistance.",
    },
    {
      nom: "Curl ischio-jambiers",
      muscle_principal: "Ischio-jambiers",
      equipement: "Machine",
      description_fr: "Isolation des ischio-jambiers",
      instructions: "Allongé, fléchissez les jambes contre la résistance.",
    },
    {
      nom: "Mollets debout",
      muscle_principal: "Mollets",
      equipement: "Machine",
      description_fr: "Extension des mollets debout",
      instructions: "Debout, montez sur la pointe des pieds.",
    },
  ];

  for (const exercise of exercises) {
    await client.query(
      `INSERT INTO exercises (nom, muscle_principal, equipement, description_fr, instructions, is_predefined) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        exercise.nom,
        exercise.muscle_principal,
        exercise.equipement,
        exercise.description_fr,
        exercise.instructions,
        true,
      ]
    );
  }
};

const seedPrograms = async (client: any) => {
  // Push/Pull/Legs Program
  const pplProgram = await client.query(
    `INSERT INTO programs (nom, description, difficulty_level, duration_weeks, sessions_per_week, is_predefined) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      "Push/Pull/Legs",
      "Programme classique 3 jours focalisé sur les groupes musculaires",
      "intermediate",
      8,
      3,
      true,
    ]
  );

  // Push Day
  const pushDay = await client.query(
    `INSERT INTO program_templates (program_id, day_number, nom, description) 
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      pplProgram.rows[0].id,
      1,
      "Push - Pectoraux/Épaules/Triceps",
      "Jour de poussée pour le haut du corps",
    ]
  );

  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [pushDay.rows[0].id, 1, 1, 4, 6, 8] // Développé couché
  );
  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [pushDay.rows[0].id, 2, 2, 3, 8, 10] // Développé incliné
  );
  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [pushDay.rows[0].id, 10, 3, 3, 8, 12] // Développé militaire
  );

  // Pull Day
  const pullDay = await client.query(
    `INSERT INTO program_templates (program_id, day_number, nom, description) 
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      pplProgram.rows[0].id,
      2,
      "Pull - Dos/Biceps",
      "Jour de tirage pour le haut du corps",
    ]
  );

  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [pullDay.rows[0].id, 7, 1, 4, 6, 10] // Tractions
  );
  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [pullDay.rows[0].id, 8, 2, 4, 8, 10] // Rowing barre
  );

  // Legs Day
  const legsDay = await client.query(
    `INSERT INTO program_templates (program_id, day_number, nom, description) 
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [pplProgram.rows[0].id, 3, "Legs - Jambes/Mollets", "Jour jambes complet"]
  );

  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [legsDay.rows[0].id, 22, 1, 4, 6, 10] // Squat
  );
  await client.query(
    `INSERT INTO template_exercises (template_id, exercise_id, exercise_order, target_sets, target_reps_min, target_reps_max) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [legsDay.rows[0].id, 23, 2, 3, 10, 12] // Fentes
  );

  // Upper/Lower Program
  const upperLowerProgram = await client.query(
    `INSERT INTO programs (nom, description, difficulty_level, duration_weeks, sessions_per_week, is_predefined) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      "Upper/Lower",
      "Programme 4 jours alternant haut et bas du corps",
      "intermediate",
      6,
      4,
      true,
    ]
  );

  // Full Body Program
  const fullBodyProgram = await client.query(
    `INSERT INTO programs (nom, description, difficulty_level, duration_weeks, sessions_per_week, is_predefined) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      "Full Body Débutant",
      "Programme complet 3 fois par semaine pour débutants",
      "beginner",
      4,
      3,
      true,
    ]
  );
};

const seedFoods = async (client: any) => {
  const foods = [
    // Protéines
    {
      nom: "Blanc de poulet",
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      fat: 3.6,
      category: "Viandes",
    },
    {
      nom: "Saumon",
      calories: 208,
      protein: 25.4,
      carbs: 0.0,
      fat: 12.4,
      category: "Poissons",
    },
    {
      nom: "Œufs entiers",
      calories: 155,
      protein: 13.0,
      carbs: 1.1,
      fat: 11.0,
      category: "Œufs",
    },
    {
      nom: "Fromage blanc 0%",
      calories: 47,
      protein: 8.0,
      carbs: 4.0,
      fat: 0.2,
      category: "Laitages",
    },
    {
      nom: "Thon en conserve",
      calories: 132,
      protein: 28.0,
      carbs: 0.0,
      fat: 1.3,
      category: "Poissons",
    },

    // Glucides
    {
      nom: "Riz basmati",
      calories: 365,
      protein: 7.5,
      carbs: 78.0,
      fat: 1.0,
      category: "Féculents",
    },
    {
      nom: "Pâtes complètes",
      calories: 348,
      protein: 13.0,
      carbs: 64.0,
      fat: 2.5,
      category: "Féculents",
    },
    {
      nom: "Patate douce",
      calories: 86,
      protein: 1.6,
      carbs: 20.0,
      fat: 0.1,
      category: "Légumes",
    },
    {
      nom: "Flocons d'avoine",
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      category: "Céréales",
    },
    {
      nom: "Banane",
      calories: 89,
      protein: 1.1,
      carbs: 23.0,
      fat: 0.3,
      category: "Fruits",
    },

    // Légumes
    {
      nom: "Brocolis",
      calories: 34,
      protein: 2.8,
      carbs: 7.0,
      fat: 0.4,
      category: "Légumes",
    },
    {
      nom: "Épinards",
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      category: "Légumes",
    },
    {
      nom: "Courgettes",
      calories: 17,
      protein: 1.2,
      carbs: 3.1,
      fat: 0.3,
      category: "Légumes",
    },
    {
      nom: "Tomates",
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      category: "Légumes",
    },

    // Lipides
    {
      nom: "Huile d'olive",
      calories: 884,
      protein: 0.0,
      carbs: 0.0,
      fat: 100.0,
      category: "Huiles",
    },
    {
      nom: "Avocat",
      calories: 160,
      protein: 2.0,
      carbs: 8.5,
      fat: 14.7,
      category: "Fruits",
    },
    {
      nom: "Amandes",
      calories: 579,
      protein: 21.2,
      carbs: 21.6,
      fat: 49.9,
      category: "Fruits secs",
    },
    {
      nom: "Noix",
      calories: 654,
      protein: 15.2,
      carbs: 13.7,
      fat: 65.2,
      category: "Fruits secs",
    },

    // Snacks/Compléments
    {
      nom: "Protéine whey",
      calories: 410,
      protein: 80.0,
      carbs: 7.0,
      fat: 7.0,
      category: "Suppléments",
    },
    {
      nom: "Yaourt grec 0%",
      calories: 59,
      protein: 10.0,
      carbs: 4.0,
      fat: 0.4,
      category: "Laitages",
    },
  ];

  for (const food of foods) {
    await client.query(
      `INSERT INTO foods (nom, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        food.nom,
        food.calories,
        food.protein,
        food.carbs,
        food.fat,
        food.category,
        true,
      ]
    );
  }
};

export { pool };
