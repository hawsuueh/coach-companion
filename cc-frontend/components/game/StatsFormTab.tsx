import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AthleteDropdown_StatsForm from '../inputs/AthleteDropdown_StatsForm';
import ShootingStats_StatsForm from '../cards/ShootingStats_StatsForm';
import ReboundingStats_StatsForm from '../cards/ReboundingStats_StatsForm';
import OtherStats_StatsForm from '../cards/OtherStats_StatsForm';

// Interfaces
interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

interface Game {
  id: string;
  gameName: string;
  date: string;
  teamName: string;
  opponentName: string;
  seasonLabel?: string;
}

interface PlayerStats {
  totalFieldGoals: { made: number; attempted: number };
  twoPointFG: { made: number; attempted: number };
  threePointFG: { made: number; attempted: number };
  freeThrows: { made: number; attempted: number };
  rebounds: { offensive: number; defensive: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

type PlayerQuarterStats = Record<number, PlayerStats>;

interface StatsFormTabProps {
  game: Game;
  selectedAthletes: Athlete[];
  selectedStatsAthlete: Athlete | null;
  currentQuarter: number;
  playerStats: Record<string, PlayerQuarterStats>;
  onAthleteSelect: (athlete: Athlete) => void;
  onShootingStatsUpdate: (
    statType: 'total' | 'twoPoint' | 'threePoint' | 'freeThrows',
    field: 'made' | 'attempted',
    value: number
  ) => void;
  onReboundingStatsUpdate: (
    field: 'offensive' | 'defensive',
    value: number
  ) => void;
  onOtherStatsUpdate: (
    field: 'assists' | 'steals' | 'blocks' | 'turnovers' | 'fouls',
    value: number
  ) => void;
  onSave: (athleteId: string, quarter: number, stats: PlayerStats) => void;
}

// Helper functions
const calculateTotalPoints = (stats: PlayerStats | undefined) => {
  if (!stats) return 0;
  const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
  const threePointPoints = (stats.threePointFG?.made || 0) * 3;
  const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
  return twoPointPoints + threePointPoints + freeThrowPoints;
};

const calculateTotalPointsForPlayer = (
  statsByQuarter: PlayerQuarterStats | undefined
): number => {
  if (!statsByQuarter) {
    return 0;
  }

  return Object.values(statsByQuarter).reduce(
    (sum, stats) => sum + calculateTotalPoints(stats),
    0
  );
};

const aggregateNumberStat = (
  statsByQuarter: PlayerQuarterStats | undefined,
  selector: (stats: PlayerStats) => number
): number => {
  if (!statsByQuarter) {
    return 0;
  }

  return Object.values(statsByQuarter).reduce(
    (sum, stats) => sum + selector(stats),
    0
  );
};

const StatsFormTab: React.FC<StatsFormTabProps> = ({
  game,
  selectedAthletes,
  selectedStatsAthlete,
  currentQuarter,
  playerStats,
  onAthleteSelect,
  onShootingStatsUpdate,
  onReboundingStatsUpdate,
  onOtherStatsUpdate,
  onSave
}) => {
  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={false}
    >
      <View className="space-y-4 p-4">
        {/* Athlete Selection */}
        <View className="mb-4">
          <AthleteDropdown_StatsForm
            athletes={selectedAthletes}
            selectedAthlete={selectedStatsAthlete}
            onSelectAthlete={onAthleteSelect}
          />
        </View>

        {/* Stats Form */}
        {selectedStatsAthlete && (
          <View className="space-y-4">
            {/* Shooting Statistics */}
            <ShootingStats_StatsForm
              totalFieldGoals={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]
                  ?.totalFieldGoals || { made: 0, attempted: 0 }
              }
              twoPointFG={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]
                  ?.twoPointFG || { made: 0, attempted: 0 }
              }
              threePointFG={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]
                  ?.threePointFG || { made: 0, attempted: 0 }
              }
              freeThrows={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.freeThrows ||
                { made: 0, attempted: 0 }
              }
              onUpdate={onShootingStatsUpdate}
            />

            {/* Rebounding Statistics */}
            <ReboundingStats_StatsForm
              offensive={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.rebounds
                  ?.offensive || 0
              }
              defensive={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.rebounds
                  ?.defensive || 0
              }
              onUpdate={onReboundingStatsUpdate}
            />

            {/* Other Statistics */}
            <OtherStats_StatsForm
              assists={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.assists || 0
              }
              steals={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.steals || 0
              }
              blocks={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.blocks || 0
              }
              turnovers={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.turnovers || 0
              }
              fouls={
                playerStats[selectedStatsAthlete.id]?.[currentQuarter]?.fouls || 0
              }
              onUpdate={onOtherStatsUpdate}
            />

            {/* Add Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-lg bg-red-500 px-6 py-4"
              onPress={() => {
                if (
                  selectedStatsAthlete &&
                  playerStats[selectedStatsAthlete.id]?.[currentQuarter]
                ) {
                  onSave(
                    selectedStatsAthlete.id,
                    currentQuarter,
                    playerStats[selectedStatsAthlete.id][currentQuarter]
                  );
                  Alert.alert('Success', 'Stats saved successfully!');
                }
              }}
            >
              <Ionicons name="save" size={20} color="white" />
              <Text className="ml-2 text-lg font-semibold text-white">
                Save Stats
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Complete Stats Sheet */}
        <View className="mt-6">
          <Text className="mb-4 text-lg font-semibold text-black">
            Complete Stats Sheet
          </Text>
          <View className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Stats Sheet Header */}
            <View className="border-b border-gray-200 bg-gray-100 p-3">
              <Text className="text-center font-bold text-black">
                BUCAL MEN'S BASKETBALL SEASON 6
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-600">
                {game.gameName}
              </Text>
              <Text className="text-center text-sm text-gray-600">
                {game.date}
              </Text>
            </View>

            {/* Player Stats Table */}
            <View className="p-3">
              {selectedAthletes.map(athlete => {
                const statsByQuarter = playerStats[athlete.id];
                const totalPoints = calculateTotalPointsForPlayer(
                  statsByQuarter
                );
                const offensiveRebounds = aggregateNumberStat(
                  statsByQuarter,
                  stats => stats.rebounds?.offensive || 0
                );
                const defensiveRebounds = aggregateNumberStat(
                  statsByQuarter,
                  stats => stats.rebounds?.defensive || 0
                );
                const totalRebounds = offensiveRebounds + defensiveRebounds;
                const assists = aggregateNumberStat(
                  statsByQuarter,
                  stats => stats.assists || 0
                );
                const steals = aggregateNumberStat(
                  statsByQuarter,
                  stats => stats.steals || 0
                );
                const blocks = aggregateNumberStat(
                  statsByQuarter,
                  stats => stats.blocks || 0
                );
                return (
                  <View
                    key={athlete.id}
                    className="border-b border-gray-100 py-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold text-black">
                          #{athlete.number} {athlete.name}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {athlete.position}
                        </Text>
                      </View>
                      <View className="flex-row space-x-4">
                        <View className="items-center">
                          <Text className="text-xs text-gray-500">PTS</Text>
                          <Text className="font-bold text-black">
                            {totalPoints}
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-xs text-gray-500">REB</Text>
                          <Text className="font-bold text-black">
                            {totalRebounds}
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-xs text-gray-500">AST</Text>
                          <Text className="font-bold text-black">
                            {assists}
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-xs text-gray-500">STL</Text>
                          <Text className="font-bold text-black">
                            {steals}
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-xs text-gray-500">BLK</Text>
                          <Text className="font-bold text-black">
                            {blocks}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsFormTab;

