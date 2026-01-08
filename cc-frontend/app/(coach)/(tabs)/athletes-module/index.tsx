/////////////////////////////// START OF IMPORTS /////////////
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import AthleteCard from '@/components/cards/AthleteCard';
import FloatingButton from '@/components/buttons/FloatingButton';
import SeasonCard from '@/components/cards/SeasonCard';
import SearchBar from '@/components/inputs/SearchBar';
import SubTab from '@/components/navigations/SUBTAB';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBatchesByCoach,
  getCurrentBatch,
  getAthletesByBatch,
  getAllAthletes,
  transformDatabaseAthlete,
  removeAthleteFromBatch,
  type Batch,
  type Athlete
} from '@/services';
import {
  getAllSeasons,
  transformDatabaseSeason,
  type Season
} from '@/services/seasonService';
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [seasonsLoading, setSeasonsLoading] = useState(true);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

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
    { id: 'seasons', label: 'Seasons' }
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

  // Fetch seasons from database (filtered by coach's batches)
  const fetchSeasons = async () => {
    try {
      setSeasonsLoading(true);
      setSeasonsError(null);

      if (!coachNo) {
        console.log('⚠️ No coach number available');
        setSeasons([]);
        setSeasonsLoading(false);
        return;
      }

      const data = await getAllSeasons();
      const transformedSeasons = data.map(transformDatabaseSeason);
      setSeasons(transformedSeasons);
    } catch (err) {
      console.error('Error fetching seasons:', err);
      setSeasonsError('Failed to load seasons. Please try again.');
      setSeasons([]);
    } finally {
      setSeasonsLoading(false);
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

  // Fetch batches on component mount
  useEffect(() => {
    if (coachNo !== null) {
      fetchBatches();
    }
  }, [coachNo]);

  // Fetch seasons when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (coachNo !== null && activeTab === 'seasons') {
        fetchSeasons();
      }
    }, [coachNo, activeTab])
  );
  ////////////////////////////// END OF USE EFFECTS ///////////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleFilterPress = () => {
    // Only show batch filter for athletes tab
    if (activeTab === 'athletes') {
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

  const handleAddSeason = () => {
    // Navigate to add season screen
    router.push('/(coach)/(tabs)/athletes-module/add-season' as any);
  };

  const handleSeasonPress = (season: Season) => {
    console.log('Season pressed:', season.label);
    // Navigate to matchups screen for this season
    router.push(
      `/(coach)/(tabs)/athletes-module/seasons/${season.id}/matchups` as any
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

  const filteredSeasons = seasons.filter(
    season =>
      season.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      season.duration.toLowerCase().includes(searchQuery.toLowerCase())
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

  const renderSeasonCard = ({ item }: { item: Season }) => (
    <SeasonCard
      seasonLabel={item.label}
      duration={item.duration}
      totalGames={item.totalGames}
      onPress={() => handleSeasonPress(item)}
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
        placeholder={activeTab === 'seasons' ? 'Search seasons...' : 'Search athletes...'}
      />

      {/* Batch Selection Indicator - Only show on Athletes tab */}
      {activeTab === 'athletes' && selectedBatch && (
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
            {seasonsLoading ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">Loading seasons...</Text>
              </View>
            ) : seasonsError ? (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="mb-4 text-center text-red-500">
                  {seasonsError}
                </Text>
                <TouchableOpacity
                  onPress={fetchSeasons}
                  className="rounded-lg bg-red-500 px-4 py-2"
                >
                  <Text className="font-semibold text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredSeasons.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-center text-gray-500">
                  {searchQuery
                    ? 'No seasons found matching your search.'
                    : 'No seasons found.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredSeasons}
                renderItem={renderSeasonCard}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 100,
                  paddingHorizontal: 8
                }}
                refreshing={seasonsLoading}
                onRefresh={fetchSeasons}
              />
            )}
          </>
        )}
      </View>

      {/* Floating Action Button */}
      {/* Floating Button */}
      <FloatingButton
        onPress={activeTab === 'athletes' ? handleAddAthlete : handleAddSeason}
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
