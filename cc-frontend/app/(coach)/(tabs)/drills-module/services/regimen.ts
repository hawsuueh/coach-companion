import supabase from '../../../../../config/supabaseClient';

type Focus = 'athleteSpecific' | { type: 'practiceCategory'; category: string };

export interface RegimenDatabase {
  id?: number;
  // auto added by supabase, useful for retrieval viewing
  created_at?: string;
  name: string;
  duration: number;
  due_date: string;
  assigned_athletes: string[];
  focus: Focus;
  limit_drills: number;
}

export const getAllRegimens = async () => {
  const { data, error } = await supabase.from('regimen').select('*');
  if (error) {
    console.error(
      'Supabase Get All Regimens Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const getRegimenById = async (id: number) => {
  const { data, error } = await supabase
    .from('regimen')
    .select('*')
    .eq('id', id);
  if (error) {
    console.error(
      'Supabase Get Regimen by Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const createRegimen = async (regimen: RegimenDatabase) => {
  const { data, error } = await supabase
    .from('regimen')
    .insert([regimen])
    .select();
  if (error) {
    console.error(
      'Supabase Create Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const updateRegimen = async (id: number, regimen: RegimenDatabase) => {
  const { data, error } = await supabase
    .from('regimen')
    .update(regimen)
    .eq('id', id)
    .select();
  if (error) {
    console.error(
      'Supabase Update Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const deleteRegimen = async (id: number) => {
  const { data, error } = await supabase.from('regimen').delete().eq('id', id);
  if (error) {
    console.error(
      'Supabase Delete Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};
