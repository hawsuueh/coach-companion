import supabase from '@/config/supabaseClient';

// services/trainingTracking.service.ts
export const getTrainingTrackingService = async (trainingId: string) => {
  // Get training info
  const { data: trainingData, error: trainingError } = await supabase
    .from('training')
    .select('training_id, name, date, time, duration')
    .eq('training_id', trainingId)
    .single();

  if (trainingError) throw trainingError;

  // Get athlete tracking + athlete info
  const { data: trackingData, error: trackingError } = await supabase
    .from('athlete_training_tracking')
    .select(
      `
      athlete_training_tracking_id,
      status,
      time_elapsed,
      date_executed,
      athlete_training (
        athlete_no,
        athlete:athlete_no (
          athlete_no,
          first_name,
          last_name,
          position,
          player_no,
          gmail
        )
      )
    `
    )
    .eq('athlete_training.training_id', trainingId);

  if (trackingError) throw trackingError;

  return { training: trainingData, athleteTracking: trackingData };
};

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

export const getAthleteTrackingService = async (athleteId: number) => {
  const { data, error } = await supabase
    .from('Athlete')
    .select(
      `
      athlete_no,
      first_name,
      middle_name,
      last_name,
      position,
      player_no,
      gmail,
      account_no,
      athlete_training (
        athlete_training_id,
        training:training_id (
          training_id,
          name,
          date,
          time,
          duration
        ),
        athlete_training_tracking (
          athlete_training_tracking_id,
          status,
          time_elapsed,
          date_executed
        )
      )
    `
    )
    .eq('athlete_no', athleteId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching athlete tracking:', error);
    throw error;
  }

  return data;
};
