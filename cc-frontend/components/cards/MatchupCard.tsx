import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface MatchupCardProps {
  playerTeam: string;
  opponentTeam: string;
  gameCount: number;
  onPress: () => void;
}

export default function MatchupCard({ 
  playerTeam, 
  opponentTeam, 
  gameCount, 
  onPress 
}: MatchupCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 rounded-xl bg-white p-4 shadow-md"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Teams Section */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 items-center">
          <Text className="text-center text-sm font-semibold text-gray-900" numberOfLines={2}>
            {playerTeam}
          </Text>
        </View>

        <View className="mx-4">
          <Text className="text-xl font-bold text-gray-400">VS</Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-center text-sm font-semibold text-gray-900" numberOfLines={2}>
            {opponentTeam}
          </Text>
        </View>
      </View>

      {/* Game Count Badge */}
      <View className="flex-row items-center justify-center rounded-lg bg-red-50 py-2">
        <Ionicons name="basketball" size={16} color="#EF4444" />
        <Text className="ml-2 text-sm font-medium text-red-600">
          {gameCount} {gameCount === 1 ? 'game' : 'games'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
