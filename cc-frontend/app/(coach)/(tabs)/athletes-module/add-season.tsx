import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHeader } from '@/components/contexts/HeaderContext';
import { createSeason } from '@/services/seasonService';

export default function AddSeasonScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  
  // Form State
  const [seasonLabel, setSeasonLabel] = useState('');
  const [duration, setDuration] = useState('');
  const [totalGames, setTotalGames] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Set header title
  useEffect(() => {
    setTitle('Add New Season');
  }, []);

  const validateForm = () => {
    if (!seasonLabel.trim()) {
      Alert.alert('Validation Error', 'Season Label is required (e.g., "2023-2024")');
      return false;
    }
    if (!duration.trim()) {
      Alert.alert('Validation Error', 'Duration is required (e.g., "October to June")');
      return false;
    }
    if (!totalGames.trim()) {
      Alert.alert('Validation Error', 'Total Games is required');
      return false;
    }
    if (isNaN(parseInt(totalGames))) {
      Alert.alert('Validation Error', 'Total Games must be a valid number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await createSeason({
        season_label: seasonLabel.trim(),
        duration: duration.trim(),
        total_games: parseInt(totalGames)
      });

      if (result.success) {
        Alert.alert('Success', 'Season created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create season');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-6">Season Details</Text>
        
        {/* Season Label */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Season Label *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. 2023-2024"
            value={seasonLabel}
            onChangeText={setSeasonLabel}
          />
        </View>

        {/* Duration */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Duration *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. October to June"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        {/* Total Games */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Total Games *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. 82"
            keyboardType="numeric"
            value={totalGames}
            onChangeText={setTotalGames}
            maxLength={3}
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
            <Text className="text-white font-semibold text-lg">Create Season</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
