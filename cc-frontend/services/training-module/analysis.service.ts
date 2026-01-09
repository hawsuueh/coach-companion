import supabase from '@/config/supabaseClient';

// Fetch latest analysis per athlete (analysis + bodypart_analysis)
export const getLatestBodypartAnalysisByAthleteService = async (
  athleteId: number
) => {
  const { data, error } = await supabase
    .from('bodypart_analysis')
    .select(
      `
      bodypart_analysis_id,
      analysis_id,
      strengths,
      weaknesses,
      bodypart_focus_scores,
      performance_summary,
      analysis:analysis_id (
        analysis_id,
        date,
        time
      )
    `
    )
    .eq('analysis.account_no', athleteId) // if analysis is linked by account_no; adjust if needed
    .order('analysis_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest bodypart analysis:', error);
    throw error;
  }
  return data;
};

// Fetch athletes (for selection)
export const getAthletesService = async () => {
  const { data, error } = await supabase
    .from('Athlete')
    .select(
      'athlete_no, first_name, middle_name, last_name, position, player_no, gmail, account_no'
    );

  if (error) {
    console.error('Error fetching athletes:', error);
    throw error;
  }
  return data;
};

// Fetch equipments (optional for UI)
export const getEquipmentsService = async () => {
  const { data, error } = await supabase
    .from('equipment')
    .select('equipment_id, name');

  if (error) {
    console.error('Error fetching equipments:', error);
    throw error;
  }
  return data;
};
