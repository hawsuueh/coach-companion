import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';

interface QuarterScores {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot: number;
  total: number;
}

interface QuarterScoresCollapsibleProps {
  homeTeamName: string;
  awayTeamName: string;
  quarterScores: {
    home: QuarterScores;
    away: QuarterScores;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onScoreChange: (
    team: 'home' | 'away',
    quarter: keyof Omit<QuarterScores, 'total'>,
    value: string
  ) => void;
}

const QuarterScoresCollapsible: React.FC<QuarterScoresCollapsibleProps> = ({
  homeTeamName,
  awayTeamName,
  quarterScores,
  isExpanded,
  onToggle,
  onScoreChange
}) => {
  const renderScoreInput = (
    team: 'home' | 'away',
    quarter: keyof Omit<QuarterScores, 'total'>,
    value: number
  ) => (
    <TextInput
      className="w-12 text-center text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded"
      keyboardType="numeric"
      value={value.toString()}
      onChangeText={(text) => onScoreChange(team, quarter, text)}
      selectTextOnFocus
    />
  );
  return (
    <View className="px-4 py-2">
      <TouchableOpacity
        className="flex-row items-center justify-between py-2"
        onPress={onToggle}
      >
        <Text className="text-base font-semibold text-black">
          Quarter Scores
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#666"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="mb-3 py-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 400 }}>
              {/* Header Row */}
              <View className="mb-1 flex-row items-center">
                <Text className="flex-1 pr-2 text-xs font-medium text-gray-600">
                  Team
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  Q1
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  Q2
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  Q3
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  Q4
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  OT
                </Text>
                <Text className="w-12 text-center text-xs font-medium text-gray-600">
                  T
                </Text>
              </View>

              {/* Home Team Row */}
              <View className="mb-1 flex-row items-center">
                <Text className="flex-1 pr-2 text-xs text-black" numberOfLines={1}>
                  {homeTeamName}
                </Text>
                <View className="flex-row items-center">
                  {renderScoreInput('home', 'q1', quarterScores.home.q1)}
                  {renderScoreInput('home', 'q2', quarterScores.home.q2)}
                  {renderScoreInput('home', 'q3', quarterScores.home.q3)}
                  {renderScoreInput('home', 'q4', quarterScores.home.q4)}
                  {renderScoreInput('home', 'ot', quarterScores.home.ot)}
                  <Text className="w-12 text-center text-sm font-semibold text-gray-900 bg-red-50 py-1">
                    {quarterScores.home.total}
                  </Text>
                </View>
              </View>

              {/* Away Team Row */}
              <View className="flex-row items-center">
                <Text className="flex-1 pr-2 text-xs text-black" numberOfLines={1}>
                  {awayTeamName}
                </Text>
                <View className="flex-row items-center">
                  {renderScoreInput('away', 'q1', quarterScores.away.q1)}
                  {renderScoreInput('away', 'q2', quarterScores.away.q2)}
                  {renderScoreInput('away', 'q3', quarterScores.away.q3)}
                  {renderScoreInput('away', 'q4', quarterScores.away.q4)}
                  {renderScoreInput('away', 'ot', quarterScores.away.ot)}
                  <Text className="w-12 text-center text-sm font-semibold text-gray-900 bg-red-50 py-1">
                    {quarterScores.away.total}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default QuarterScoresCollapsible;

