import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/headers/Header';

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

// Mock game statistics data
const MOCK_GAME_STATS = {
  '1': {
    totalFieldGoal: { percentage: 42.86, made: 6, attempted: 14 },
    twoPointFieldGoal: { percentage: 33.33, made: 3, attempted: 9 },
    threePointFieldGoal: { percentage: 80.0, made: 3, attempted: 5 },
    totalPoints: 19,
    assist: 8,
    steal: 0,
    block: 3
  },
  '2': {
    totalFieldGoal: { percentage: 50.0, made: 8, attempted: 16 },
    twoPointFieldGoal: { percentage: 45.45, made: 5, attempted: 11 },
    threePointFieldGoal: { percentage: 60.0, made: 3, attempted: 5 },
    totalPoints: 22,
    assist: 5,
    steal: 2,
    block: 1
  }
};

interface StatRowProps {
  label: string;
  value: string | number;
  percentage?: number;
  made?: number;
  attempted?: number;
  progressColor?: string;
}

function StatRow({
  label,
  value,
  percentage,
  made,
  attempted,
  progressColor
}: StatRowProps) {
  return (
    <View className="border-b border-gray-100 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-medium text-black"
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          className="ml-2 text-base font-semibold text-black"
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>

      {percentage !== undefined && (
        <View className="mt-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>
              Made: {made} | Attempt: {attempted}
            </Text>
            <Text
              className="ml-2 text-sm font-medium text-black"
              numberOfLines={1}
            >
              {percentage.toFixed(2)}%
            </Text>
          </View>
          <View className="h-2.5 w-full rounded-full bg-gray-200">
            <View
              className="h-2.5 rounded-full"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: progressColor || '#FF6B6B'
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default function GameRecordsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Get athlete data - in the future this will be fetched from Supabase
  const athlete = MOCK_ATHLETES[id as keyof typeof MOCK_ATHLETES];
  const gameStats =
    MOCK_GAME_STATS[id as keyof typeof MOCK_GAME_STATS] || MOCK_GAME_STATS['1'];

  const handleBackPress = () => {
    router.back();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Header */}
      <Header
        title="Game Report"
        showBack={true}
        showNotifications={false}
        showMenu={false}
        onBackPress={handleBackPress}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Player Information Section */}
        <View
          className="mx-4 mt-4 rounded-xl bg-white p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5
          }}
        >
          <View className="items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <Ionicons name="person" size={48} color="#666" />
            </View>
            <Text className="mb-1 text-2xl font-bold text-black">
              {athlete.name}
            </Text>
            <Text className="text-lg text-gray-600">{athlete.position}</Text>
          </View>
        </View>

        {/* Game Statistics Section */}
        <View
          className="mx-4 mt-4 rounded-xl bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5
          }}
        >
          <View className="border-b border-gray-100 px-4 py-4">
            <Text className="text-lg font-semibold text-black">
              Game 1 Statistics
            </Text>
          </View>

          <StatRow
            label="Total Field Goal"
            value={`${gameStats.totalFieldGoal.percentage.toFixed(2)}%`}
            percentage={gameStats.totalFieldGoal.percentage}
            made={gameStats.totalFieldGoal.made}
            attempted={gameStats.totalFieldGoal.attempted}
            progressColor="#FF6B6B"
          />

          <StatRow
            label="2PTS Field Goal"
            value={`${gameStats.twoPointFieldGoal.percentage.toFixed(2)}%`}
            percentage={gameStats.twoPointFieldGoal.percentage}
            made={gameStats.twoPointFieldGoal.made}
            attempted={gameStats.twoPointFieldGoal.attempted}
            progressColor="#FFA500"
          />

          <StatRow
            label="3PTS Field Goal"
            value={`${gameStats.threePointFieldGoal.percentage.toFixed(2)}%`}
            percentage={gameStats.threePointFieldGoal.percentage}
            made={gameStats.threePointFieldGoal.made}
            attempted={gameStats.threePointFieldGoal.attempted}
            progressColor="#4CAF50"
          />

          <StatRow label="Total Points" value={gameStats.totalPoints} />
          <StatRow label="Assist" value={gameStats.assist} />
          <StatRow label="Steal" value={gameStats.steal} />
          <StatRow label="Block" value={gameStats.block} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
