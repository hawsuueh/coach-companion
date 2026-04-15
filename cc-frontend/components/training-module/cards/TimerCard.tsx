import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimerCardProps = {
  remainingSeconds: number;
};

export function TimerCard({ remainingSeconds }: TimerCardProps) {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View className="flex-row items-center gap-1 px-4 py-3">
      <MaterialCommunityIcons name="timer-outline" size={20} color="black" />
      <Text className="text-body1 text-black">{formattedTime}</Text>
    </View>
  );
}
