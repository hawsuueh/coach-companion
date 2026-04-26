import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import DateInput from '@/components/training-module/inputs/DateInput';
import MultiSelectCalendar from '@/components/training-module/inputs/MultiSelectCalendar';
import TimeInput from '@/components/training-module/inputs/TimeInput';
import NumberInput from '@/components/training-module/inputs/NumberInput';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';
import { MLService } from '@/services/training-module/ml.service';
import supabase from '@/config/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
// Import the new ML generation function
import { getAthletesAndEquipmentsVM } from '@/view-models/training-module/training.vm';

export default function GenerateTrainingModal() {
  const { setTitle } = useHeader();
  const router = useRouter();
  const { coachNo } = useAuth();
  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [noOfExercise, setNoOfExercise] = useState<number | null>(null);
  const [athleteData, setAthleteData] = useState<any[]>([]);
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
      } catch (err) {
        console.error('Error fetching athletes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAthleteSelectChange = (values: string[]) => {
    setSelectedAthletes(values);
  };

  const handleGenerate = async () => {
    if (
      !trainingName ||
      selectedAthletes.length === 0 ||
      !noOfExercise ||
      dates.length === 0
    ) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    setIsGenerating(true);
    const mlService = new MLService();

    try {
      // 1. Create the Main Training Records first (One per date)
      for (const date of dates) {
        const { data: training, error: tError } = await supabase
          .from('training')
          .insert({
            coach_no: Number(coachNo),
            name: trainingName,
            date: date,
            time: startTime
            // coach_no: currentCoachId // Make sure you have the coach ID available
          })
          .select()
          .single();

        if (tError) throw tError;

        // 2. Loop through each Athlete for THIS training session
        for (const athleteId of selectedAthletes) {
          // A. Link Athlete to Training
          const { data: atLink, error: atError } = await supabase
            .from('athlete_training')
            .insert({
              athlete_no: Number(athleteId),
              training_id: training.training_id
            })
            .select()
            .single();

          if (atError) throw atError;

          // B. Run AI Logic for this specific Athlete
          const zScores = await mlService.getAthleteZScores(Number(athleteId));
          const focusScores = mlService.predictFatigue(zScores);
          const distribution = mlService.calculateDistribution(
            focusScores,
            noOfExercise
          );

          // C. Fetch and Link Exercises based on AI Distribution
          for (const item of distribution) {
            if (item.count === 0) continue;

            const { data: exercises } = await supabase
              .from('exercise_bodypart')
              .select('exercise_id')
              .eq('bodypart_id', item.bodyPartId)
              .limit(item.count);

            if (exercises && exercises.length > 0) {
              const exerciseEntries = exercises.map(ex => ({
                athlete_training_id: atLink.athlete_training_id,
                exercise_id: ex.exercise_id
              }));

              const { error: eError } = await supabase
                .from('athlete_training_exercise')
                .insert(exerciseEntries);

              if (eError) console.error('Exercise Link Error:', eError);
            }
          }
        }
      }

      Alert.alert(
        'Success',
        'Individualized training generated for all athletes!'
      );
      router.replace('/(coach)/(tabs)/training-module/training');
    } catch (error: any) {
      console.error('Generation Error:', error);
      Alert.alert('Error', 'Failed to populate training tables.');
    } finally {
      setIsGenerating(false);
    }
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
          <NumberInput
            label="Number of Exercises"
            value={noOfExercise}
            onChange={setNoOfExercise}
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
