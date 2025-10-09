import { Text, TextInput, View } from 'react-native';

interface OtherStatsProps {
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  onUpdate: (
    field: 'assists' | 'steals' | 'blocks' | 'turnovers' | 'fouls',
    value: number
  ) => void;
}

export default function OtherStats_StatsForm({
  assists,
  steals,
  blocks,
  turnovers,
  fouls,
  onUpdate
}: OtherStatsProps) {
  const StatInput = ({
    label,
    value,
    onUpdate
  }: {
    label: string;
    value: number;
    onUpdate: (value: number) => void;
  }) => (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-black">{label}</Text>
      <TextInput
        className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
        value={value.toString()}
        onChangeText={text => onUpdate(parseInt(text) || 0)}
        keyboardType="numeric"
        placeholder="Enter Value"
      />
    </View>
  );

  return (
    <View className="rounded-lg bg-gray-100 p-4">
      <Text className="mb-4 text-xl font-bold text-black">
        Other Statistics
      </Text>

      <StatInput
        label="Assists"
        value={assists}
        onUpdate={value => onUpdate('assists', value)}
      />

      <StatInput
        label="Steals"
        value={steals}
        onUpdate={value => onUpdate('steals', value)}
      />

      <StatInput
        label="Blocks"
        value={blocks}
        onUpdate={value => onUpdate('blocks', value)}
      />

      <StatInput
        label="Turnovers"
        value={turnovers}
        onUpdate={value => onUpdate('turnovers', value)}
      />

      <StatInput
        label="Fouls"
        value={fouls}
        onUpdate={value => onUpdate('fouls', value)}
      />
    </View>
  );
}
