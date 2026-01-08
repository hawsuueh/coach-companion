import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useHeader } from '@/components/contexts/HeaderContext';
import { FontAwesome6 } from '@expo/vector-icons';
import GameCard from '@/components/cards/GameCard';
import FloatingButton from '@/components/buttons/FloatingButton';
import SearchBar from '@/components/inputs/SearchBar';
import {
  getGamesBySeason,
  transformDatabaseGame,
  type Game
} from '@/services/gameService';

export default function MatchupGamesScreen() {
  const router = useRouter();
  const { seasonId, matchupId } = useLocalSearchParams();
  const { setTitle } = useHeader();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Parse matchup ID to get team names for title
    if (typeof matchupId === 'string') {
      const teams = matchupId.split('-vs-');
      if (teams.length === 2) {
        const team1 = teams[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const team2 = teams[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setTitle(`${team1} vs ${team2}`);
      } else {
        setTitle('Games');
      }
    }
  }, [matchupId]);

  useFocusEffect(
    useCallback(() => {
      const fetchGames = async () => {
        try {
          setLoading(true);
          setError(null);

          if (!seasonId || typeof seasonId !== 'string') {
            setError('Invalid season ID');
            return;
          }

          if (!matchupId || typeof matchupId !== 'string') {
            setError('Invalid matchup ID');
            return;
          }

          // Parse matchup ID to get team names
          const teams = matchupId.split('-vs-');
          if (teams.length !== 2) {
            setError('Invalid matchup format');
            return;
          }

          const seasonNo = parseInt(seasonId);
          const dbGames = await getGamesBySeason(seasonNo);
          const allGames = dbGames.map(transformDatabaseGame);

          // Filter games for this specific matchup and exclude placeholders (no batch)
          const matchupGames = allGames.filter(game => {
            const gameMatchupId = `${game.teamName.toLowerCase().replace(/\s+/g, '-')}-vs-${game.opponentName.toLowerCase().replace(/\s+/g, '-')}`;
            const isRealGame = game.batchNo !== null && game.batchNo !== undefined;
            return gameMatchupId === matchupId && isRealGame;
          });

          // Sort by date
          matchupGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setGames(matchupGames);
        } catch (err) {
          console.error('Error fetching games:', err);
          setError('Failed to load games. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchGames();
    }, [seasonId, matchupId])
  );

  const handleGamePress = (game: Game) => {
    router.push(
      `/(coach)/(tabs)/athletes-module/game/${game.id}/roster` as any
    );
  };

  const filteredGames = games.filter(
    game =>
      game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGameCard = ({ item, index }: { item: Game; index: number }) => (
    <GameCard
      gameName={item.gameName}
      date={item.date}
      gameNumber={index + 1}
      customLabel={item.customGameLabel}
      onPress={() => handleGamePress(item)}
    />
  );

  return (
    <View className="flex-1">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search games..."
      />

      <View className="flex-1 px-3">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading games...</Text>
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
        ) : filteredGames.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-gray-500">
              {searchQuery
                ? 'No games found matching your search.'
                : 'No games found for this matchup.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredGames}
            renderItem={renderGameCard}
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
         onPress={() => {
           // Parse team names from matchupId for context
           const teams = typeof matchupId === 'string' ? matchupId.split('-vs-') : [];
           let playerTeam = '';
           let opponentTeam = '';
           
           if (teams.length >= 2) {
             // Convert slug back to normal text (approximate)
             playerTeam = teams[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
             opponentTeam = teams[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
           }
           
           router.push({
            pathname: '/(coach)/(tabs)/athletes-module/add-game',
            params: { 
              seasonNo: seasonId,
              playerTeam,
              opponentTeam
            }
          } as any);
         }}
        icon="plus"
        IconComponent={FontAwesome6}
      />
    </View>
  );
}
