export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum ActivityLevel {
  Sedentary = 'sedentary',
  Active = 'active',
  VeryActive = 'very_active',
}

export enum TrainingHistory {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export enum TrainingGoal {
  FatLoss = 'fat_loss',
  MuscleGain = 'muscle_gain',
  Recomposition = 'recomposition',
  StrengthGain = 'strength_gain',
  AthleticPerformance = 'athletic_performance',
  FitnessModel = 'fitness_model',
}

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  date_of_birth: string;
  gender: Gender;
  height_cm: number;
  activity_level: ActivityLevel;
  training_history: TrainingHistory;
  workouts_per_week: number;
  training_goal: TrainingGoal;

  [key: string]: unknown;
}
