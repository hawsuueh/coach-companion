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
import supabase from '../../../../../../config/supabaseClient';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
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
  batch_no: number | null; // ex: 1 - FK to Batch table
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

      // First get the game
      const { data: gameData, error: fetchError } = await supabase
        .from('Game')
        .select('*')
        .eq('game_no', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!gameData || !gameData.batch_no) {
        setError('Game does not belong to any batch');
        return;
      }

      // Validate that the batch belongs to this coach
      const { data: batchData, error: batchError } = await supabase
        .from('Batch')
        .select('coach_no')
        .eq('batch_no', gameData.batch_no)
        .eq('coach_no', coachNo)
        .single();

      if (batchError || !batchData) {
        setError('Game does not belong to your batches');
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
      const { data, error } = await supabase // take note that the "data" is an array of RECORDS from the SUPABASE
        .from('athlete_game')
        .select('*')
        .eq('game_no', id); // this id represent the id of the game in the database

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Transform database stats to UI format

       
        
        const athleteStatsContainer: Record<string, PlayerQuarterStats> = {};
        // TypeScript type definition - Says "this will be an object with:"
       // Keys: strings (player IDs like "5", "7") <- this is the key of the object
       //Values: PlayerQuarterStats objects (which are Record<number, PlayerStats>) <- this is the value of the object

        data.forEach((stat: DatabaseAthleteGame) => {
          const athleteId = stat.athlete_no.toString(); //  this is the part where we extract the "STAT_ATHLETE_NO" from the supabase 'athlete_game' -> convert it to string -> becomes "athleteId" Ex. "5"
          const quarterNo = stat.quarter_no ? Number(stat.quarter_no) : 1; // this is the part where we extract the "STAT_QUARTER_NO" from the supabase 'athlete_game' -> convert it to number -> becomes "quarterNo" Ex. 1

         // NOTES:
        // Step-by-Step for each item in the data array:

        // Iteration 1: stat = { athlete_no: 5, quarter_no: 1, assists: 3, ... }
        // Extract: athleteId = "5", quarterNo = 1
        // Create container for player 5 if needed
        // Create quarter 1 for player 5 if needed
        // Add the stats: assists: 3, etc.

        // Iteration 2: stat = { athlete_no: 5, quarter_no: 2, assists: 5, ... }
        // Extract: athleteId = "5", quarterNo = 2
        // Player 5 already exists (from iteration 1)
        // Create quarter 2 for player 5

        // Iteration 3: stat = { athlete_no: 7, quarter_no: 1, assists: 2, ... }
        // Extract: athleteId = "7", quarterNo = 1
        // Create container for player 7
        // Create quarter 1 for player 7
        // Add the stats: assists: 2, etc.


          // Before: athleteStatsContainer = {}
          // After:  athleteStatsContainer = { "5": {} }  ← Now player 5 has a spot!
          if (!athleteStatsContainer[athleteId]) { // This line is NOT checking Supabase. It's checking the local container (athleteStatsContainer) you're building if this player ID has a data or entry stats for this GAME NO. 
            athleteStatsContainer[athleteId] = {}; // IF no, create this structure: { "5": {} }
          }


          // NOTES: example iteration 1:
          // Iteration 1: Player 5, Quarter 1
          // athleteStatsContainer["5"] exists? NO → Create it!
          // athleteStatsContainer = { "5": {} }


          // Iteration 2: Player 5, Quarter 2  
          // athleteStatsContainer["5"] exists? YES → Skip this, don't create again!
          // athleteStatsContainer = { "5": { 1: {...} } }  // Already has player 5

          // Iteration 3: Player 7, Quarter 1
          // athleteStatsContainer["7"] exists? NO → Create it!
          // athleteStatsContainer = { "5": {...}, "7": {} }



          // Before: athleteStatsContainer = { "5": {} }
          // After:  athleteStatsContainer = { "5": { 2: { assists: 0, steals: 0, ... } } }
          if (!athleteStatsContainer[athleteId][quarterNo]) { // checks if this player 5 have a data or entry stats for this QUARTER NO (5). 
            athleteStatsContainer[athleteId][quarterNo] = createEmptyPlayerStats();
          }


          // NOTES:
          // Then after all the checking and creating the structure, we can now add the stats with the actual data from the supabase 'athlete_game' table
          const currentStats = athleteStatsContainer[athleteId][quarterNo];
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

        setPlayerStats(athleteStatsContainer);
        console.log('Loaded per-quarter stats from database:', athleteStatsContainer); // Debug log


        //NOTES:
        // BEFORE (raw data from Supabase athlete_game table):
        // [
        //   {
        //     athlete_game_no: 1,
        //     athlete_no: 5, <- this becomes the key "5" in the playerStats object
        //     game_no: 1,
        //     quarter_no: 2, <- this becomes the key "2" in the playerStats object
        //     ...
        //   },
        // ]
        // AFTER (transformed or organized data in the playerStats object):
        // {
        //   "5": { 
        //     2: { assists: 0, steals: 0, ... }
        //   }
        // }


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
