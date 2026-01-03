import supabase from '@/config/supabaseClient';

// Types
export interface UserProfile {
  account_no: number;
  first_name: string | null;
  last_name: string | null;
  role: string; // 'coach', 'athlete', 'director'
}

/**
 * Get user profile from Account table by user ID
 * @param userId - Supabase auth user ID
 * @returns UserProfile object or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('👤 Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('Account')
      .select(
        `
          account_no,
          first_name,
          last_name,
          Role(user_role)
        `
      )
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('❌ Profile fetch error:', error);
      throw error;
    }

    console.log('📋 Raw profile data:', data);

    const profile: UserProfile = {
      account_no: data.account_no,
      first_name: data.first_name,
      last_name: data.last_name,
      role: (data.Role as any)?.user_role || ''
    };

    console.log('✅ Processed profile:', profile);
    return profile;
  } catch (error) {
    console.error('💥 Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get coach number from Coach table by account number
 * @param accountNo - Account number from Account table
 * @returns Coach number or null if not found/error
 */
export const getCoachNoByAccount = async (accountNo: number): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('Coach')
      .select('coach_no')
      .eq('account_no', accountNo)
      .single();

    if (error) {
      console.log('❌ Coach fetch error:', error);
      return null;
    }

    return data?.coach_no || null;
  } catch (error) {
    console.error('💥 Error fetching coach number:', error);
    return null;
  }
};
