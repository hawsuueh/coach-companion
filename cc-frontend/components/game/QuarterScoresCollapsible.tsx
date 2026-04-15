import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

const QuarterScoresCollapsible: React.FC<QuarterScoresCollapsibleProps> = ({
  homeTeamName,
  awayTeamName,
  quarterScores,
  isExpanded,
  onToggle
}) => {
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
                <Text className="flex-1 pr-2 text-xs text-black">
                  {homeTeamName}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.home.q1}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.home.q2}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.home.q3}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.home.q4}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.home.ot}
                </Text>
                <Text className="w-12 text-center text-sm font-semibold text-gray-900">
                  {quarterScores.home.total}
                </Text>
              </View>

              {/* Away Team Row */}
              <View className="flex-row items-center">
                <Text className="flex-1 pr-2 text-xs text-black">
                  {awayTeamName}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.away.q1}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.away.q2}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.away.q3}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.away.q4}
                </Text>
                <Text className="w-12 text-center text-sm font-medium text-gray-700">
                  {quarterScores.away.ot}
                </Text>
                <Text className="w-12 text-center text-sm font-semibold text-gray-900">
                  {quarterScores.away.total}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default QuarterScoresCollapsible;

