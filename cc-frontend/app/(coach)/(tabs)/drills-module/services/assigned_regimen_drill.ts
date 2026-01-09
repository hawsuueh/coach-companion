import supabase from '../../../../../config/supabaseClient';

export interface AssignedRegimenDrillDatabase {
  id?: number;
  assigned_regimen_id: number;
  drill_id: number;
  // status of the specific drill of an assigned regimen
  status: string;
}

export const getAllAssignedRegimenDrill = async () => {
  let { data: assigned_regimen_drill, error } = await supabase
    .from('assigned_regimen_drill')
    .select('*');
  if (error) {
    console.error(
      'Supabase Get All Assigned Regimen Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen_drill;
};

export const getAllAssignedRegimenDrillByAssignedRegimenId = async (
  assignedRegimenId: number
) => {
  let { data: assigned_regimen_drill, error } = await supabase
    .from('assigned_regimen_drill')
    .select('*')
    .eq('assigned_regimen_id', assignedRegimenId);
  if (error) {
    console.error(
      'Supabase Get All Assigned Regimen Drill by Assigned Regimen Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return assigned_regimen_drill;
};

export const createAssignedRegimenDrill = async (
  assignedRegimenDrill: AssignedRegimenDrillDatabase
) => {
  const { data, error } = await supabase
    .from('assigned_regimen_drill')
    .insert(assignedRegimenDrill);
  if (error) {
    console.error(
      'Supabase Create Assigned Regimen Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const updateAssignedRegimenDrill = async (
  id: number,
  assignedRegimenDrill: AssignedRegimenDrillDatabase
) => {
  const { data, error } = await supabase
    .from('assigned_regimen_drill')
    .update(assignedRegimenDrill)
    .eq('id', id);
  if (error) {
    console.error(
      'Supabase Update Assigned Regimen Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const deleteAssignedRegimenDrill = async (id: number) => {
  const { data, error } = await supabase
    .from('assigned_regimen_drill')
    .delete()
    .eq('id', id);
  if (error) {
    console.error(
      'Supabase Delete Assigned Regimen Drill Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return data;
};

export const deleteAssignedRegimenDrillByAssignedRegimenId = async (
  assignedRegimenId: number
) => {
  const { error } = await supabase
    .from('assigned_regimen_drill')
    .delete()
    .eq('assigned_regimen_id', assignedRegimenId);

  if (error) {
    console.error(
      'Supabase Delete Assigned Regimen Drill by Assigned Regimen Id Error details:',
      error.message,
      error.details,
      error.hint
    );
    return null;
  }
  return true;
};
