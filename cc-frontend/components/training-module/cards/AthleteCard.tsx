import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AthleteCardProps = {
  name: string;
  position: string;
};

export default function AthleteCard({ name, position }: AthleteCardProps) {
  return (
    <View className="items-center shadow-sm">
      {/* Avatar Icon */}
      <MaterialCommunityIcons name="account" size={100} color="gray" />

      {/* Info Section */}
      <Text className="text-title1 mt-2">{name}</Text>
      <Text className="text-label2 mt-1">{position}</Text>
    </View>
  );
}
