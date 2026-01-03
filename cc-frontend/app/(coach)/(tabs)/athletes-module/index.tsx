/////////////////////////////// START OF IMPORTS /////////////
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import AthleteCard from '@/components/cards/AthleteCard';
import FloatingButton from '@/components/buttons/FloatingButton';
import GameCard from '@/components/cards/GameCard';
import SearchBar from '@/components/inputs/SearchBar';
import SubTab from '@/components/navigations/SUBTAB';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBatchesByCoach,
  getCurrentBatch,
  getAthletesByBatch,
  getAllAthletes,
  transformDatabaseAthlete,
  getGamesByCoach,
  transformDatabaseGame,
  removeAthleteFromBatch,
  type Batch,
  type Athlete,
  type Game
} from '@/services';
////////////////////////////// END OF IMPORTS ////////////////

/////////////////////////////// START OF INTERFACES /////////////
// Interfaces are now imported from services
////////////////////////////// END OF INTERFACES ////////////////

/////////////////////////////// START OF HELPER FUNCTIONS /////////////
// Helper functions are now imported from services
////////////////////////////// END OF HELPER FUNCTIONS ////////////////

/////////////////////////////// START OF MAIN COMPONENT /////////////

export default function AthleteScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const { coachNo } = useAuth();
  const [activeTab, setActiveTab] = useState('athletes');
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showGameFilterModal, setShowGameFilterModal] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gamesError, setGamesError] = useState<string | null>(null);

  // Purpose: Handles the deletion of an athlete from a batch
  // 1. Validates that a batch and coach context exist
  // 2. Shows a confirmation alert to the user
  // 3. Calls the removeAthleteFromBatch service
  // 4. Refreshes the list on success
  const handleDeleteAthlete = (athlete: Athlete) => {
    if (!selectedBatch || !coachNo) {
      alert('Cannot delete: No active batch context.');
      return;
    }

    Alert.alert(
      'Remove Athlete',
      `Are you sure you want to remove ${athlete.name} from this batch? Their historical stats will be preserved, but they will be removed from this list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await removeAthleteFromBatch(
                parseInt(athlete.id),
                selectedBatch.batch_no
              );
              
              if (success) {
                // Refresh list
                await refreshAthletes();
                alert('Athlete removed from batch.');
              } else {
                alert('Failed to remove athlete.');
              }
            } catch (err) {
              console.error('Error deleting athlete:', err);
              alert('An error occurred while deleting.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const athleteTabs = [
    { id: 'athletes', label: 'Athletes' },
    { id: 'games', label: 'Games' }
  ];
  ////////////////////////////// END OF STATE AND CONFIGURATION ////////////////

  /////////////////////////////// START OF UTILITY FUNCTIONS /////////////
  // Utility functions are now imported from services
  ////////////////////////////// END OF UTILITY FUNCTIONS ////////////////

  /////////////////////////////// START OF DATA FETCHING FUNCTIONS /////////////
  // Fetch batches from database (filtered by coach)
  const fetchBatches = async () => {
    try {
      if (!coachNo) {
        console.log('⚠️ No coach number available');
        setBatches([]);
        return;
      }

      const data = await getBatchesByCoach(coachNo);
      setBatches(data);
      // Auto-select current batch if available
      const currentBatch = getCurrentBatch(data);
      setSelectedBatch(currentBatch);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  // Fetch games from database (filtered by coach's batches)
  const fetchGames = async () => {
    try {
      setGamesLoading(true);
      setGamesError(null);

      if (!coachNo) {
        console.log('⚠️ No coach number available');
        setGames([]);
        setGamesLoading(false);
        return;
      }

      const data = await getGamesByCoach(coachNo);
      const transformedGames = data.map(transformDatabaseGame);
      setGames(transformedGames);
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
        const athletes = await getAthletesByBatch(selectedBatch.batch_no);
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setAthletes(transformedAthletes);
      } else {
        const athletes = await getAllAthletes();
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setAthletes(transformedAthletes);
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
          const athletes = await getAthletesByBatch(selectedBatch.batch_no);
          const transformedAthletes = athletes.map(transformDatabaseAthlete);
          setAthletes(transformedAthletes);
        } else {
          const athletes = await getAllAthletes();
          const transformedAthletes = athletes.map(transformDatabaseAthlete);
          setAthletes(transformedAthletes);
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

  // Fetch batches and games on component mount and when coachNo changes
  useEffect(() => {
    if (coachNo !== null) {
      fetchBatches();
      fetchGames();
    }
  }, [coachNo]);
  ////////////////////////////// END OF USE EFFECTS ///////////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleFilterPress = () => {
    if (activeTab === 'games') {
      setShowGameFilterModal(true);
    } else {
      setShowBatchModal(true);
    }
  };

  const handleBatchSelect = (batch: Batch | null) => {
    setSelectedBatch(batch);
    setShowBatchModal(false);
  };


  // When one of the athlete card is pressed, navigate to the athlete detail screen
  const handleAthletePress = (athlete: Athlete) => {
    console.log('Athlete pressed:', athlete.name);
    // Navigate to athlete detail screen
    router.push(`/(coach)/(tabs)/athletes-module/${athlete.id}` as any);
  };

  const handleAddAthlete = () => {
    // Navigate to add athlete screen
    router.push('/(coach)/(tabs)/athletes-module/add-athlete' as any);
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
      onLongPress={() => handleDeleteAthlete(item)}
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
        filterType={activeTab === 'games' ? 'game' : 'batch'}
        placeholder={activeTab === 'games' ? 'Search games...' : 'Search athletes...'}
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

      {/* Game Filter Modal */}
      <Modal
        visible={showGameFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGameFilterModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-80 rounded-xl bg-white p-6">
            <Text className="mb-4 text-center text-lg font-semibold">
              Filter Games
            </Text>

            <TouchableOpacity
              onPress={() => setShowGameFilterModal(false)}
              className="mb-3 rounded-lg bg-gray-100 p-3"
            >
              <Text className="text-center font-medium text-gray-700">
                All Games (Default)
              </Text>
            </TouchableOpacity>
            
             <TouchableOpacity
              onPress={() => {
                 setGames([...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                 setShowGameFilterModal(false);
              }}
              className="mb-3 rounded-lg bg-gray-100 p-3"
            >
              <Text className="text-center font-medium text-gray-700">
                Most Recent First
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                 setGames([...games].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                 setShowGameFilterModal(false);
              }}
              className="mb-3 rounded-lg bg-gray-100 p-3"
            >
              <Text className="text-center font-medium text-gray-700">
                Oldest First
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowGameFilterModal(false)}
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
