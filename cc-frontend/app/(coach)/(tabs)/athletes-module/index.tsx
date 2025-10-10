/////////////////////////////// START OF IMPORTS /////////////
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, Modal } from 'react-native';
import AthleteCard from '@/components/cards/AthleteCard';
import FloatingButton from '@/components/buttons/FloatingButton';
import GameCard from '@/components/cards/GameCard';
import SearchBar from '@/components/inputs/SearchBar';
import SubTab from '@/components/navigations/SUBTAB';
import supabase from '@/config/supabaseClient';
////////////////////////////// END OF IMPORTS ////////////////

/////////////////////////////// START OF INTERFACES /////////////
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

interface Batch {
  batch_no: number;
  start_date: string | null;
  end_date: string | null;
}

interface Game {
  id: string;
  gameName: string;
  date: string;
}

interface DatabaseGame {
  game_no: number;
  date: string | null;
  time: string | null;
  season_no: number | null;
  player_name: string | null;
  opponent_name: string | null;
}
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

  // Create game name using player_name and opponent_name
  const playerTeam = dbGame.player_name || 'Your Team';
  const opponentTeam = dbGame.opponent_name || 'TBD';
  const gameName = `${playerTeam} vs ${opponentTeam}`;

  return {
    id: dbGame.game_no.toString(),
    gameName: gameName,
    date: formattedDate
  };
};
////////////////////////////// END OF HELPER FUNCTIONS ////////////////

/////////////////////////////// START OF MAIN COMPONENT /////////////

export default function AthleteScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('athletes');
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);

  const athleteTabs = [
    { id: 'athletes', label: 'Athletes' },
    { id: 'games', label: 'Games' }
  ];
  ////////////////////////////// END OF STATE AND CONFIGURATION ////////////////

  /////////////////////////////// START OF UTILITY FUNCTIONS /////////////
  // Helper function to determine current batch based on today's date
  const getCurrentBatch = (batches: Batch[]): Batch | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return (
      batches.find(batch => {
        if (!batch.start_date || !batch.end_date) return false;

        const startDate = new Date(batch.start_date);
        const endDate = new Date(batch.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return today >= startDate && today <= endDate;
      }) || null
    );
  };
  ////////////////////////////// END OF UTILITY FUNCTIONS ////////////////

  /////////////////////////////// START OF DATA FETCHING FUNCTIONS /////////////
  // Fetch batches from database
  const fetchBatches = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Batch')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setBatches(data);
        // Auto-select current batch if available
        const currentBatch = getCurrentBatch(data);
        setSelectedBatch(currentBatch);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  // Fetch games from database
  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      setGamesError(null);

      const { data, error: fetchError } = await supabase
        .from('Game')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const transformedGames = data.map(transformDatabaseGame);
        setGames(transformedGames);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setGamesError('Failed to load games. Please try again.');
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  // Function to refresh athlete data
  const refreshAthletes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedBatch) {
        // Fetch athletes for selected batch using athlete_batch junction table
        const { data, error: fetchError } = await supabase
          .from('athlete_batch')
          .select(
            `
            Athlete!inner(*)
          `
          )
          .eq('batch_no', selectedBatch.batch_no);

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const athletes = data
            .map((item: any) => item.Athlete)
            .filter(Boolean);
          const transformedAthletes = athletes.map(transformDatabaseAthlete);
          setAthletes(transformedAthletes);
        }
      } else {
        // If no batch selected, fetch all athletes
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
      }
    } catch (err) {
      console.error('Error refreshing athletes:', err);
      setError('Failed to refresh athletes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  ////////////////////////////// END OF DATA FETCHING FUNCTIONS ////////////////

  /////////////////////////////// START OF USE EFFECTS /////////////
  // Fetch athletes from database with batch filtering
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedBatch) {
          // Fetch athletes for selected batch using athlete_batch junction table
          const { data, error: fetchError } = await supabase
            .from('athlete_batch')
            .select(
              `
              Athlete!inner(*)
            `
            )
            .eq('batch_no', selectedBatch.batch_no);

          if (fetchError) {
            throw fetchError;
          }

          if (data) {
            const athletes = data
              .map((item: any) => item.Athlete)
              .filter(Boolean);
            const transformedAthletes = athletes.map(transformDatabaseAthlete);
            setAthletes(transformedAthletes);
          }
        } else {
          // If no batch selected, fetch all athletes
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
        }
      } catch (err) {
        console.error('Error fetching athletes:', err);
        setError('Failed to load athletes. Please try again.');
        setAthletes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, [selectedBatch]);

  // Fetch batches and games on component mount
  useEffect(() => {
    fetchBatches();
    fetchGames();
  }, []);
  ////////////////////////////// END OF USE EFFECTS ////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleFilterPress = () => {
    setShowBatchModal(true);
  };

  const handleBatchSelect = (batch: Batch | null) => {
    setSelectedBatch(batch);
    setShowBatchModal(false);
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
  ////////////////////////////// END OF EVENT HANDLERS ////////////////

  /////////////////////////////// START OF FILTER LOGIC /////////////
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
  ////////////////////////////// END OF FILTER LOGIC ////////////////

  /////////////////////////////// START OF RENDER FUNCTIONS /////////////
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
  ////////////////////////////// END OF RENDER FUNCTIONS ////////////////

  /////////////////////////////// START OF JSX RETURN /////////////
  return (
    <View className="flex-1" style={{ position: 'relative' }}>
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
        filterType="batch"
        placeholder="Search athletes..."
      />

      {/* Batch Selection Indicator */}
      {selectedBatch && (
        <View className="mx-3 mb-2 rounded-lg bg-red-50 p-2">
          <Text className="text-center text-sm text-red-600">
            Showing athletes from Batch {selectedBatch.batch_no}
            {selectedBatch.start_date && selectedBatch.end_date && (
              <Text className="text-red-500">
                {' '}
                ({new Date(
                  selectedBatch.start_date
                ).toLocaleDateString()} -{' '}
                {new Date(selectedBatch.end_date).toLocaleDateString()})
              </Text>
            )}
          </Text>
        </View>
      )}

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
          <>
            {gamesLoading ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">Loading games...</Text>
              </View>
            ) : gamesError ? (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="mb-4 text-center text-red-500">
                  {gamesError}
                </Text>
                <TouchableOpacity
                  onPress={fetchGames}
                  className="rounded-lg bg-red-500 px-4 py-2"
                >
                  <Text className="font-semibold text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredGames.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-gray-500">
                  {searchQuery
                    ? 'No games found matching your search.'
                    : 'No games found.'}
                </Text>
              </View>
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
                refreshing={gamesLoading}
                onRefresh={fetchGames}
              />
            )}
          </>
        )}
      </View>

      {/* Floating Action Button */}
      {/* Floating Button */}
      <FloatingButton
        onPress={activeTab === 'athletes' ? handleAddAthlete : handleAddGame}
        icon="add"
        IconComponent={FontAwesome6}
      />

      {/* Batch Selection Modal */}
      <Modal
        visible={showBatchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-80 rounded-xl bg-white p-6">
            <Text className="mb-4 text-center text-lg font-semibold">
              Select Batch
            </Text>

            {/* All Athletes Option */}
            <TouchableOpacity
              onPress={() => handleBatchSelect(null)}
              className={`mb-3 rounded-lg p-3 ${
                selectedBatch === null ? 'bg-red-100' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  selectedBatch === null ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                All Athletes
              </Text>
            </TouchableOpacity>

            {/* Batch Options */}
            {batches.map(batch => (
              <TouchableOpacity
                key={batch.batch_no}
                onPress={() => handleBatchSelect(batch)}
                className={`mb-3 rounded-lg p-3 ${
                  selectedBatch?.batch_no === batch.batch_no
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedBatch?.batch_no === batch.batch_no
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}
                >
                  Batch {batch.batch_no}
                </Text>
                {batch.start_date && batch.end_date && (
                  <Text
                    className={`text-center text-sm ${
                      selectedBatch?.batch_no === batch.batch_no
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(batch.start_date).toLocaleDateString()} -{' '}
                    {new Date(batch.end_date).toLocaleDateString()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowBatchModal(false)}
              className="mt-4 rounded-lg bg-gray-200 p-3"
            >
              <Text className="text-center font-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
  ////////////////////////////// END OF JSX RETURN ////////////////
}
////////////////////////////// END OF MAIN COMPONENT ////////////////
