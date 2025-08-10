// API Response Types for SportApp
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ==============================================
// Authentication Types
// ==============================================

export interface User {
  id: number;
  email: string;
  nom: string;
  created_at: string;
  updated_at?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
}

// ==============================================
// Exercise Types
// ==============================================

export interface Exercise {
  id: number;
  nom: string;
  muscle_principal: string;
  equipement: string;
  description_fr?: string;
  instructions?: string;
  is_predefined: boolean;
  created_by?: number;
  created_at: string;
  image_url?: string;
}

export interface CreateExerciseRequest {
  nom: string;
  muscle_principal: string;
  equipement: string;
  description_fr?: string;
  instructions?: string;
}

export interface ExerciseSearchParams {
  search?: string;
  muscle_principal?: string;
  equipement?: string;
  limit?: number;
  offset?: number;
}

// ==============================================
// Training & Workout Types
// ==============================================

export interface Training {
  id: number;
  user_id: number;
  nom: string;
  date: string;
  duration?: number;
  notes?: string;
  completed: boolean;
  created_at: string;
  sets?: Set[];
}

export interface Set {
  id: number;
  training_id: number;
  exercise_id: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  set_order: number;
  notes?: string;
  created_at: string;
  exercise?: Exercise;
}

export interface CreateTrainingRequest {
  nom: string;
  notes?: string;
  date?: string;
}

export interface CreateSetRequest {
  exercise_id: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

// ==============================================
// Program Types
// ==============================================

export interface Program {
  id: number;
  nom: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  sessions_per_week: number;
  is_predefined: boolean;
  created_by?: number;
  created_at: string;
  exercises?: ProgramExercise[];
}

export interface ProgramExercise {
  id: number;
  program_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight_percentage?: number;
  rest_seconds?: number;
  day_of_week: number;
  week_number: number;
  exercise?: Exercise;
}

export interface UserProgram {
  id: number;
  user_id: number;
  program_id: number;
  status: 'active' | 'completed' | 'paused';
  started_at: string;
  completed_at?: string;
  current_week: number;
  program?: Program;
}

// ==============================================
// Progress Tracking Types
// ==============================================

export interface ProgressPhoto {
  id: number;
  user_id: number;
  photo_url: string;
  photo_type: 'front' | 'side' | 'back' | 'other';
  description?: string;
  photo_date: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: number;
  user_id: number;
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bicep_cm?: number;
  thigh_cm?: number;
  measurement_date: string;
  created_at: string;
}

export interface CreateProgressPhotoRequest {
  photo_url: string;
  photo_type: 'front' | 'side' | 'back' | 'other';
  description?: string;
  photo_date?: string;
}

export interface CreateBodyMeasurementRequest {
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  bicep_cm?: number;
  thigh_cm?: number;
  measurement_date?: string;
}

// ==============================================
// Nutrition Types
// ==============================================

export interface Food {
  id: number;
  name: string;
  brand?: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  barcode?: string;
}

export interface NutritionEntry {
  id: number;
  user_id: number;
  food_id: number;
  quantity_g: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  entry_date: string;
  created_at: string;
  food?: Food;
}

export interface CreateNutritionEntryRequest {
  food_id: number;
  quantity_g: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  entry_date?: string;
}

export interface NutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  entries_count: number;
}

// ==============================================
// Social Features Types
// ==============================================

export interface UserProfile {
  id: number;
  user_id: number;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  birth_date?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goals?: string;
  privacy_level: 'public' | 'friends' | 'private';
  created_at: string;
}

export interface Friend {
  id: number;
  user_id: number;
  friend_user_id: number;
  status: 'accepted' | 'pending' | 'blocked';
  created_at: string;
  friend?: User;
}

export interface WorkoutShare {
  id: number;
  user_id: number;
  training_id: number;
  shared_at: string;
  user?: User;
  training?: Training;
}

export interface ActivityFeed {
  id: number;
  user_id: number;
  activity_type:
    | 'workout_completed'
    | 'progress_photo'
    | 'achievement'
    | 'friend_added';
  activity_data: any;
  created_at: string;
  user?: User;
}

// ==============================================
// AI & Recommendations Types
// ==============================================

export interface AIRecommendation {
  id: number;
  user_id: number;
  recommendation_type: 'exercise' | 'workout' | 'nutrition' | 'rest';
  title: string;
  description: string;
  data: any;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  preference_key: string;
  preference_value: string;
  created_at: string;
}

// ==============================================
// Wearables & Health Data Types
// ==============================================

export interface WearableDevice {
  id: number;
  user_id: number;
  device_type: 'fitness_tracker' | 'smartwatch' | 'heart_rate_monitor';
  device_name: string;
  device_id: string;
  is_active: boolean;
  last_sync: string;
  created_at: string;
}

export interface HeartRateData {
  id: number;
  user_id: number;
  heart_rate: number;
  recorded_at: string;
  activity_type?: string;
  created_at: string;
}

export interface SleepData {
  id: number;
  user_id: number;
  sleep_date: string;
  bedtime: string;
  wake_time: string;
  total_sleep_minutes: number;
  deep_sleep_minutes?: number;
  light_sleep_minutes?: number;
  rem_sleep_minutes?: number;
  sleep_quality_score?: number;
  created_at: string;
}

export interface ActivityData {
  id: number;
  user_id: number;
  activity_date: string;
  steps: number;
  distance_km?: number;
  calories_burned?: number;
  active_minutes?: number;
  created_at: string;
}

// ==============================================
// Sync & Offline Types
// ==============================================

export interface SyncQueueItem {
  id: number;
  user_id: number;
  table_name: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  created_at: string;
}

export interface SyncConflict {
  id: number;
  user_id: number;
  table_name: string;
  record_id: number;
  local_data: any;
  server_data: any;
  status: 'pending' | 'resolved';
  created_at: string;
}

// ==============================================
// Statistics & Analytics Types
// ==============================================

export interface TrainingStats {
  total_trainings: number;
  total_duration_minutes: number;
  total_sets: number;
  total_reps: number;
  total_weight_lifted: number;
  average_duration: number;
  trainings_this_week: number;
  trainings_this_month: number;
  favorite_exercises: Exercise[];
  most_used_muscles: string[];
}

export interface ProgressStats {
  weight_progress: {
    date: string;
    weight: number;
  }[];
  measurement_progress: {
    date: string;
    measurements: BodyMeasurement;
  }[];
  strength_progress: {
    exercise_id: number;
    exercise_name: string;
    max_weight: number;
    progress_data: {
      date: string;
      weight: number;
    }[];
  }[];
}

// ==============================================
// Pagination Types
// ==============================================

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
