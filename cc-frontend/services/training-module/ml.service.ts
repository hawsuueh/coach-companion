import supabase from '@/config/supabaseClient';
import { Exercise } from '@/ml/training-module/types';
import { parseTimeToDB, parseDurationToSeconds } from '@/utils/formatTime';

import {
  GameStats,
  AthleteProfile,
  DataPoint
} from '@/ml/training-module/types';

/**
 * Fetches a wide dataset of games to train the Random Forest.
 * In a production app, you might use a pre-trained model file instead.
 */
export const fetchMLTrainingDataset = async (): Promise<DataPoint[]> => {
  const { data } = await supabase
    .from('athlete_game')
    .select(
      'points, assists, turnovers, offensive_rebounds, defensive_rebounds, steals, blocks, fouls, field_goals_made, field_goals_attempted'
    );

  // For this project, we map historical performance to a dummy label
  // In a real scenario, this label would come from your 'analysis' table
  return (data || []).map(row => ({
    features: [
      row.points,
      row.assists,
      row.turnovers,
      row.offensive_rebounds + row.defensive_rebounds,
      row.steals,
      row.blocks,
      row.fouls,
      row.field_goals_attempted > 0
        ? row.field_goals_made / row.field_goals_attempted
        : 0
    ],
    label: row.points > 20 ? 2 : 1 // Simplified: 2=Push, 1=Moderate
  }));
};

/**
 * Fetches specific data for the current athlete being analyzed.
 */
export const fetchAthleteStatsAndProfile = async (athleteNo: string) => {
  // Get last 5 games
  const { data: games } = await supabase
    .from('athlete_game')
    .select('*')
    .eq('athlete_no', athleteNo)
    .order('game_no', { ascending: false })
    .limit(5);

  // Get current injuries and body focus scores
  const { data: analysis } = await supabase
    .from('analysis')
    .select('*, injury_analysis(*), bodypart_analysis(*)')
    .eq('athlete_no', athleteNo)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const last5Games: GameStats[] = (games || []).map(
    g =>
      ({
        // ... map to your GameStats interface
        points: g.points,
        assists: g.assists,
        turnovers: g.turnovers,
        offensive_rebounds: g.offensive_rebounds,
        defensive_rebounds: g.defensive_rebounds,
        steals: g.steals,
        blocks: g.blocks,
        fouls: g.fouls,
        field_goals_made: g.field_goals_made,
        field_goals_attempted: g.field_goals_attempted
        // Add other percentage calculations as discussed
      }) as GameStats
  );

  const profile: AthleteProfile = {
    athlete_no: athleteNo,
    position: 'Guard', // You'd fetch this from the athlete table
    injured_bodypart_ids:
      analysis?.injury_analysis?.[0]?.affected_bodypart || [],
    body_focus_scores: analysis?.bodypart_analysis?.[0]?.body_focus_scores || {}
  };

  return { last5Games, profile };
};

/**
 * Fetches all exercises, filtering by the equipment selected in the modal.
 * Includes nested bodypart data for the Rule Engine and Content Matcher.
 */
export const fetchExercisesForAlgo = async (
  equipmentIds: string[]
): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercise')
    .select(
      `
      exercise_id,
      name,
      exercise_bodypart ( bodypart_id ),
      exercise_equipment ( equipment_id )
    `
    )
    // Filter for exercises that use AT LEAST one of the selected equipments
    .in('exercise_equipment.equipment_id', equipmentIds);

  if (error) throw error;

  return (data || []).map(ex => ({
    exercise_id: ex.exercise_id.toString(),
    name: ex.name,
    bodypart_ids: ex.exercise_bodypart.map((bp: any) =>
      bp.bodypart_id.toString()
    ),
    intensity: 5 // Default intensity if not in DB; can be randomized 1-10 for testing
  }));
};

/**
 * Saves the algorithm's results into the database across multiple tables.
 */
export const saveGeneratedTrainingSession = async (params: {
  coachNo: string | number;
  trainingName: string;
  dates: string[];
  startTime: string;
  duration: string;
  results: { athleteNo: string; exercises: any[] }[];
}) => {
  const { coachNo, trainingName, dates, startTime, duration, results } = params;

  console.log('Total athletes to process:', results.length);

  const formattedTime = parseTimeToDB(startTime);
  const durationInSeconds = parseDurationToSeconds(duration);

  try {
    for (const date of dates) {
      // 3. Create the Training Header
      const { data: training, error: tError } = await supabase
        .from('training')
        .insert({
          coach_no: coachNo,
          name: trainingName,
          date: date,
          time: formattedTime,
          duration: durationInSeconds
        })
        .select()
        .single();

      if (tError) {
        console.error('❌ Error creating training header:', tError);
        throw tError; // If the header fails, we can't do anything else
      }

      const trainingId = training.training_id;

      // 4. Loop through athletes using try/catch INSIDE the loop
      for (const res of results) {
        try {
          console.log(
            `Processing athlete_no: ${res.athleteNo} for training_id: ${trainingId}`
          );

          // Link athlete to training
          const { data: at, error: atError } = await supabase
            .from('athlete_training')
            .insert({
              athlete_no: res.athleteNo,
              training_id: trainingId
            })
            .select()
            .single();

          if (atError) {
            // We log the error but don't "throw" so we don't kill the other 3 athletes
            console.error(
              `⚠️ Error linking athlete ${res.athleteNo}:`,
              atError.message
            );
            continue;
          }

          // 5. Insert Exercises
          const exerciseInserts = res.exercises.map(ex => ({
            athlete_training_id: at.athlete_training_id,
            exercise_id: ex.exercise_id,
            sets: 3,
            reps: 12,
            duration: 60
          }));

          const { error: ateError } = await supabase
            .from('athlete_training_exercise')
            .insert(exerciseInserts);

          if (ateError)
            console.error(
              `⚠️ Error inserting exercises for ${res.athleteNo}:`,
              ateError.message
            );

          // 6. Initialize tracking
          await supabase.from('athlete_training_tracking').insert({
            athlete_training_id: at.athlete_training_id,
            status: 'assigned'
          });

          console.log(
            `✅ Successfully saved training for athlete: ${res.athleteNo}`
          );
        } catch (innerErr) {
          console.error(
            `❌ Unexpected error for athlete ${res.athleteNo}:`,
            innerErr
          );
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Critical error in saveGeneratedTrainingSession:', err);
    throw err;
  }
};
