import { View, Text } from 'react-native';
import MainButton from '../buttons/MainButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TrainingReminderCardProps = {
  name: string;
  date: string;
  time: string;
  onPress?: () => void;
};

export default function TrainingReminderCard({
  name,
  date,
  time,
  onPress
}: TrainingReminderCardProps) {
  return (
    <View>
      <View className="mb-3">
        <Text className="text-h2">Training for Today!</Text>
      </View>
      {/* Info Section */}
      <View className="items-center rounded-2xl bg-white px-4 py-3">
        <Text className="text-title1 mb-1">{name}</Text>
        <Text className="text-label2 mb-2">
          {date} • {time}
        </Text>
        <MainButton text="View" width="25%" height={25} onPress={onPress} />
      </View>
    </View>
  );
}
