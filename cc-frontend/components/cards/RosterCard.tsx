import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface RosterCardProps {
  playerNumber: string;
  playerName: string;
  position: string;
  isSelected: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  className?: string;
}

export default function RosterCard({
  playerNumber,
  playerName,
  position,
  isSelected,
  onPress,
  onRemove,
  className = ''
}: RosterCardProps) {
  return (
    <View
      className={`mb-3 rounded-xl bg-white p-4 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* Player Profile Icon */}
          <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <Ionicons name="person" size={24} color="#666" />
          </View>

          {/* Player Information */}
          <View>
            <Text className="text-base font-semibold text-black">
              {playerName}
            </Text>
            <Text className="text-sm text-gray-600">
              No. {playerNumber} - {position}
            </Text>
          </View>
        </View>

        {/* Remove Button */}
        {isSelected && (
          <TouchableOpacity
            onPress={onRemove}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
