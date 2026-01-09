// training.service.ts
import supabase from '@/config/supabaseClient';

// Coach
// Fetch the Trainings
export const getTrainingsService = async (coachNo: string | number | null) => {
  const { data, error } = await supabase
    .from('training')
    .select(
      `
      training_id,
      coach_no,
      name,
      date,
      time,
      duration,
      coach:coach_no (
        contact_no
      )
    `
    )
    .eq('coach_no', coachNo)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }

  return data;
};

// Fetch Training Details
export const getTrainingDetailsService = async (trainingId: string) => {
  const { data, error } = await supabase
    .from('training')
    .select(
      `
      training_id,
      name,
      date,
      time,
      duration,
      athlete_training (
        athlete_training_id,
        athlete:athlete_no (
          athlete_no,
          first_name,
          middle_name,
          last_name,
          position,
          player_no,
          gmail
        )
      )
    `
    )
    .eq('training_id', trainingId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching training details:', error);
    throw error;
  }

  return data;
};

export const getAthleteTrainingCoachService = async (
  athleteTrainingId: string
) => {
  const { data, error } = await supabase
    .from('athlete_training')
    .select(
      `
      athlete_training_id,
      training:training_id (
        training_id,
        name,
        date,
        time,
        duration
      ),
      athlete:athlete_no (
        athlete_no,
        first_name,
        middle_name,
        last_name,
        position,
        player_no,
        gmail
      )
    `
    )
    .eq('athlete_training_id', athleteTrainingId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getAthleteTrainingExerciseService = async (
  athleteTrainingId: string
) => {
  const { data, error } = await supabase
    .from('athlete_training_exercise')
    .select(
      `
      athlete_training_exercise_id,
      sets,
      reps,
      duration,
      exercise:exercise_id (
        exercise_id,
        name,
        video_url,
        instructions
      )
    `
    )
    .eq('athlete_training_id', athleteTrainingId);

  if (error) throw error;
  return data;
};

// Athlete

export const getAthleteTrainingsService = async (
  athleteNo: string | number | null
) => {
  const { data, error } = await supabase
    .from('athlete_training')
    .select(
      `
      athlete_training_id,
      training:training_id (
        training_id,
        name,
        date,
        time,
        duration
      )
    `
    )
    .eq('athlete_no', athleteNo);

  if (error) {
    console.error('Error fetching athlete trainings:', error);
    throw error;
  }

  return data;
};

export const getAthleteTrainingService = async (athleteTrainingId: string) => {
  const { data, error } = await supabase
    .from('athlete_training')
    .select(
      `
      athlete_training_id,
      training_id,
      training (
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
    `
    )
    .eq('athlete_training_id', athleteTrainingId)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    return null;
  }

  return data;
};

export const getAthleteTrainingExecutionService = async (
  athleteTrainingId: string
) => {
  const { data, error } = await supabase
    .from('athlete_training')
    .select(
      `
      athlete_training_id,
      training:training_id (
        training_id,
        name,
        date,
        time,
        duration
      ),
      tracking:athlete_training_tracking (
        athlete_training_tracking_id,
        status,
        time_elapsed,
        date_executed
      ),
      athlete_training_exercise (
        athlete_training_exercise_id,
        sets,
        reps,
        duration,
        exercise:exercise_id (
          exercise_id,
          name,
          video_url,
          instructions
        ),
        tracking:athlete_training_exercise_tracking (
          athlete_training_exercise_tracking_id,
          sets_finished,
          reps_finished,
          time_elapsed
        )
      )
    `
    )
    .eq('athlete_training_id', athleteTrainingId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateAthleteTrainingTrackingService = async (
  athleteTrainingId: string,
  {
    status,
    timeElapsed,
    dateExecuted
  }: { status: string; timeElapsed: number; dateExecuted: string }
) => {
  const { data, error } = await supabase
    .from('athlete_training_tracking')
    .update({
      status,
      time_elapsed: timeElapsed,
      date_executed: dateExecuted
    })
    .eq('athlete_training_id', athleteTrainingId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateAthleteTrainingExerciseTrackingService = async (
  athleteTrainingExerciseId: string,
  elapsedSeconds: number
) => {
  const { data, error } = await supabase
    .from('athlete_training_exercise_tracking')
    .update({
      time_elapsed: elapsedSeconds
    })
    .eq('athlete_training_exercise_id', athleteTrainingExerciseId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Fetch athletes
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

// Fetch equipments
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
