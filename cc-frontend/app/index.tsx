import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [role, setRole] = useState<'coach' | 'athlete' | 'director' | null>(
    null
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const roles = ['coach', 'athlete', 'director'];

  const handleLogin = () => {
    const routes = {
      coach: '/(coach)/(tabs)/home',
      athlete: '/(athlete)/(tabs)/home',
      director: '/(director)/(tabs)/home'
    };

    if (role && routes[role]) {
      router.replace(routes[role] as any);
    }
  };

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

          {/* Role selection */}
          <View className="mb-10 flex-row">
            {roles.map(roleOption => (
              <TouchableOpacity
                key={roleOption}
                onPress={() => setRole(roleOption as typeof role)}
                className={`mx-1 rounded-full border px-6 py-2 ${
                  role === roleOption
                    ? 'border-red-600 bg-red-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <Text
                  className={`text-base font-semibold capitalize ${
                    role === roleOption ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {roleOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
            className="rounded-full bg-gray-800 px-16 py-4 shadow-md"
          >
            <Text className="text-lg font-bold text-white">LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
