import supabase from '@/config/supabaseClient';

// Types
export interface DatabaseAthleteGame {
  athlete_game_no: number;
  athlete_no: number;
  game_no: number;
  quarter_no: number | null;
  points: number | null;
  field_goals_made: number | null;
  field_goals_attempted: number | null;
  two_point_made: number | null;
  two_point_attempted: number | null;
  three_point_made: number | null;
  three_point_attempted: number | null;
  free_throws_made: number | null;
  free_throws_attempted: number | null;
  assists: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  fouls: number | null;
}

export interface AthleteGameStatsInput {
  points: number;
  field_goals_made: number;
  field_goals_attempted: number;
  two_point_made: number;
  two_point_attempted: number;
  three_point_made: number;
  three_point_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  assists: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

/**
 * Get all athlete game stats for a specific game
 * @param gameNo - Game number
 * @returns Array of athlete game stats or empty array
 */
export const getAthleteGameStatsByGame = async (
  gameNo: number
): Promise<DatabaseAthleteGame[]> => {
  try {
    const { data, error } = await supabase
      .from('athlete_game')
      .select('*')
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error fetching athlete game stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAthleteGameStatsByGame:', error);
    return [];
  }
};

/**
 * Insert or update athlete game stats for a specific quarter
 * @param athleteNo - Athlete number
 * @param gameNo - Game number
 * @param quarterNo - Quarter number
 * @param stats - Stats to save
 * @returns Success boolean
 */
export const upsertAthleteGameStats = async (
  athleteNo: number,
  gameNo: number,
  quarterNo: number,
  stats: AthleteGameStatsInput
): Promise<boolean> => {
  try {
    // Check if stats already exist for this athlete/game/quarter combination
    const { data: existingStats, error: checkError } = await supabase
      .from('athlete_game')
      .select('athlete_game_no')
      .eq('athlete_no', athleteNo)
      .eq('game_no', gameNo)
      .eq('quarter_no', quarterNo)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no stats exist
      throw checkError;
    }

    const statsData = {
      athlete_no: athleteNo,
      game_no: gameNo,
      quarter_no: quarterNo,
      ...stats
    };

    if (existingStats) {
      // Update existing stats
      const { error: updateError } = await supabase
        .from('athlete_game')
        .update(statsData)
        .eq('athlete_game_no', existingStats.athlete_game_no);

      if (updateError) {
        console.error('Error updating athlete game stats:', updateError);
        return false;
      }
    } else {
      // Insert new stats
      const { error: insertError } = await supabase
        .from('athlete_game')
        .insert(statsData);

      if (insertError) {
        console.error('Error inserting athlete game stats:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in upsertAthleteGameStats:', error);
    return false;
  }
};

/**
 * Delete all athlete game stats for a specific game
 * @param gameNo - Game number
 * @returns Success boolean
 */
export const deleteAthleteGameStatsByGame = async (
  gameNo: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('athlete_game')
      .delete()
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error deleting athlete game stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAthleteGameStatsByGame:', error);
    return false;
  }
};

/**
 * Get athlete game stats for a specific athlete in a game
 * @param athleteNo - Athlete number
 * @param gameNo - Game number
 * @returns Array of athlete game stats or empty array
 */
export const getAthleteGameStatsByAthlete = async (
  athleteNo: number,
  gameNo: number
): Promise<DatabaseAthleteGame[]> => {
  try {
    const { data, error } = await supabase
      .from('athlete_game')
      .select('*')
      .eq('athlete_no', athleteNo)
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error fetching athlete game stats by athlete:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAthleteGameStatsByAthlete:', error);
    return [];
  }
};
