import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

type Header1Props = {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
};

export default function Header1({
  onNotificationPress,
  onMenuPress
}: Header1Props) {
  const pathname = usePathname();

  // Map routes → titles
  const titles: Record<string, string> = {
    '/home': 'Home',
    '/athletes-module': 'Athletes & Games',
    '/training-module': 'Training & Exercises',
    '/drills-module': 'Practice & Drills'
  };

  // Default title fallback
  const title =
    Object.entries(titles).find(([route]) => pathname.startsWith(route))?.[1] ??
    'Dashboard';

  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
      <Text className="text-h1">{title}</Text>

      <View className="flex-row items-center">
        <TouchableOpacity onPress={onNotificationPress} className="ml-4">
          <MaterialCommunityIcons name="bell" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onMenuPress} className="ml-4">
          <Feather name="menu" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
