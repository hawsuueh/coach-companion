// exercise.service.ts
import supabase from '@/config/supabaseClient';

// Get all Exercises
export const getExercisesService = async () => {
  const { data, error } = await supabase.from('exercise').select(`
      exercise_id,
      name,
      exercise_bodypart (
        bodypart (
          name
        )
      )
    `);

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return data;
};

export const getExerciseService = async (exerciseId: string) => {
  const { data, error } = await supabase
    .from('exercise')
    .select(
      `
      exercise_id,
      name,
      video_url,
      instructions
    `
    )
    .eq('exercise_id', exerciseId)
    .maybeSingle(); // ✅ returns one row or null

  if (error) {
    console.error('Supabase error:', error);
    return null;
  }

  return data;
};

// Insert Exercise
export const addExerciseService = async (
  name: string,
  videoUrl: string,
  instructions: string[],
  equipmentIds: string[],
  primaryMuscleIds: string[],
  secondaryMuscleIds: string[]
) => {
  // 1. Insert into exercise
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercise')
    .insert({
      name,
      video_url: videoUrl,
      instructions
    })
    .select()
    .single();

  if (exerciseError) {
    console.error('Error inserting exercise:', exerciseError);
    throw exerciseError;
  }

  const exerciseId = exercise.exercise_id;

  // 2. Insert into exercise_equipment
  if (equipmentIds.length > 0) {
    const equipmentRows = equipmentIds.map(equipmentId => ({
      exercise_id: exerciseId,
      equipment_id: equipmentId
    }));
    await supabase.from('exercise_equipment').insert(equipmentRows);
  }

  // 3. Insert into exercise_muscle (primary)
  if (primaryMuscleIds.length > 0) {
    const primaryRows = primaryMuscleIds.map(muscleId => ({
      exercise_id: exerciseId,
      muscle_id: muscleId,
      is_primary: true
    }));
    await supabase.from('exercise_muscle').insert(primaryRows);
  }

  // 4. Insert into exercise_muscle (secondary)
  if (secondaryMuscleIds.length > 0) {
    const secondaryRows = secondaryMuscleIds.map(muscleId => ({
      exercise_id: exerciseId,
      muscle_id: muscleId,
      is_primary: false
    }));
    await supabase.from('exercise_muscle').insert(secondaryRows);
  }

  return exercise;
};

// Update Exercise
export const updateExerciseService = async (
  exerciseId: string,
  name: string,
  videoUrl: string,
  instructions: string[],
  equipmentIds: string[],
  primaryMuscleIds: string[],
  secondaryMuscleIds: string[]
) => {
  // 1. Update exercise row
  const { error: exerciseError } = await supabase
    .from('exercise')
    .update({
      name,
      video_url: videoUrl,
      instructions
    })
    .eq('exercise_id', exerciseId);

  if (exerciseError) {
    console.error('Error updating exercise:', exerciseError);
    throw exerciseError;
  }

  // 2. Clear existing relations
  await supabase
    .from('exercise_equipment')
    .delete()
    .eq('exercise_id', exerciseId);
  await supabase.from('exercise_muscle').delete().eq('exercise_id', exerciseId);

  // 3. Re‑insert equipment
  if (equipmentIds.length > 0) {
    const equipmentRows = equipmentIds.map(equipmentId => ({
      exercise_id: exerciseId,
      equipment_id: equipmentId
    }));
    await supabase.from('exercise_equipment').insert(equipmentRows);
  }

  // 4. Re‑insert muscles
  if (primaryMuscleIds.length > 0) {
    const primaryRows = primaryMuscleIds.map(muscleId => ({
      exercise_id: exerciseId,
      muscle_id: muscleId,
      is_primary: true
    }));
    await supabase.from('exercise_muscle').insert(primaryRows);
  }

  if (secondaryMuscleIds.length > 0) {
    const secondaryRows = secondaryMuscleIds.map(muscleId => ({
      exercise_id: exerciseId,
      muscle_id: muscleId,
      is_primary: false
    }));
    await supabase.from('exercise_muscle').insert(secondaryRows);
  }

  return true;
};

// Delete Exercise
export const deleteExerciseService = async (exerciseId: string) => {
  // Delete the exercise row
  const { error } = await supabase
    .from('exercise')
    .delete()
    .eq('exercise_id', exerciseId);

  if (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }

  return true;
};

// Equipment fetch
export const getEquipmentsService = async () => {
  const { data, error } = await supabase
    .from('equipment')
    .select('equipment_id, name');

  if (error) {
    console.error('Error fetching equipments:', error);
    return [];
  }
  return data;
};

// Muscle fetch
export const getMusclesService = async () => {
  const { data, error } = await supabase
    .from('muscle')
    .select('muscle_id, name');

  if (error) {
    console.error('Error fetching muscles:', error);
    return [];
  }
  return data;
};
