import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface GameCardProps {
  gameName: string;
  date: string;
  onPress: () => void;
}

export default function GameCard({ gameName, date, onPress }: GameCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="mb-1 text-base font-medium text-gray-900">
          {gameName}
        </Text>
        <Text className="text-sm text-gray-500">{date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
