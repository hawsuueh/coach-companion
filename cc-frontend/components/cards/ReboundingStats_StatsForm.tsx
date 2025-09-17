import { Text, TextInput, View } from 'react-native';

interface ReboundingStatsProps {
  offensive: number;
  defensive: number;
  onUpdate: (field: 'offensive' | 'defensive', value: number) => void;
}

export default function ReboundingStats_StatsForm({
  offensive,
  defensive,
  onUpdate
}: ReboundingStatsProps) {
  const total = offensive + defensive;

  return (
    <View className="rounded-lg bg-gray-100 p-4">
      <Text className="mb-4 text-xl font-bold text-black">Rebounding</Text>

      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold text-black">
          Offensive Rebounds
        </Text>
        <TextInput
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          value={offensive.toString()}
          onChangeText={text => onUpdate('offensive', parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="Enter Value"
        />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold text-black">
          Defensive Rebounds
        </Text>
        <TextInput
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          value={defensive.toString()}
          onChangeText={text => onUpdate('defensive', parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="Enter Value"
        />
      </View>

      <View className="rounded bg-white p-3">
        <Text className="text-center text-lg font-bold text-black">
          TOTAL REBOUNDS: {total}
        </Text>
      </View>
    </View>
  );
}
