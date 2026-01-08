export type Exercise = {
  exercise_id: string;
  name: string;
  video_url: string;
  instructions: string[];
};

export type Bodypart = {
  bodypart_id: string;
  name: string;
};

export type ExerciseBodypart = {
  exercise_bodypart_id: string;
  exercise_id: string;
  bodypart_id: string;
};

export type Muscle = {
  muscle_id: string;
  bodypart_id: string;
  name: string;
};

export type ExerciseMuscle = {
  exercise_muscle_id: string;
  exercise_id: string;
  muscle_id: string;
  is_primary: boolean;
};

export type Equipment = {
  equipment_id: string;
  name: string;
};

export type ExerciseEquipment = {
  exercise_equipment_id: string;
  exercise_id: string;
  equipment_id: string;
};

export type Type = {
  type_id: string;
  name: string;
  type: string;
  description: string;
};

export type ExerciseType = {
  exercise_type_id: string;
  exercise_id: string;
  type_id: string;
};
