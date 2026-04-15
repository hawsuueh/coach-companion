/////////////////////////////// START OF IMPORTS //////////////////////////////////////////////////////////

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  View,
  Alert,
} from 'react-native';

import QuarterSelector from '../../../../../../components/game/QuarterSelector';
import GameHeader from '../../../../../../components/game/GameHeader';
import TabNavigation from '../../../../../../components/navigation/TabNavigation';
import StatsFormTab from '../../../../../../components/game/StatsFormTab';
import RealTimeStatsTab from '../../../../../../components/game/RealTimeStatsTab';
import LoadingScreen from '../../../../../../components/common/LoadingScreen';
import ErrorScreen from '../../../../../../components/common/ErrorScreen';
import QuarterScoresCollapsible from '../../../../../../components/game/QuarterScoresCollapsible';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
// Utility imports
import { exportGameStatsToPDF, type PlayerStats } from '@/utils/pdfExport';
// Service imports
import { getGameByIdWithBatchValidation, transformDatabaseGame, type DatabaseGame, type Game } from '@/services/gameService';
import { transformDatabaseAthlete, type DatabaseAthlete, type Athlete } from '@/services/athleteService';
import { getRosterWithAthletes } from '@/services/rosterService';
import { getAthleteGameStatsByGame, upsertAthleteGameStats, type DatabaseAthleteGame } from '@/services/statsService';
////////////////////////////// END OF IMPORTS ////////////////


/////////////////////////////// START OF INTERFACES /////////////
// Using imported types from services for Database interfaces and helper functions
// PlayerStats is now imported from @/utils/pdfExport

// For default values of the player stats object
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

// the purpose of this function is to calculate the total points for a player
const calculateTotalPoints = (stats: PlayerStats | undefined) => { 
  if (!stats) return 0;
  const twoPointPoints = (stats.twoPointFG?.made || 0) * 2;
  const threePointPoints = (stats.threePointFG?.made || 0) * 3;
  const freeThrowPoints = (stats.freeThrows?.made || 0) * 1;
  return twoPointPoints + threePointPoints + freeThrowPoints;
};
////////////////////////////// END OF INTERFACES ////////////////


/////////////////////////////// START OF MAIN COMPONENT /////////////

export default function GameRecordingScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setTitle } = useHeader();
  const { coachNo } = useAuth();
  const [activeTab, setActiveTab] = useState<'realtime' | 'stats'>('realtime');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedStatsAthlete, setSelectedStatsAthlete] = useState<{
    id: string;
    number: string;
    name: string;
    position: string;
  } | null>(null);
  const [playerStats, setPlayerStats] = useState<
    Record<string, PlayerStats>
  >({});


  const [showQuarterScores, setShowQuarterScores] = useState(true);
  const [quarterScores, setQuarterScores] = useState({
    home: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0, total: 0 },
    away: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0, total: 0 }
  });
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Real data states
  const [game, setGame] = useState<Game | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save functionality
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSavesRef = useRef<Set<string>>(new Set());
  ////////////////////////////// END OF STATE AND CONFIGURATION ////////////////

  /////////////////////////////// START OF DATA FETCHING FUNCTIONS /////////////
  // Fetch game data from database (with coach validation)
  const fetchGame = async () => {
    try {
      if (!coachNo) {
        setError('No coach information available');
        return;
      }

      const gameData = await getGameByIdWithBatchValidation(Number(id), coachNo);
      
      if (!gameData) {
        setError('Game not found or does not belong to your batches');
        return;
      }

      // Game is valid, transform and set it
      const transformedGame = transformDatabaseGame(gameData);
      setGame(transformedGame);

      // Initialize scoreboard from database
      if (transformedGame.scores) {
        setQuarterScores(transformedGame.scores);
      }
    } catch (err) {
      console.error('Error fetching game:', err);
      setError('Failed to load game details');
    }
  };

  // Fetch roster athletes for this game
  const fetchRosterAthletes = async () => {
    try {
      const athletes = await getRosterWithAthletes(Number(id));
      const transformedAthletes = athletes.map(transformDatabaseAthlete);
      setSelectedAthletes(transformedAthletes);
    } catch (err) {
      console.error('Error fetching roster athletes:', err);
      setError('Failed to load roster athletes');
    }
  };

  // Fetch existing game stats for athletes (Cumulative)
  const fetchGameStats = async () => {
    try {
      const data = await getAthleteGameStatsByGame(Number(id));

      if (data && data.length > 0) {
        // Transform database stats to UI format
        const athleteStatsContainer: Record<string, PlayerStats> = {};

        data.forEach((stat: DatabaseAthleteGame) => {
          const athleteId = stat.athlete_no.toString();

          // In the cumulative schema, there is only ONE row per athlete
          athleteStatsContainer[athleteId] = {
            totalFieldGoals: {
              made: stat.field_goals_made || 0,
              attempted: stat.field_goals_attempted || 0,
            },
            twoPointFG: {
              made: stat.two_point_made || 0,
              attempted: stat.two_point_attempted || 0,
            },
            threePointFG: {
              made: stat.three_point_made || 0,
              attempted: stat.three_point_attempted || 0,
            },
            freeThrows: {
              made: stat.free_throws_made || 0,
              attempted: stat.free_throws_attempted || 0,
            },
            rebounds: {
              offensive: stat.offensive_rebounds || 0,
              defensive: stat.defensive_rebounds || 0,
            },
            assists: stat.assists || 0,
            steals: stat.steals || 0,
            blocks: stat.blocks || 0,
            turnovers: stat.turnovers || 0,
            fouls: stat.fouls || 0,
          };
        });

        setPlayerStats(athleteStatsContainer);
        console.log('Loaded cumulative stats from database:', athleteStatsContainer);
      }
    } catch (err) {
      console.error('Error fetching game stats:', err);
    }
  };

  // Save stats to database (Cumulative)
  const saveStatsToDatabase = useCallback(
    async (athleteId: string, stats: PlayerStats) => {
    try {
      if (!id || typeof id !== 'string') return;

      // Calculate total points
      const totalPoints = calculateTotalPoints(stats);

      // Prepare data for database
      const statsData = {
        points: totalPoints,
        field_goals_made:
          (stats.twoPointFG.made || 0) + (stats.threePointFG.made || 0),
        field_goals_attempted:
          (stats.twoPointFG.attempted || 0) +
          (stats.threePointFG.attempted || 0),
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

      const success = await upsertAthleteGameStats(
        parseInt(athleteId),
        parseInt(id),
        statsData
      );

      if (!success) {
        throw new Error('Failed to save stats');
      }
    } catch (err) {
      console.error('Error saving stats:', err);
      Alert.alert('Error', 'Failed to save stats to database');
    }
  }, [id]);
  ////////////////////////////// END OF DATA FETCHING FUNCTIONS ////////////////

  /////////////////////////////// START OF UTILITY FUNCTIONS /////////////
  // Handle manual score changes for the team scoreboard
  const handleScoreChange = async (
    team: 'home' | 'away',
    quarter: 'q1' | 'q2' | 'q3' | 'q4' | 'ot',
    value: string
  ) => {
    const numericValue = parseInt(value) || 0;
    
    setQuarterScores(prev => {
      const newScores = { ...prev };
      newScores[team] = { ...newScores[team], [quarter]: numericValue };
      
      // Automatic total calculation
      newScores[team].total = 
        newScores[team].q1 + 
        newScores[team].q2 + 
        newScores[team].q3 + 
        newScores[team].q4 + 
        newScores[team].ot;
      
      // Auto-save to database
      if (id) {
        import('@/services/gameService').then(m => 
          m.updateGameScoreboard(parseInt(id as string), newScores)
        );
      }
      
      return newScores;
    });
  };

  // Ensure player total stats entry exists
  const ensurePlayerStats = (playerId: string) => {
    setPlayerStats(currentState => {
      const existingAthleteStats = currentState[playerId];
      if (existingAthleteStats) return currentState;

      return {
        ...currentState,
        [playerId]: createEmptyPlayerStats()
      };
    });
  };

  // Smart auto-save function with debouncing (Cumulative)
  const scheduleAutoSave = useCallback(
    (athleteId: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    pendingSavesRef.current.add(athleteId);

    saveTimeoutRef.current = setTimeout(async () => {
      const athletesToSave = Array.from(pendingSavesRef.current);
      pendingSavesRef.current.clear();

      for (const authId of athletesToSave) {
        // Get the current state at save time
        setPlayerStats(currentStats => {
          const stats = currentStats[authId];
          if (stats) {
            saveStatsToDatabase(authId, stats);
          }
          return currentStats;
        });
      }
    }, 1500);
  }, [saveStatsToDatabase]);
  ////////////////////////////// END OF UTILITY FUNCTIONS ////////////////

  /////////////////////////////// START OF USE EFFECTS /////////////
  useEffect(() => {
    setTitle('Game Recording');
  });

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

  // Manual scoring removes automatic sync - keeping this comment as reference
  ////////////////////////////// END OF USE EFFECTS ////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
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

  const handleExport = useCallback(async () => {
    if (!game) {
      Alert.alert('Export Unavailable', 'Game details are still loading.');
      return;
    }

    if (selectedAthletes.length === 0) {
      Alert.alert('No Roster', 'Add athletes to the roster before exporting.');
      return;
    }

    try {
      setExporting(true);
      
      await exportGameStatsToPDF({
        game: {
          gameName: game.gameName,
          teamName: game.teamName,
          opponentName: game.opponentName,
          date: game.date,
          seasonLabel: game.seasonLabel ?? ''
        },
        selectedAthletes,
        playerStats,
        quarterScores: quarterScores.home
      });
    } catch (err) {
      console.error('Error exporting stats:', err);
      Alert.alert('Export Failed', 'Something went wrong while generating the PDF.');
    } finally {
      setExporting(false);
    }
  }, [
    game,
    playerStats,
    quarterScores.home,
    selectedAthletes
  ]);

  // Quarter selector handler
  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
    // Athlete stats are cumulative, so we no longer need to ensure entries for specific quarters
    // However, we still want to ensure the athlete has a base object if they are selected
    if (selectedPlayerId) {
      ensurePlayerStats(selectedPlayerId);
    }
    if (selectedStatsAthlete) {
      ensurePlayerStats(selectedStatsAthlete.id);
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
    ensurePlayerStats(athlete.id);
  };

  const handleShootingStatsUpdate = (
    statType: 'total' | 'twoPoint' | 'threePoint' | 'freeThrows',
    field: 'made' | 'attempted',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    const statKey: 'totalFieldGoals' | 'twoPointFG' | 'threePointFG' | 'freeThrows' =
      statType === 'total'
        ? 'totalFieldGoals'
        : statType === 'twoPoint'
          ? 'twoPointFG'
          : statType === 'threePoint'
            ? 'threePointFG'
            : 'freeThrows';

    setPlayerStats(prev => {
      const athleteStats = prev[selectedStatsAthlete.id] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          [statKey]: {
            ...athleteStats[statKey],
            [field]: value
          }
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  const handleReboundingStatsUpdate = (
    field: 'offensive' | 'defensive',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => {
      const athleteStats = prev[selectedStatsAthlete.id] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          rebounds: {
            ...athleteStats.rebounds,
            [field]: value
          }
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  const handleOtherStatsUpdate = (
    field: 'assists' | 'steals' | 'blocks' | 'turnovers' | 'fouls',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => {
      const athleteStats = prev[selectedStatsAthlete.id] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          [field]: value
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id);
  };

  // Real-time tab handlers
  const handlePlayerSelectByRealTime = (athleteId: string) => {
    setSelectedPlayerId(athleteId);
    ensurePlayerStats(athleteId);
  };

  // Unified stat update handler for RealTimeStatsTab (Cumulative)
  const handleRealTimeStatsUpdate = useCallback(
    (
      playerId: string,
      field: string,
      subfield: string | null,
      value: number
    ) => {
      setPlayerStats(prev => {
        const player = prev[playerId] ?? createEmptyPlayerStats();
        let updatedPlayer = { ...player };

        if (subfield) {
          // Handle nested fields like twoPointFG.made, rebounds.offensive
          updatedPlayer = {
            ...player,
            [field]: {
              ...(player[field as keyof PlayerStats] as any),
              [subfield]: value
            }
          };
        } else {
          // Handle simple fields like assists, steals
          updatedPlayer = {
            ...player,
            [field]: value
          };
        }

        const newState = {
          ...prev,
          [playerId]: updatedPlayer
        };

        scheduleAutoSave(playerId);
        return newState;
      });
    },
    [scheduleAutoSave]
  );
  ////////////////////////////// END OF EVENT HANDLERS ////////////////

  /////////////////////////////// START OF LOADING AND ERROR STATES /////////////
  if (loading) {
    return <LoadingScreen message="Loading game data..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          if (id) {
            Promise.all([
              fetchGame(),
              fetchRosterAthletes(),
              fetchGameStats()
            ]).finally(() => setLoading(false));
          }
        }}
      />
    );
  }

  if (!game) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold text-gray-500">
          Game not found
        </Text>
      </View>
    );
  }
  ////////////////////////////// END OF LOADING AND ERROR STATES ////////////////

  /////////////////////////////// START OF JSX RETURN /////////////
  return (
    <View className="flex-1 bg-white">
      <GameHeader gameName={game.gameName} variant="compact" />

      {/* Quarter Selector */}
      <QuarterSelector
        currentQuarter={currentQuarter}
        onQuarterChange={handleQuarterChange}
        onReset={handleReset}
      />

      {/* Quarter Scores Section */}
      <QuarterScoresCollapsible
        homeTeamName={game.teamName}
        awayTeamName={game.opponentName}
        quarterScores={quarterScores}
        isExpanded={showQuarterScores}
        onToggle={() => setShowQuarterScores(!showQuarterScores)}
        onScoreChange={handleScoreChange}
      />

      {/* Tab Navigation */}
      <TabNavigation<'realtime' | 'stats'>
        tabs={[
          { id: 'realtime', label: 'Real-Time' },
          { id: 'stats', label: 'Stats Sheet' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'realtime' ? (
        <RealTimeStatsTab
          selectedAthletes={selectedAthletes}
          selectedPlayerId={selectedPlayerId || ''}
          currentQuarter={currentQuarter}
          playerStats={playerStats}
          onPlayerSelect={handlePlayerSelectByRealTime}
          onStatsUpdate={handleRealTimeStatsUpdate}
          onExport={handleExport}
          exporting={exporting}
        />
      ) : (
        <StatsFormTab
          game={game}
          selectedAthletes={selectedAthletes}
          selectedStatsAthlete={selectedStatsAthlete}
          currentQuarter={currentQuarter}
          playerStats={playerStats}
          onAthleteSelect={handleStatsAthleteSelect}
          onShootingStatsUpdate={handleShootingStatsUpdate}
          onReboundingStatsUpdate={handleReboundingStatsUpdate}
          onOtherStatsUpdate={handleOtherStatsUpdate}
          onSave={saveStatsToDatabase}
        />
      )}
    </View>
  );
  ////////////////////////////// END OF JSX RETURN ////////////////
}
////////////////////////////// END OF MAIN COMPONENT ////////////////
