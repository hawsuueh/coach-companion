/////////////////////////////// START OF IMPORTS /////////////
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal
} from 'react-native';
import StartRecordingButton from '@/components/buttons/StartRecordingButton';
import RosterCard from '@/components/cards/RosterCard';
import GameHeader from '@/components/game/GameHeader';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorScreen from '@/components/common/ErrorScreen';
import supabase from '@/config/supabaseClient';
import { useHeader } from '@/components/contexts/HeaderContext';
////////////////////////////// END OF IMPORTS //////////////////////////////////////////////////////////

/////////////////////////////// START OF INTERFACES ////////////////////////////////////////////
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

interface DatabaseBatch {
  batch_no: number; // ex: 1
  start_date: string | null; // ex: "2024-01-01"
  end_date: string | null; // ex: "2024-12-31"
}

interface DatabaseRoster {
  roster_no: number; // ex: 1
  game_no: number; // ex: 1
  athlete_no: number; // ex: 1
  created_at: string; // ex: "2024-01-15T10:30:00Z"
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

  const playerTeam = dbGame.player_name || 'Your Team';
  const opponentTeam = dbGame.opponent_name || 'TBD';
  const gameName = `${playerTeam} vs ${opponentTeam}`;

  return {
    id: dbGame.game_no.toString(),
    gameName: gameName,
    date: formattedDate
  };
};

// Helper function to determine current batch based on today's date
const getCurrentBatch = (batches: DatabaseBatch[]): DatabaseBatch | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
////////////////////////////// END OF HELPER FUNCTIONS ////////////////

/////////////////////////////// START OF MAIN COMPONENT /////////////

export default function GameRosterScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { setTitle } = useHeader();
  
  // UI state
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Data state
  const [game, setGame] = useState<Game | null>(null);
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [rosterAthletes, setRosterAthletes] = useState<Athlete[]>([]);
  const [batches, setBatches] = useState<DatabaseBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<DatabaseBatch | null>(null);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch all batches from database
  const fetchBatches = async () => {
    try {
      const { data: batches, error: batchError } = await supabase
        .from('Batch')
        .select('*')
        .order('start_date', { ascending: false });

      if (batchError) {
        throw batchError;
      }

      if (batches) {
        setBatches(batches);
        
        // Handle empty batches array
        if (batches.length === 0) {
          setSelectedBatch(null);
          setError('No batches available. Please create a batch first.');
          return;
        }
        
        // Auto-select current batch if available, otherwise select first batch
        const currentBatch = getCurrentBatch(batches);
        setSelectedBatch(currentBatch || batches[0] || null);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches');
    }
  };

  // Fetch available athletes from selected batch
  const fetchAvailableAthletes = async (batchNo?: number) => {
    try {
      const batchToUse = batchNo || selectedBatch?.batch_no;
      if (!batchToUse) {
        setError('No batch selected');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('athlete_batch')
        .select(
          `
          Athlete!inner(*)
        `
        )
        .eq('batch_no', batchToUse);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const athletes = data.map((item: any) => item.Athlete).filter(Boolean);
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setAvailableAthletes(transformedAthletes);
      }
    } catch (err) {
      console.error('Error fetching available athletes:', err);
      setError('Failed to load available athletes');
    }
  };

  // Fetch current roster for this game
  const fetchRoster = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('Roster')
        .select(
          `
          Athlete!inner(*)
        `
        )
        .eq('game_no', id);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const athletes = data.map((item: any) => item.Athlete).filter(Boolean);
        const transformedAthletes = athletes.map(transformDatabaseAthlete);
        setRosterAthletes(transformedAthletes);
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
      setError('Failed to load roster');
    }
  };
  ////////////////////////////// END OF DATA FETCHING FUNCTIONS ////////////////

  /////////////////////////////// START OF USE EFFECTS /////////////
  useEffect(() => {
    setTitle('Team Roster');
  });

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      await Promise.all([fetchGame(), fetchBatches(), fetchRoster()]);

      setLoading(false);
    };

    if (id && typeof id === 'string') {
      loadData();
    }
  }, [id]);

  // Fetch available athletes when selected batch changes
  useEffect(() => {
    if (selectedBatch) {
      fetchAvailableAthletes(selectedBatch.batch_no);
    }
  }, [selectedBatch]);
  ////////////////////////////// END OF USE EFFECTS ////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
  const handleBackPress = () => {
    router.back();
  };

  const handleBatchSelect = (batch: DatabaseBatch | null) => {
    setSelectedBatch(batch);
    setShowBatchModal(false);
  };

  const handleAthleteToggle = (athleteId: string) => {
    console.log('Toggle athlete:', athleteId, 'for game:', game?.gameName);
    // This will be handled by the remove function
    handleRemoveAthlete(athleteId);
  };

  const handleRemoveAthlete = async (athleteId: string) => {
    // Get athlete name for confirmation dialog
    const athlete = rosterAthletes.find(a => a.id === athleteId);
    const athleteName = athlete?.name || 'this athlete';

    // Show confirmation dialog
    Alert.alert(
      'Remove Athlete',
      `Are you sure you want to remove ${athleteName} from the roster?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('Roster')
                .delete()
                .eq('game_no', id && typeof id === 'string' ? parseInt(id) : 0)
                .eq('athlete_no', parseInt(athleteId));

              if (error) {
                throw error;
              }

              // Update local state
              setRosterAthletes(prev =>
                prev.filter(athlete => athlete.id !== athleteId)
              );
              console.log('Athlete removed from roster successfully');
            } catch (err) {
              console.error('Error removing athlete from roster:', err);
              Alert.alert('Error', 'Failed to remove athlete from roster');
            }
          }
        }
      ]
    );
  };

  const handleStartRecording = () => {
    // Validate roster is not empty
    if (rosterAthletes.length === 0) {
      Alert.alert(
        'No Athletes Selected',
        'Please add at least one athlete to the roster before starting recording.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Start recording for game:', game?.gameName);
    router.push(`/athletes-module/game/${id}/recording`);
  };

  const handleAddAthlete = async () => {
    // Validate selection
    if (!selectedAthleteId) {
      Alert.alert('No Athlete Selected', 'Please select an athlete from the dropdown first');
      return;
    }

    // Check if already in roster (immediate feedback)
    const alreadyInRoster = rosterAthletes.some(a => a.id === selectedAthleteId);
    if (alreadyInRoster) {
      Alert.alert('Already Added', 'This athlete is already on the roster');
      return;
    }

    if (id && typeof id === 'string') {
      setIsAdding(true); // Disable button during operation
      try {
        const { error } = await supabase.from('Roster').insert({
          game_no: parseInt(id),
          athlete_no: parseInt(selectedAthleteId)
        });

        if (error) {
          // Handle unique constraint violation gracefully
          if (error.code === '23505') {
            Alert.alert('Already Added', 'This athlete is already on the roster');
            return;
          }
          throw error;
        }

        // Update local state
        const athleteToAdd = availableAthletes.find(
          a => a.id === selectedAthleteId
        );
        if (athleteToAdd) {
          setRosterAthletes(prev => [...prev, athleteToAdd]);
        }

        setSelectedAthleteId('');
        setShowDropdown(false);
        console.log('Athlete added to roster successfully');
      } catch (err) {
        console.error('Error adding athlete to roster:', err);
        Alert.alert('Error', 'Failed to add athlete to roster');
      } finally {
        setIsAdding(false); // Re-enable button
      }
    }
  };
  ////////////////////////////// END OF EVENT HANDLERS ////////////////

  /////////////////////////////// START OF UTILITY FUNCTIONS /////////////
  // Filter available athletes (exclude those already on roster)
  const availableAthletesFiltered = availableAthletes.filter(
    athlete =>
      !rosterAthletes.some(rosterAthlete => rosterAthlete.id === athlete.id)
  );
  ////////////////////////////// END OF UTILITY FUNCTIONS ////////////////

  /////////////////////////////// START OF LOADING AND ERROR STATES /////////////
  if (loading) {
    return <LoadingScreen message="Loading roster..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          // Reload all data (including batches)
          if (id) {
            Promise.all([
              fetchGame(),
              fetchBatches(),
              fetchRoster()
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
    <View className="flex-1">
      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Game Info Section */}
        <GameHeader gameName={game.gameName} date={game.date} />

        {/* Athlete Selection Section */}
        <View className="px-4 pb-4">
          <View className="rounded-xl bg-gray-100 p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-black">
                Select Athletes for Lineup
              </Text>
              {selectedBatch && (
                <View className="rounded-lg bg-red-50 px-2 py-1">
                  <Text className="text-xs text-red-600">
                    Batch {selectedBatch.batch_no}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-3"
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text className="text-gray-500">
                  {selectedAthleteId
                    ? availableAthletes.find(a => a.id === selectedAthleteId)
                        ?.name
                    : 'Select an athlete'}
                </Text>
              </TouchableOpacity>
              <Ionicons
                name={showDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
                style={{ marginLeft: 8 }}
              />
              <TouchableOpacity
                className="ml-2 rounded-lg bg-gray-500 p-2"
                onPress={() => setShowBatchModal(true)}
              >
                <Ionicons name="funnel" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className={`ml-2 rounded-lg px-4 py-3 ${isAdding ? 'bg-gray-400' : 'bg-red-500'}`}
                onPress={handleAddAthlete}
                disabled={isAdding}
              >
                <Text className="font-semibold text-white">
                  {isAdding ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dropdown */}
            {showDropdown && (
              <View className="mt-2 rounded-lg border border-gray-300 bg-white">
                {availableAthletesFiltered.length > 0 ? (
                  availableAthletesFiltered.map(athlete => (
                    <TouchableOpacity
                      key={athlete.id}
                      className="border-b border-gray-100 px-3 py-3"
                      onPress={() => {
                        setSelectedAthleteId(athlete.id);
                        setShowDropdown(false);
                      }}
                    >
                      <Text className="text-black">{athlete.name}</Text>
                      <Text className="text-sm text-gray-500">
                        No. {athlete.number} - {athlete.position}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="px-3 py-6">
                    <Text className="text-center text-gray-500">
                      All available athletes have been added to the roster
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Current Lineup Section */}
        <View className="px-4 pb-6">
          <View className="rounded-xl bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-black">
                CURRENT LINEUP
              </Text>
              <Text className="text-sm font-medium text-red-500">
                {rosterAthletes.length} Athletes
              </Text>
            </View>

            {/* Selected Athletes List */}
            {rosterAthletes.length > 0 ? (
              <View>
                {rosterAthletes.map(athlete => (
                  <RosterCard
                    key={athlete.id}
                    playerNumber={athlete.number}
                    playerName={athlete.name}
                    position={athlete.position}
                    isSelected={true}
                    onPress={() => handleAthleteToggle(athlete.id)}
                    onRemove={() => handleRemoveAthlete(athlete.id)}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text className="mt-2 text-gray-500">
                  No athletes selected for this game
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Start Recording Button */}
        <View className="px-4 pb-20">
          <StartRecordingButton onPress={handleStartRecording} />
        </View>
      </ScrollView>

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
