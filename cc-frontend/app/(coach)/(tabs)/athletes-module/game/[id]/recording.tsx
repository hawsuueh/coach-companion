import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatCard from '../../../../../../components/cards/StatCard';
import SimpleStatRow from '../../../../../../components/cards/SimpleStatRow';
import AthleteDropdown_StatsForm from '../../../../../../components/inputs/AthleteDropdown_StatsForm';
import ShootingStats_StatsForm from '../../../../../../components/cards/ShootingStats_StatsForm';
import ReboundingStats_StatsForm from '../../../../../../components/cards/ReboundingStats_StatsForm';
import OtherStats_StatsForm from '../../../../../../components/cards/OtherStats_StatsForm';
import supabase from '../../../../../../config/supabaseClient';

// Database interfaces
interface DatabaseAthlete {
  athlete_no: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  position: string | null;
  player_no: number | null;
}

interface DatabaseGame {
  game_no: number;
  date: string | null;
  time: string | null;
  season_no: number | null;
  player_name: string | null;
  opponent_name: string | null;
}

interface DatabaseAthleteGame {
  athlete_game_no: number;
  athlete_no: number;
  game_no: number;
  quarter_no: number | null;
  points: number | null;
  field_goals_made: number | null;
  field_goals_attempted: number | null;
  two_point_made: number | null;
  two_point_attempted: number | null;
  three_point_made: number | null;
  three_point_attempted: number | null;
  free_throws_made: number | null;
  free_throws_attempted: number | null;
  assists: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  fouls: number | null;
}

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

// Helper function to transform database athlete to UI athlete
const transformDatabaseAthlete = (dbAthlete: DatabaseAthlete): Athlete => {
  const fullName = [
    dbAthlete.first_name,
    dbAthlete.middle_name,
    dbAthlete.last_name
  ]
    .filter(name => name && name.trim() !== '')
    .join(' ');

  return {
    id: dbAthlete.athlete_no.toString(),
    number: dbAthlete.player_no?.toString() || '0',
    name: fullName || 'Unknown Player',
    position: dbAthlete.position || 'Unknown'
  };
};

// Helper function to transform database game to UI game
const transformDatabaseGame = (dbGame: DatabaseGame): Game => {
  const gameDate = dbGame.date
    ? new Date(dbGame.date).toLocaleDateString()
    : 'TBD';
  const gameTime = dbGame.time
    ? new Date(`2000-01-01T${dbGame.time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const formattedDate = gameTime ? `${gameDate} ${gameTime}` : gameDate;

  const playerTeam = dbGame.player_name || 'Your Team';
  const opponentTeam = dbGame.opponent_name || 'TBD';
  const gameName = `${playerTeam} vs ${opponentTeam}`;

  return {
    id: dbGame.game_no.toString(),
    gameName: gameName,
    date: formattedDate
  };
};

export default function GameRecordingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'realtime' | 'stats'>('realtime');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedStatsAthlete, setSelectedStatsAthlete] = useState<{
    id: string;
    number: string;
    name: string;
    position: string;
  } | null>(null);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>(
    {}
  );
  const [showQuarterScores, setShowQuarterScores] = useState(true);
  const [quarterScores, setQuarterScores] = useState({
    home: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0, total: 0 },
    away: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0, total: 0 }
  });
  const [currentQuarter, setCurrentQuarter] = useState(1);

  // Real data states
  const [game, setGame] = useState<Game | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save functionality
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSavesRef = useRef<Set<string>>(new Set());

  // Fetch game data from database
  const fetchGame = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Game')
        .select('*')
        .eq('game_no', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const transformedGame = transformDatabaseGame(data);
        setGame(transformedGame);
      }
    } catch (err) {
      console.error('Error fetching game:', err);
      setError('Failed to load game details');
    }
  };

  // Fetch roster athletes for this game
  const fetchRosterAthletes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Roster')
        .select(
          `
          Athlete!inner(*)
        `
        )
        .eq('game_no', id);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const athletes = data.map((item: any) => item.Athlete).filter(Boolean);
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setSelectedAthletes(transformedAthletes);
      }
    } catch (err) {
      console.error('Error fetching roster athletes:', err);
      setError('Failed to load roster athletes');
    }
  };

  // Fetch existing game stats for athletes
  const fetchGameStats = async () => {
    try {
      const { data, error } = await supabase
        .from('athlete_game')
        .select('*')
        .eq('game_no', id);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Transform database stats to UI format
        const statsMap: Record<string, PlayerStats> = {};
        
        data.forEach((stat: DatabaseAthleteGame) => {
          const athleteId = stat.athlete_no.toString();
          if (!statsMap[athleteId]) {
            statsMap[athleteId] = {
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
            };
          }

          const currentStats = statsMap[athleteId];
          currentStats.twoPointFG.made += stat.two_point_made || 0;
          currentStats.twoPointFG.attempted += stat.two_point_attempted || 0;
          currentStats.threePointFG.made += stat.three_point_made || 0;
          currentStats.threePointFG.attempted += stat.three_point_attempted || 0;
          currentStats.freeThrows.made += stat.free_throws_made || 0;
          currentStats.freeThrows.attempted += stat.free_throws_attempted || 0;
          currentStats.rebounds.offensive += stat.offensive_rebounds || 0;
          currentStats.rebounds.defensive += stat.defensive_rebounds || 0;
          currentStats.assists += stat.assists || 0;
          currentStats.steals += stat.steals || 0;
          currentStats.blocks += stat.blocks || 0;
          currentStats.turnovers += stat.turnovers || 0;
          currentStats.fouls += stat.fouls || 0;
        });

        setPlayerStats(statsMap);
        console.log('Loaded stats from database:', statsMap); // Debug log
      }
    } catch (err) {
      console.error('Error fetching game stats:', err);
      // Don't set error for stats fetch, just log it
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      await Promise.all([fetchGame(), fetchRosterAthletes(), fetchGameStats()]);

      setLoading(false);
    };

    if (id && typeof id === 'string') {
      loadData();
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id]);

  // Calculate total points for a player
  const calculateTotalPoints = (stats: PlayerStats | undefined) => {
    if (!stats) return 0;
    const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
    const threePointPoints = (stats.threePointFG?.made || 0) * 3;
    const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
    return twoPointPoints + threePointPoints + freeThrowPoints;
  };

  // Update quarter scores automatically - show total points for now
  const updateQuarterScores = () => {
    const totalPoints = Object.values(playerStats).reduce((sum, stats) => 
      sum + calculateTotalPoints(stats), 0);
    
    setQuarterScores(prev => ({
      ...prev,
      home: {
        q1: totalPoints, // Show total in Q1 for now
        q2: 0,
        q3: 0,
        q4: 0,
        ot: 0,
        total: totalPoints
      }
    }));
  };

  // Update quarter scores whenever player stats change
  useEffect(() => {
    updateQuarterScores();
  }, [playerStats]);

  // Initialize player stats if not exists
  const initializePlayerStats = (playerId: string) => {
    if (!playerStats[playerId]) {
      setPlayerStats(prev => ({
        ...prev,
        [playerId]: {
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

  const handleExport = () => {
    Alert.alert(
      'Export Stats',
      'Export functionality will be implemented soon!'
    );
  };

  // Smart auto-save function with debouncing
  const scheduleAutoSave = useCallback((athleteId: string) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Add to pending saves
    pendingSavesRef.current.add(athleteId);

    // Set new timeout for 1.5 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      const athletesToSave = Array.from(pendingSavesRef.current);
      pendingSavesRef.current.clear();

      // Save all pending athletes - get fresh state at save time
      for (const athleteId of athletesToSave) {
        // Get the current state at save time, not when scheduled
        setPlayerStats(currentStats => {
          if (currentStats[athleteId]) {
            console.log('Auto-save capturing fresh state:', {
              athleteId,
              steals: currentStats[athleteId].steals,
              timestamp: new Date().toISOString()
            });
            saveStatsToDatabase(athleteId, currentStats[athleteId]);
          }
          return currentStats; // Don't change state, just capture it
        });
      }
    }, 1500); // 1.5 second delay
  }, []); // Remove playerStats dependency to avoid stale closures

  // Save stats to database
  const saveStatsToDatabase = async (athleteId: string, stats: PlayerStats) => {
    try {
      if (!id || typeof id !== 'string') return;

      // Calculate total points
      const totalPoints = calculateTotalPoints(stats);

      // Prepare data for database
      const statsData = {
        athlete_no: parseInt(athleteId),
        game_no: parseInt(id),
        quarter_no: currentQuarter, // Use current quarter
        points: totalPoints,
        field_goals_made: (stats.twoPointFG.made || 0) + (stats.threePointFG.made || 0),
        field_goals_attempted: (stats.twoPointFG.attempted || 0) + (stats.threePointFG.attempted || 0),
        two_point_made: stats.twoPointFG.made || 0,
        two_point_attempted: stats.twoPointFG.attempted || 0,
        three_point_made: stats.threePointFG.made || 0,
        three_point_attempted: stats.threePointFG.attempted || 0,
        free_throws_made: stats.freeThrows.made || 0,
        free_throws_attempted: stats.freeThrows.attempted || 0,
        assists: stats.assists || 0,
        offensive_rebounds: stats.rebounds.offensive || 0,
        defensive_rebounds: stats.rebounds.defensive || 0,
        steals: stats.steals || 0,
        blocks: stats.blocks || 0,
        turnovers: stats.turnovers || 0,
        fouls: stats.fouls || 0
      };

      console.log('Saving stats to database:', {
        athleteId,
        currentQuarter,
        statsData,
        originalStats: stats
      });

      // Check if stats already exist for this athlete/game combination
      const { data: existingStats, error: checkError } = await supabase
        .from('athlete_game')
        .select('athlete_game_no')
        .eq('athlete_no', parseInt(athleteId))
        .eq('game_no', parseInt(id))
        .eq('quarter_no', currentQuarter)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no stats exist
        throw checkError;
      }

      if (existingStats) {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('athlete_game')
          .update(statsData)
          .eq('athlete_game_no', existingStats.athlete_game_no);

        if (updateError) throw updateError;
      } else {
        // Insert new stats
        const { error: insertError } = await supabase
          .from('athlete_game')
          .insert(statsData);

        if (insertError) throw insertError;
      }

      console.log('Stats saved successfully for athlete:', athleteId);
    } catch (err) {
      console.error('Error saving stats:', err);
      Alert.alert('Error', 'Failed to save stats to database');
    }
  };

  // Stats form handlers
  const handleStatsAthleteSelect = (athlete: {
    id: string;
    number: string;
    name: string;
    position: string;
  }) => {
    setSelectedStatsAthlete(athlete);
    initializePlayerStats(athlete.id);
  };

  const handleShootingStatsUpdate = (
    statType: 'total' | 'twoPoint' | 'threePoint' | 'freeThrows',
    field: 'made' | 'attempted',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => ({
      ...prev,
      [selectedStatsAthlete.id]: {
        ...prev[selectedStatsAthlete.id],
        [statType === 'total'
          ? 'totalFieldGoals'
          : statType === 'twoPoint'
            ? 'twoPointFG'
            : statType === 'threePoint'
              ? 'threePointFG'
              : 'freeThrows']: {
          ...prev[selectedStatsAthlete.id][
            statType === 'total'
              ? 'totalFieldGoals'
              : statType === 'twoPoint'
                ? 'twoPointFG'
                : statType === 'threePoint'
                  ? 'threePointFG'
                  : 'freeThrows'
          ],
          [field]: value
        }
      }
    }));
    
    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  const handleReboundingStatsUpdate = (
    field: 'offensive' | 'defensive',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => ({
      ...prev,
      [selectedStatsAthlete.id]: {
        ...prev[selectedStatsAthlete.id],
        rebounds: {
          ...prev[selectedStatsAthlete.id].rebounds,
          [field]: value
        }
      }
    }));
    
    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  const handleOtherStatsUpdate = (
    field: 'assists' | 'steals' | 'blocks' | 'turnovers' | 'fouls',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => ({
      ...prev,
      [selectedStatsAthlete.id]: {
        ...prev[selectedStatsAthlete.id],
        [field]: value
      }
    }));
    
    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  // Quarter selector handler
  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Loading game data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="mb-4 text-center text-lg font-semibold text-red-500">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              if (id) {
                Promise.all([fetchGame(), fetchRosterAthletes(), fetchGameStats()]).finally(() => setLoading(false));
              }
            }}
            className="rounded-lg bg-red-500 px-4 py-2"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Quarter Selector */}
        <View className="border-b border-gray-200 px-4 py-3">
          <Text className="mb-2 text-center text-sm font-medium text-gray-600">
            Recording for Quarter:
          </Text>
          <View className="flex-row justify-center space-x-2">
            {[1, 2, 3, 4].map(quarter => (
              <TouchableOpacity
                key={quarter}
                onPress={() => handleQuarterChange(quarter)}
                className={`rounded-lg px-4 py-2 ${
                  currentQuarter === quarter
                    ? 'bg-red-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currentQuarter === quarter
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  Q{quarter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.q1}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.q2}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.q3}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.q4}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.ot}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-100 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.home.total}
                      </Text>
                    </View>
                  </View>

                  {/* Away Team Row */}
                  <View className="flex-row items-center">
                    <Text className="flex-1 pr-4 text-sm text-black">
                      State University
                    </Text>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.q1}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.q2}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.q3}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.q4}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-50 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.ot}
                      </Text>
                    </View>
                    <View className="h-12 w-20 rounded border border-gray-300 bg-gray-100 items-center justify-center">
                      <Text className="text-lg font-semibold text-gray-600">
                        {quarterScores.away.total}
                      </Text>
                    </View>
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
                      onPress={() => {
                        setSelectedPlayerId(athlete.id);
                        initializePlayerStats(athlete.id);
                      }}
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
                      {selectedAthletes.find(a => a.id === selectedPlayerId)?.name}{' '}
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
                        ? playerStats[selectedPlayerId]?.twoPointFG
                        : { made: 0, attempted: 0 }
                    }
                    onUpdate={(field, value) => {
                      if (selectedPlayerId) {
                        setPlayerStats(prev => ({
                          ...prev,
                          [selectedPlayerId]: {
                            ...prev[selectedPlayerId],
                            twoPointFG: {
                              ...prev[selectedPlayerId].twoPointFG,
                              [field]: value
                            }
                          }
                        }));
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId);
                      }
                    }}
                  />

                  {/* 3-Point Field Goals Card */}
                  <StatCard
                    title="3-Point Field Goals"
                    type="shooting"
                    stats={
                      selectedPlayerId
                        ? playerStats[selectedPlayerId]?.threePointFG
                        : { made: 0, attempted: 0 }
                    }
                    onUpdate={(field, value) => {
                      if (selectedPlayerId) {
                        setPlayerStats(prev => ({
                          ...prev,
                          [selectedPlayerId]: {
                            ...prev[selectedPlayerId],
                            threePointFG: {
                              ...prev[selectedPlayerId].threePointFG,
                              [field]: value
                            }
                          }
                        }));
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId);
                      }
                    }}
                  />

                  {/* Free Throws Card */}
                  <StatCard
                    title="Free Throws"
                    type="shooting"
                    stats={
                      selectedPlayerId
                        ? playerStats[selectedPlayerId]?.freeThrows
                        : { made: 0, attempted: 0 }
                    }
                    onUpdate={(field, value) => {
                      if (selectedPlayerId) {
                        setPlayerStats(prev => ({
                          ...prev,
                          [selectedPlayerId]: {
                            ...prev[selectedPlayerId],
                            freeThrows: {
                              ...prev[selectedPlayerId].freeThrows,
                              [field]: value
                            }
                          }
                        }));
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId);
                      }
                    }}
                  />

                  {/* Rebounds Card */}
                  <StatCard
                    title="Rebounds"
                    type="rebounds"
                    stats={
                      selectedPlayerId
                        ? playerStats[selectedPlayerId]?.rebounds
                        : { offensive: 0, defensive: 0 }
                    }
                    onUpdate={(field, value) => {
                      if (selectedPlayerId) {
                        setPlayerStats(prev => ({
                          ...prev,
                          [selectedPlayerId]: {
                            ...prev[selectedPlayerId],
                            rebounds: {
                              ...prev[selectedPlayerId].rebounds,
                              [field]: value
                            }
                          }
                        }));
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId);
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
                      value={playerStats[selectedPlayerId]?.assists || 0}
                      onUpdate={value => {
                        if (selectedPlayerId) {
                          setPlayerStats(prev => ({
                            ...prev,
                            [selectedPlayerId]: {
                              ...prev[selectedPlayerId],
                              assists: value
                            }
                          }));
                          // Trigger auto-save
                          scheduleAutoSave(selectedPlayerId);
                        }
                      }}
                    />

                    <SimpleStatRow
                      label="Steals"
                      value={playerStats[selectedPlayerId]?.steals || 0}
                      onUpdate={value => {
                        if (selectedPlayerId) {
                          console.log('Steals onUpdate called:', {
                            selectedPlayerId,
                            newValue: value,
                            currentValue: playerStats[selectedPlayerId]?.steals || 0,
                            timestamp: new Date().toISOString()
                          });
                          
                          setPlayerStats(prev => {
                            const newStats = {
                              ...prev,
                              [selectedPlayerId]: {
                                ...prev[selectedPlayerId],
                                steals: value
                              }
                            };
                            console.log('Steals state updated:', {
                              oldValue: prev[selectedPlayerId]?.steals || 0,
                              newValue: value,
                              finalState: newStats[selectedPlayerId]
                            });
                            return newStats;
                          });
                          
                          // Trigger auto-save
                          scheduleAutoSave(selectedPlayerId);
                        }
                      }}
                    />

                    <SimpleStatRow
                      label="Blocks"
                      value={playerStats[selectedPlayerId]?.blocks || 0}
                      onUpdate={value => {
                        if (selectedPlayerId) {
                          setPlayerStats(prev => ({
                            ...prev,
                            [selectedPlayerId]: {
                              ...prev[selectedPlayerId],
                              blocks: value
                            }
                          }));
                          // Trigger auto-save
                          scheduleAutoSave(selectedPlayerId);
                        }
                      }}
                    />

                    <SimpleStatRow
                      label="Turnovers"
                      value={playerStats[selectedPlayerId]?.turnovers || 0}
                      onUpdate={value => {
                        if (selectedPlayerId) {
                          setPlayerStats(prev => ({
                            ...prev,
                            [selectedPlayerId]: {
                              ...prev[selectedPlayerId],
                              turnovers: value
                            }
                          }));
                          // Trigger auto-save
                          scheduleAutoSave(selectedPlayerId);
                        }
                      }}
                    />

                    <SimpleStatRow
                      label="Fouls"
                      value={playerStats[selectedPlayerId]?.fouls || 0}
                      onUpdate={value => {
                        if (selectedPlayerId) {
                          setPlayerStats(prev => ({
                            ...prev,
                            [selectedPlayerId]: {
                              ...prev[selectedPlayerId],
                              fouls: value
                            }
                          }));
                          // Trigger auto-save
                          scheduleAutoSave(selectedPlayerId);
                        }
                      }}
                    />

                    {/* Total Points - Calculated Display */}
                    <View className="flex-row items-center justify-between">
                      <Text className="font-medium text-black">
                        Total Points
                      </Text>
                      <Text className="text-lg font-bold text-red-500">
                        {calculateTotalPoints(playerStats[selectedPlayerId])}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
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
                  onSelectAthlete={handleStatsAthleteSelect}
                />
              </View>

              {/* Stats Form */}
              {selectedStatsAthlete && (
                <View className="space-y-4">
                  {/* Shooting Statistics */}
                  <ShootingStats_StatsForm
                    totalFieldGoals={
                      playerStats[selectedStatsAthlete.id]?.totalFieldGoals || {
                        made: 0,
                        attempted: 0
                      }
                    }
                    twoPointFG={
                      playerStats[selectedStatsAthlete.id]?.twoPointFG || {
                        made: 0,
                        attempted: 0
                      }
                    }
                    threePointFG={
                      playerStats[selectedStatsAthlete.id]?.threePointFG || {
                        made: 0,
                        attempted: 0
                      }
                    }
                    freeThrows={
                      playerStats[selectedStatsAthlete.id]?.freeThrows || {
                        made: 0,
                        attempted: 0
                      }
                    }
                    onUpdate={handleShootingStatsUpdate}
                  />

                  {/* Rebounding Statistics */}
                  <ReboundingStats_StatsForm
                    offensive={
                      playerStats[selectedStatsAthlete.id]?.rebounds
                        ?.offensive || 0
                    }
                    defensive={
                      playerStats[selectedStatsAthlete.id]?.rebounds
                        ?.defensive || 0
                    }
                    onUpdate={handleReboundingStatsUpdate}
                  />

                  {/* Other Statistics */}
                  <OtherStats_StatsForm
                    assists={playerStats[selectedStatsAthlete.id]?.assists || 0}
                    steals={playerStats[selectedStatsAthlete.id]?.steals || 0}
                    blocks={playerStats[selectedStatsAthlete.id]?.blocks || 0}
                    turnovers={
                      playerStats[selectedStatsAthlete.id]?.turnovers || 0
                    }
                    fouls={playerStats[selectedStatsAthlete.id]?.fouls || 0}
                    onUpdate={handleOtherStatsUpdate}
                  />

                  {/* Add Button */}
                  <TouchableOpacity 
                    className="flex-row items-center justify-center rounded-lg bg-red-500 px-6 py-4"
                    onPress={() => {
                      if (selectedStatsAthlete && playerStats[selectedStatsAthlete.id]) {
                        saveStatsToDatabase(selectedStatsAthlete.id, playerStats[selectedStatsAthlete.id]);
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
                                <Text className="text-xs text-gray-500">
                                  PTS
                                </Text>
                                <Text className="font-bold text-black">
                                  {calculateTotalPoints(stats)}
                                </Text>
                              </View>
                              <View className="items-center">
                                <Text className="text-xs text-gray-500">
                                  REB
                                </Text>
                                <Text className="font-bold text-black">
                                  {(stats?.rebounds?.offensive || 0) +
                                    (stats?.rebounds?.defensive || 0)}
                                </Text>
                              </View>
                              <View className="items-center">
                                <Text className="text-xs text-gray-500">
                                  AST
                                </Text>
                                <Text className="font-bold text-black">
                                  {stats?.assists || 0}
                                </Text>
                              </View>
                              <View className="items-center">
                                <Text className="text-xs text-gray-500">
                                  STL
                                </Text>
                                <Text className="font-bold text-black">
                                  {stats?.steals || 0}
                                </Text>
                              </View>
                              <View className="items-center">
                                <Text className="text-xs text-gray-500">
                                  BLK
                                </Text>
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
