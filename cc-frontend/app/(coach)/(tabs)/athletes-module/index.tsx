import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, View, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AthleteCard from '@/components/cards/AthleteCard';
import FloatingActionButton from '@/components/buttons/FloatingActionButton';
import GameCard from '@/components/cards/GameCard';
import Header from '@/components/headers/Header';
import SearchBar from '@/components/inputs/SearchBar';
import SubTab from '@/components/navigations/SUBTAB';
import supabase from '@/config/supabaseClient';

interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

interface DatabaseAthlete {
  athlete_no: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  position: string | null;
  player_no: number | null;
}

interface Game {
  id: string;
  gameName: string;
  date: string;
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

const MOCK_GAMES: Game[] = [
  {
    id: '1',
    gameName: 'UNC Basketball Team vs State University',
    date: 'Oct 15, 2025'
  },
  { id: '2', gameName: 'Game 2', date: 'Date' },
  { id: '3', gameName: 'Game 3', date: 'Date' },
  { id: '4', gameName: 'Game 4', date: 'Date' },
  { id: '5', gameName: 'Game 5', date: 'Date' },
  { id: '6', gameName: 'Game 6', date: 'Date' }
];

export default function AthleteScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('athletes');
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const athleteTabs = [
    { id: 'athletes', label: 'Athletes' },
    { id: 'games', label: 'Games' }
  ];

  // Fetch athletes from database
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, fetch all athletes. Later we can add batch filtering
        const { data, error: fetchError } = await supabase
          .from('Athlete')
          .select('*')
          .order('athlete_no', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const transformedAthletes = data.map(transformDatabaseAthlete);
          setAthletes(transformedAthletes);
        }
      } catch (err) {
        console.error('Error fetching athletes:', err);
        setError('Failed to load athletes. Please try again.');
        // Fallback to empty array or show error state
        setAthletes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  // Function to refresh athlete data
  const refreshAthletes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Athlete')
        .select('*')
        .order('athlete_no', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const transformedAthletes = data.map(transformDatabaseAthlete);
        setAthletes(transformedAthletes);
      }
    } catch (err) {
      console.error('Error refreshing athletes:', err);
      setError('Failed to refresh athletes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch athletes by batch (for future use)
  const fetchAthletesByBatch = async (batchNo: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('athlete_batch')
        .select(
          `
          Athlete!inner(*)
        `
        )
        .eq('batch_no', batchNo);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const athletes = data.map((item: any) => item.Athlete).filter(Boolean);
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setAthletes(transformedAthletes);
      }
    } catch (err) {
      console.error('Error fetching athletes by batch:', err);
      setError('Failed to load athletes for this batch. Please try again.');
      setAthletes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleAthletePress = (athlete: Athlete) => {
    console.log('Athlete pressed:', athlete.name);
    // Navigate to athlete detail screen
    router.push(`/(coach)/(tabs)/athletes-module/${athlete.id}` as any);
  };

  const handleAddAthlete = () => {
    console.log('Add athlete pressed');
    // TODO: Navigate to add athlete screen when created
    // router.push('/(coach)/(tabs)/athletes-module/add-athlete' as any);
    alert('Add Athlete functionality coming soon!');
  };

  const handleAddGame = () => {
    console.log('Add game pressed');
    // TODO: Navigate to add game screen when created
    // router.push('/(coach)/(tabs)/athletes-module/add-game' as any);
    alert('Add Game functionality coming soon!');
  };

  const handleGamePress = (game: Game) => {
    console.log('Game pressed:', game.gameName);
    // Navigate to team roster screen for this specific game
    router.push(
      `/(coach)/(tabs)/athletes-module/game/${game.id}/roster` as any
    );
  };

  const filteredAthletes = athletes.filter(
    athlete =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.number.includes(searchQuery) ||
      athlete.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGames = games.filter(
    game =>
      game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAthleteCard = ({ item }: { item: Athlete }) => (
    <AthleteCard
      playerNumber={item.number}
      playerName={item.name}
      position={item.position}
      onPress={() => handleAthletePress(item)}
    />
  );

  const renderGameCard = ({ item }: { item: Game }) => (
    <GameCard
      gameName={item.gameName}
      date={item.date}
      onPress={() => handleGamePress(item)}
    />
  );

  return (
    <View className="flex-1" style={{ position: 'relative' }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        {/* Header Section - Using reusable Header component */}
        <Header
          title="Athletes & Games"
          onNotificationPress={handleNotificationPress}
        />

        {/* Tab Navigation - Using reusable SubTab component */}
        <SubTab
          tabs={athleteTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Search and Filter Section - Using reusable SearchBar component */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={handleFilterPress}
        />

        {/* Athlete/Game List */}
        <View className="flex-1 px-3">
          {activeTab === 'athletes' ? (
            <>
              {loading ? (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-gray-500">Loading athletes...</Text>
                </View>
              ) : error ? (
                <View className="flex-1 items-center justify-center px-4">
                  <Text className="mb-4 text-center text-red-500">{error}</Text>
                  <TouchableOpacity
                    onPress={refreshAthletes}
                    className="rounded-lg bg-red-500 px-4 py-2"
                  >
                    <Text className="font-semibold text-white">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredAthletes.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-center text-gray-500">
                    {searchQuery
                      ? 'No athletes found matching your search.'
                      : 'No athletes found.'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredAthletes}
                  renderItem={renderAthleteCard}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingBottom: 100,
                    paddingHorizontal: 8
                  }}
                  refreshing={loading}
                  onRefresh={refreshAthletes}
                />
              )}
            </>
          ) : (
            <FlatList
              data={filteredGames}
              renderItem={renderGameCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 8
              }}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={activeTab === 'athletes' ? 'person-add' : 'add'}
        onPress={activeTab === 'athletes' ? handleAddAthlete : handleAddGame}
        color="#FF0000"
        size="medium"
        position="bottom-right"
      />
    </View>
  );
}
