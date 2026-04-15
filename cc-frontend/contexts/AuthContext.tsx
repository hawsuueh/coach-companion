import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '@/config/supabaseClient';
import { getUserProfile, getCoachNoByAccount, UserProfile } from '@/services/authService';
import { getAthleteNoByAccount } from '@/services/athleteService';

// Types
interface DatabaseCoach {
  coach_no: number;
  account_no: number | null; // FK to Account table
  contact_no: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  coachNo: number | null; // Coach number if user is a coach
  athleteNo: number | null; // Athlete number if user is an athlete
  activeRole: string | null; // Currently selected role
  setActiveRole: (role: string) => Promise<void>; // Switch between roles
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshAthleteNo: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [coachNo, setCoachNo] = useState<number | null>(null);
  const [athleteNo, setAthleteNo] = useState<number | null>(null);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);

  // Load role-specific data (coachNo/athleteNo) based on active role
  const loadRoleData = async (role: string, accountNo: number) => {
    const normalizedRole = role.toLowerCase();
    console.log('🔍 Loading role data for:', normalizedRole, 'Account:', accountNo);

    if (normalizedRole === 'coach') {
      const coachNumber = await getCoachNoByAccount(accountNo);
      setCoachNo(coachNumber);
      setAthleteNo(null);
    } else if (normalizedRole === 'athlete') {
      const athleteNumber = await getAthleteNoByAccount(accountNo);
      console.log('🏃 Athlete Number found:', athleteNumber);
      setAthleteNo(athleteNumber);
      setCoachNo(null);
    } else {
      // director or other roles
      setCoachNo(null);
      setAthleteNo(null);
    }
  };

  // Switch active role
  const setActiveRole = async (role: string) => {
    setActiveRoleState(role);
    if (profile) {
      await loadRoleData(role, profile.account_no);
    }
  };

  // Refresh Athlete No
  const refreshAthleteNo = async () => {
    if (profile?.account_no && activeRole?.toLowerCase() === 'athlete') {
      console.log('🔄 Refreshing athleteNo for account:', profile.account_no);
      const athleteNumber = await getAthleteNoByAccount(profile.account_no);
      console.log('✅ Found athleteNo:', athleteNumber);
      setAthleteNo(athleteNumber);
    } else {
      console.log('⚠️ Cannot refresh athleteNo. Profile:', profile);
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('❌ Login error:', error.message);
        return { error: error.message };
      }

      console.log('✅ Login successful:', data.user?.id);
      return {};
    } catch (error) {
      console.log('💥 Unexpected error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign Up
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) return { error: authError.message };
      if (!authData.user) return { error: 'Failed to create user' };

      // 2. Get role_no from Role table
      const { data: roleData, error: roleError } = await supabase
        .from('Role')
        .select('role_no')
        .eq('user_role', role)
        .single();

      if (roleError) return { error: 'Invalid role selected' };

      // 3. Create profile in your Account table
      const { data: accountData, error: profileError } = await supabase
        .from('Account')
        .insert({
          user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName
        })
        .select('account_no')
        .single();

      if (profileError) return { error: 'Failed to create profile' };

      // 4. Insert into Account_Role junction table
      const { error: accountRoleError } = await supabase
        .from('Account_Role')
        .insert({
          account_no: accountData.account_no,
          role_no: roleData.role_no
        });

      if (accountRoleError) return { error: 'Failed to assign role' };

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      console.log('🚪 Signing out user:', user?.email);
      console.log('🗑️ Clearing session from AsyncStorage...');

      await supabase.auth.signOut();

      // Clear local state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setActiveRoleState(null);
      setCoachNo(null);
      setAthleteNo(null);

      console.log('✅ Sign out completed - all data cleared');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔄 Checking for existing session...');
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        console.log('✅ Found existing session for:', session.user.email);
        console.log('📱 Session restored from AsyncStorage!');
      } else {
        console.log('❌ No existing session found');
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);

        // Handle roles
        if (userProfile && userProfile.roles.length > 0) {
          console.log('🔍 User roles:', userProfile.roles, 'for Account:', userProfile.account_no);

          if (userProfile.roles.length === 1) {
            // Single role - auto-select it
            const role = userProfile.roles[0];
            setActiveRoleState(role);
            await loadRoleData(role, userProfile.account_no);
          } else {
            // Multiple roles - don't auto-select, let user choose on login screen
            setActiveRoleState(null);
            setCoachNo(null);
            setAthleteNo(null);
          }
        } else {
          setCoachNo(null);
          setAthleteNo(null);
        }
      } else {
        setCoachNo(null);
        setAthleteNo(null);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);

      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        console.log('🗑️ AsyncStorage cleared');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed for:', session?.user.email);
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);

        // Handle roles on auth state change
        if (userProfile && userProfile.roles.length > 0) {
          if (userProfile.roles.length === 1) {
            const role = userProfile.roles[0];
            setActiveRoleState(role);
            await loadRoleData(role, userProfile.account_no);
          } else {
            // Multiple roles - don't auto-select
            setActiveRoleState(null);
            setCoachNo(null);
            setAthleteNo(null);
          }
        } else {
          setCoachNo(null);
          setAthleteNo(null);
        }
      } else {
        setProfile(null);
        setActiveRoleState(null);
        setCoachNo(null);
        setAthleteNo(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    coachNo,
    athleteNo,
    activeRole,
    setActiveRole,
    signIn,
    signUp,
    signOut,
    refreshAthleteNo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
