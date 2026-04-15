import supabase from '@/config/supabaseClient';

// Types
export interface DatabaseGame {
  game_no: number;
  date: string | null;
  time: string | null;
  season_no: number | null;
  player_name: string | null;
  opponent_name: string | null;
  batch_no: number | null;
}

export interface Game {
  id: string;
  gameName: string;
  date: string;
  teamName: string;
  opponentName: string;
  seasonLabel?: string;
}

/**
 * Transform database game format to UI game format
 * @param dbGame - Game data from database
 * @returns Formatted game object for UI
 */
export const transformDatabaseGame = (dbGame: DatabaseGame): Game => {
  const gameDate = dbGame.date
    ? new Date(dbGame.date).toLocaleDateString()
    : 'TBD';
  const gameTime = dbGame.time
    ? new Date(`2000-01-01T${dbGame.time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const formattedDate = gameTime ? `${gameDate} ${gameTime}` : gameDate;

  // Create game name using player_name and opponent_name
  const playerTeam = dbGame.player_name || 'Your Team';
  const opponentTeam = dbGame.opponent_name || 'TBD';
  const gameName = `${playerTeam} vs ${opponentTeam}`;
  const seasonLabel = dbGame.season_no ? `Season ${dbGame.season_no}` : undefined;

  return {
    id: dbGame.game_no.toString(),
    gameName: gameName,
    date: formattedDate,
    teamName: playerTeam,
    opponentName: opponentTeam,
    seasonLabel
  };
};

/**
 * Get all games for a specific coach (via their batches)
 * @param coachNo - Coach number
 * @returns Array of games or empty array
 */
export const getGamesByCoach = async (coachNo: number): Promise<DatabaseGame[]> => {
  try {
    // First get all batch_no for this coach
    const { data: batches, error: batchError } = await supabase
      .from('Batch')
      .select('batch_no')
      .eq('coach_no', coachNo);

    if (batchError) {
      console.error('Error fetching batches for games:', batchError);
      throw batchError;
    }

    if (!batches || batches.length === 0) {
      return [];
    }

    const batchNumbers = batches.map(b => b.batch_no);

    // Then get games for those batches
    const { data, error: fetchError } = await supabase
      .from('Game')
      .select('*')
      .in('batch_no', batchNumbers)
      .order('date', { ascending: false });

    if (fetchError) {
      console.error('Error fetching games:', fetchError);
      throw fetchError;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGamesByCoach:', error);
    return [];
  }
};

/**
 * Get a single game by game number
 * @param gameNo - Game number
 * @returns Game object or null if not found
 */
export const getGameById = async (gameNo: number): Promise<DatabaseGame | null> => {
  try {
    const { data, error } = await supabase
      .from('Game')
      .select('*')
      .eq('game_no', gameNo)
      .single();

    if (error) {
      console.error('Error fetching game by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGameById:', error);
    return null;
  }
};

/**
 * Get all games for a specific batch
 * @param batchNo - Batch number
 * @returns Array of games or empty array
 */
export const getGamesByBatch = async (batchNo: number): Promise<DatabaseGame[]> => {
  try {
    const { data, error } = await supabase
      .from('Game')
      .select('*')
      .eq('batch_no', batchNo)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching games by batch:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGamesByBatch:', error);
    return [];
  }
};

/**
 * Get a game by ID and validate it belongs to the coach's batch
 * @param gameNo - Game number
 * @param coachNo - Coach number for validation
 * @returns Game object or null if not found or doesn't belong to coach
 */
export const getGameByIdWithBatchValidation = async (
  gameNo: number,
  coachNo: number
): Promise<DatabaseGame | null> => {
  try {
    // First get the game
    const { data: gameData, error: gameError } = await supabase
      .from('Game')
      .select('*')
      .eq('game_no', gameNo)
      .single();

    if (gameError) {
      console.error('Error fetching game:', gameError);
      return null;
    }

    if (!gameData || !gameData.batch_no) {
      console.error('Game does not belong to any batch');
      return null;
    }

    // Validate that the batch belongs to this coach
    const { data: batchData, error: batchError } = await supabase
      .from('Batch')
      .select('coach_no')
      .eq('batch_no', gameData.batch_no)
      .eq('coach_no', coachNo)
      .single();

    if (batchError || !batchData) {
      console.error('Game does not belong to coach batches');
      return null;
    }

    // Game is valid, return it
    return gameData;
  } catch (error) {
    console.error('Error in getGameByIdWithBatchValidation:', error);
    return null;
  }
};
