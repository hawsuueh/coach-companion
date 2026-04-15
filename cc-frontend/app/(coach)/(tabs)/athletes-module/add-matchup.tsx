import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { createGame } from '@/services/gameService';
import { getAllSeasons, type DatabaseSeason } from '@/services/seasonService';
import { Picker } from '@react-native-picker/picker';

export default function AddMatchupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setTitle } = useHeader();
  const { coachNo } = useAuth();
  
  // Form State
  const [playerTeamName, setPlayerTeamName] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [selectedSeasonNo, setSelectedSeasonNo] = useState<number | null>(null);
  
  const [seasons, setSeasons] = useState<DatabaseSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Set header title
  useEffect(() => {
    setTitle('Add Matchup');
  }, []);

  // Fetch seasons
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const seasonsData = await getAllSeasons();
        setSeasons(seasonsData);
        
        // Pre-select season if passed in params
        if (params.seasonNo) {
          const seasonId = Number(params.seasonNo);
          if (!isNaN(seasonId)) {
            setSelectedSeasonNo(seasonId);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        Alert.alert('Error', 'Failed to load seasons');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [params.seasonNo]);

  const validateForm = () => {
    if (!playerTeamName.trim()) {
      Alert.alert('Validation Error', 'Your team name is required');
      return false;
    }
    if (!opponentTeamName.trim()) {
      Alert.alert('Validation Error', 'Opponent team name is required');
      return false;
    }
    if (!selectedSeasonNo) {
      Alert.alert('Validation Error', 'Please select a season');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create a placeholder game (matchup) with no batch/date/time
      const result = await createGame({
        player_name: playerTeamName.trim(),
        opponent_name: opponentTeamName.trim(),
        season_no: selectedSeasonNo,
        batch_no: null, // Placeholder
        date: null,
        time: null
      });

      if (result.success) {
        Alert.alert('Success', 'Matchup created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create matchup');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-6">Matchup Details</Text>
        <Text className="text-sm text-gray-500 mb-6">
          Create a matchup to group games between two teams. You can add specific game instances (dates, times) later.
        </Text>
        
        {/* Season Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Season *</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedSeasonNo}
              onValueChange={(value) => setSelectedSeasonNo(value)}
            >
              <Picker.Item label="Select a season" value={null} />
              {seasons.map((season) => (
                <Picker.Item 
                  key={season.season_no} 
                  label={season.season_label || `Season ${season.season_no}`} 
                  value={season.season_no} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Player Team Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Your Team Name *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. University of Nueva Caceres"
            value={playerTeamName}
            onChangeText={setPlayerTeamName}
          />
        </View>

        {/* Opponent Team Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Opponent Team Name *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Ateneo"
            value={opponentTeamName}
            onChangeText={setOpponentTeamName}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center ${loading ? 'bg-red-300' : 'bg-red-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">Create Matchup</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
