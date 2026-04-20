import supabase from '../../../../../config/supabaseClient';

export interface AssignedRegimenDatabase {
  id?: number;
  regimen_id: number;
  assigned_athlete_id: number;
  // status of entire assigned regimen
  status: 'pending' | 'completed' | 'missed' | 'assigned';
  // return of the performanceUtils
  attention_areas: string[];
}

export const getAllAssignedRegimen = async () => {
  let { data: assigned_regimen, error } = await supabase
    .from('assigned_regimen')
    .select('*');
  if (error) {
    console.error(
      'Supabase Get All Assigned Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen;
};

// getting a specific assigned regimen by regimen id (all assigned regimens of a regimen)
export const getAllAssignedRegimenByRegimenId = async (regimenId: number) => {
  let { data: assigned_regimen, error } = await supabase
    .from('assigned_regimen')
    .select('*')
    .eq('regimen_id', regimenId);
  if (error) {
    console.error(
      'Supabase Get by Regimen Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen;
};

// getting all assigned regimens of a specific athlete (all assigned regimens of an athlete)
export const getAllAssignedRegimenByAthleteId = async (athleteId: number) => {
  let { data: assigned_regimen, error } = await supabase
    .from('assigned_regimen')
    .select('*')
    .eq('assigned_athlete_id', athleteId);
  if (error) {
    console.error(
      'Supabase Get All Assigned Regimen by Athlete Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen;
};

// getting a specific assigned regimen by id
export const getAssignedRegimenById = async (id: number) => {
  let { data: assigned_regimen, error } = await supabase
    .from('assigned_regimen')
    .select('*')
    .eq('id', id);
  if (error) {
    console.error(
      'Supabase Get by Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen;
};

// getting a specific assigned regimen from a specific regimen id of a specific athlete (one assigned regimen of an athlete)
export const getAssignedRegimenByRegimenIdAndAthleteId = async (
  regimenId: number,
  athleteId: number
) => {
  let { data: assigned_regimen, error } = await supabase
    .from('assigned_regimen')
    .select('*')
    .eq('regimen_id', regimenId)
    .eq('assigned_athlete_id', athleteId);
  if (error) {
    console.error(
      'Supabase Get by Regimen Id and Athlete Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen;
};

// creating an assigned regimen for a specific athlete
export const createAssignedRegimen = async (
  assignedRegimen: AssignedRegimenDatabase
) => {
  const { data, error } = await supabase
    .from('assigned_regimen')
    .insert([assignedRegimen])
    .select();
  if (error) {
    console.error(
      'Supabase Create Assigned Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const updateAssignedRegimen = async (
  id: number,
  assignedRegimen: AssignedRegimenDatabase
) => {
  const { data, error } = await supabase
    .from('assigned_regimen')
    .update(assignedRegimen)
    .eq('id', id)
    .select();
  if (error) {
    console.error(
      'Supabase Update Assigned Regimen Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const deleteAssignedRegimenByRegimenId = async (regimenId: number) => {
  const { error } = await supabase
    .from('assigned_regimen')
    .delete()
    .eq('regimen_id', regimenId);
  if (error) {
    console.error(
      'Supabase Delete Assigned Regimen by Regimen Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return true;
};

// check if a regimen is missed
export const checkAndMapMissedStatus = (
  status: string,
  dueDate: string
): string => {
  if (status === 'completed') return 'completed';

  const now = new Date();
  const deadline = new Date(dueDate);

  if (now > deadline) {
    return 'missed';
  }

  return status;
};
