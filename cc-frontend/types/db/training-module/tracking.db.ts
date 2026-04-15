export type TrainingTracking = {
  training_tracking_id: string;
  training_id: string;
  date: string;
  time: string;
  remarks: string | null;
};

export type AthleteTrainingTracking = {
  athlete_training_tracking_id: string;
  athlete_training_id: string;
  status: 'assigned' | 'done' | 'missed';
  time_elapsed: number;
  date_executed: string | null;
};

export type AthleteTrainingExerciseTracking = {
  athlete_training_exercise_tracking_id: string;
  athlete_training_exercise_id: string;
  sets_finished: number;
  reps_finished: number;
  time_elapsed: number;
};
