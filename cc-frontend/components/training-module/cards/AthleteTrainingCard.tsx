import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AthleteTrainingCardProps = {
  athleteName: string;
  position: string;
  trainingName: string;
  date: string;
  time: string;
};

export default function AthleteTrainingCard({
  athleteName,
  position,
  trainingName,
  date,
  time
}: AthleteTrainingCardProps) {
  return (
    <View className="flex-row items-center rounded-2xl bg-white p-4 shadow-sm">
      {/* Avatar Icon */}
      <View className="mr-5 items-center justify-center">
        <MaterialCommunityIcons name="account" size={100} color="gray" />
      </View>

      {/* Info Section */}
      <View className="flex-1">
        <Text className="text-title1 mb-1 mt-2">{athleteName}</Text>
        <Text className="text-label2 mb-3">{position}</Text>

        <Text className="text-title1 mb-1">{trainingName}</Text>
        <Text className="text-label2 mb-2">
          {date} • {time}
        </Text>
      </View>
    </View>
  );
}
