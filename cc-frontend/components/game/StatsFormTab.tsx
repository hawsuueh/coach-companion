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

// Redefining PlayerStats and related types to match cumulative schema
export interface PlayerStats {
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

interface StatsFormTabProps {
  game: Game;
  selectedAthletes: Athlete[];
  selectedStatsAthlete: Athlete | null;
  currentQuarter: number;
  playerStats: Record<string, PlayerStats>;
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
  onSave: (athleteId: string, stats: PlayerStats) => void;
}

// Helper functions
const calculateTotalPoints = (stats: PlayerStats | undefined) => {
  if (!stats) return 0;
  const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
  const threePointPoints = (stats.threePointFG?.made || 0) * 3;
  const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
  return twoPointPoints + threePointPoints + freeThrowPoints;
};


const aggregateNumberStat = (
  stats: PlayerStats | undefined,
  selector: (stats: PlayerStats) => number
): number => {
  if (!stats) {
    return 0;
  }
  return selector(stats);
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
                playerStats[selectedStatsAthlete.id]?.totalFieldGoals || { made: 0, attempted: 0 }
              }
              twoPointFG={
                playerStats[selectedStatsAthlete.id]?.twoPointFG || { made: 0, attempted: 0 }
              }
              threePointFG={
                playerStats[selectedStatsAthlete.id]?.threePointFG || { made: 0, attempted: 0 }
              }
              freeThrows={
                playerStats[selectedStatsAthlete.id]?.freeThrows || { made: 0, attempted: 0 }
              }
              onUpdate={onShootingStatsUpdate}
            />

            {/* Rebounding Statistics */}
            <ReboundingStats_StatsForm
              offensive={
                playerStats[selectedStatsAthlete.id]?.rebounds?.offensive || 0
              }
              defensive={
                playerStats[selectedStatsAthlete.id]?.rebounds?.defensive || 0
              }
              onUpdate={onReboundingStatsUpdate}
            />

            {/* Other Statistics */}
            <OtherStats_StatsForm
              assists={
                playerStats[selectedStatsAthlete.id]?.assists || 0
              }
              steals={
                playerStats[selectedStatsAthlete.id]?.steals || 0
              }
              blocks={
                playerStats[selectedStatsAthlete.id]?.blocks || 0
              }
              turnovers={
                playerStats[selectedStatsAthlete.id]?.turnovers || 0
              }
              fouls={
                playerStats[selectedStatsAthlete.id]?.fouls || 0
              }
              onUpdate={onOtherStatsUpdate}
            />

            {/* Add Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-lg bg-red-500 px-6 py-4"
              onPress={() => {
                if (
                  selectedStatsAthlete &&
                  playerStats[selectedStatsAthlete.id]
                ) {
                  onSave(
                    selectedStatsAthlete.id,
                    playerStats[selectedStatsAthlete.id]
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
              {/* Table Header */}
              <View className="flex-row border-b border-gray-200 pb-2 mb-2 px-2">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 uppercase">Athlete</Text>
                </View>
                <View className="flex-row w-[60%] justify-between px-2">
                  <Text className="w-10 text-center text-xs font-bold text-gray-500">PTS</Text>
                  <Text className="w-10 text-center text-xs font-bold text-gray-500">REB</Text>
                  <Text className="w-10 text-center text-xs font-bold text-gray-500">AST</Text>
                  <Text className="w-10 text-center text-xs font-bold text-gray-500">STL</Text>
                  <Text className="w-10 text-center text-xs font-bold text-gray-500">BLK</Text>
                </View>
              </View>

              {/* Rows */}
              {selectedAthletes.map(athlete => {
                const stats = playerStats[athlete.id];
                const totalPoints = calculateTotalPoints(stats);
                const offensiveRebounds = aggregateNumberStat(
                  stats,
                  s => s.rebounds?.offensive || 0
                );
                const defensiveRebounds = aggregateNumberStat(
                  stats,
                  s => s.rebounds?.defensive || 0
                );
                const totalRebounds = offensiveRebounds + defensiveRebounds;
                const assists = aggregateNumberStat(
                  stats,
                  s => s.assists || 0
                );
                const steals = aggregateNumberStat(
                  stats,
                  s => s.steals || 0
                );
                const blocks = aggregateNumberStat(
                  stats,
                  s => s.blocks || 0
                );
                return (
                  <View
                    key={athlete.id}
                    className="border-b border-gray-100 py-3 flex-row items-center px-2"
                  >
                    <View className="flex-1">
                      <Text className="font-semibold text-black">
                        #{athlete.number} {athlete.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {athlete.position}
                      </Text>
                    </View>
                    <View className="flex-row w-[60%] justify-between px-2">
                      <Text className="w-10 text-center font-bold text-black text-lg">
                        {totalPoints}
                      </Text>
                      <Text className="w-10 text-center font-bold text-black text-lg">
                        {totalRebounds}
                      </Text>
                      <Text className="w-10 text-center font-bold text-black text-lg">
                        {assists}
                      </Text>
                      <Text className="w-10 text-center font-bold text-black text-lg">
                        {steals}
                      </Text>
                      <Text className="w-10 text-center font-bold text-black text-lg">
                        {blocks}
                      </Text>
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

