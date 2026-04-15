import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import MatchupCard from '@/components/cards/MatchupCard';
import FloatingButton from '@/components/buttons/FloatingButton';
import SearchBar from '@/components/inputs/SearchBar';
import {
  getGamesBySeason,
  transformDatabaseGame,
  groupGamesByMatchup,
  type Matchup
} from '@/services/gameService';

export default function SeasonMatchupsScreen() {
  const router = useRouter();
  const { seasonId } = useLocalSearchParams();
  const { setTitle } = useHeader();
  const { coachNo } = useAuth();

  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTitle('Matchups');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchMatchups = async () => {
        try {
          setLoading(true);
          setError(null);

          if (!seasonId || typeof seasonId !== 'string') {
            setError('Invalid season ID');
            return;
          }

          const seasonNo = parseInt(seasonId);
          const dbGames = await getGamesBySeason(seasonNo);
          const games = dbGames.map(transformDatabaseGame);
          const groupedMatchups = groupGamesByMatchup(games);

          setMatchups(groupedMatchups);
        } catch (err) {
          console.error('Error fetching matchups:', err);
          setError('Failed to load matchups. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchMatchups();
    }, [seasonId])
  );

  const handleMatchupPress = (matchup: Matchup) => {
    router.push(
      `/(coach)/(tabs)/athletes-module/seasons/${seasonId}/matchups/${matchup.id}` as any
    );
  };

  const filteredMatchups = matchups.filter(
    matchup =>
      matchup.playerTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matchup.opponentTeam.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMatchupCard = ({ item }: { item: Matchup }) => (
    <MatchupCard
      playerTeam={item.playerTeam}
      opponentTeam={item.opponentTeam}
      gameCount={item.gameCount}
      onPress={() => handleMatchupPress(item)}
    />
  );

  return (
    <View className="flex-1">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search matchups..."
      />

      <View className="flex-1 px-3">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading matchups...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="mb-4 text-center text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-lg bg-red-500 px-4 py-2"
            >
              <Text className="font-semibold text-white">Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : filteredMatchups.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">
              {searchQuery
                ? 'No matchups found matching your search.'
                : 'No games found for this season.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredMatchups}
            renderItem={renderMatchupCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: 8
            }}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <FloatingButton
        onPress={() => router.push({
          pathname: '/(coach)/(tabs)/athletes-module/add-matchup',
          params: { seasonNo: seasonId }
        } as any)}
        icon="plus"
        IconComponent={FontAwesome6}
      />
    </View>
  );
}
