import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttributesCard from '@/components/cards/AttributesCard';
import { useHeader } from '@/components/contexts/HeaderContext';
import supabase from '@/config/supabaseClient';
import React from 'react';

interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

export default function AthleteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setTitle } = useHeader();

  const [athlete, setAthlete] = React.useState<Athlete | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const fetchAthlete = async () => {
    setLoading(true);
    setError(null);
    if (!id || typeof id !== 'string') {
      setError('Invalid athlete ID.');
      setAthlete(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('Athlete')
        .select('*')
        .eq('athlete_no', id)
        .maybeSingle();
      if (fetchError) {
        throw fetchError;
      }
      if (!data) {
        setAthlete(null);
      } else {
        // transformDatabaseAthlete function copy from module
        const fullName = [
          data.first_name,
          data.middle_name,
          data.last_name,
        ]
          .filter(name => name && name.trim() !== '')
          .join(' ');
        setAthlete({
          id: data.athlete_no.toString(),
          number: data.player_no?.toString() || '0',
          name: fullName || 'Unknown Player',
          position: data.position || 'Unknown',
        });
      }
    } catch (err) {
      setError('Failed to load athlete.');
      setAthlete(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setTitle('Athlete Menu');
  }, [setTitle]);

  useEffect(() => {
    
    fetchAthlete();
  }, [id]);

  const handleAttributesPress = () => {
     // This takes the current athlete's ID and goes into the [id] folder's attributes file
    if (!athlete) return;
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/attributes` as any
    );
  };

  const handleInjuryRecordsPress = () => {
    // This takes the current athlete's ID and goes into the [id] folder's injuries file
    if (!athlete) return;
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/injuries` as any
    );
  };

  const handleGameRecordsPress = () => {
    // This takes the current athlete's ID and goes into the [id] folder's game-records file
    if (!athlete) return;
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/game-records` as any
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Loading athlete details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !athlete) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            {error || 'Athlete not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      {/* Athlete Profile Section */}
      <View className="items-center px-4 py-8">
        {/* Athlete Photo Placeholder */}
        <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
          <Ionicons name="person" size={48} color="#666" />
        </View>

        {/* Athlete Info */}
        <Text className="mb-1 text-2xl font-bold text-black">
          {athlete.name}
        </Text>
        <Text className="text-lg text-gray-600">{athlete.position}</Text>
      </View>

      {/* Attributes Cards */}
      <View className="flex-1 px-4">
        <AttributesCard
          title="Attributes"
          description="Description"
          onPress={handleAttributesPress}
        />

        <AttributesCard
          title="Injury Records"
          description="Description"
          onPress={handleInjuryRecordsPress}
        />

        <AttributesCard
          title="Game Records"
          description="Description"
          onPress={handleGameRecordsPress}
        />
      </View>
    </View>
  );
}
