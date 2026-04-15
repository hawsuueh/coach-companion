import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { createAthlete } from '@/services/athleteService';
import { getBatchesByCoach, getCurrentBatch } from '@/services/batchService';
import { useEffect } from 'react';

export default function AddAthleteScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { coachNo } = useAuth();
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [playerNo, setPlayerNo] = useState('');
  const [position, setPosition] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [activeBatchNo, setActiveBatchNo] = useState<number | null>(null);

  // Set header title
  useEffect(() => {
    setTitle('Add New Athlete');
  }, []);

  // Fetch current batch on mount
  useEffect(() => {
    const fetchCurrentBatch = async () => {
      if (!coachNo) return;
      try {
        const batches = await getBatchesByCoach(coachNo);
        const current = getCurrentBatch(batches);
        
        if (current) {
          setActiveBatchNo(current.batch_no);
        } else {
          Alert.alert(
            'No Active Batch',
            'You need an active batch (based on today\'s date) to add athletes. Please check your batch dates.',
            [{ text: 'Go Back', onPress: () => router.back() }]
          );
        }
      } catch (err) {
        console.error('Error fetching batch context:', err);
        Alert.alert('Error', 'Failed to determine current batch context.');
      }
    };
    
    fetchCurrentBatch();
  }, [coachNo]);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First Name is required');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Last Name is required');
      return false;
    }
    if (!playerNo.trim()) {
      Alert.alert('Validation Error', 'Jersey Number is required');
      return false;
    }
    if (isNaN(parseInt(playerNo))) {
      Alert.alert('Validation Error', 'Jersey Number must be a valid number');
      return false;
    }
    if (!position.trim()) {
      Alert.alert('Validation Error', 'Position is required');
      return false;
    }
    if (!activeBatchNo) {
      Alert.alert('Error', 'No active batch found used to associate this athlete.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !activeBatchNo) return;

    setLoading(true);
    try {
      const result = await createAthlete({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        player_no: parseInt(playerNo),
        position: position.trim()
      }, activeBatchNo);

      if (result.success) {
        Alert.alert('Success', 'Athlete added successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add athlete');
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
        <Text className="text-lg font-semibold text-gray-800 mb-6">Athlete Details</Text>
        
        {/* Name Fields */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">First Name *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Michael"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Middle Name (Optional)</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Jeffrey"
            value={middleName}
            onChangeText={setMiddleName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Last Name *</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Jordan"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Number and Position Row */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Jersey No. *</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
              placeholder="23"
              keyboardType="numeric"
              value={playerNo}
              onChangeText={setPlayerNo}
              maxLength={3}
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Position *</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800"
              placeholder="e.g. Guard"
              value={position}
              onChangeText={setPosition}
            />
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
            <Text className="text-white font-semibold text-lg">Add Athlete</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
