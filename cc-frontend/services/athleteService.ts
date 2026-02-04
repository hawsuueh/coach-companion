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
/**
 * Check if an athlete with the same email exists globally or same player number exists in a batch
 * @param email - Email to check
 * @param playerNo - Jersey number to check
 * @param batchNo - Batch ID to check within
 * @returns Object with existence status and message
 */
export const checkDuplicateAthlete = async (
  email: string,
  playerNo: number,
  batchNo: number
): Promise<{ exists: boolean; field?: 'email' | 'player_no'; message?: string }> => {
  try {
    // 1. Check for duplicate email (Global)
    const { data: emailData, error: emailError } = await supabase
      .from('Athlete')
      .select('athlete_no')
      .ilike('gmail', email.trim())
      .maybeSingle();

    if (emailError) throw emailError;
    if (emailData) {
      return { exists: true, field: 'email', message: 'An athlete with this email already exists.' };
    }

    // 2. Check for duplicate player number in the current batch
    const { data: batchData, error: batchError } = await supabase
      .from('athlete_batch')
      .select('Athlete!inner(player_no)')
      .eq('batch_no', batchNo)
      .eq('Athlete.player_no', playerNo);

    if (batchError) throw batchError;
    if (batchData && batchData.length > 0) {
      return { exists: true, field: 'player_no', message: `Jersey #${playerNo} is already taken in this batch.` };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return { exists: false }; // Fail safe to allow creation if check fails
  }
};

/**
 * Create a new athlete and associate with a batch
 * @param athlete - Athlete data (excluding ID) plus credentials
 * @param batchNo - Batch number to associate with
 * @returns Object with success status and optional error or new ID
 */
export const createAthlete = async (
  athlete: Omit<DatabaseAthlete, 'athlete_no'> & { email?: string; password?: string },
  batchNo: number
): Promise<{ success: boolean; error?: string; athleteNo?: number }> => {
  try {
    let accountNo: number | null = null;

    // 1. If email and password provided, create Auth user and Account
    if (athlete.email && athlete.password) {
      const sanitizedEmail = athlete.email.trim().toLowerCase();
      console.log(`📧 Attempting Auth Signup for: [${sanitizedEmail}]`); // Brackets to see hidden spaces

      // Use a separate client for signup to avoid changing the current session
      const { createClient } = await import('@supabase/supabase-js');
      const tempSupabase = createClient(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );

      // Create Supabase Auth user
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: sanitizedEmail,
        password: athlete.password
      });

      if (authError) {
        console.error('❌ Auth Error Details:', JSON.stringify(authError, null, 2));
        return { success: false, error: `Auth Error: ${authError.message}` };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create auth user' };
      }

      // Get Athlete role number
      const { data: roleData, error: roleError } = await supabase
        .from('Role')
        .select('role_no')
        .ilike('user_role', 'Athlete')
        .single();

      if (roleError) {
        console.error('Error fetching Athlete role:', roleError);
        return { success: false, error: 'System configuration error: Athlete role not found' };
      }

      // Create Account record
      const { data: accountData, error: accountError } = await supabase
        .from('Account')
        .insert({
          user_id: authData.user.id,
          first_name: athlete.first_name,
          middle_name: athlete.middle_name,
          last_name: athlete.last_name,
          role_no: roleData.role_no
        })
        .select('account_no')
        .single();

      if (accountError) {
        console.error('Error creating account:', accountError);
        return { success: false, error: 'Failed to create athlete account' };
      }

      accountNo = accountData.account_no;
    }

    // 2. Insert into Athlete table
    const { data: athleteData, error: athleteError } = await supabase
      .from('Athlete')
      .insert([
        {
          first_name: athlete.first_name,
          middle_name: athlete.middle_name,
          last_name: athlete.last_name,
          position: athlete.position,
          player_no: athlete.player_no,
          account_no: accountNo,
          gmail: athlete.email || null
        }
      ])
      .select('athlete_no')
      .single();

    if (athleteError) {
      console.error('Error creating athlete:', athleteError);
      return { success: false, error: 'Failed to create athlete record' };
    }

    if (!athleteData) {
      return { success: false, error: 'No data returned from creation' };
    }

    const newAthleteNo = athleteData.athlete_no;

    // 3. Associate with Batch (athlete_batch table)
    const { error: batchError } = await supabase
      .from('athlete_batch')
      .insert([
        {
          athlete_no: newAthleteNo,
          batch_no: batchNo
        }
      ]);

    if (batchError) {
      console.error('Error associating athlete with batch:', batchError);
      return {
        success: false,
        error: 'Created athlete but failed to add to batch'
      };
    }

    return { success: true, athleteNo: newAthleteNo };
  } catch (error) {
    console.error('Error in createAthlete:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};
/**
 * Remove an athlete from a specific batch (Unlink operation)
 * This safely removes them from the current view without deleting historical stats.
 * @param athleteNo - Athlete number to remove
 * @param batchNo - Batch number to remove from
 * @returns Success boolean
 */
export const removeAthleteFromBatch = async (
  athleteNo: number,
  batchNo: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('athlete_batch')
      .delete()
      .eq('athlete_no', athleteNo)
      .eq('batch_no', batchNo);

    if (error) {
      console.error('Error removing athlete from batch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeAthleteFromBatch:', error);
    return false;
  }
};

/**
 * Get athlete number from Athlete table by account number
 * @param accountNo - Account number from Account table
 * @returns Athlete number or null if not found/error
 */
export const getAthleteNoByAccount = async (
  accountNo: number
): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('Athlete')
      .select('athlete_no')
      .eq('account_no', accountNo)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Ignore "no rows found"
        console.log('❌ Athlete fetch error:', error);
      }
      return null;
    }

    return data?.athlete_no || null;
  } catch (error) {
    console.error('💥 Error fetching athlete number:', error);
    return null;
  }
};

/**
 * Search for athletes by name (for profile linking)
 * @param query - Name search query
 * @returns Array of matching athletes
 */
export const searchAthletesByName = async (
  query: string
): Promise<DatabaseAthlete[]> => {
  try {
    const { data, error } = await supabase
      .from('Athlete')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .is('account_no', null) // Only show unlinked athletes
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching athletes:', error);
    return [];
  }
};

/**
 * Link an athlete record to an account
 * @param athleteNo - Athlete ID to link
 * @param accountNo - Account ID to link to
 * @returns Success boolean
 */
export const linkAthleteToAccount = async (
  athleteNo: number,
  accountNo: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Athlete')
      .update({ account_no: accountNo })
      .eq('athlete_no', athleteNo);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error linking athlete to account:', error);
    return false;
  }
};

