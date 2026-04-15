import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface GameCardProps {
  gameName: string;
  date: string;
  gameNumber?: number;  // Optional: for showing "Game 1", "Game 2", etc.
  customLabel?: string; // Optional: Override label e.g., "Finals G1"
  onPress: () => void;
}


export default function GameCard({ gameName, date, gameNumber, customLabel, onPress }: GameCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        {(customLabel || gameNumber) && (
          <Text className="mb-1 text-xs font-medium text-red-500">
            {customLabel || `Game ${gameNumber}`}
          </Text>
        )}
        <Text className="mb-1 text-base font-medium text-gray-900">
          {gameName}
        </Text>
        <Text className="text-sm text-gray-500">{date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
