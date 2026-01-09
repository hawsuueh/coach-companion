export type Training = {
  training_id: string;
  coach_no: string;
  name: string;
  date: string;
  time: string;
  duration: number;
};

export type AthleteTraining = {
  athlete_training_id: string;
  athlete_no: string;
  training_id: string;
};

export type AthleteTrainingExercise = {
  athlete_training_exercise_id: string;
  athlete_training_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  duration: number;
};
