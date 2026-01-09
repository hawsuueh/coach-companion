import supabase from '@/config/supabaseClient';
import { Exercise } from '@/types/db/training-module';

// Get exercise using exercise_id
export const getExerciseById = async (
  exercise_id: string
): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from('exercise')
    .select('*')
    .eq('exercise_id', exercise_id)
    .single();

  if (error) throw error;
  return data as Exercise;
};

// Get all exercises
export const getAllExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase.from('exercise').select('*');

  if (error) throw error;
  return (data ?? []) as Exercise[];
};
