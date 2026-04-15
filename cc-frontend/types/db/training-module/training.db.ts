export type Training = {
  training_id: number;
  coach_no: number;
  name: string;
  date: string;
  time: string;
  duration: number;
};

export type AthleteTraining = {
  athlete_training_id: number;
  athlete_no: string;
  training_id: string;
};

export type AthleteTrainingExercise = {
  athlete_training_exercise_id: number;
  athlete_training_id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  duration: number;
};
