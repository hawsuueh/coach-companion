import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '@/config/supabaseClient';

// Types
interface UserProfile {
  account_no: number;
  first_name: string | null;
  last_name: string | null;
  role: string; // 'coach', 'athlete', 'director'
}

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
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
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

  // Get user profile from your Account table
  const getUserProfile = async (userId: string) => {
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

      const profile = {
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

  // Get coach_no from account_no
  const getCoachNo = async (accountNo: number): Promise<number | null> => {
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
      const { error: profileError } = await supabase.from('Account').insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        role_no: roleData.role_no
      });

      if (profileError) return { error: 'Failed to create profile' };

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
        
        // Get coach_no if user is a coach
        if (userProfile) {
          const coachNumber = await getCoachNo(userProfile.account_no);
          setCoachNo(coachNumber);
        } else {
          setCoachNo(null);
        }
      } else {
        setCoachNo(null);
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
        
        // Get coach_no if user is a coach
        if (userProfile) {
          const coachNumber = await getCoachNo(userProfile.account_no);
          setCoachNo(coachNumber);
        } else {
          setCoachNo(null);
        }
      } else {
        setProfile(null);
        setCoachNo(null);
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
    signIn,
    signUp,
    signOut
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
