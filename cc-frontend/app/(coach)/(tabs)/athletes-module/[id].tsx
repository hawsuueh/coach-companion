import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AttributesCard from '@/components/cards/AttributesCard';
import { useHeader } from '@/components/contexts/HeaderContext';

// Mock data - in the future this will come from Supabase
const MOCK_ATHLETES = {
  '1': { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  '2': { id: '2', number: '7', name: 'Mike Johnson', position: 'Midfielder' },
  '3': { id: '3', number: '23', name: 'David Wilson', position: 'Defender' },
  '4': { id: '4', number: '1', name: 'Tom Brown', position: 'Goalkeeper' },
  '5': { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  '6': { id: '6', number: '4', name: 'Chris Miller', position: 'Defender' },
  '7': { id: '7', number: '8', name: 'Ryan Taylor', position: 'Midfielder' },
  '8': { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
};

export default function AthleteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Get athlete data - in the future this will be fetched from Supabase
  const athlete = MOCK_ATHLETES[id as keyof typeof MOCK_ATHLETES];

  const handleBackPress = () => {
    router.back();
  };

  const handleAttributesPress = () => {
    console.log('Attributes pressed for athlete:', athlete?.name);
    // Navigate to attributes detail screen
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/attributes` as any
    );
  };

  const handleInjuryRecordsPress = () => {
    console.log('Injury Records pressed for athlete:', athlete?.name);
    // Navigate to injury records screen
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/injuries` as any
    );
  };

  const handleGameRecordsPress = () => {
    console.log('Game Records pressed for athlete:', athlete?.name);
    // Navigate to game records screen
    router.push(
      `/(coach)/(tabs)/athletes-module/${athlete.id}/game-records` as any
    );
  };

  if (!athlete) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Athlete not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Header */}

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
