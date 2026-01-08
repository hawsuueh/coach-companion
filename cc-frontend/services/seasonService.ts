import supabase from '@/config/supabaseClient';

// Types
export interface DatabaseSeason {
  season_no: number;
  season_label: string | null;
  duration: string | null;
  total_games: number | null;
}

export interface Season {
  id: string;
  label: string;
  duration: string;
  totalGames: number;
}

/**
 * Transform database season format to UI season format
 * @param dbSeason - Season data from database
 * @returns Formatted season object for UI
 */
export const transformDatabaseSeason = (dbSeason: DatabaseSeason): Season => {
  return {
    id: dbSeason.season_no.toString(),
    label: dbSeason.season_label || 'Unknown Season',
    duration: dbSeason.duration || 'N/A',
    totalGames: dbSeason.total_games || 0
  };
};

/**
 * Get all seasons for a specific coach (via their batches)
 * @param coachNo - Coach number
 * @returns Array of seasons or empty array
 */
/**
 * Get all seasons sorted by ID descending
 * Note: Since specific coach ownership is not in the schema, we fetch all seasons.
 * This ensures newly created seasons (which have no games yet) are visible.
 * @returns Array of seasons or empty array
 */
export const getAllSeasons = async (): Promise<DatabaseSeason[]> => {
  try {
    const { data: seasons, error } = await supabase
      .from('Season')
      .select('*')
      .order('season_no', { ascending: false });

    if (error) {
      console.error('Error fetching all seasons:', error);
      throw error;
    }

    return seasons || [];
  } catch (error) {
    console.error('Error in getAllSeasons:', error);
    return [];
  }
};

/**
 * Get a single season by season number
 * @param seasonNo - Season number
 * @returns Season object or null if not found
 */
export const getSeasonById = async (seasonNo: number): Promise<DatabaseSeason | null> => {
  try {
    const { data, error } = await supabase
      .from('Season')
      .select('*')
      .eq('season_no', seasonNo)
      .single();

    if (error) {
      console.error('Error fetching season by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSeasonById:', error);
    return null;
  }
};

/**
 * Create a new season
 * @param season - Season data to create
 * @returns Success status and error message if any
 */
export const createSeason = async (
  season: Partial<DatabaseSeason>
): Promise<{ success: boolean; error?: string; seasonNo?: number }> => {
  try {
    const { data, error } = await supabase
      .from('Season')
      .insert([
        {
          season_label: season.season_label,
          duration: season.duration,
          total_games: season.total_games
        }
      ])
      .select('season_no')
      .single();

    if (error) {
      console.error('Error creating season:', error);
      return { success: false, error: error.message };
    }

    return { success: true, seasonNo: data.season_no };
  } catch (error) {
    console.error('Error in createSeason:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
