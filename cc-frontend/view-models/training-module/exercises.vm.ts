// exercise.vm.ts
import {
  getExerciseService,
  getExercisesService,
  updateExerciseService,
  deleteExerciseService,
  getEquipmentsService,
  getMusclesService
} from '@/services/training-module/exercises.service';

// Get all exercises
export const getExercisesVM = async () => {
  const raw = await getExercisesService();

  return raw.map((ex: any) => {
    // 1. Dig into the nested join table
    // ex.exercise_bodypart is an array of objects
    const bodypartNames =
      ex.exercise_bodypart
        ?.map((eb: any) => eb.bodypart?.name) // Extract the 'name' from the nested 'bodypart' object
        .filter((name: string | undefined) => name != null) || []; // Remove any nulls just in case

    // 2. Format the body parts as a readable string for the 'description' field
    const description =
      bodypartNames.length > 0 ? bodypartNames.join(', ') : 'General Exercise';

    return {
      exerciseId: ex.exercise_id,
      exerciseName: ex.name,
      description: description // This now shows "Chest, Shoulders" etc.
    };
  });
};

export const getExerciseVM = async (exerciseId: string) => {
  const raw = await getExerciseService(exerciseId);
  if (!raw) return null;

  return {
    exerciseId: raw.exercise_id,
    name: raw.name,
    url: raw.video_url,
    instructions: Array.isArray(raw.instructions) ? raw.instructions : []
  };
};

// Update Exercise
export const updateExerciseVM = async (
  exerciseId: string,
  name: string,
  videoUrl: string,
  instructions: string[],
  equipmentIds: string[],
  primaryMuscleIds: string[],
  secondaryMuscleIds: string[]
) => {
  try {
    await updateExerciseService(
      exerciseId,
      name,
      videoUrl,
      instructions,
      equipmentIds,
      primaryMuscleIds,
      secondaryMuscleIds
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

// Delete Exercise
export const deleteExerciseVM = async (exerciseId: string) => {
  try {
    await deleteExerciseService(exerciseId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const getEquipmentOptionsVM = async () => {
  const raw = await getEquipmentsService();
  return raw.map((eq: any) => ({
    label: eq.name,
    value: eq.equipment_id.toString()
  }));
};

export const getMuscleOptionsVM = async () => {
  const raw = await getMusclesService();
  return raw.map((m: any) => ({
    label: m.name,
    value: m.muscle_id.toString()
  }));
};
