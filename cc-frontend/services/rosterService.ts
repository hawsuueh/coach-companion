import supabase from '@/config/supabaseClient';
import { DatabaseAthlete } from './athleteService';

// Types
export interface RosterEntry {
  roster_no: number;
  game_no: number;
  athlete_no: number;
}



export interface AthleteGameStats {
  athlete_game_no: number;
  game_no: number;
  athlete_no: number;
  quarter: number;
  // Add other stat fields as needed
  [key: string]: any;
}

/**
 * Get roster entries for a specific game
 * @param gameNo - Game number
 * @returns Array of roster entries or empty array
 */
export const getRosterByGame = async (gameNo: number): Promise<RosterEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('Roster')
      .select('*')
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error fetching roster:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRosterByGame:', error);
    return [];
  }
};

/**
 * Add a player to a game roster
 * @param gameNo - Game number
 * @param athleteNo - Athlete number
 * @returns Success boolean
 */
export const addPlayerToRoster = async (
  gameNo: number,
  athleteNo: number
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('Roster').insert({
      game_no: gameNo,
      athlete_no: athleteNo
    });

    if (error) {
      console.error('Error adding player to roster:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addPlayerToRoster:', error);
    return false;
  }
};

/**
 * Remove a player from a game roster
 * @param rosterNo - Roster entry number
 * @returns Success boolean
 */
export const removePlayerFromRoster = async (rosterNo: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Roster')
      .delete()
      .eq('roster_no', rosterNo);

    if (error) {
      console.error('Error removing player from roster:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removePlayerFromRoster:', error);
    return false;
  }
};

/**
 * Get athlete game stats for a specific game and athlete
 * @param gameNo - Game number
 * @param athleteNo - Athlete number
 * @returns Array of athlete game stats or empty array
 */
export const getAthleteGameStats = async (
  gameNo: number,
  athleteNo: number
): Promise<AthleteGameStats[]> => {
  try {
    const { data, error } = await supabase
      .from('athlete_game')
      .select('*')
      .eq('game_no', gameNo)
      .eq('athlete_no', athleteNo);

    if (error) {
      console.error('Error fetching athlete game stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAthleteGameStats:', error);
    return [];
  }
};

/**
 * Get all athlete game stats for a specific game
 * @param gameNo - Game number
 * @returns Array of all athlete game stats or empty array
 */
export const getAllAthleteGameStatsByGame = async (
  gameNo: number
): Promise<AthleteGameStats[]> => {
  try {
    const { data, error } = await supabase
      .from('athlete_game')
      .select('*')
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error fetching all athlete game stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAthleteGameStatsByGame:', error);
    return [];
  }
};

/**
 * Update athlete game stats
 * @param athleteGameNo - Athlete game entry number
 * @param stats - Stats to update
 * @returns Success boolean
 */
export const updateAthleteGameStats = async (
  athleteGameNo: number,
  stats: Partial<AthleteGameStats>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('athlete_game')
      .update(stats)
      .eq('athlete_game_no', athleteGameNo);

    if (error) {
      console.error('Error updating athlete game stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAthleteGameStats:', error);
    return false;
  }
};

/**
 * Insert new athlete game stats
 * @param stats - Stats to insert
 * @returns Success boolean
 */
export const insertAthleteGameStats = async (
  stats: Partial<AthleteGameStats>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('athlete_game')
      .insert(stats);

    if (error) {
      console.error('Error inserting athlete game stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in insertAthleteGameStats:', error);
    return false;
  }
};

/**
 * Get roster with full athlete details for a specific game
 * @param gameNo - Game number
 * @returns Array of athletes in the roster or empty array
 */
export const getRosterWithAthletes = async (gameNo: number): Promise<DatabaseAthlete[]> => {
  try {
    const { data, error } = await supabase
      .from('Roster')
      .select(`
        Athlete!inner(*)
      `)
      .eq('game_no', gameNo);

    if (error) {
      console.error('Error fetching roster with athletes:', error);
      throw error;
    }

    if (data) {
      const athletes = data.map((item: any) => item.Athlete).filter(Boolean);
      return athletes;
    }

    return [];
  } catch (error) {
    console.error('Error in getRosterWithAthletes:', error);
    return [];
  }
};

/**
 * Remove an athlete from a game roster by game number and athlete number
 * @param gameNo - Game number
 * @param athleteNo - Athlete number
 * @returns Success boolean
 */
export const removeAthleteFromRoster = async (
  gameNo: number,
  athleteNo: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Roster')
      .delete()
      .eq('game_no', gameNo)
      .eq('athlete_no', athleteNo);

    if (error) {
      console.error('Error removing athlete from roster:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeAthleteFromRoster:', error);
    return false;
  }
};

/**
 * Add a player to a game roster with duplicate checking
 * @param gameNo - Game number
 * @param athleteNo - Athlete number
 * @returns Object with success status and error code if applicable
 */
export const addAthleteToRosterWithValidation = async (
  gameNo: number,
  athleteNo: number
): Promise<{ success: boolean; errorCode?: string }> => {
  try {
    const { error } = await supabase.from('Roster').insert({
      game_no: gameNo,
      athlete_no: athleteNo
    });

    if (error) {
      console.error('Error adding athlete to roster:', error);
      // Return the error code for handling (e.g., '23505' for unique constraint violation)
      return { success: false, errorCode: error.code };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in addAthleteToRosterWithValidation:', error);
    return { success: false };
  }
};
