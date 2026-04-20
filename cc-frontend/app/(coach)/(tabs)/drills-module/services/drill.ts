import supabase from '../../../../../config/supabaseClient';

export interface DatabaseDrill {
  id?: number;
  from_practice_id: number;
  name: string;
  description: string;
  steps: string[];
  good_for: string[];
  media?: string;
}

export const getAllDrills = async () => {
  let { data: drill, error } = await supabase.from('drill').select('*');
  if (error) {
    console.error(
      'Supabase Get All Drills Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }

  return drill;
};

export const getDrillsByPracticeId = async (practiceId: number) => {
  const { data: drills, error } = await supabase
    .from('drill')
    .select('*')
    .eq('from_practice_id', practiceId);

  if (error) {
    console.error(
      'Supabase Get Drills by Practice Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  console.log('Drills:', drills);
  return drills;
};

export const getDrillById = async (id: number) => {
  const { data, error } = await supabase.from('drill').select('*').eq('id', id);
  if (error) {
    console.error('Error fetching drill by id:', error);
    return null;
  }
  return data;
};

export const createDrill = async (drill: DatabaseDrill) => {
  const { id, ...dataToInsert } = drill;

  const { data, error } = await supabase
    .from('drill')
    .insert([dataToInsert]) // Pass the object without the id key
    .select();

  if (error) {
    console.error(
      'Supabase Insert Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data ? data[0] : null;
};

export const updateDrill = async (id: number, drill: DatabaseDrill) => {
  const { id: _, ...updateData } = drill;

  const { data, error } = await supabase
    .from('drill')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating drill:', error);
    return null;
  }
  return data ? data[0] : null;
};

export const deleteDrill = async (id: number) => {
  const { data, error } = await supabase
    .from('drill')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error(
      'Supabase Delete Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const subscribeToDrills = async () => {
  const channels = supabase
    .channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drill' },
      payload => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return channels;
};
