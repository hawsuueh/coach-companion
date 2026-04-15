import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import PlayerSelectionGrid from './PlayerSelectionGrid';
import ExportButton from '../buttons/ExportButton';
import StatCard from '../cards/StatCard';
import SimpleStatRow from '../cards/SimpleStatRow';

// Interfaces
interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
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

type PlayerQuarterStats = Record<number, PlayerStats>; // This represents ONE player's stats across ALL quarters

interface RealTimeStatsTabProps {
  selectedAthletes: Athlete[];
  selectedPlayerId: string;
  currentQuarter: number;
  playerStats: Record<string, PlayerQuarterStats>; // This represents ALL players, each with their stats across ALL quarters
  
  onPlayerSelect: (athleteId: string) => void;
  onStatsUpdate: (playerId: string, quarter: number, field: string, subfield: string | null, value: number) => void;
  onExport: () => void;
  exporting: boolean;
}

// Helper function
const createEmptyPlayerStats = (): PlayerStats => ({
  totalFieldGoals: { made: 0, attempted: 0 },
  twoPointFG: { made: 0, attempted: 0 },
  threePointFG: { made: 0, attempted: 0 },
  freeThrows: { made: 0, attempted: 0 },
  rebounds: { offensive: 0, defensive: 0 },
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0
});

const calculateTotalPoints = (stats: PlayerStats | undefined) => {
  if (!stats) return 0;
  const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
  const threePointPoints = (stats.threePointFG?.made || 0) * 3;
  const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
  return twoPointPoints + threePointPoints + freeThrowPoints;
};

const RealTimeStatsTab: React.FC<RealTimeStatsTabProps> = ({
  selectedAthletes,
  selectedPlayerId,
  currentQuarter,
  playerStats,
  onPlayerSelect,
  onStatsUpdate,
  onExport,
  exporting
}) => {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Player Selection */}
      <PlayerSelectionGrid
        athletes={selectedAthletes}
        selectedAthleteId={selectedPlayerId}
        onSelectAthlete={onPlayerSelect}
      />

      {/* Export Button Container */}
      <View className="px-4">
        <ExportButton onExport={onExport} isExporting={exporting} />
      </View>

      {/* Statistics Table */}
      <View className="px-4 pb-6">
        <View className="rounded-lg border border-gray-200 bg-white">
          {selectedPlayerId && (
            <View className="border-b border-gray-200 p-4">
              <Text className="text-center text-lg font-semibold text-black">
                {
                  selectedAthletes.find(a => a.id === selectedPlayerId)
                    ?.name
                }{' '}
                - No.{' '}
                {
                  selectedAthletes.find(a => a.id === selectedPlayerId)
                    ?.number
                }
              </Text>
            </View>
          )}

          <View className="p-4">
            {/* 2-Point Field Goals Card */}
            <StatCard
              title="2-Point Field Goals"
              type="shooting"
              stats={
                selectedPlayerId
                  ? playerStats[selectedPlayerId]?.[currentQuarter]?.twoPointFG
                  : { made: 0, attempted: 0 }
              }
              onUpdate={(field, value) => {
                if (selectedPlayerId) {
                  onStatsUpdate(selectedPlayerId, currentQuarter, 'twoPointFG', field, value);
                }
              }}
            />

            {/* 3-Point Field Goals Card */}
            <StatCard
              title="3-Point Field Goals"
              type="shooting"
              stats={
                selectedPlayerId
                  ? playerStats[selectedPlayerId]?.[currentQuarter]?.threePointFG
                  : { made: 0, attempted: 0 }
              }
              onUpdate={(field, value) => {
                if (selectedPlayerId) {
                  onStatsUpdate(selectedPlayerId, currentQuarter, 'threePointFG', field, value);
                }
              }}
            />

            {/* Free Throws Card */}
            <StatCard
              title="Free Throws"
              type="shooting"
              stats={
                selectedPlayerId
                  ? playerStats[selectedPlayerId]?.[currentQuarter]?.freeThrows
                  : { made: 0, attempted: 0 }
              }
              onUpdate={(field, value) => {
                if (selectedPlayerId) {
                  onStatsUpdate(selectedPlayerId, currentQuarter, 'freeThrows', field, value);
                }
              }}
            />

            {/* Rebounds Card */}
            <StatCard
              title="Rebounds"
              type="rebounds"
              stats={
                selectedPlayerId
                  ? playerStats[selectedPlayerId]?.[currentQuarter]?.rebounds
                  : { offensive: 0, defensive: 0 }
              }
              onUpdate={(field, value) => {
                if (selectedPlayerId) {
                  onStatsUpdate(selectedPlayerId, currentQuarter, 'rebounds', field, value);
                }
              }}
            />

            {/* Other Stats Card */}
            <View className="rounded-lg bg-gray-100 p-4">
              <Text className="mb-3 text-lg font-semibold text-black">
                Other Stats
              </Text>

              <SimpleStatRow
                label="Assists"
                value={
                  playerStats[selectedPlayerId]?.[currentQuarter]?.assists || 0
                }
                onUpdate={value => {
                  if (selectedPlayerId) {
                    onStatsUpdate(selectedPlayerId, currentQuarter, 'assists', null, value);
                  }
                }}
              />

              <SimpleStatRow
                label="Steals"
                value={
                  playerStats[selectedPlayerId]?.[currentQuarter]?.steals || 0
                }
                onUpdate={value => {
                  if (selectedPlayerId) {
                    onStatsUpdate(selectedPlayerId, currentQuarter, 'steals', null, value);
                  }
                }}
              />

              <SimpleStatRow
                label="Blocks"
                value={
                  playerStats[selectedPlayerId]?.[currentQuarter]?.blocks || 0
                }
                onUpdate={value => {
                  if (selectedPlayerId) {
                    onStatsUpdate(selectedPlayerId, currentQuarter, 'blocks', null, value);
                  }
                }}
              />

              <SimpleStatRow
                label="Turnovers"
                value={
                  playerStats[selectedPlayerId]?.[currentQuarter]?.turnovers ||
                  0
                }
                onUpdate={value => {
                  if (selectedPlayerId) {
                    onStatsUpdate(selectedPlayerId, currentQuarter, 'turnovers', null, value);
                  }
                }}
              />

              <SimpleStatRow
                label="Fouls"
                value={
                  playerStats[selectedPlayerId]?.[currentQuarter]?.fouls || 0
                }
                onUpdate={value => {
                  if (selectedPlayerId) {
                    onStatsUpdate(selectedPlayerId, currentQuarter, 'fouls', null, value);
                  }
                }}
              />

              {/* Total Points - Calculated Display */}
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-black">Total Points</Text>
                <Text className="text-lg font-bold text-red-500">
                  {calculateTotalPoints(
                    playerStats[selectedPlayerId]?.[currentQuarter]
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RealTimeStatsTab;

