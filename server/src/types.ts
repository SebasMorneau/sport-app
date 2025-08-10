export interface User {
  id: number;
  email: string;
  nom: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nom: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Exercise types
export interface Exercise {
  id: number;
  nom: string;
  muscle_principal: string;
  equipement: string;
  description_fr?: string;
  instructions?: string;
  is_predefined: boolean;
  created_at: Date;
}

export interface CreateExerciseRequest {
  nom: string;
  muscle_principal: string;
  equipement: string;
  description_fr?: string;
  instructions?: string;
}

export interface SearchExercisesRequest {
  search?: string;
  muscle_principal?: string;
  equipement?: string;
  limit?: number;
  offset?: number;
}

// Training types
export interface Training {
  id: number;
  user_id: number;
  nom: string;
  date: Date;
  duration?: number;
  notes?: string;
  completed: boolean;
  created_at: Date;
}

export interface CreateTrainingRequest {
  nom: string;
  notes?: string;
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
  created_at: Date;
}

export interface CreateSetRequest {
  exercise_id: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}