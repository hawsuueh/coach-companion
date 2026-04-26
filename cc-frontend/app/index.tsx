import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_ROUTES: Record<string, string> = {
  coach: '/(coach)/(tabs)/home',
  athlete: '/(athlete)/(tabs)/home',
  director: '/(director)/(tabs)/home',
  'sports director': '/(director)/(tabs)/home'
};

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  coach: 'clipboard-outline',
  athlete: 'fitness-outline',
  director: 'briefcase-outline',
  'sports director': 'briefcase-outline'
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);

  const router = useRouter();
  const {
    signIn,
    user,
    profile,
    activeRole,
    setActiveRole,
    loading: authLoading
  } = useAuth();

  // Auto-redirect based on auth state
  useEffect(() => {
    console.log('🔄 Redirect check:', {
      user: !!user,
      profile: profile,
      activeRole,
      authLoading
    });

    // Don't do anything while auth is still loading
    if (authLoading) return;

    // If user is logged in and has a profile
    if (user && profile) {
      const roles = profile.roles || [];

      if (roles.length === 1) {
        // Single role - redirect immediately
        const route = ROLE_ROUTES[roles[0]];
        if (route) {
          console.log('🚀 Single role, redirecting to:', roles[0]);
          router.replace(route as any);
        }
      } else if (roles.length > 1 && activeRole) {
        // Multiple roles and user has selected one - redirect
        const route = ROLE_ROUTES[activeRole];
        if (route) {
          console.log('🚀 Role selected, redirecting to:', activeRole);
          router.replace(route as any);
        }
      } else if (roles.length > 1 && !activeRole) {
        // Multiple roles but none selected - show role picker
        setShowRolePicker(true);
      }
    }

    // If user was logged out (session cleared), stay on login screen
    if (!user && !profile && !authLoading) {
      console.log('🚪 User logged out - staying on login screen');
      setError('');
      setEmail('');
      setPassword('');
      setShowRolePicker(false);
    }
  }, [user, profile, activeRole, authLoading, router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
      }
      // Success is handled by the useEffect above
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: string) => {
    setShowRolePicker(false);
    await setActiveRole(role);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
        <Text className="mt-4 text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/bg-login.png')}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Overlay */}
      <View className="absolute inset-0 bg-black/40" />

      <View className="flex-1 px-6">
        {/* Header with logos */}
        <View className="flex-row justify-between pt-12">
          <Image
            source={require('@/assets/logos/logo-cc.png')}
            className="h-20 w-20"
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/logos/logo-unc.png')}
            className="h-20 w-20"
            resizeMode="contain"
          />
        </View>

        {/* Main content */}
        <View className="flex-1 items-center justify-center">
          {/* Title */}
          <View className="mb-10 items-center">
            <Text
              className="text-5xl leading-tight text-white"
              style={{ fontFamily: 'poetsen' }}
            >
              Coach
            </Text>
            <Text
              className="text-5xl leading-tight text-white"
              style={{ fontFamily: 'poetsen' }}
            >
              Companion
            </Text>
            <View className="mt-3 h-1 w-12 rounded-full bg-[#EC1D25]" />
          </View>

          {/* Login Card */}
          <View
            className="w-full rounded-2xl bg-white px-5 py-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8
            }}
          >
            <Text
              className="mb-1 text-center text-xl font-bold text-gray-800"
              style={{ fontFamily: 'inter-bold' }}
            >
              Welcome Back
            </Text>
            <Text
              className="mb-6 text-center text-sm text-gray-400"
              style={{ fontFamily: 'inter-light' }}
            >
              Sign in to your account
            </Text>

            {/* Error message */}
            {error ? (
              <View className="mb-4 flex-row items-center rounded-xl bg-red-50 px-4 py-3">
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text
                  className="ml-2 flex-1 text-sm text-red-600"
                  style={{ fontFamily: 'inter' }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email input */}
            <View
              className="mb-4 flex-row items-center rounded-xl bg-gray-50 px-4"
              style={{ height: 52 }}
            >
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="ml-3 flex-1 text-base text-gray-900"
                placeholderTextColor="#C0C0C0"
                style={{ fontFamily: 'inter' }}
              />
            </View>

            {/* Password input */}
            <View
              className="mb-6 flex-row items-center rounded-xl bg-gray-50 px-4"
              style={{ height: 52 }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="ml-3 flex-1 text-base text-gray-900"
                placeholderTextColor="#C0C0C0"
                style={{ fontFamily: 'inter' }}
              />
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || authLoading}
              className="items-center justify-center rounded-xl py-4"
              style={{
                backgroundColor: loading || authLoading ? '#FCA5A5' : '#EC1D25',
                shadowColor: '#EC1D25',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
              activeOpacity={0.8}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text
                    className="ml-2 text-base text-white"
                    style={{ fontFamily: 'inter-bold' }}
                  >
                    Signing in...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-base tracking-wider text-white"
                  style={{ fontFamily: 'inter-bold' }}
                >
                  LOGIN
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center pb-8">
          <Text
            className="text-xs text-white/60"
            style={{ fontFamily: 'inter-light' }}
          >
            Coach Companion v1.0
          </Text>
        </View>
      </View>

      {/* Role Picker Modal - shown when user has multiple roles */}
      <Modal
        visible={showRolePicker}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View
            className="w-full rounded-2xl bg-white px-6 py-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 10
            }}
          >
            {/* Header */}
            <View className="mb-6 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="people-outline" size={30} color="#EC1D25" />
              </View>
              <Text
                className="text-xl text-gray-800"
                style={{ fontFamily: 'inter-bold' }}
              >
                Login As
              </Text>
              <Text
                className="mt-1 text-center text-sm text-gray-400"
                style={{ fontFamily: 'inter-light' }}
              >
                You have multiple roles. Choose one to continue.
              </Text>
            </View>

            {/* Role Options */}
            {(profile?.roles || []).map((role, index) => (
              <TouchableOpacity
                key={role}
                onPress={() => handleRoleSelect(role)}
                className="flex-row items-center rounded-xl bg-gray-50 px-4 py-4"
                style={{
                  marginBottom:
                    index < (profile?.roles?.length || 0) - 1 ? 12 : 0
                }}
                activeOpacity={0.7}
              >
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-[#EC1D25]">
                  <Ionicons
                    name={ROLE_ICONS[role] || 'person-outline'}
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base text-gray-800"
                    style={{ fontFamily: 'inter-bold' }}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                  <Text
                    className="text-xs text-gray-400"
                    style={{ fontFamily: 'inter-light' }}
                  >
                    Continue as {role}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
