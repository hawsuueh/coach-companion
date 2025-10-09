import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Header2Props = {
  title?: string;
  onBackPress?: () => void;
};

export default function Header2({ title, onBackPress }: Header2Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
      {/* Back Button (Left) */}
      <TouchableOpacity onPress={handleBack}>
        <FontAwesome6 name="arrow-left-long" size={24} color="black" />
      </TouchableOpacity>

      {/* Title (Centered) */}
      <Text className="text-h2 flex-1 text-center">{title}</Text>

      {/* Spacer to balance layout (same width as icon) */}
      <View style={{ width: 28 }} />
    </View>
  );
}
