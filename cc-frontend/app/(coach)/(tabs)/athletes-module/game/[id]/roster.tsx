import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StartRecordingButton from '@/components/buttons/StartRecordingButton';
import Header from '@/components/headers/Header';
import RosterCard from '@/components/cards/RosterCard';

// Mock data - in the future this will come from Supabase
const MOCK_GAMES = {
  '1': {
    id: '1',
    gameName: 'UNC Basketball Team vs State University',
    date: 'Oct 15, 2025',
    opponent: 'State University'
  },
  '2': {
    id: '2',
    gameName: 'UNC vs Duke',
    date: 'Nov 20, 2025',
    opponent: 'Duke University'
  },
  '3': {
    id: '3',
    gameName: 'UNC vs Wake Forest',
    date: 'Dec 5, 2025',
    opponent: 'Wake Forest University'
  }
};

const MOCK_ATHLETES = [
  { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  { id: '2', number: '7', name: 'Mike Johnson', position: 'Midfielder' },
  { id: '3', number: '23', name: 'David Wilson', position: 'Defender' },
  { id: '4', number: '1', name: 'Tom Brown', position: 'Goalkeeper' },
  { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  { id: '6', number: '4', name: 'Chris Miller', position: 'Defender' },
  { id: '7', number: '8', name: 'Ryan Taylor', position: 'Midfielder' },
  { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
];

// Mock roster data - in the future this will come from Supabase
const MOCK_ROSTERS = {
  '1': ['1', '2', '3', '4', '5'], // Game 1 roster
  '2': ['1', '6', '7', '8', '5'], // Game 2 roster
  '3': ['2', '3', '6', '7', '8'] // Game 3 roster
};

export default function GameRosterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Get game data
  const game = MOCK_GAMES[id as keyof typeof MOCK_GAMES];
  const selectedAthleteIds =
    MOCK_ROSTERS[id as keyof typeof MOCK_ROSTERS] || [];

  const handleBackPress = () => {
    router.back();
  };

  const handleAthleteToggle = (athleteId: string) => {
    console.log('Toggle athlete:', athleteId, 'for game:', game?.gameName);
    // TODO: Update roster in database
  };

  const handleRemoveAthlete = (athleteId: string) => {
    console.log('Remove athlete:', athleteId, 'from game:', game?.gameName);
    // TODO: Remove athlete from roster in database
  };

  const handleStartRecording = () => {
    console.log('Start recording for game:', game?.gameName);
    router.push(`/athletes-module/game/${id}/recording`);
  };

  const handleAddAthlete = () => {
    if (selectedAthleteId) {
      console.log(
        'Add athlete:',
        selectedAthleteId,
        'to game:',
        game?.gameName
      );
      // TODO: Add athlete to roster in database
      setSelectedAthleteId('');
      setShowDropdown(false);
    }
  };

  const availableAthletes = MOCK_ATHLETES.filter(
    athlete => !selectedAthleteIds.includes(athlete.id)
  );

  if (!game) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Game not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedAthletes = MOCK_ATHLETES.filter(athlete =>
    selectedAthleteIds.includes(athlete.id)
  );

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        {/* Header */}
        <Header
          title="Team Roster"
          showBack={true}
          showNotifications={false}
          showMenu={false}
          onBackPress={handleBackPress}
        />

        {/* Scrollable Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Game Info Section */}
          <View className="items-center px-4 py-4">
            <Text className="mb-1 text-center text-xl font-bold text-black">
              {game.gameName}
            </Text>
            <Text className="text-center text-base text-gray-600">
              {game.date}
            </Text>
          </View>

          {/* Athlete Selection Section */}
          <View className="px-4 pb-4">
            <View className="rounded-xl bg-gray-100 p-4">
              <Text className="mb-3 text-base font-semibold text-black">
                Select Athletes for Lineup
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-3"
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text className="text-gray-500">
                    {selectedAthleteId
                      ? MOCK_ATHLETES.find(a => a.id === selectedAthleteId)
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
                  className="ml-3 rounded-lg bg-red-500 px-4 py-3"
                  onPress={handleAddAthlete}
                >
                  <Text className="font-semibold text-white">Add</Text>
                </TouchableOpacity>
              </View>

              {/* Dropdown */}
              {showDropdown && (
                <View className="mt-2 rounded-lg border border-gray-300 bg-white">
                  {availableAthletes.map(athlete => (
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
                  ))}
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
                  {selectedAthletes.length} Athletes
                </Text>
              </View>

              {/* Selected Athletes List */}
              {selectedAthletes.length > 0 ? (
                <View>
                  {selectedAthletes.map(athlete => (
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
      </SafeAreaView>
    </View>
  );
}
