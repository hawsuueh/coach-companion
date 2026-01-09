import { View, Text } from 'react-native';

export default function TrainingCard({
  name,
  date,
  time
}: {
  name: string;
  date: string;
  time: string;
}) {
  return (
    <View className="items-center px-4 py-3">
      {/* Training Name */}
      <Text className="text-title1 mb-2">{name}</Text>

      {/* Date and Time */}
      <Text className="text-label1">
        {date} • {time}
      </Text>
    </View>
  );
}
