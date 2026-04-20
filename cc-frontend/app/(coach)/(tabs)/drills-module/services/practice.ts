import supabase from '../../../../../config/supabaseClient';

export interface DatabasePractice {
  id?: number;
  name: string;
  description: string;
  skill: string[];
  image: string;
}

export const getAllPractices = async () => {
  const { data, error } = await supabase.from('practice').select('*');
  if (error) {
    console.error('Error fetching practices:', error);
    return null;
  }
  return data;
};

export const getPracticeById = async (id: number) => {
  const { data, error } = await supabase
    .from('practice')
    .select('*')
    .eq('id', id);
  if (error) {
    console.error('Error fetching practice by id:', error);
    return null;
  }
  return data;
};

export const createPractice = async (practice: DatabasePractice) => {
  const dataToInsert = {
    name: practice.name,
    description: practice.description,
    skill: practice.skill,
    image: practice.image || ''
  };

  console.log('Attempting Insert with:', dataToInsert);

  const { data, error } = await supabase
    .from('practice')
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error(
      'Supabase Insert Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const updatePractice = async (
  id: number,
  practice: DatabasePractice
) => {
  const { id: _, ...updateData } = practice;

  const { data, error } = await supabase
    .from('practice')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating practice:', error);
    return null;
  }
  return data;
};

export const deletePractice = async (id: number) => {
  const { data, error } = await supabase.from('practice').delete().eq('id', id);
  if (error) {
    console.error('Error deleting practice:', error);
    return null;
  }
  return data;
};

export const subscribeToPractices = async () => {
  const channels = supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'practice' },
      payload => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return channels;
};
