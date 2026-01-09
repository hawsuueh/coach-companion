import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type List1Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  onLongPress?: () => void;
};

export default function List1({
  title,
  subtitle,
  onPress,
  onLongPress
}: List1Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="mb-4 flex-row items-center justify-between rounded-xl bg-white p-4"
    >
      {/* Content */}
      <View className="flex-1">
        <Text className="text-title1 mb-1">{title}</Text>
        <Text className="text-label3">{subtitle}</Text>
      </View>

      {/* Icon */}
      <Ionicons name="chevron-forward" size={20} color="black" />
    </TouchableOpacity>
  );
}
