import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useHeader } from '@/components/contexts/HeaderContext';
import { getAthleteGameStatsHistory, AggregatedGameStats } from '@/services/statsService';
import supabase from '@/config/supabaseClient';
import { useState } from 'react';

// Mock data - in the future this will come from Supabase
const MOCK_ATHLETES = {
  '1': { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  '2': { id: '2', number: '7', name: 'Mike Johnson', position: 'Midfielder' },
  '3': { id: '3', number: '23', name: 'David Wilson', position: 'Defender' },
  '4': { id: '4', number: '1', name: 'Tom Brown', position: 'Goalkeeper' },
  '5': { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  '6': { id: '6', number: '4', name: 'Chris Miller', position: 'Defender' },
  '7': { id: '7', number: '8', name: 'Ryan Taylor', position: 'Midfielder' },
  '8': { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
};

// Mock game statistics data
const MOCK_GAME_STATS = {
  '1': {
    totalFieldGoal: { percentage: 42.86, made: 6, attempted: 14 },
    twoPointFieldGoal: { percentage: 33.33, made: 3, attempted: 9 },
    threePointFieldGoal: { percentage: 80.0, made: 3, attempted: 5 },
    totalPoints: 19,
    assist: 8,
    steal: 0,
    block: 3
  },
  '2': {
    totalFieldGoal: { percentage: 50.0, made: 8, attempted: 16 },
    twoPointFieldGoal: { percentage: 45.45, made: 5, attempted: 11 },
    threePointFieldGoal: { percentage: 60.0, made: 3, attempted: 5 },
    totalPoints: 22,
    assist: 5,
    steal: 2,
    block: 1
  }
};



export default function GameRecordsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setTitle } = useHeader();
  
  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState('Athlete');
  const [athletePosition, setAthletePosition] = useState('');
  const [gameStats, setGameStats] = useState<AggregatedGameStats[]>([]);

  useEffect(() => {
    setTitle('Game Records');
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      // 1. Fetch Athlete Details
      const { data: athleteData } = await supabase
        .from('Athlete')
        .select('first_name, last_name, position')
        .eq('athlete_no', id)
        .single();
        
      if (athleteData) {
        setAthleteName(`${athleteData.first_name} ${athleteData.last_name}`);
        setAthletePosition(athleteData.position || '');
      }

      // 2. Fetch Game History
      const history = await getAthleteGameStatsHistory(parseInt(id as string));
      setGameStats(history);
      
    } catch (error) {
      console.error('Error loading game records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (made: number, attempted: number) => {
    if (!attempted || attempted === 0) return 0;
    return (made / attempted) * 100;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading records...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Player Information Section */}
        <View
          className="mx-4 mt-4 rounded-xl bg-white p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5
          }}
        >
          <View className="items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
              <Ionicons name="person" size={48} color="#666" />
            </View>
            <Text className="mb-1 text-2xl font-bold text-black">
              {athleteName}
            </Text>
            <Text className="text-lg text-gray-600">{athletePosition}</Text>
          </View>
        </View>

        {/* Start of Game Loop */}
        {gameStats.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-gray-500">No game records found.</Text>
          </View>
        ) : (
          gameStats.map((game) => {
            // Calculate Percentages
            const fgPct = calculatePercentage(game.field_goals_made, game.field_goals_attempted);
            const twoPtPct = calculatePercentage(game.two_point_made, game.two_point_attempted);
            const threePtPct = calculatePercentage(game.three_point_made, game.three_point_attempted);
            const ftPct = calculatePercentage(game.free_throws_made, game.free_throws_attempted);

            return (
              <View
                key={game.gameId}
                className="mx-4 mt-6 rounded-2xl bg-white mb-2 overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5
                }}
              >
                {/* Header: Date & Opponent */}
                <View className="bg-gray-900 px-5 py-3 flex-row justify-between items-center">
                  <Text className="text-white font-bold text-lg">VS {game.opponentName}</Text>
                  <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">{new Date(game.date).toLocaleDateString()}</Text>
                </View>

                {/* Hero Section: Points & Quarter Breakdown */}
                <View className="items-center py-6 bg-gray-50 border-b border-gray-100">
                  <Text className="text-5xl font-extrabold text-black tracking-tighter">{game.points}</Text>
                  <Text className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Total Points</Text>
                  
                  {/* Quarter Strip */}
                  <View className="flex-row gap-2 mt-2">
                     <View className="items-center px-3 py-1 bg-white rounded-lg border border-gray-200">
                       <Text className="text-[10px] text-gray-400 font-bold">Q1</Text>
                       <Text className="text-sm font-bold text-gray-800">{game.quarterPoints.q1}</Text>
                     </View>
                     <View className="items-center px-3 py-1 bg-white rounded-lg border border-gray-200">
                       <Text className="text-[10px] text-gray-400 font-bold">Q2</Text>
                       <Text className="text-sm font-bold text-gray-800">{game.quarterPoints.q2}</Text>
                     </View>
                     <View className="items-center px-3 py-1 bg-white rounded-lg border border-gray-200">
                       <Text className="text-[10px] text-gray-400 font-bold">Q3</Text>
                       <Text className="text-sm font-bold text-gray-800">{game.quarterPoints.q3}</Text>
                     </View>
                     <View className="items-center px-3 py-1 bg-white rounded-lg border border-gray-200">
                       <Text className="text-[10px] text-gray-400 font-bold">Q4</Text>
                       <Text className="text-sm font-bold text-gray-800">{game.quarterPoints.q4}</Text>
                     </View>
                  </View>
                </View>

                {/* Action Grid: Major Stats */}
                <View className="flex-row border-b border-gray-100">
                  {/* AST */}
                  <View className="flex-1 items-center py-4 border-r border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800">{game.assists}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">AST</Text>
                  </View>
                  {/* REB */}
                  <View className="flex-1 items-center py-4 border-r border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800">{game.rebounds}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">REB</Text>
                  </View>
                  {/* STL */}
                  <View className="flex-1 items-center py-4 border-r border-gray-100">
                    <Text className="text-2xl font-bold text-gray-800">{game.steals}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">STL</Text>
                  </View>
                  {/* BLK */}
                  <View className="flex-1 items-center py-4">
                    <Text className="text-2xl font-bold text-gray-800">{game.blocks}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">BLK</Text>
                  </View>
                </View>

                {/* Shooter's Corner: Detailed Percentages */}
                <View className="p-5">
                  <Text className="text-xs text-gray-400 font-bold uppercase mb-3">Shooting Splits</Text>
                  
                  {/* Grid for Shooting Stats */}
                  <View className="flex-row justify-between">
                     <View>
                        <Text className="text-sm font-bold text-gray-800 mb-1">Field Goals</Text>
                        <Text className="text-xs text-gray-500">{game.field_goals_made}/{game.field_goals_attempted} <Text className={fgPct >= 50 ? "text-green-600 font-bold" : "text-gray-400"}>({fgPct.toFixed(0)}%)</Text></Text>
                     </View>

                     <View>
                        <Text className="text-sm font-bold text-gray-800 mb-1">3-Pointers</Text>
                        <Text className="text-xs text-gray-500">{game.three_point_made}/{game.three_point_attempted} <Text className={threePtPct >= 35 ? "text-green-600 font-bold" : "text-gray-400"}>({threePtPct.toFixed(0)}%)</Text></Text>
                     </View>

                     <View>
                        <Text className="text-sm font-bold text-gray-800 mb-1">Free Throws</Text>
                        <Text className="text-xs text-gray-500">{game.free_throws_made}/{game.free_throws_attempted} <Text className={ftPct >= 70 ? "text-green-600 font-bold" : "text-gray-400"}>({ftPct.toFixed(0)}%)</Text></Text>
                     </View>
                  </View>

                  {/* Secondary Stats Row (To, PF) */}
                  <View className="flex-row mt-4 pt-4 border-t border-dashed border-gray-100">
                     <Text className="text-xs text-gray-400 mr-4">Turnovers: <Text className="text-gray-700 font-bold">{game.turnovers}</Text></Text>
                     <Text className="text-xs text-gray-400">Fouls: <Text className="text-gray-700 font-bold">{game.fouls}</Text></Text>
                  </View>
                </View>

              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
