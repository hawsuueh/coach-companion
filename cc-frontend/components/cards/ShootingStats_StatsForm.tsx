import { Text, TextInput, View } from 'react-native';

interface ShootingStatsProps {
  totalFieldGoals: { made: number; attempted: number };
  twoPointFG: { made: number; attempted: number };
  threePointFG: { made: number; attempted: number };
  freeThrows: { made: number; attempted: number };
  onUpdate: (
    statType: 'total' | 'twoPoint' | 'threePoint' | 'freeThrows',
    field: 'made' | 'attempted',
    value: number
  ) => void;
}

export default function ShootingStats_StatsForm({
  totalFieldGoals,
  twoPointFG,
  threePointFG,
  freeThrows,
  onUpdate
}: ShootingStatsProps) {
  const calculatePercentage = (made: number, attempted: number) => {
    if (attempted === 0) return 0;
    return ((made / attempted) * 100).toFixed(1);
  };

  const StatRow = ({
    title,
    made,
    attempted,
    onMadeChange,
    onAttemptedChange
  }: {
    title: string;
    made: number;
    attempted: number;
    onMadeChange: (value: number) => void;
    onAttemptedChange: (value: number) => void;
  }) => (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-black">{title}</Text>
      <View className="flex-row items-center space-x-4">
        <View className="flex-1">
          <Text className="mb-1 text-sm text-gray-600">Made</Text>
          <TextInput
            className="rounded border border-gray-300 bg-white px-3 py-2 text-center text-black"
            value={made.toString()}
            onChangeText={text => onMadeChange(parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-sm text-gray-600">Attempt</Text>
          <TextInput
            className="rounded border border-gray-300 bg-white px-3 py-2 text-center text-black"
            value={attempted.toString()}
            onChangeText={text => onAttemptedChange(parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View className="w-16 items-center">
          <Text className="text-lg font-bold text-black">
            {calculatePercentage(made, attempted)}%
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="rounded-lg bg-gray-100 p-4">
      <Text className="mb-4 text-xl font-bold text-black">
        Shooting Statistics
      </Text>

      <StatRow
        title="Total Field Goals"
        made={totalFieldGoals.made}
        attempted={totalFieldGoals.attempted}
        onMadeChange={value => onUpdate('total', 'made', value)}
        onAttemptedChange={value => onUpdate('total', 'attempted', value)}
      />

      <StatRow
        title="2-Point Field Goals"
        made={twoPointFG.made}
        attempted={twoPointFG.attempted}
        onMadeChange={value => onUpdate('twoPoint', 'made', value)}
        onAttemptedChange={value => onUpdate('twoPoint', 'attempted', value)}
      />

      <StatRow
        title="3-Point Field Goals"
        made={threePointFG.made}
        attempted={threePointFG.attempted}
        onMadeChange={value => onUpdate('threePoint', 'made', value)}
        onAttemptedChange={value => onUpdate('threePoint', 'attempted', value)}
      />

      <StatRow
        title="Free Throws"
        made={freeThrows.made}
        attempted={freeThrows.attempted}
        onMadeChange={value => onUpdate('freeThrows', 'made', value)}
        onAttemptedChange={value => onUpdate('freeThrows', 'attempted', value)}
      />
    </View>
  );
}
