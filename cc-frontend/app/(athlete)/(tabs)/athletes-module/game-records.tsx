import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAthleteGameStatsHistory, type AggregatedGameStats } from '@/services/statsService';
import supabase from '@/config/supabaseClient';

export default function AthleteGameRecordsScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { athleteNo, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState('My Athlete');
  const [athletePosition, setAthletePosition] = useState('');
  const [gameStats, setGameStats] = useState<AggregatedGameStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('My Game Records');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!athleteNo) {
        setError('No athlete profile associated with this account.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch Athlete Details
        const { data: athleteData } = await supabase
          .from('Athlete')
          .select('first_name, last_name, position')
          .eq('athlete_no', athleteNo)
          .single();
          
        if (athleteData) {
          setAthleteName(`${athleteData.first_name || ''} ${athleteData.last_name || ''}`.trim() || 'My Athlete');
          setAthletePosition(athleteData.position || '');
        }

        // 2. Fetch Game History
        const history = await getAthleteGameStatsHistory(athleteNo);
        setGameStats(history);
        
      } catch (error) {
        console.error('Error loading game records:', error);
        setError('Failed to load your game history.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [athleteNo, authLoading]);

  const calculatePercentage = (made: number, attempted: number) => {
    if (!attempted || attempted === 0) return 0;
    return (made / attempted) * 100;
  };

  if (loading || authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-500 font-medium">Loading your records...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-lg font-semibold text-gray-800">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Player Information Section */}
        <View className="bg-white px-6 py-10 items-center shadow-sm">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
            <Ionicons name="person" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{athleteName}</Text>
          <Text className="mt-1 text-lg text-gray-500 font-medium">{athletePosition}</Text>
        </View>

        {/* Game History List */}
        <View className="px-4 py-6">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
            Game History
          </Text>

          {gameStats.length === 0 ? (
            <View className="items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
              <Ionicons name="stats-chart-outline" size={48} color="#D1D5DB" />
              <Text className="mt-4 text-gray-500 font-medium">No game records available yet.</Text>
            </View>
          ) : (
            gameStats.map((game) => {
              const fgPct = calculatePercentage(game.field_goals_made, game.field_goals_attempted);
              const threePtPct = calculatePercentage(game.three_point_made, game.three_point_attempted);
              const ftPct = calculatePercentage(game.free_throws_made, game.free_throws_attempted);

              return (
                <View
                  key={game.gameId}
                  className="mb-6 rounded-2xl bg-white overflow-hidden shadow-sm border border-gray-100"
                >
                  {/* Header: Date & Opponent */}
                  <View className="bg-gray-900 px-5 py-3 flex-row justify-between items-center">
                    <Text className="text-white font-bold">VS {game.opponentName}</Text>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      {new Date(game.date).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Hero Section: Points & Quarter Breakdown */}
                  <View className="items-center py-6 bg-gray-50 border-b border-gray-100">
                    <Text className="text-5xl font-extrabold text-gray-900 tracking-tighter">{game.points}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Total Points</Text>
                    
                    {/* Quarter Strip */}
                    <View className="flex-row gap-2">
                       {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
                         const qPoint = game.quarterPoints[`q${i+1}` as keyof typeof game.quarterPoints];
                         return (
                           <View key={q} className="items-center px-4 py-2 bg-white rounded-xl border border-gray-200">
                             <Text className="text-[10px] text-gray-400 font-bold">{q}</Text>
                             <Text className="text-sm font-bold text-gray-800">{qPoint}</Text>
                           </View>
                         );
                       })}
                    </View>
                  </View>

                  {/* Major Stats Bar */}
                  <View className="flex-row border-b border-gray-100">
                    {[
                      { l: 'AST', v: game.assists },
                      { l: 'REB', v: game.rebounds },
                      { l: 'STL', v: game.steals },
                      { l: 'BLK', v: game.blocks }
                    ].map((s, i) => (
                      <View key={s.l} className={`flex-1 items-center py-4 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                        <Text className="text-2xl font-bold text-gray-800">{s.v}</Text>
                        <Text className="text-[10px] text-gray-400 font-bold uppercase">{s.l}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Detailed Splits */}
                  <View className="p-5">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Shooting Analytics</Text>
                    
                    <View className="flex-row justify-between">
                       <View>
                          <Text className="text-xs font-bold text-gray-400 mb-1">FG%</Text>
                          <Text className="text-sm font-bold text-gray-800">{fgPct.toFixed(0)}%</Text>
                          <Text className="text-[10px] text-gray-500">{game.field_goals_made}/{game.field_goals_attempted}</Text>
                       </View>

                       <View>
                          <Text className="text-xs font-bold text-gray-400 mb-1">3P%</Text>
                          <Text className="text-sm font-bold text-gray-800">{threePtPct.toFixed(0)}%</Text>
                          <Text className="text-[10px] text-gray-500">{game.three_point_made}/{game.three_point_attempted}</Text>
                       </View>

                       <View>
                          <Text className="text-xs font-bold text-gray-400 mb-1">FT%</Text>
                          <Text className="text-sm font-bold text-gray-800">{ftPct.toFixed(0)}%</Text>
                          <Text className="text-[10px] text-gray-500">{game.free_throws_made}/{game.free_throws_attempted}</Text>
                       </View>
                    </View>

                    {/* Secondary Metrics */}
                    <View className="flex-row mt-5 pt-4 border-t border-gray-50">
                       <View className="mr-6 flex-row items-baseline">
                         <Text className="text-[10px] text-gray-400 font-bold mr-1">T.O:</Text>
                         <Text className="text-xs font-bold text-gray-700">{game.turnovers}</Text>
                       </View>
                       <View className="flex-row items-baseline">
                         <Text className="text-[10px] text-gray-400 font-bold mr-1">FOULS:</Text>
                         <Text className="text-xs font-bold text-gray-700">{game.fouls}</Text>
                       </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
