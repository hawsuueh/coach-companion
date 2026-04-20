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
    .eq('analysis.athlete_no', athleteId)
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

// analysis.service.ts

export const createFullAnalysisService = async (
  athleteId: number,
  bodyData: {
    strengths: string[];
    weaknesses: string[];
    bodypart_focus_scores: Record<string, number>;
    performance_summary: any;
  },
  injuryData: {
    name: string;
    affected_bodypart: string[];
    recommended_adjustments: any;
    injury_summary: any;
  }
) => {
  // 1. Create the Parent Record in 'analysis'
  const { data: analysisRecord, error: analysisError } = await supabase
    .from('analysis')
    .insert([
      {
        athlete_no: athleteId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        time: new Date().toLocaleTimeString('en-GB') // HH:MM:SS
      }
    ])
    .select()
    .single();

  if (analysisError)
    throw new Error(`Analysis Error: ${analysisError.message}`);

  const analysisId = analysisRecord.analysis_id;

  // 2. Create the Bodypart Analysis Record
  const { error: bodyError } = await supabase.from('bodypart_analysis').insert([
    {
      analysis_id: analysisId,
      strengths: bodyData.strengths,
      weaknesses: bodyData.weaknesses,
      bodypart_focus_scores: bodyData.bodypart_focus_scores,
      performance_summary: bodyData.performance_summary
    }
  ]);

  if (bodyError)
    throw new Error(`Bodypart Analysis Error: ${bodyError.message}`);

  // 3. Create the Injury Analysis Record
  const { error: injuryError } = await supabase.from('injury_analysis').insert([
    {
      analysis_id: analysisId,
      name: injuryData.name,
      affected_bodypart: injuryData.affected_bodypart,
      recommended_adjustments: injuryData.recommended_adjustments,
      injury_summary: injuryData.injury_summary
    }
  ]);

  if (injuryError)
    throw new Error(`Injury Analysis Error: ${injuryError.message}`);

  return { success: true, analysisId };
};
