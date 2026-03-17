import supabase from '@/config/supabaseClient';

// Types
export interface DatabaseAthleteGame {
  athlete_game_no: number;
  athlete_no: number;
  game_no: number;
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
 * Insert or update athlete game stats (Cumulative for the whole game)
 * @param athleteNo - Athlete number
 * @param gameNo - Game number
 * @param stats - Stats to save
 * @returns Success boolean
 */
export const upsertAthleteGameStats = async (
  athleteNo: number,
  gameNo: number,
  stats: AthleteGameStatsInput
): Promise<boolean> => {
  try {
    // Check if stats already exist for this athlete/game combination
    const { data: existingStats, error: checkError } = await supabase
      .from('athlete_game')
      .select('athlete_game_no')
      .eq('athlete_no', athleteNo)
      .eq('game_no', gameNo)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    const statsData = {
      athlete_no: athleteNo,
      game_no: gameNo,
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

export interface QuarterBreakdown {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

export interface AggregatedGameStats {
  gameId: number;
  gameName: string;
  date: string;
  opponentName: string;
  
  // Totals
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
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;

  // Breakdown
  quarterPoints: QuarterBreakdown;
}

/**
 * Get aggregated game history for an athlete
 * @param athleteNo - Athlete number
 * @returns Array of aggregated game stats
 */
export const getAthleteGameStatsHistory = async (
  athleteNo: number
): Promise<AggregatedGameStats[]> => {
  try {
    // 1. Fetch all raw stats for this athlete
    // Fixed: Selecting correct columns 'player_name' and 'opponent_name' from Game table
    const { data: rawStats, error } = await supabase
      .from('athlete_game')
      .select(`
        *,
        Game:game_no (
          player_name,
          date,
          opponent_name
        )
      `)
      .eq('athlete_no', athleteNo)
      .order('game_no', { ascending: false });

    if (error) {
      console.error('Error fetching athlete history:', error);
      throw error;
    }

    if (!rawStats || rawStats.length === 0) return [];

    // 2. Group by Game ID
    const gamesMap = new Map<number, AggregatedGameStats>();

    rawStats.forEach((stat: any) => {
      const gameId = stat.game_no;
      
      if (!gamesMap.has(gameId)) {
        // Construct game name manually since it doesn't exist in DB
        const team = stat.Game?.player_name || 'Team';
        const opponent = stat.Game?.opponent_name || 'Opponent';
        
        gamesMap.set(gameId, {
          gameId,
          gameName: `${team} vs ${opponent}`,
          date: stat.Game?.date,
          opponentName: opponent,
          points: 0,
          field_goals_made: 0,
          field_goals_attempted: 0,
          two_point_made: 0,
          two_point_attempted: 0,
          three_point_made: 0,
          three_point_attempted: 0,
          free_throws_made: 0,
          free_throws_attempted: 0,
          assists: 0,
          rebounds: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0,
          quarterPoints: { q1: 0, q2: 0, q3: 0, q4: 0 }
        });
      }

      const game = gamesMap.get(gameId)!;

      // Sum totals
      game.points += (stat.points || 0);
      game.field_goals_made += (stat.field_goals_made || 0);
      game.field_goals_attempted += (stat.field_goals_attempted || 0);
      game.two_point_made += (stat.two_point_made || 0);
      game.two_point_attempted += (stat.two_point_attempted || 0);
      game.three_point_made += (stat.three_point_made || 0);
      game.three_point_attempted += (stat.three_point_attempted || 0);
      game.free_throws_made += (stat.free_throws_made || 0);
      game.free_throws_attempted += (stat.free_throws_attempted || 0);
      game.assists += (stat.assists || 0);
      game.rebounds += ((stat.offensive_rebounds || 0) + (stat.defensive_rebounds || 0));
      game.steals += (stat.steals || 0);
      game.blocks += (stat.blocks || 0);
      game.turnovers += (stat.turnovers || 0);
      game.fouls += (stat.fouls || 0);

      // Quarter Breakdown is no longer available in athlete_game table
      // It can be added back if the schema includes q1_points, q2_points, etc.
    });

    return Array.from(gamesMap.values());
  } catch (error) {
    console.error('Error in getAthleteGameStatsHistory:', error);
    return [];
  }
};
