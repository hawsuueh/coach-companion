/////////////////////////////// START OF IMPORTS /////////////
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
import supabase from '../../../../../../config/supabaseClient';
import { useHeader } from '@/components/contexts/HeaderContext';
import {
  PlayerExportRow,
  renderGameStatsHtml
} from '@/utils/export/renderGameStatsHtml';
////////////////////////////// END OF IMPORTS ////////////////

/////////////////////////////// START OF INTERFACES /////////////
// Database interfaces
interface DatabaseAthlete {
  athlete_no: number; // ex: 1
  first_name: string | null; // ex: "John"
  middle_name: string | null; // ex: "Paul"
  last_name: string | null; // ex: "Doe"
  position: string | null; // ex: "Point Guard"
  player_no: number | null; // ex: 23
}

interface DatabaseGame {
  game_no: number; // ex: 1
  date: string | null; // ex: "2024-01-15"
  time: string | null; // ex: "18:00:00"
  season_no: number | null; // ex: 6
  player_name: string | null; // ex: "Men's Division Team"
  opponent_name: string | null; // ex: "State University"
}

// This is the raw database interface for athlete_game
interface DatabaseAthleteGame {
  athlete_game_no: number; // ex: 1
  athlete_no: number; // ex: 1
  game_no: number; // ex: 1
  quarter_no: number | null; // ex: 1
  points: number | null; // ex: 15
  field_goals_made: number | null; // ex: 6
  field_goals_attempted: number | null; // ex: 12
  two_point_made: number | null; // ex: 4
  two_point_attempted: number | null; // ex: 8
  three_point_made: number | null; // ex: 2
  three_point_attempted: number | null; // ex: 4
  free_throws_made: number | null; // ex: 1
  free_throws_attempted: number | null; // ex: 2
  assists: number | null; // ex: 3
  offensive_rebounds: number | null; // ex: 2
  defensive_rebounds: number | null; // ex: 5
  steals: number | null; // ex: 2
  blocks: number | null; // ex: 1
  turnovers: number | null; // ex: 2
  fouls: number | null; // ex: 3
}

// UI-friendly version of DatabaseAthlete - restructured for better organization
interface Athlete {
  id: string; // ex: "1"
  number: string; // ex: "23"
  name: string; // ex: "John Paul Doe"
  position: string; // ex: "Point Guard"
}

// UI-friendly version of DatabaseGame - restructured for better organization
interface Game {
  id: string; // ex: "1"
  gameName: string; // ex: "Men's Division Team vs State University"
  date: string; // ex: "1/15/2024 6:00 PM"
  teamName: string;
  opponentName: string;
  seasonLabel?: string;
}

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

/////////////////////////////// START OF HELPER FUNCTIONS /////////////
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
  const seasonLabel = dbGame.season_no ? `Season ${dbGame.season_no}` : undefined;

  return {
    id: dbGame.game_no.toString(),
    gameName: gameName,
    date: formattedDate,
    teamName: playerTeam,
    opponentName: opponentTeam,
    seasonLabel
  };
};
////////////////////////////// END OF HELPER FUNCTIONS ////////////////

/////////////////////////////// START OF MAIN COMPONENT /////////////

export default function GameRecordingScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setTitle } = useHeader();
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
  // Whatever game_no you select → get all athletes in that game's roster
  const fetchRosterAthletes = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Roster')
        .select(
          `
          Athlete!inner(*) // Select the Athlete table and inner join it with the Roster table
        `
        )
        .eq('game_no', id); // join where the game_no is the same as the id

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
        const statsMap: Record<string, PlayerQuarterStats> = {};

        data.forEach((stat: DatabaseAthleteGame) => {
          const athleteId = stat.athlete_no.toString();
          const quarterNo = stat.quarter_no ? Number(stat.quarter_no) : 1;

          if (!statsMap[athleteId]) {
            statsMap[athleteId] = {};
          }

          if (!statsMap[athleteId][quarterNo]) {
            statsMap[athleteId][quarterNo] = createEmptyPlayerStats();
          }

          const currentStats = statsMap[athleteId][quarterNo];
          currentStats.totalFieldGoals.made += stat.field_goals_made || 0;
          currentStats.totalFieldGoals.attempted +=
            stat.field_goals_attempted || 0;
          currentStats.twoPointFG.made += stat.two_point_made || 0;
          currentStats.twoPointFG.attempted += stat.two_point_attempted || 0;
          currentStats.threePointFG.made += stat.three_point_made || 0;
          currentStats.threePointFG.attempted +=
            stat.three_point_attempted || 0;
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
        console.log('Loaded per-quarter stats from database:', statsMap); // Debug log
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
        athlete_no: parseInt(athleteId),
        game_no: parseInt(id),
        quarter_no: quarter,
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

      // Check if stats already exist for this athlete/game combination
      const { data: existingStats, error: checkError } = await supabase
        .from('athlete_game')
        .select('athlete_game_no')
        .eq('athlete_no', parseInt(athleteId))
        .eq('game_no', parseInt(id))
        .eq('quarter_no', quarter)
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
  ////////////////////////////// END OF EVENT HANDLERS ////////////////

  /////////////////////////////// START OF LOADING AND ERROR STATES /////////////
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold text-gray-500">
          Loading game data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="mb-4 text-center text-lg font-semibold text-red-500">
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
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
          className="rounded-lg bg-red-500 px-4 py-2"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
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
      <View>
        <Text className="mb-2 mt-2 text-center text-lg font-semibold text-black">
          {game.gameName}
        </Text>
      </View>

      {/* Quarter Selector */}
      <View className="border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <Text className="mr-3 text-sm font-medium text-gray-700">
              Quarter:
            </Text>
            <View className="flex-row space-x-1.5">
              {[1, 2, 3, 4].map(quarter => (
                <TouchableOpacity
                  key={quarter}
                  onPress={() => handleQuarterChange(quarter)}
                  className={`rounded-lg px-3 py-1.5 ${
                    currentQuarter === quarter ? 'bg-red-500' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      currentQuarter === quarter ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    Q{quarter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleReset}
            className="ml-3 rounded-lg bg-gray-900 px-3 py-1.5"
          >
            <Text className="text-sm font-medium text-white">Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quarter Scores Section */}
      <View className="px-4 py-2">
        <TouchableOpacity
          className="flex-row items-center justify-between py-2"
          onPress={() => setShowQuarterScores(!showQuarterScores)}
        >
          <Text className="text-base font-semibold text-black">
            Quarter Scores
          </Text>
          <Ionicons
            name={showQuarterScores ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#666"
          />
        </TouchableOpacity>

        {showQuarterScores && (
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
                    Men's Division Team
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
                    State University
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
                      ensureQuarterStats(athlete.id, currentQuarter);
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
              disabled={exporting}
              className={`rounded-lg border border-gray-300 px-4 py-3 ${
                exporting ? 'bg-gray-200' : 'bg-white'
              }`}
            >
              {exporting ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#DC2626" />
                  <Text className="ml-2 text-center font-medium text-gray-600">
                    Generating PDF...
                  </Text>
                </View>
              ) : (
                <Text className="text-center font-medium text-black">
                  Export PDF
                </Text>
              )}
            </TouchableOpacity>
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
                      setPlayerStats(prev => {
                        const athleteStats = prev[selectedPlayerId] ?? {};
                        const currentQuarterStats =
                          athleteStats[currentQuarter] ??
                          createEmptyPlayerStats();

                        return {
                          ...prev,
                          [selectedPlayerId]: {
                            ...athleteStats,
                            [currentQuarter]: {
                              ...currentQuarterStats,
                              twoPointFG: {
                                ...currentQuarterStats.twoPointFG,
                                [field]: value
                              }
                            }
                          }
                        };
                      });
                      // Trigger auto-save
                      scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                      setPlayerStats(prev => {
                        const athleteStats = prev[selectedPlayerId] ?? {};
                        const currentQuarterStats =
                          athleteStats[currentQuarter] ??
                          createEmptyPlayerStats();

                        return {
                          ...prev,
                          [selectedPlayerId]: {
                            ...athleteStats,
                            [currentQuarter]: {
                              ...currentQuarterStats,
                              threePointFG: {
                                ...currentQuarterStats.threePointFG,
                                [field]: value
                              }
                            }
                          }
                        };
                      });
                      // Trigger auto-save
                      scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                      setPlayerStats(prev => {
                        const athleteStats = prev[selectedPlayerId] ?? {};
                        const currentQuarterStats =
                          athleteStats[currentQuarter] ??
                          createEmptyPlayerStats();

                        return {
                          ...prev,
                          [selectedPlayerId]: {
                            ...athleteStats,
                            [currentQuarter]: {
                              ...currentQuarterStats,
                              freeThrows: {
                                ...currentQuarterStats.freeThrows,
                                [field]: value
                              }
                            }
                          }
                        };
                      });
                      // Trigger auto-save
                      scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                      setPlayerStats(prev => {
                        const athleteStats = prev[selectedPlayerId] ?? {};
                        const currentQuarterStats =
                          athleteStats[currentQuarter] ??
                          createEmptyPlayerStats();

                        return {
                          ...prev,
                          [selectedPlayerId]: {
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
                      scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                        setPlayerStats(prev => {
                          const athleteStats = prev[selectedPlayerId] ?? {};
                          const currentQuarterStats =
                            athleteStats[currentQuarter] ??
                            createEmptyPlayerStats();

                          return {
                            ...prev,
                            [selectedPlayerId]: {
                              ...athleteStats,
                              [currentQuarter]: {
                                ...currentQuarterStats,
                                assists: value
                              }
                            }
                          };
                        });
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                        console.log('Steals onUpdate called:', {
                          selectedPlayerId,
                          newValue: value,
                          currentValue:
                            playerStats[selectedPlayerId]?.[currentQuarter]?.steals || 0,
                          timestamp: new Date().toISOString()
                        });

                        setPlayerStats(prev => {
                          const athleteStats = prev[selectedPlayerId] ?? {};
                          const currentQuarterStats =
                            athleteStats[currentQuarter] ??
                            createEmptyPlayerStats();

                          const newStats = {
                            ...prev,
                            [selectedPlayerId]: {
                              ...athleteStats,
                              [currentQuarter]: {
                                ...currentQuarterStats,
                                steals: value
                              }
                            }
                          };
                          console.log('Steals state updated:', {
                            oldValue:
                              prev[selectedPlayerId]?.[currentQuarter]?.steals || 0,
                            newValue: value,
                            finalState: newStats[selectedPlayerId]
                          });
                          return newStats;
                        });

                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                        setPlayerStats(prev => {
                          const athleteStats = prev[selectedPlayerId] ?? {};
                          const currentQuarterStats =
                            athleteStats[currentQuarter] ??
                            createEmptyPlayerStats();

                          return {
                            ...prev,
                            [selectedPlayerId]: {
                              ...athleteStats,
                              [currentQuarter]: {
                                ...currentQuarterStats,
                                blocks: value
                              }
                            }
                          };
                        });
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                        setPlayerStats(prev => {
                          const athleteStats = prev[selectedPlayerId] ?? {};
                          const currentQuarterStats =
                            athleteStats[currentQuarter] ??
                            createEmptyPlayerStats();

                          return {
                            ...prev,
                            [selectedPlayerId]: {
                              ...athleteStats,
                              [currentQuarter]: {
                                ...currentQuarterStats,
                                turnovers: value
                              }
                            }
                          };
                        });
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                        setPlayerStats(prev => {
                          const athleteStats = prev[selectedPlayerId] ?? {};
                          const currentQuarterStats =
                            athleteStats[currentQuarter] ??
                            createEmptyPlayerStats();

                          return {
                            ...prev,
                            [selectedPlayerId]: {
                              ...athleteStats,
                              [currentQuarter]: {
                                ...currentQuarterStats,
                                fouls: value
                              }
                            }
                          };
                        });
                        // Trigger auto-save
                        scheduleAutoSave(selectedPlayerId, currentQuarter);
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
                  onUpdate={handleShootingStatsUpdate}
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
                  onUpdate={handleReboundingStatsUpdate}
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
                  onUpdate={handleOtherStatsUpdate}
                />

                {/* Add Button */}
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-lg bg-red-500 px-6 py-4"
                  onPress={() => {
                    if (
                      selectedStatsAthlete &&
                      playerStats[selectedStatsAthlete.id]?.[currentQuarter]
                    ) {
                      saveStatsToDatabase(
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
      )}
    </View>
  );
  ////////////////////////////// END OF JSX RETURN ////////////////
}
////////////////////////////// END OF MAIN COMPONENT ////////////////
