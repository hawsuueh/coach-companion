import supabase from '@/config/supabaseClient';

// Types
export interface DatabaseAthlete {
  athlete_no: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  position: string | null;
  player_no: number | null;
}

export interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

/**
 * Transform database athlete format to UI athlete format
 * @param dbAthlete - Athlete data from database
 * @returns Formatted athlete object for UI
 */
export const transformDatabaseAthlete = (dbAthlete: DatabaseAthlete): Athlete => {
  const fullName = [
    dbAthlete.first_name,
    dbAthlete.middle_name,
    dbAthlete.last_name
  ]
    .filter(name => name && name.trim() !== '')
    .join(' ');

  return {
    id: dbAthlete.athlete_no.toString(),
    number: dbAthlete.player_no?.toString() || '0',
    name: fullName || 'Unknown Player',
    position: dbAthlete.position || 'Unknown'
  };
};

/**
 * Get all athletes for a specific batch
 * @param batchNo - Batch number
 * @returns Array of athletes or empty array
 */
export const getAthletesByBatch = async (batchNo: number): Promise<DatabaseAthlete[]> => {

  //  This query means:
  // This means: "Get me all athletes assigned to this batch number,
  // but only if they actually exist in the Athlete table"

  // It's a data quality safeguard that prevents you from getting incomplete or broken data!
  try {
    const { data, error } = await supabase
      .from('athlete_batch')
      .select(
        `
          Athlete!inner(*)
        `
      )
      .eq('batch_no', batchNo);

    if (error) {
      console.error('Error fetching athletes by batch:', error);
      throw error;
    }

    if (data) {
      const athletes = data
        .map((item: any) => item.Athlete)
        .filter(Boolean);
      return athletes;
    }

    return [];
  } catch (error) {
    console.error('Error in getAthletesByBatch:', error);
    return [];
  }
};

/**
 * Get all athletes (no filtering)
 * @returns Array of all athletes or empty array
 */
export const getAllAthletes = async (): Promise<DatabaseAthlete[]> => {
  try {
    const { data, error } = await supabase
      .from('Athlete')
      .select('*')
      .order('athlete_no', { ascending: true });

    if (error) {
      console.error('Error fetching all athletes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAthletes:', error);
    return [];
  }
};

/**
 * Get a single athlete by athlete number
 * @param athleteNo - Athlete number
 * @returns Athlete object or null if not found
 */
export const getAthleteById = async (athleteNo: number): Promise<DatabaseAthlete | null> => {
  try {
    const { data, error } = await supabase
      .from('Athlete')
      .select('*')
      .eq('athlete_no', athleteNo)
      .single();

    if (error) {
      console.error('Error fetching athlete by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAthleteById:', error);
    return null;
  }
};

/**
 * Get athlete attributes
 * @param athleteNo - Athlete number
 * @returns Athlete attributes or null if not found
 */
export const getAthleteAttributes = async (athleteNo: number): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('Athlete_attributes')
      .select('*')
      .eq('athlete_no', athleteNo)
      .single();

    if (error) {
      console.error('Error fetching athlete attributes:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAthleteAttributes:', error);
    return null;
  }
};

/**
 * Update athlete attributes
 * @param athleteNo - Athlete number
 * @param attributes - Attributes to update
 * @returns Success boolean
 */
export const updateAthleteAttributes = async (
  athleteNo: number,
  attributes: any
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Athlete_attributes')
      .update(attributes)
      .eq('athlete_no', athleteNo);

    if (error) {
      console.error('Error updating athlete attributes:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAthleteAttributes:', error);
    return false;
  }
};
