export interface AthleteTrainingExercise {
  athleteTrainingExerciseId: string;
  exerciseId: string;
  name: string;
  videoUrl: string;
  instructions: string[];
  sets: number;
  reps: number;
  duration: number;
  setsExecuted: number | null;
  repsExecuted: number | null;
  timeElapsed: number;
}

export interface AthleteTraining {
  athleteTrainingId: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  timeElapsed: number;
  dateExecuted: string | null;
  exercises: AthleteTrainingExercise[];
}
