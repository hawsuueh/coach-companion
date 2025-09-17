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

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
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
    await supabase.auth.signOut();
  };

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
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
