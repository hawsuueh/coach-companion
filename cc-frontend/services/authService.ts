import supabase from '@/config/supabaseClient';

// Types
export interface UserProfile {
  account_no: number;
  first_name: string | null;
  last_name: string | null;
  roles: string[]; // e.g. ['coach', 'sports director']
}

export interface UserRole {
  role_no: number;
  user_role: string;
}

/**
 * Get user profile from Account table by user ID
 * @param userId - Supabase auth user ID
 * @returns UserProfile object or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('👤 Fetching profile for user:', userId);

    // 1. Get account info
    const { data: accountData, error: accountError } = await supabase
      .from('Account')
      .select('account_no, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (accountError) {
      console.log('❌ Account fetch error:', accountError);
      throw accountError;
    }

    // 2. Get roles from Account_Role junction table
    const { data: roleData, error: roleError } = await supabase
      .from('Account_Role')
      .select('Role(user_role)')
      .eq('account_no', accountData.account_no);

    if (roleError) {
      console.log('❌ Roles fetch error:', roleError);
      throw roleError;
    }

    const roles = roleData
      .map((r: any) => r.Role?.user_role?.toLowerCase())
      .filter(Boolean);

    console.log('📋 Raw profile data:', accountData, 'Roles:', roles);

    const profile: UserProfile = {
      account_no: accountData.account_no,
      first_name: accountData.first_name,
      last_name: accountData.last_name,
      roles: roles.length > 0 ? roles : ['']
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
