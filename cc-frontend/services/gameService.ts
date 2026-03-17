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
  custom_game_label: string | null;
  home_q1: number | null;
  home_q2: number | null;
  home_q3: number | null;
  home_q4: number | null;
  home_total_score: number | null;
  away_q1: number | null;
  away_q2: number | null;
  away_q3: number | null;
  away_q4: number | null;
  away_ot: number | null;
  away_total_score: number | null;
}

export interface Game {
  id: string;
  gameName: string;
  date: string;
  teamName: string;
  opponentName: string;
  seasonLabel?: string;
  seasonNo?: number;
  batchNo?: number | null;
  customGameLabel?: string;
  scores: {
    home: { q1: number; q2: number; q3: number; q4: number; ot: number; total: number };
    away: { q1: number; q2: number; q3: number; q4: number; ot: number; total: number };
  };
}

export interface Matchup {
  id: string;              // e.g., "unc-vs-ateneo"
  playerTeam: string;      // "UNC"
  opponentTeam: string;    // "Ateneo"
  gameCount: number;       // 3
  games: Game[];           // Array of individual game instances
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
    seasonLabel,
    seasonNo: dbGame.season_no || undefined,
    batchNo: dbGame.batch_no,
    customGameLabel: dbGame.custom_game_label || undefined,
    scores: {
      home: {
        q1: dbGame.home_q1 || 0,
        q2: dbGame.home_q2 || 0,
        q3: dbGame.home_q3 || 0,
        q4: dbGame.home_q4 || 0,
        ot: 0,
        total: dbGame.home_total_score || 0
      },
      away: {
        q1: dbGame.away_q1 || 0,
        q2: dbGame.away_q2 || 0,
        q3: dbGame.away_q3 || 0,
        q4: dbGame.away_q4 || 0,
        ot: dbGame.away_ot || 0,
        total: dbGame.away_total_score || 0
      }
    }
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

/**
 * Get all games for a specific season
 * @param seasonNo - Season number
 * @returns Array of games or empty array
 */
export const getGamesBySeason = async (seasonNo: number): Promise<DatabaseGame[]> => {
  try {
    const { data, error } = await supabase
      .from('Game')
      .select('*')
      .eq('season_no', seasonNo)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching games by season:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGamesBySeason:', error);
    return [];
  }
};

/**
 * Group games by matchup (opponent pairs)
 * @param games - Array of Game objects
 * @returns Array of Matchup objects with grouped games
 */
export const groupGamesByMatchup = (games: Game[]): Matchup[] => {
  const matchupMap = new Map<string, Matchup>();

  games.forEach(game => {
    // Create a unique matchup ID based on team names
    const matchupId = `${game.teamName.toLowerCase().replace(/\s+/g, '-')}-vs-${game.opponentName.toLowerCase().replace(/\s+/g, '-')}`;

    // Check if it's a real game (has batchNo) or a placeholder
    const isRealGame = game.batchNo !== null && game.batchNo !== undefined;

    if (matchupMap.has(matchupId)) {
      // Add game to existing matchup if it's a real game
      const matchup = matchupMap.get(matchupId)!;
      if (isRealGame) {
        matchup.games.push(game);
        matchup.gameCount = matchup.games.length;
      }
    } else {
      // Create new matchup
      matchupMap.set(matchupId, {
        id: matchupId,
        playerTeam: game.teamName,
        opponentTeam: game.opponentName,
        gameCount: isRealGame ? 1 : 0,
        games: isRealGame ? [game] : []
      });
    }
  });

  // Convert map to array and sort by game count (descending)
  return Array.from(matchupMap.values()).sort((a, b) => b.gameCount - a.gameCount);
};

/**
 * Create a new game
 * @param game - Game data to create
 * @returns Success status and error message if any
 */
export const createGame = async (
  game: Partial<DatabaseGame>
): Promise<{ success: boolean; error?: string; gameNo?: number }> => {
  try {
    const { data, error } = await supabase
      .from('Game')
      .insert([
        {
          player_name: game.player_name,
          opponent_name: game.opponent_name,
          date: game.date,
          time: game.time,
          season_no: game.season_no,
          batch_no: game.batch_no,
          custom_game_label: game.custom_game_label
        }
      ])
      .select('game_no')
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return { success: false, error: error.message };
    }

    return { success: true, gameNo: data.game_no };
  } catch (error) {
    console.error('Error in createGame:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
/**
 * Update game scoreboard
 * @param gameNo - Game number
 * @param scores - Scoreboard data
 * @returns Success status
 */
export const updateGameScoreboard = async (
  gameNo: number,
  scores: {
    home: { q1: number; q2: number; q3: number; q4: number; ot: number; total: number };
    away: { q1: number; q2: number; q3: number; q4: number; ot: number; total: number };
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('Game')
      .update({
        home_q1: scores.home.q1,
        home_q2: scores.home.q2,
        home_q3: scores.home.q3,
        home_q4: scores.home.q4,
        home_total_score: scores.home.total,
        away_q1: scores.away.q1,
        away_q2: scores.away.q2,
        away_q3: scores.away.q3,
        away_q4: scores.away.q4,
        away_ot: scores.away.ot,
        away_total_score: scores.away.total
      })
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error updating game scoreboard:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateGameScoreboard:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
