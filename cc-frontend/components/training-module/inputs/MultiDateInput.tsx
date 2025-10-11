import { TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type MultiDateInputProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  onLongPress?: () => void;
};

export default function MultiDateInput({
  onPress,
  title
}: MultiDateInputProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl bg-white px-3 py-4"
      style={{ borderWidth: 0.5 }}
    >
      {/* Content */}
      <View className="flex-1">
        <Text className="text-label1 mb-1">{title}</Text>
      </View>

      {/* Icon */}
      <FontAwesome name="calendar" size={24} color="black" />
    </TouchableOpacity>
  );
}
