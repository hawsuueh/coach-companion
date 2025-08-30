import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface AthleteCardProps {
  playerNumber: string;
  playerName: string;
  position: string;
  onPress?: () => void;
  className?: string;
}

export default function AthleteCard({
  playerNumber,
  playerName,
  position,
  onPress,
  className = ''
}: AthleteCardProps) {
  return (
    <TouchableOpacity
      className={`mb-3 rounded-xl p-3 ${className}`}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 0,
        flex: 1
      }}
    >
      <View className="flex-row items-center">
        {/* Player Silhouette Icon */}
        <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-gray-200">
          <Ionicons name="person" size={32} color="#666" />
        </View>

        {/* Player Information */}
        <View className="flex-1">
          <Text className="text-xs text-gray-500">{playerNumber}</Text>
          <Text className="text-base font-semibold text-black">
            {playerName}
          </Text>
          <Text className="text-sm text-gray-500">{position}</Text>
        </View>

        {/* Navigation Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
}
