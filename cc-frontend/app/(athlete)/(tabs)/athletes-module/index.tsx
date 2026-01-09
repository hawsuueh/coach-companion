import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttributesCard from '@/components/cards/AttributesCard';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAthleteById, transformDatabaseAthlete, type Athlete } from '@/services/athleteService';
import React from 'react';

export default function AthleteModuleIndex() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { athleteNo, profile, loading: authLoading } = useAuth();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('My Personal Module');
  }, [setTitle]);

  useEffect(() => {
    const fetchAthleteData = async () => {
      if (authLoading) return;
      
      if (!athleteNo) {
        setError('No athlete profile associated with this account.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getAthleteById(athleteNo);
        if (data) {
          setAthlete(transformDatabaseAthlete(data));
        } else {
          setError('Could not find your athlete record.');
        }
      } catch (err) {
        console.error('Error fetching athlete info:', err);
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteData();
  }, [athleteNo, authLoading]);

  const handleAttributesPress = () => {
    router.push('/(athlete)/(tabs)/athletes-module/attributes' as any);
  };

  const handleInjuryRecordsPress = () => {
    router.push('/(athlete)/(tabs)/athletes-module/injuries' as any);
  };

  const handleGameRecordsPress = () => {
    router.push('/(athlete)/(tabs)/athletes-module/game-records' as any);
  };

  if (loading || authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-500 font-medium">Loading your profile...</Text>
      </View>
    );
  }

  // Handle case where athlete is not linked to a player record
  if (!athleteNo) {
    return (
      <View className="flex-1 bg-gray-50 px-6 justify-center items-center">
        <View className="bg-white p-8 rounded-[32px] items-center shadow-sm border border-gray-100 w-full">
          <View className="h-20 w-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="person-add-outline" size={40} color="#EF4444" />
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            No Profile Linked
          </Text>
          
          <Text className="text-gray-500 text-center mb-8 leading-5">
            You haven't linked your account to a player profile yet. 
            Find your name to see your game statistics and injury history.
          </Text>

          <TouchableOpacity 
            onPress={() => router.push('/(athlete)/(tabs)/athletes-module/link-profile' as any)}
            className="bg-red-600 w-full py-4 rounded-2xl items-center shadow-md shadow-red-200"
          >
            <Text className="text-white font-bold text-lg">Find My Profile</Text>
          </TouchableOpacity>
        </View>

        <Text className="mt-8 text-gray-400 text-sm text-center">
          Logged in as: <Text className="font-semibold text-gray-600">{profile?.first_name} {profile?.last_name}</Text>{"\n"}
          Account No: <Text className="font-semibold text-gray-600">{profile?.account_no || 'N/A'}</Text> | Role: <Text className="font-semibold text-gray-600 uppercase">{profile?.role || 'N/A'}</Text>
        </Text>
      </View>
    );
  }

  if (error || !athlete) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-lg font-semibold text-gray-900">
          {error || 'Profile not found'}
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/(athlete)/(tabs)/athletes-module/link-profile' as any)}
          className="mt-6 bg-gray-200 px-6 py-3 rounded-xl"
        >
          <Text className="text-gray-700 font-bold">Try Linking Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Athlete Profile Section */}
      <View className="items-center px-4 py-10 bg-gray-50">
        {/* Athlete Photo Placeholder */}
        <View className="mb-4 h-28 w-28 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
          <Ionicons name="person" size={56} color="#9CA3AF" />
        </View>

        {/* Athlete Info */}
        <Text className="text-2xl font-bold text-gray-900">
          {athlete.name}
        </Text>
        <View className="mt-2 flex-row items-center">
          <View className="bg-red-100 px-3 py-1 rounded-full">
            <Text className="text-red-700 font-bold text-xs">#{athlete.number}</Text>
          </View>
          <Text className="ml-2 text-lg text-gray-600 font-medium">{athlete.position}</Text>
        </View>
      </View>

      {/* Action Cards */}
      <View className="flex-1 px-4 mt-6">
        <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
          Activity & Records
        </Text>
        
        <AttributesCard
          title="My Attributes"
          description="View your skill ratings and progress"
          onPress={handleAttributesPress}
        />

        <AttributesCard
          title="Injury History"
          description="Check your recovery status and past records"
          onPress={handleInjuryRecordsPress}
        />

        <AttributesCard
          title="Game Statistics"
          description="Analyze your performance across all games"
          onPress={handleGameRecordsPress}
        />
      </View>
    </View>
  );
}
