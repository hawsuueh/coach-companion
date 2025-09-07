import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - in the future this will come from Supabase
const MOCK_GAMES = {
  '1': {
    id: '1',
    gameName: 'UNC Basketball Team vs State University',
    date: 'Oct 15, 2025',
    opponent: 'State University'
  },
  '2': {
    id: '2',
    gameName: 'UNC vs Duke',
    date: 'Nov 20, 2025',
    opponent: 'Duke University'
  },
  '3': {
    id: '3',
    gameName: 'UNC vs Wake Forest',
    date: 'Dec 5, 2025',
    opponent: 'Wake Forest University'
  }
};

const MOCK_ATHLETES = [
  { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  { id: '2', number: '7', name: 'Mike Johnson', position: 'Guard' },
  { id: '3', number: '23', name: 'David Wilson', position: 'Center' },
  { id: '4', number: '1', name: 'Tom Brown', position: 'Guard' },
  { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  { id: '6', number: '4', name: 'Chris Miller', position: 'Center' },
  { id: '7', number: '8', name: 'Ryan Taylor', position: 'Guard' },
  { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
];

// Mock roster data
const MOCK_ROSTERS = {
  '1': ['1', '2', '3', '4', '5'], // Game 1 roster
  '2': ['1', '6', '7', '8', '5'], // Game 2 roster
  '3': ['2', '3', '6', '7', '8'] // Game 3 roster
};

interface PlayerStats {
  fieldGoals: { made: number; attempted: number };
  twoPointFG: { made: number; attempted: number };
  threePointFG: { made: number; attempted: number };
  freeThrows: { made: number; attempted: number };
  rebounds: { offensive: number; defensive: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  points: number;
}

export default function GameRecordingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'realtime' | 'stats'>('realtime');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>(
    {}
  );
  const [showQuarterScores, setShowQuarterScores] = useState(true);
  const [quarterScores, setQuarterScores] = useState({
    home: { q1: '', q2: '', q3: '', q4: '', ot: '', total: 0 },
    away: { q1: '', q2: '', q3: '', q4: '', ot: '', total: 0 }
  });

  // Get game data
  const game = MOCK_GAMES[id as keyof typeof MOCK_GAMES];
  const selectedAthleteIds =
    MOCK_ROSTERS[id as keyof typeof MOCK_ROSTERS] || [];
  const selectedAthletes = MOCK_ATHLETES.filter(athlete =>
    selectedAthleteIds.includes(athlete.id)
  );

  // Initialize player stats if not exists
  const initializePlayerStats = (playerId: string) => {
    if (!playerStats[playerId]) {
      setPlayerStats(prev => ({
        ...prev,
        [playerId]: {
          fieldGoals: { made: 0, attempted: 0 },
          twoPointFG: { made: 0, attempted: 0 },
          threePointFG: { made: 0, attempted: 0 },
          freeThrows: { made: 0, attempted: 0 },
          rebounds: { offensive: 0, defensive: 0 },
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0,
          points: 0
        }
      }));
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Game Stats',
      'Are you sure you want to reset all player statistics?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setPlayerStats({})
        }
      ]
    );
  };

  const updateStat = (
    playerId: string,
    statType: keyof PlayerStats,
    value: number
  ) => {
    initializePlayerStats(playerId);
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: value
      }
    }));
  };

  const incrementStat = (playerId: string, statType: keyof PlayerStats) => {
    initializePlayerStats(playerId);
    const currentStats = playerStats[playerId];
    if (currentStats) {
      if (
        statType === 'fieldGoals' ||
        statType === 'twoPointFG' ||
        statType === 'threePointFG' ||
        statType === 'freeThrows'
      ) {
        updateStat(playerId, statType, {
          ...currentStats[statType],
          attempted: currentStats[statType].attempted + 1
        });
      } else if (statType === 'rebounds') {
        updateStat(playerId, statType, {
          ...currentStats[statType],
          defensive: currentStats[statType].defensive + 1
        });
      } else {
        updateStat(playerId, statType, (currentStats[statType] as number) + 1);
      }
    }
  };

  const decrementStat = (playerId: string, statType: keyof PlayerStats) => {
    initializePlayerStats(playerId);
    const currentStats = playerStats[playerId];
    if (currentStats && (currentStats[statType] as number) > 0) {
      if (
        statType === 'fieldGoals' ||
        statType === 'twoPointFG' ||
        statType === 'threePointFG' ||
        statType === 'freeThrows'
      ) {
        const currentAttempted = currentStats[statType].attempted;
        if (currentAttempted > 0) {
          updateStat(playerId, statType, {
            ...currentStats[statType],
            attempted: currentAttempted - 1
          });
        }
      } else if (statType === 'rebounds') {
        const currentDefensive = currentStats[statType].defensive;
        if (currentDefensive > 0) {
          updateStat(playerId, statType, {
            ...currentStats[statType],
            defensive: currentDefensive - 1
          });
        }
      } else {
        updateStat(playerId, statType, (currentStats[statType] as number) - 1);
      }
    }
  };

  const handleExport = () => {
    Alert.alert(
      'Export Stats',
      'Export functionality will be implemented soon!'
    );
  };

  const updateQuarterScore = (
    team: 'home' | 'away',
    quarter: string,
    value: string
  ) => {
    setQuarterScores(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [quarter]: value
      }
    }));
  };

  if (!game) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Game not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
          <TouchableOpacity onPress={handleBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-black">
            {game.gameName}
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            className="rounded bg-black px-3 py-1"
          >
            <Text className="font-medium text-white">Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Quarter Scores Section */}
        <View className="px-4 py-2">
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => setShowQuarterScores(!showQuarterScores)}
          >
            <Text className="text-lg font-semibold text-black">
              Quarter Scores
            </Text>
            <Ionicons
              name={showQuarterScores ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showQuarterScores && (
            <View className="mb-4 rounded-lg bg-gray-50 p-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: 600 }}>
                  {/* Header Row */}
                  <View className="mb-3 flex-row items-center">
                    <Text className="flex-1 pr-4 text-sm font-medium text-gray-600">
                      Team
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      Q1
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      Q2
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      Q3
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      Q4
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      OT
                    </Text>
                    <Text className="w-20 text-center text-sm font-medium text-gray-600">
                      T
                    </Text>
                  </View>

                  {/* Home Team Row */}
                  <View className="mb-2 flex-row items-center">
                    <Text className="flex-1 pr-4 text-sm text-black">
                      Men's Division Team
                    </Text>
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.home.q1}
                      onChangeText={value =>
                        updateQuarterScore('home', 'q1', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.home.q2}
                      onChangeText={value =>
                        updateQuarterScore('home', 'q2', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.home.q3}
                      onChangeText={value =>
                        updateQuarterScore('home', 'q3', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.home.q4}
                      onChangeText={value =>
                        updateQuarterScore('home', 'q4', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.home.ot}
                      onChangeText={value =>
                        updateQuarterScore('home', 'ot', value)
                      }
                      keyboardType="numeric"
                    />
                    <Text className="w-20 text-center text-lg font-bold text-black">
                      0
                    </Text>
                  </View>

                  {/* Away Team Row */}
                  <View className="flex-row items-center">
                    <Text className="flex-1 pr-4 text-sm text-black">
                      State University
                    </Text>
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.away.q1}
                      onChangeText={value =>
                        updateQuarterScore('away', 'q1', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.away.q2}
                      onChangeText={value =>
                        updateQuarterScore('away', 'q2', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.away.q3}
                      onChangeText={value =>
                        updateQuarterScore('away', 'q3', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.away.q4}
                      onChangeText={value =>
                        updateQuarterScore('away', 'q4', value)
                      }
                      keyboardType="numeric"
                    />
                    <TextInput
                      className="h-12 w-20 rounded border border-gray-300 text-center text-lg font-semibold"
                      value={quarterScores.away.ot}
                      onChangeText={value =>
                        updateQuarterScore('away', 'ot', value)
                      }
                      keyboardType="numeric"
                    />
                    <Text className="w-20 text-center text-lg font-bold text-black">
                      0
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-4 ${activeTab === 'realtime' ? 'border-b-2 border-red-500' : ''}`}
            onPress={() => setActiveTab('realtime')}
          >
            <Text
              className={`text-center font-semibold ${activeTab === 'realtime' ? 'text-red-500' : 'text-gray-500'}`}
            >
              Real-Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-4 ${activeTab === 'stats' ? 'border-b-2 border-red-500' : ''}`}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              className={`text-center font-semibold ${activeTab === 'stats' ? 'text-red-500' : 'text-gray-500'}`}
            >
              Stats Sheet
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'realtime' ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Player Selection */}
            <View className="px-4 py-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                <View className="flex-row space-x-3">
                  {selectedAthletes.map(athlete => (
                    <TouchableOpacity
                      key={athlete.id}
                      className={`items-center rounded-lg border-2 p-3 ${
                        selectedPlayerId === athlete.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white'
                      }`}
                      onPress={() => setSelectedPlayerId(athlete.id)}
                    >
                      <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                        <Text className="font-bold text-gray-600">
                          {athlete.number}
                        </Text>
                      </View>
                      <Text className="text-center text-sm font-medium text-black">
                        {athlete.name}
                      </Text>
                      <Text className="text-center text-xs text-gray-500">
                        {athlete.position}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Export Button */}
              <TouchableOpacity
                onPress={handleExport}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3"
              >
                <Text className="text-center font-medium text-black">
                  Export
                </Text>
              </TouchableOpacity>
            </View>

            {/* Statistics Table */}
            <View className="px-4 pb-6">
              <View className="rounded-lg border border-gray-200 bg-white">
                {selectedPlayerId && (
                  <View className="border-b border-gray-200 p-4">
                    <Text className="text-center text-lg font-semibold text-black">
                      {MOCK_ATHLETES.find(a => a.id === selectedPlayerId)?.name}{' '}
                      - No.{' '}
                      {
                        MOCK_ATHLETES.find(a => a.id === selectedPlayerId)
                          ?.number
                      }
                    </Text>
                  </View>
                )}

                <View className="p-4">
                  {[
                    {
                      key: 'fieldGoals',
                      label: 'Field Goals',
                      type: 'complex'
                    },
                    { key: 'freeThrows', label: 'Free Throw', type: 'complex' },
                    { key: 'rebounds', label: 'Rebounds', type: 'rebounds' },
                    { key: 'assists', label: 'Assists', type: 'simple' },
                    { key: 'steals', label: 'Steals', type: 'simple' },
                    { key: 'blocks', label: 'Blocks', type: 'simple' },
                    { key: 'turnovers', label: 'Turnovers', type: 'simple' }
                  ].map(stat => (
                    <View
                      key={stat.key}
                      className="flex-row items-center justify-between border-b border-gray-100 py-3"
                    >
                      <View className="flex-1">
                        <Text className="font-medium text-black">
                          {stat.label}
                        </Text>
                        {stat.type === 'complex' && selectedPlayerId && (
                          <Text className="text-sm text-gray-500">
                            {playerStats[selectedPlayerId]?.[
                              stat.key as keyof PlayerStats
                            ]?.made || 0}{' '}
                            /{' '}
                            {playerStats[selectedPlayerId]?.[
                              stat.key as keyof PlayerStats
                            ]?.attempted || 0}
                          </Text>
                        )}
                        {stat.type === 'rebounds' && selectedPlayerId && (
                          <Text className="text-sm text-gray-500">
                            Off:{' '}
                            {playerStats[selectedPlayerId]?.rebounds
                              ?.offensive || 0}{' '}
                            | Def:{' '}
                            {playerStats[selectedPlayerId]?.rebounds
                              ?.defensive || 0}
                          </Text>
                        )}
                        {stat.type === 'simple' && selectedPlayerId && (
                          <Text className="text-sm text-gray-500">
                            {playerStats[selectedPlayerId]?.[
                              stat.key as keyof PlayerStats
                            ] || 0}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <TouchableOpacity
                          className="h-8 w-8 items-center justify-center rounded-full bg-gray-200"
                          onPress={() =>
                            selectedPlayerId &&
                            decrementStat(
                              selectedPlayerId,
                              stat.key as keyof PlayerStats
                            )
                          }
                        >
                          <Text className="font-bold text-gray-600">-</Text>
                        </TouchableOpacity>
                        <Text className="w-8 text-center font-medium">
                          {stat.type === 'complex' && selectedPlayerId
                            ? playerStats[selectedPlayerId]?.[
                                stat.key as keyof PlayerStats
                              ]?.attempted || 0
                            : stat.type === 'rebounds' && selectedPlayerId
                              ? (playerStats[selectedPlayerId]?.rebounds
                                  ?.offensive || 0) +
                                (playerStats[selectedPlayerId]?.rebounds
                                  ?.defensive || 0)
                              : selectedPlayerId
                                ? playerStats[selectedPlayerId]?.[
                                    stat.key as keyof PlayerStats
                                  ] || 0
                                : 0}
                        </Text>
                        <TouchableOpacity
                          className="h-8 w-8 items-center justify-center rounded-full bg-gray-200"
                          onPress={() =>
                            selectedPlayerId &&
                            incrementStat(
                              selectedPlayerId,
                              stat.key as keyof PlayerStats
                            )
                          }
                        >
                          <Text className="font-bold text-gray-600">+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
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
                    const stats = playerStats[athlete.id];
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
                                {stats?.points || 0}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-xs text-gray-500">REB</Text>
                              <Text className="font-bold text-black">
                                {(stats?.rebounds?.offensive || 0) +
                                  (stats?.rebounds?.defensive || 0)}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-xs text-gray-500">AST</Text>
                              <Text className="font-bold text-black">
                                {stats?.assists || 0}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-xs text-gray-500">STL</Text>
                              <Text className="font-bold text-black">
                                {stats?.steals || 0}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-xs text-gray-500">BLK</Text>
                              <Text className="font-bold text-black">
                                {stats?.blocks || 0}
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
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View className="flex-row items-center justify-around border-t border-gray-200 bg-white py-3">
          <TouchableOpacity className="items-center">
            <Ionicons name="home-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="shirt-outline" size={24} color="#EC1D25" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="fitness-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="basketball-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
