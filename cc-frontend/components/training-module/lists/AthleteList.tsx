import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Athlete = {
  number: string;
  name: string;
  position: string;
};

type Props = {
  athlete: Athlete;
  onPress?: (athlete: Athlete) => void;
};

export default function AthleteList({ athlete, onPress }: Props) {
  return (
    <TouchableOpacity
      className="mb-4 flex-row items-center rounded-xl bg-white p-4 shadow-sm"
      onPress={() => onPress?.(athlete)}
    >
      {/* Placeholder Icon */}
      <View className="mr-4 items-center justify-center">
        <MaterialCommunityIcons name="account" size={60} color="gray" />
      </View>

      {/* Athlete details */}
      <View className="flex-1">
        <Text className="text-label3 mb-1">{athlete.number}</Text>
        <Text className="text-body1 mb-1">{athlete.name}</Text>
        <Text className="text-label3">{athlete.position}</Text>
      </View>

      {/* Icon */}
      <Ionicons name="chevron-forward" size={20} color="black" />
    </TouchableOpacity>
  );
}
