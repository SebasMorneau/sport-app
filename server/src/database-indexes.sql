-- Database Indexes for SportApp Performance Optimization
-- Run this script after creating all tables to add performance indexes

-- ==============================================
-- Authentication & Users Indexes
-- ==============================================

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(created_at) WHERE created_at IS NOT NULL;

-- ==============================================
-- Exercise & Training Indexes  
-- ==============================================

-- Exercises table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_muscle_principal ON exercises(muscle_principal);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_equipement ON exercises(equipement);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_predefined ON exercises(is_predefined);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercises_search ON exercises USING gin(to_tsvector('french', nom || ' ' || COALESCE(description_fr, '')));

-- Trainings table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_user_id ON trainings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_date ON trainings(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_user_date ON trainings(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_created_at ON trainings(created_at);

-- Sets table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sets_training_id ON sets(training_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sets_training_exercise ON sets(training_id, exercise_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sets_created_at ON sets(created_at);

-- ==============================================
-- Programs & Templates Indexes
-- ==============================================

-- Programs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programs_created_by ON programs(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programs_predefined ON programs(is_predefined);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programs_difficulty ON programs(difficulty_level);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_programs_search ON programs USING gin(to_tsvector('french', nom || ' ' || COALESCE(description, '')));

-- Program exercises indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_exercises_program_id ON program_exercises(program_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_exercises_exercise_id ON program_exercises(exercise_id);

-- User programs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_programs_user_id ON user_programs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_programs_program_id ON user_programs(program_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_programs_status ON user_programs(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_programs_started_at ON user_programs(started_at);

-- User program progress indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_progress_user_program_id ON user_program_progress(user_program_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_progress_week ON user_program_progress(week);

-- ==============================================
-- Progress & Body Measurements Indexes
-- ==============================================

-- Progress photos indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_photos_date ON progress_photos(photo_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_photos_type ON progress_photos(photo_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);

-- Body measurements indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_body_measurements_user_id ON body_measurements(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_body_measurements_date ON body_measurements(measurement_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, measurement_date DESC);

-- ==============================================
-- Social Features Indexes
-- ==============================================

-- User profiles indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_privacy ON user_profiles(privacy_level);

-- Friends indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_created_at ON friends(created_at);

-- Friend requests indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friend_requests_from_user ON friend_requests(from_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Workout shares indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_shares_user_id ON workout_shares(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_shares_training_id ON workout_shares(training_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_shares_shared_at ON workout_shares(shared_at);

-- Activity feed indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_feed_activity_type ON activity_feed(activity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- ==============================================
-- Nutrition Indexes
-- ==============================================

-- Foods indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_foods_search ON foods USING gin(to_tsvector('french', name || ' ' || COALESCE(brand, '')));

-- Nutrition entries indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_entries_user_id ON nutrition_entries(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_entries_date ON nutrition_entries(entry_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_entries_food_id ON nutrition_entries(food_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_entries_user_date ON nutrition_entries(user_id, entry_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_entries_meal_type ON nutrition_entries(meal_type);

-- ==============================================
-- AI & Recommendations Indexes
-- ==============================================

-- AI recommendations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);

-- User preferences indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_preference_key ON user_preferences(preference_key);

-- ==============================================
-- Wearables & Health Data Indexes
-- ==============================================

-- Wearable devices indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wearable_devices_user_id ON wearable_devices(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wearable_devices_device_type ON wearable_devices(device_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wearable_devices_is_active ON wearable_devices(is_active);

-- Heart rate data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_heart_rate_data_user_id ON heart_rate_data(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_heart_rate_data_recorded_at ON heart_rate_data(recorded_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_heart_rate_data_user_time ON heart_rate_data(user_id, recorded_at DESC);

-- Sleep data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_data_user_id ON sleep_data(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_data_sleep_date ON sleep_data(sleep_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_data_user_date ON sleep_data(user_id, sleep_date DESC);

-- Activity data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_data_user_id ON activity_data(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_data_date ON activity_data(activity_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_data_user_date ON activity_data(user_id, activity_date DESC);

-- ==============================================
-- Sync & Offline Support Indexes
-- ==============================================

-- Sync queue indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_queue_retry_count ON sync_queue(retry_count);

-- Sync conflicts indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_conflicts_table_name ON sync_conflicts(table_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);

-- ==============================================
-- Composite Indexes for Common Queries
-- ==============================================

-- User training history (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_user_date_status ON trainings(user_id, date DESC, created_at DESC);

-- Exercise performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sets_user_exercise_date ON sets 
    USING btree (exercise_id, created_at DESC) 
    INCLUDE (reps, weight_kg, training_id);

-- Nutrition daily totals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_daily_totals ON nutrition_entries(user_id, entry_date, meal_type);

-- Social activity timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_timeline ON activity_feed(user_id, created_at DESC, activity_type);

-- Program completion tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_program_completion ON user_programs(user_id, status, started_at DESC);

-- ==============================================
-- Performance Statistics
-- ==============================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE exercises;
ANALYZE trainings;
ANALYZE sets;
ANALYZE programs;
ANALYZE program_exercises;
ANALYZE user_programs;
ANALYZE progress_photos;
ANALYZE body_measurements;
ANALYZE nutrition_entries;
ANALYZE foods;
ANALYZE ai_recommendations;
ANALYZE wearable_devices;
ANALYZE heart_rate_data;
ANALYZE sleep_data;
ANALYZE activity_data;
ANALYZE sync_queue;

-- ==============================================
-- Index Maintenance
-- ==============================================

-- Enable auto-vacuum for better performance
-- (This should be set at database level, but including for reference)

-- Check index usage with this query:
-- SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- ORDER BY idx_tup_read DESC;

-- Drop unused indexes with this query:
-- SELECT schemaname, tablename, indexname 
-- FROM pg_stat_user_indexes 
-- WHERE idx_tup_read = 0 AND idx_tup_fetch = 0;