import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { signIn, user, profile, loading: authLoading } = useAuth();

  // Auto-redirect if user is already logged in
  useEffect(() => {
    console.log('🔄 Redirect check:', {
      user: !!user,
      profile: profile,
      authLoading
    });

    if (user && profile && !authLoading) {
      const routes = {
        coach: '/(coach)/(tabs)/home',
        athlete: '/(athlete)/(tabs)/home',
        director: '/(director)/(tabs)/home',
        'sports director': '/(director)/(tabs)/home'
      };

      const userRole = profile.role?.toLowerCase() as keyof typeof routes;
      console.log('🚀 Redirecting to:', userRole, routes[userRole]);

      if (routes[userRole]) {
        router.replace(routes[userRole] as any);
      }
    }
  }, [user, profile, authLoading, router]);

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
      <View className="absolute inset-0 bg-white/80" />

      <View className="flex-1 px-6">
        {/* Header with logos */}
        <View className="flex-row justify-between pt-12">
          <Image
            source={require('@/assets/logos/logo-cc.png')}
            className="h-24 w-24"
            resizeMode="contain"
          />
          <Image
            source={require('@/assets/logos/logo-unc.png')}
            className="h-24 w-24"
            resizeMode="contain"
          />
        </View>

        {/* Main content */}
        <View className="flex-1 items-center justify-center">
          {/* Title */}
          <View className="mb-12 items-center">
            <Text className="text-5xl font-extrabold leading-tight text-black">
              Coach
            </Text>
            <Text className="text-5xl font-extrabold leading-tight text-black">
              Companion
            </Text>

            <Text className="mt-4 text-2xl font-bold text-black">LOGIN</Text>
            <Text className="mt-1 text-base text-gray-600">
              Please sign in to continue
            </Text>
          </View>

          {/* Error message */}
          {error ? (
            <View className="mb-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <Text className="text-center text-red-700">{error}</Text>
            </View>
          ) : null}

          {/* Inputs */}
          <View className="mb-8 w-full">
            {/* Email input */}
            <View className="mb-4 flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
              <Text className="mr-3 text-gray-400">✉</Text>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Password input */}
            <View className="flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
              <Text className="mr-3 text-gray-400">🔒</Text>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 text-base text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || authLoading}
            className={`rounded-full px-16 py-4 shadow-md ${
              loading || authLoading ? 'bg-gray-400' : 'bg-gray-800'
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="ml-2 text-lg font-bold text-white">
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text className="text-lg font-bold text-white">LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
