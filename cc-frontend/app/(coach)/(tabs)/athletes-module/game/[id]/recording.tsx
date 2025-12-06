/////////////////////////////// START OF IMPORTS //////////////////////////////////////////////////////////
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import StatCard from '../../../../../../components/cards/StatCard';
import SimpleStatRow from '../../../../../../components/cards/SimpleStatRow';
import AthleteDropdown_StatsForm from '../../../../../../components/inputs/AthleteDropdown_StatsForm';
import ShootingStats_StatsForm from '../../../../../../components/cards/ShootingStats_StatsForm';
import ReboundingStats_StatsForm from '../../../../../../components/cards/ReboundingStats_StatsForm';
import OtherStats_StatsForm from '../../../../../../components/cards/OtherStats_StatsForm';
import QuarterSelector from '../../../../../../components/game/QuarterSelector';
import GameHeader from '../../../../../../components/game/GameHeader';
import PlayerSelectionGrid from '../../../../../../components/game/PlayerSelectionGrid';
import TabNavigation from '../../../../../../components/navigation/TabNavigation';
import StatsFormTab from '../../../../../../components/game/StatsFormTab';
import RealTimeStatsTab from '../../../../../../components/game/RealTimeStatsTab';
import LoadingScreen from '../../../../../../components/common/LoadingScreen';
import ErrorScreen from '../../../../../../components/common/ErrorScreen';
import ExportButton from '../../../../../../components/buttons/ExportButton';
import QuarterScoresCollapsible from '../../../../../../components/game/QuarterScoresCollapsible';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlayerExportRow,
  renderGameStatsHtml
} from '@/utils/export/renderGameStatsHtml';
// Service imports
import { getGameByIdWithBatchValidation, transformDatabaseGame, type DatabaseGame, type Game } from '@/services/gameService';
import { transformDatabaseAthlete, type DatabaseAthlete, type Athlete } from '@/services/athleteService';
import { getRosterWithAthletes } from '@/services/rosterService';
import { getAthleteGameStatsByGame, upsertAthleteGameStats, type DatabaseAthleteGame } from '@/services/statsService';
////////////////////////////// END OF IMPORTS ////////////////


/////////////////////////////// START OF INTERFACES /////////////
// Using imported types from services for Database interfaces and helper functions

// UI-friendly version of DatabaseAthleteGame - restructured for better organization
interface PlayerStats { // Think of PlayerStats as an object with numbers like points, rebounds, etc.
  totalFieldGoals: { made: number; attempted: number }; // ex: { made: 6, attempted: 12 }
  twoPointFG: { made: number; attempted: number }; // ex: { made: 4, attempted: 8 } - from two_point_made/attempted
  threePointFG: { made: number; attempted: number }; // ex: { made: 2, attempted: 4 } - from three_point_made/attempted
  freeThrows: { made: number; attempted: number }; // ex: { made: 1, attempted: 2 } - from free_throws_made/attempted
  rebounds: { offensive: number; defensive: number }; // ex: { offensive: 2, defensive: 5 } - from offensive_rebounds/defensive_rebounds
  assists: number; // ex: 3
  steals: number; // ex: 2
  blocks: number; // ex: 1
  turnovers: number; // ex: 2
  fouls: number; // ex: 3
}

type PlayerQuarterStats = Record<number, PlayerStats>; 
// Purpose: The Record<number, PlayerStats> type is useful for creating an object with known key-value pairs where the keys are of type number and the values are of type PlayerStats. It helps to define the shape of an object clearly and concisely.
// Example: const myObject: Record<number, PlayerStats> = { 1: { made: 1, attempted: 2 }, 2: { made: 3, attempted: 4 } };


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
const calculateTotalPoints = (stats: PlayerStats | undefined) => { // "stats:" is like the parameter name 
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

const aggregateShootingTotals = (
  statsByQuarter: PlayerQuarterStats | undefined,
  accessor: (stats: PlayerStats) => { made: number; attempted: number }
) => {
  let made = 0;
  let attempted = 0;

  if (statsByQuarter) {
    Object.values(statsByQuarter).forEach(stats => {
      const segment = accessor(stats);
      made += segment.made || 0;
      attempted += segment.attempted || 0;
    });
  }

  return { made, attempted };
};

const formatPercentage = (made: number, attempted: number) => {
  if (!attempted) {
    return '0%';
  }

  const percentage = (made / attempted) * 100;
  return `${percentage.toFixed(1)}%`;
};
////////////////////////////// END OF INTERFACES ////////////////

////////////////////////////// END OF HELPER FUNCTIONS ////////////////


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
    Record<string, PlayerQuarterStats>
  >({});

  // Purpose: The Record<K, T> type is useful for creating an object with known key-value pairs where the keys are of type K and the values are of type T. It helps to define the shape of an object clearly and concisely.
  // Example: const myObject: Record<string, number> = { 'key1': 1, 'key2': 2, 'key3': 3 };


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
    } catch (err) {
      console.error('Error fetching game:', err);
      setError('Failed to load game details');
    }
  };

  // Fetch roster athletes for this game
  // Whatever game_no you select → get all athletes in that game's roster
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

  // Fetch existing game stats for athletes
  const fetchGameStats = async () => {
    try {
      const data = await getAthleteGameStatsByGame(Number(id));

      if (data && data.length > 0) {
        // Transform database stats to UI format
        const athleteStatsContainer: Record<string, PlayerQuarterStats> = {};

        data.forEach((stat: DatabaseAthleteGame) => {
          const athleteId = stat.athlete_no.toString();
          const quarterNo = stat.quarter_no ? Number(stat.quarter_no) : 1;

          if (!athleteStatsContainer[athleteId]) {
            athleteStatsContainer[athleteId] = {};
          }

          if (!athleteStatsContainer[athleteId][quarterNo]) {
            athleteStatsContainer[athleteId][quarterNo] = createEmptyPlayerStats();
          }

          const currentStats = athleteStatsContainer[athleteId][quarterNo];
          currentStats.totalFieldGoals.made += stat.field_goals_made || 0;
          currentStats.totalFieldGoals.attempted += stat.field_goals_attempted || 0;
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

        setPlayerStats(athleteStatsContainer);
        console.log('Loaded per-quarter stats from database:', athleteStatsContainer);
      }
    } catch (err) {
      console.error('Error fetching game stats:', err);
      // Don't set error for stats fetch, just log it
    }
  };

  // Save stats to database
  const saveStatsToDatabase = useCallback(
    async (athleteId: string, quarter: number, stats: PlayerStats) => {
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

      console.log('Saving stats to database:', {
        athleteId,
        quarter,
        statsData,
        originalStats: stats
      });

      const success = await upsertAthleteGameStats(
        parseInt(athleteId),
        parseInt(id),
        quarter,
        statsData
      );

      if (!success) {
        throw new Error('Failed to save stats');
      }

      console.log('Stats saved successfully for athlete:', athleteId);
    } catch (err) {
      console.error('Error saving stats:', err);
      Alert.alert('Error', 'Failed to save stats to database');
    }
  }, [id]);
  ////////////////////////////// END OF DATA FETCHING FUNCTIONS ////////////////

  /////////////////////////////// START OF UTILITY FUNCTIONS /////////////
  // Update quarter scores automatically using per-quarter stats
  const updateQuarterScores = () => {
    const homeScores = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      ot: 0,
      total: 0
    };

    Object.values(playerStats).forEach(athleteQuarterStats => {
      Object.entries(athleteQuarterStats).forEach(([quarterKey, stats]) => {
        const quarterNumber = Number(quarterKey);
        const points = calculateTotalPoints(stats);

        switch (quarterNumber) {
          case 1:
            homeScores.q1 += points;
            break;
          case 2:
            homeScores.q2 += points;
            break;
          case 3:
            homeScores.q3 += points;
            break;
          case 4:
            homeScores.q4 += points;
            break;
          default:
            homeScores.ot += points;
            break;
        }
      });
    });

    homeScores.total =
      homeScores.q1 +
      homeScores.q2 +
      homeScores.q3 +
      homeScores.q4 +
      homeScores.ot;

    setQuarterScores(prev => ({
      home: homeScores,
      away: prev.away
    }));
  };

  // Initialize player stats if not exists
  // this is to make the players in the playerStats object have a default value of 0 for all stats
  const ensureQuarterStats = (playerId: string, quarter: number) => {
    setPlayerStats(currentState => {
      const existingAthleteStats = currentState[playerId];
      const quarterExists = existingAthleteStats?.[quarter];

      if (quarterExists) {
        return currentState;
      }

      const updatedAthleteStats: PlayerQuarterStats = {
        ...(existingAthleteStats || {}),
        [quarter]: createEmptyPlayerStats()
      };

      return {
        ...currentState,
        [playerId]: updatedAthleteStats
      };
    });
  };

  // Smart auto-save function with debouncing
  const scheduleAutoSave = useCallback(
    (athleteId: string, quarter: number) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Add to pending saves
    pendingSavesRef.current.add(`${athleteId}::${quarter}`);

    // Set new timeout for 1.5 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      const athletesToSave = Array.from(pendingSavesRef.current);
      pendingSavesRef.current.clear();

      // Save all pending athletes - get fresh state at save time
      for (const athleteKey of athletesToSave) {
        const [idPart, quarterPart] = athleteKey.split('::');
        const parsedQuarter = Number(quarterPart);
        if (!idPart || Number.isNaN(parsedQuarter)) {
          continue;
        }

        // Get the current state at save time, not when scheduled
        setPlayerStats(currentStats => {
          const statsForQuarter = currentStats[idPart]?.[parsedQuarter];
          if (statsForQuarter) {
            console.log('Auto-save capturing fresh state:', {
              athleteId: idPart,
              quarter: parsedQuarter,
              steals: statsForQuarter.steals,
              timestamp: new Date().toISOString()
            });
            saveStatsToDatabase(idPart, parsedQuarter, statsForQuarter);
          }
          return currentStats; // Don't change state, just capture it
        });
      }
    }, 1500); // 1.5 second delay
  }, [saveStatsToDatabase]); // Remove playerStats dependency to avoid stale closures
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

  // Update quarter scores whenever player stats change
  useEffect(() => {
    updateQuarterScores();
  }, [playerStats]);
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

      const sortedAthletes = [...selectedAthletes].sort((a, b) => {
        const aNumber = parseInt(a.number, 10);
        const bNumber = parseInt(b.number, 10);
        if (Number.isNaN(aNumber) || Number.isNaN(bNumber)) {
          return a.name.localeCompare(b.name);
        }
        return aNumber - bNumber;
      });

      const playersForExport: PlayerExportRow[] = sortedAthletes.map(athlete => {
        const statsByQuarter = playerStats[athlete.id];
        const fieldGoals = aggregateShootingTotals(
          statsByQuarter,
          stats => stats.totalFieldGoals
        );
        const twoPoint = aggregateShootingTotals(
          statsByQuarter,
          stats => stats.twoPointFG
        );
        const threePoint = aggregateShootingTotals(
          statsByQuarter,
          stats => stats.threePointFG
        );
        const freeThrows = aggregateShootingTotals(
          statsByQuarter,
          stats => stats.freeThrows
        );

        const offensiveRebounds = aggregateNumberStat(
          statsByQuarter,
          stats => stats.rebounds?.offensive || 0
        );
        const defensiveRebounds = aggregateNumberStat(
          statsByQuarter,
          stats => stats.rebounds?.defensive || 0
        );
        const assists = aggregateNumberStat(statsByQuarter, stats => stats.assists || 0);
        const steals = aggregateNumberStat(statsByQuarter, stats => stats.steals || 0);
        const blocks = aggregateNumberStat(statsByQuarter, stats => stats.blocks || 0);
        const turnovers = aggregateNumberStat(
          statsByQuarter,
          stats => stats.turnovers || 0
        );
        const fouls = aggregateNumberStat(statsByQuarter, stats => stats.fouls || 0);
        const totalPoints = calculateTotalPointsForPlayer(statsByQuarter);

        return {
          jerseyNumber: athlete.number || '-',
          name: athlete.name,
          position: athlete.position,
          fieldGoals: {
            made: fieldGoals.made,
            attempted: fieldGoals.attempted,
            percentage: formatPercentage(fieldGoals.made, fieldGoals.attempted)
          },
          twoPoint: {
            made: twoPoint.made,
            attempted: twoPoint.attempted,
            percentage: formatPercentage(twoPoint.made, twoPoint.attempted)
          },
          threePoint: {
            made: threePoint.made,
            attempted: threePoint.attempted,
            percentage: formatPercentage(threePoint.made, threePoint.attempted)
          },
          freeThrows: {
            made: freeThrows.made,
            attempted: freeThrows.attempted,
            percentage: formatPercentage(freeThrows.made, freeThrows.attempted)
          },
          rebounds: {
            offensive: offensiveRebounds,
            defensive: defensiveRebounds,
            total: offensiveRebounds + defensiveRebounds
          },
          assists,
          steals,
          blocks,
          turnovers,
          fouls,
          points: totalPoints
        };
      });

      const totals = playersForExport.reduce(
        (acc, player) => {
          acc.fieldGoals.made += player.fieldGoals.made;
          acc.fieldGoals.attempted += player.fieldGoals.attempted;
          acc.twoPoint.made += player.twoPoint.made;
          acc.twoPoint.attempted += player.twoPoint.attempted;
          acc.threePoint.made += player.threePoint.made;
          acc.threePoint.attempted += player.threePoint.attempted;
          acc.freeThrows.made += player.freeThrows.made;
          acc.freeThrows.attempted += player.freeThrows.attempted;
          acc.rebounds.offensive += player.rebounds.offensive;
          acc.rebounds.defensive += player.rebounds.defensive;
          acc.rebounds.total += player.rebounds.total;
          acc.assists += player.assists;
          acc.steals += player.steals;
          acc.blocks += player.blocks;
          acc.turnovers += player.turnovers;
          acc.fouls += player.fouls;
          acc.points += player.points;
          return acc;
        },
        {
          fieldGoals: { made: 0, attempted: 0, percentage: '0%' },
          twoPoint: { made: 0, attempted: 0, percentage: '0%' },
          threePoint: { made: 0, attempted: 0, percentage: '0%' },
          freeThrows: { made: 0, attempted: 0, percentage: '0%' },
          rebounds: { offensive: 0, defensive: 0, total: 0 },
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0,
          points: 0
        }
      );

      totals.fieldGoals.percentage = formatPercentage(
        totals.fieldGoals.made,
        totals.fieldGoals.attempted
      );
      totals.twoPoint.percentage = formatPercentage(
        totals.twoPoint.made,
        totals.twoPoint.attempted
      );
      totals.threePoint.percentage = formatPercentage(
        totals.threePoint.made,
        totals.threePoint.attempted
      );
      totals.freeThrows.percentage = formatPercentage(
        totals.freeThrows.made,
        totals.freeThrows.attempted
      );

      const html = renderGameStatsHtml({
        metadata: {
          gameName: game.gameName,
          teamName: game.teamName,
          opponentName: game.opponentName,
          date: game.date,
          seasonLabel: game.seasonLabel
        },
        quarterSummary: quarterScores.home,
        players: playersForExport,
        totals
      });

      const { uri } = await Print.printToFileAsync({ html });

      const safeTeam = game.teamName.replace(/[^a-z0-9]+/gi, '_');
      const safeOpponent = game.opponentName.replace(/[^a-z0-9]+/gi, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${safeTeam}_vs_${safeOpponent}_${timestamp}.pdf`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;

      try {
        const existing = await FileSystem.getInfoAsync(destinationUri);
        if (existing.exists) {
          await FileSystem.deleteAsync(destinationUri, { idempotent: true });
        }
      } catch (fileErr) {
        console.warn('Unable to check existing export file:', fileErr);
      }

      await FileSystem.copyAsync({ from: uri, to: destinationUri });

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(destinationUri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          'PDF Saved',
          `The stat sheet was saved to the app documents folder:\n${destinationUri}`
        );
      }
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
    if (selectedPlayerId) {
      ensureQuarterStats(selectedPlayerId, quarter);
    }
    if (selectedStatsAthlete) {
      ensureQuarterStats(selectedStatsAthlete.id, quarter);
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
    ensureQuarterStats(athlete.id, currentQuarter);
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
      const athleteStats = prev[selectedStatsAthlete.id] ?? {};
      const currentQuarterStats =
        athleteStats[currentQuarter] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          [currentQuarter]: {
            ...currentQuarterStats,
            [statKey]: {
              ...currentQuarterStats[statKey],
              [field]: value
            }
          }
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id, currentQuarter);
  };

  const handleReboundingStatsUpdate = (
    field: 'offensive' | 'defensive',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => {
      const athleteStats = prev[selectedStatsAthlete.id] ?? {};
      const currentQuarterStats =
        athleteStats[currentQuarter] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          [currentQuarter]: {
            ...currentQuarterStats,
            rebounds: {
              ...currentQuarterStats.rebounds,
              [field]: value
            }
          }
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id, currentQuarter);
  };

  const handleOtherStatsUpdate = (
    field: 'assists' | 'steals' | 'blocks' | 'turnovers' | 'fouls',
    value: number
  ) => {
    if (!selectedStatsAthlete) return;

    setPlayerStats(prev => {
      const athleteStats = prev[selectedStatsAthlete.id] ?? {};
      const currentQuarterStats =
        athleteStats[currentQuarter] ?? createEmptyPlayerStats();

      return {
        ...prev,
        [selectedStatsAthlete.id]: {
          ...athleteStats,
          [currentQuarter]: {
            ...currentQuarterStats,
            [field]: value
          }
        }
      };
    });

    // Trigger auto-save
    scheduleAutoSave(selectedStatsAthlete.id, currentQuarter);
  };

  // Unified stat update handler for RealTimeStatsTab
  const handleRealTimeStatsUpdate = (
    playerId: string,
    quarter: number,
    field: string,
    subfield: string | null,
    value: number
  ) => {
    setPlayerStats(prev => {
      const athleteStats = prev[playerId] ?? {};
      const quarterStats = athleteStats[quarter] ?? createEmptyPlayerStats();

      let updatedQuarterStats = { ...quarterStats };

      if (subfield) {
        // Handle nested fields like twoPointFG.made, rebounds.offensive
        updatedQuarterStats = {
          ...quarterStats,
          [field]: {
            ...(quarterStats[field as keyof PlayerStats] as any),
            [subfield]: value
          }
        };
      } else {
        // Handle simple fields like assists, steals
        updatedQuarterStats = {
          ...quarterStats,
          [field]: value
        };
      }

      const result = {
        ...prev,
        [playerId]: {
          ...athleteStats,
          [quarter]: updatedQuarterStats
        }
      };

      // Trigger auto-save
      scheduleAutoSave(playerId, quarter);

      return result;
    });
  };
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
        homeTeamName="Men's Division Team"
        awayTeamName="State University"
        quarterScores={quarterScores}
        isExpanded={showQuarterScores}
        onToggle={() => setShowQuarterScores(!showQuarterScores)}
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
          selectedPlayerId={selectedPlayerId}
          currentQuarter={currentQuarter}
          playerStats={playerStats}
          onPlayerSelect={(id) => {
            setSelectedPlayerId(id);
            ensureQuarterStats(id, currentQuarter);
          }}
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
