import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import DateInput from '@/components/training-module/inputs/DateInput';
import MultiSelectCalendar from '@/components/training-module/inputs/MultiSelectCalendar';
import TimeInput from '@/components/training-module/inputs/TimeInput';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';
// Import the new ML generation function
import {
  getAthletesAndEquipmentsVM,
  generateTrainingSessionVM
} from '@/view-models/training-module/training.vm';

export default function GenerateTrainingModal() {
  const { setTitle } = useHeader();
  const router = useRouter();

  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [athleteData, setAthleteData] = useState<any[]>([]);
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New state to track ML processing
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTitle('Generate Training');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { athleteDropdown, equipmentDropdown } =
          await getAthletesAndEquipmentsVM();
        setAthleteData(athleteDropdown);
        setEquipmentData(equipmentDropdown);
      } catch (err) {
        console.error('Error fetching athletes/equipments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // The updated handleGenerate function
  const handleGenerate = async () => {
    // 1. Validation
    if (
      !trainingName ||
      selectedAthletes.length === 0 ||
      dates.length === 0 ||
      !startTime ||
      !duration
    ) {
      Alert.alert(
        'Missing Fields',
        'Please fill in all the required training details.'
      );
      return;
    }

    setIsGenerating(true);
    try {
      // 2. Call the ML Orchestrator in the VM
      // coachNo should ideally come from your Auth context/session
      const coachNo = '1';

      await generateTrainingSessionVM(
        coachNo,
        trainingName,
        selectedAthletes,
        selectedEquipments,
        dates,
        startTime,
        duration
      );

      Alert.alert('Success', 'Training plans generated successfully via ML!');
      router.back();
    } catch (err) {
      console.error('Generation failed:', err);
      Alert.alert(
        'Error',
        'An error occurred while generating the training plan.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAthleteSelectChange = (values: string[]) => {
    setSelectedAthletes(values);
  };

  const handleEquipmentSelectChange = (values: string[]) => {
    setSelectedEquipments(values);
  };

  return (
    <View className="mb-4 mt-4 flex-1 bg-primary">
      {/* Loading Overlay for ML Processing */}
      {isGenerating && (
        <View className="absolute z-50 h-full w-full items-center justify-center bg-black/40">
          <View className="items-center justify-center rounded-2xl bg-white p-6 shadow-lg">
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text className="mt-4 text-lg font-bold">Machine Learning</Text>
            <Text className="text-sm text-gray-500">
              Analyzing athlete performance...
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 mt-4 px-6">
          <TextInput
            label="Training Name"
            value={trainingName}
            onChangeText={setTrainingName}
          />
        </View>

        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={athleteData}
            value={selectedAthletes}
            IconComponent={Ionicons}
            icon="people-sharp"
            onChange={handleAthleteSelectChange}
            placeholder={loading ? 'Loading athletes...' : 'Select athletes'}
          />
        </View>

        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={equipmentData}
            value={selectedEquipments}
            IconComponent={Ionicons}
            icon="barbell-outline"
            onChange={handleEquipmentSelectChange}
            placeholder={
              loading ? 'Loading equipments...' : 'Select equipments'
            }
          />
        </View>

        <View className="px-6">
          <DateInput
            dates={dates}
            onPress={() => setShowCalendar(prev => !prev)}
          />
        </View>

        {showCalendar && (
          <View className="mb-4">
            <MultiSelectCalendar
              initialDates={dates}
              onChange={selected => setDates(selected)}
            />
          </View>
        )}

        <View className="mb-4 mt-3 px-6">
          <TimeInput
            label="Start Time"
            mode="time"
            value={startTime}
            onChange={setStartTime}
          />
        </View>
        <View className="mb-4 px-6">
          <TimeInput
            label="Duration"
            mode="duration"
            value={duration}
            onChange={setDuration}
          />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pb-6 pt-4">
        <MainButton
          text={isGenerating ? 'Processing...' : 'Generate'}
          width="50%"
          height={40}
          onPress={handleGenerate}
          disabled={isGenerating}
        />
      </View>
    </View>
  );
}
