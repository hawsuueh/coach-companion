import supabase from '@/config/supabaseClient';
import { Training, AthleteTraining, AthleteTrainingTracking } from '@/types/db';

export const getTrainingAthleteTrainingTracking = async (
  athleteTrainingId: number
): Promise<
  | (AthleteTraining & {
      training: Training;
      athlete_training_tracking: AthleteTrainingTracking | null;
    })
  | null
> => {
  const { data, error } = await supabase
    .from('athlete_training')
    .select(
      `
      athlete_training_id,
      training_id,
      athlete_no,

      training:training_id (
        training_id,
        coach_no,
        name,
        date,
        time,
        duration
      ),

      athlete_training_tracking:athlete_training_tracking!athlete_training_tracking_athlete_training_id_fkey (
        athlete_training_tracking_id,
        athlete_training_id,
        status,
        time_elapsed,
        date_executed
      )
    `
    )
    .eq('athlete_training_id', athleteTrainingId)
    .maybeSingle();
  console.log('Supabase data:', data, 'Error:', error);

  if (error) throw error;
  if (!data) return null;

  return {
    athlete_training_id: data.athlete_training_id,
    training_id: data.training_id,
    athlete_no: data.athlete_no,

    // ✅ pick the first element from the array
    training: (data.training as Training[])[0],

    // ✅ tracking may be null if no records
    athlete_training_tracking: data.athlete_training_tracking?.[0] ?? null
  };
};
