import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface SeasonCardProps {
  seasonLabel: string;
  duration: string;
  totalGames: number;
  onPress: () => void;
}

export default function SeasonCard({ 
  seasonLabel, 
  duration, 
  totalGames, 
  onPress 
}: SeasonCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center rounded-xl bg-white p-4 shadow-md"
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
      }}
    >
      {/* Icon Section */}
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <Ionicons name="calendar" size={24} color="#EF4444" />
      </View>

      {/* Content Section */}
      <View className="flex-1">
        <Text className="mb-1 text-lg font-bold text-gray-900">
          {seasonLabel}
        </Text>
        <Text className="mb-1 text-sm text-gray-600">{duration}</Text>
        <View className="flex-row items-center">
          <Ionicons name="basketball" size={14} color="#9CA3AF" />
          <Text className="ml-1 text-xs font-medium text-gray-500">
            {totalGames} {totalGames === 1 ? 'game' : 'games'}
          </Text>
        </View>
      </View>

      {/* Arrow Icon */}
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
