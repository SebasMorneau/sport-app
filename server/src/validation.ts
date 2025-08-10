import Joi from "joi";

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit contenir au moins 6 caractères",
    "any.required": "Mot de passe requis",
  }),
  nom: Joi.string().min(2).max(50).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne peut pas dépasser 50 caractères",
    "any.required": "Nom requis",
  }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis",
  }),
  password: Joi.string().required().messages({
    "any.required": "Mot de passe requis",
  }),
});

// Exercise validation schemas
export const createExerciseSchema = Joi.object({
  nom: Joi.string().min(2).max(255).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne peut pas dépasser 255 caractères",
    "any.required": "Nom de l'exercice requis",
  }),
  muscle_principal: Joi.string().min(2).max(100).required().messages({
    "string.min": "Le muscle principal doit contenir au moins 2 caractères",
    "string.max": "Le muscle principal ne peut pas dépasser 100 caractères",
    "any.required": "Muscle principal requis",
  }),
  equipement: Joi.string().min(2).max(100).required().messages({
    "string.min": "L'équipement doit contenir au moins 2 caractères",
    "string.max": "L'équipement ne peut pas dépasser 100 caractères",
    "any.required": "Équipement requis",
  }),
  description_fr: Joi.string().max(1000).optional().messages({
    "string.max": "La description ne peut pas dépasser 1000 caractères",
  }),
  instructions: Joi.string().max(2000).optional().messages({
    "string.max": "Les instructions ne peuvent pas dépasser 2000 caractères",
  }),
});

export const searchExercisesSchema = Joi.object({
  search: Joi.string().optional(),
  muscle_principal: Joi.string().optional(),
  equipement: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

// Training validation schemas
export const createTrainingSchema = Joi.object({
  nom: Joi.string().min(2).max(255).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne peut pas dépasser 255 caractères",
    "any.required": "Nom de la séance requis",
  }),
  notes: Joi.string().max(1000).optional().messages({
    "string.max": "Les notes ne peuvent pas dépasser 1000 caractères",
  }),
});

export const createSetSchema = Joi.object({
  exercise_id: Joi.number().integer().positive().required().messages({
    "number.base": "L'ID de l'exercice doit être un nombre",
    "number.integer": "L'ID de l'exercice doit être un entier",
    "number.positive": "L'ID de l'exercice doit être positif",
    "any.required": "ID de l'exercice requis",
  }),
  reps: Joi.number().integer().min(1).max(1000).required().messages({
    "number.base": "Le nombre de répétitions doit être un nombre",
    "number.integer": "Le nombre de répétitions doit être un entier",
    "number.min": "Au moins 1 répétition requise",
    "number.max": "Maximum 1000 répétitions",
    "any.required": "Nombre de répétitions requis",
  }),
  weight_kg: Joi.number().min(0).max(1000).optional().messages({
    "number.base": "Le poids doit être un nombre",
    "number.min": "Le poids ne peut pas être négatif",
    "number.max": "Poids maximum 1000kg",
  }),
  rest_seconds: Joi.number().integer().min(0).max(3600).optional().messages({
    "number.base": "Le temps de repos doit être un nombre",
    "number.integer": "Le temps de repos doit être un entier",
    "number.min": "Le temps de repos ne peut pas être négatif",
    "number.max": "Temps de repos maximum 1 heure",
  }),
  notes: Joi.string().max(500).optional().messages({
    "string.max": "Les notes ne peuvent pas dépasser 500 caractères",
  }),
});
