import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { createGame } from '@/services/gameService';
import { getAllSeasons, type DatabaseSeason } from '@/services/seasonService';
import { getBatchesByCoach, getCurrentBatch, type Batch } from '@/services/batchService';

export default function AddGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setTitle } = useHeader();
  const { coachNo } = useAuth();
  
  // Form State
  const [playerTeamName, setPlayerTeamName] = useState('');
  const [opponentTeamName, setOpponentTeamName] = useState('');
  const [selectedSeasonNo, setSelectedSeasonNo] = useState<number | null>(null);
  const [selectedBatchNo, setSelectedBatchNo] = useState<number | null>(null);
  const [customGameLabel, setCustomGameLabel] = useState('');
  
  // Read-only flags (if coming from matchup)
  const isMatchupContext = !!(params.playerTeam && params.opponentTeam && params.seasonNo);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [seasons, setSeasons] = useState<DatabaseSeason[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Set header title
  useEffect(() => {
    setTitle('Add New Game');
  }, []);

  // Fetch seasons and batches
  useEffect(() => {
    const fetchData = async () => {
      if (!coachNo) return;
      
      try {
        setDataLoading(true);
        
        // Fetch seasons
        const seasonsData = await getAllSeasons();
        setSeasons(seasonsData);
        
        // Fetch batches and auto-select current batch
        const batchesData = await getBatchesByCoach(coachNo);
        setBatches(batchesData);
        
        const currentBatch = getCurrentBatch(batchesData);
        if (currentBatch) {
          setSelectedBatchNo(currentBatch.batch_no);
        }

        // Pre-select params if passed
        if (params.seasonNo) {
          const seasonId = Number(params.seasonNo);
          if (!isNaN(seasonId)) {
            setSelectedSeasonNo(seasonId);
          }
        }
        
        if (params.playerTeam) {
          setPlayerTeamName(params.playerTeam as string);
        }
        if (params.opponentTeam) {
          setOpponentTeamName(params.opponentTeam as string);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        Alert.alert('Error', 'Failed to load seasons and batches');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [coachNo]);

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
    if (!selectedBatchNo) {
      Alert.alert('Validation Error', 'Please select a batch');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format date and time
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedTime = time.toTimeString().split(' ')[0]; // HH:MM:SS

      const result = await createGame({
        player_name: playerTeamName.trim(),
        opponent_name: opponentTeamName.trim(),
        season_no: selectedSeasonNo,
        batch_no: selectedBatchNo,
        date: formattedDate,
        time: formattedTime,
        custom_game_label: customGameLabel.trim() || null
      });

      if (result.success) {
        Alert.alert('Success', 'Game created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create game');
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
        <Text className="text-lg font-semibold text-gray-800 mb-6">Game Details</Text>
        
        {/* Season Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Season *</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedSeasonNo}
              enabled={!isMatchupContext} // Disable if in matchup context
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
            className={`w-full border border-gray-200 rounded-lg p-3 text-gray-800 ${isMatchupContext ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
            placeholder="e.g. University of Nueva Caceres"
            value={playerTeamName}
            onChangeText={setPlayerTeamName}
            editable={!isMatchupContext}
          />
        </View>

        {/* Opponent Team Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Opponent Team Name *</Text>
          <TextInput
            className={`w-full border border-gray-200 rounded-lg p-3 text-gray-800 ${isMatchupContext ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
            placeholder="e.g. Ateneo"
            value={opponentTeamName}
            onChangeText={setOpponentTeamName}
            editable={!isMatchupContext}
          />
        </View>

        {/* Date Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Date *</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
            <Text className="text-gray-800">{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Time Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Time *</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
            <Text className="text-gray-800">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* Custom Game Label (Optional) */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Game Label (Optional)</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Game 1, Finals G1"
            value={customGameLabel}
            onChangeText={setCustomGameLabel}
          />
        </View>

        {/* Batch Selection */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Batch *</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedBatchNo}
              onValueChange={(value) => setSelectedBatchNo(value)}
            >
              <Picker.Item label="Select a batch" value={null} />
              {batches.map((batch) => (
                <Picker.Item 
                  key={batch.batch_no} 
                  label={`Batch ${batch.batch_no}`} 
                  value={batch.batch_no} 
                />
              ))}
            </Picker>
          </View>
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
            <Text className="text-white font-semibold text-lg">Create Game</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
