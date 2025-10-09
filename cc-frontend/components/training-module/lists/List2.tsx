import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type List2Props = {
  title: string;
  rightText?: string;
  onPress: () => void;
  onLongPress?: () => void;
};

export default function List2({
  title,
  rightText,
  onPress,
  onLongPress
}: List2Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 2 // Android shadow
      }}
    >
      {/* Left: Title */}
      <Text className="text-title2">{title}</Text>

      {/* Right: Optional text + Icon */}
      <View className="flex-row items-center space-x-2">
        {rightText && (
          <Text className="text-label3 text-gray-500">{rightText}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="black" />
      </View>
    </TouchableOpacity>
  );
}
