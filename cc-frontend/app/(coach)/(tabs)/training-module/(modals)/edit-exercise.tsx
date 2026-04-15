import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import NumberedTextArea from '@/components/training-module/inputs/NumberedTextArea';
import SingleSelectDropdown from '@/components/training-module/inputs/SingleSelectDropdown';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';

export default function EditExerciseModal() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { setTitle } = useHeader();
  const router = useRouter();

  // 🔹 Form state
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseUrl, setExerciseUrl] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedPrimaryMuscle, setSelectedPrimaryMuscle] = useState<string[]>(
    []
  );
  const [selectedSecondaryMuscle, setSelectedSecondaryMuscle] = useState<
    string[]
  >([]);
  const [exerciseType, setExerciseType] = useState<string | null>(null);

  // 🔹 Loading state
  const [loading, setLoading] = useState(true);

  // 🔹 Dummy exercise (simulating DB result)
  const exercise = {
    exerciseId,
    name: 'Bench Press',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    instructions: ['Lie on bench', 'Lower bar', 'Press up'],
    equipment: ['2'], // must match dropdown values
    type: '1',
    primaryMuscle: ['1'],
    secondaryMuscle: ['3']
  };

  // 🔹 Populate modal when exercise loads
  useEffect(() => {
    setTitle('Edit Exercise');

    // simulate fetch
    setExerciseName(exercise.name);
    setExerciseUrl(exercise.url);
    setInstructions(exercise.instructions);
    setSelectedEquipments(exercise.equipment);
    setExerciseType(exercise.type);
    setSelectedPrimaryMuscle(exercise.primaryMuscle);
    setSelectedSecondaryMuscle(exercise.secondaryMuscle);

    setLoading(false);
  }, [exerciseId]);

  // 🔹 Dropdown options
  const equipmentOptions = [
    { label: 'Bodyweight', value: '1' },
    { label: 'Barbell', value: '2' },
    { label: 'Smith Machine', value: '3' }
  ];

  const exerciseTypeOptions = [
    { label: 'Strength', value: '1' },
    { label: 'Endurance', value: '2' },
    { label: 'Hypertrophy', value: '3' }
  ];

  const muscleOptions = [
    { label: 'Pectoralis Major', value: '1' },
    { label: 'Rectus Femoris', value: '2' },
    { label: 'Deltoids', value: '3' }
  ];

  // 🔹 Loading guard
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text>Loading exercise...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Name */}
        <View className="mb-4 mt-4 px-6">
          <TextInput
            label="Exercise Name"
            value={exerciseName}
            onChangeText={setExerciseName}
          />
        </View>

        {/* Video URL */}
        <View className="mb-4 px-6">
          <TextInput
            label="Video Link"
            value={exerciseUrl}
            onChangeText={setExerciseUrl}
          />
        </View>

        {/* Instructions */}
        <View className="mb-4 px-6">
          <NumberedTextArea
            label="Instructions"
            value={instructions}
            onChange={setInstructions}
          />
        </View>

        {/* Equipments */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={equipmentOptions}
            value={selectedEquipments}
            IconComponent={Ionicons}
            icon="barbell-outline"
            onChange={setSelectedEquipments}
            placeholder="Select equipments"
          />
        </View>

        {/* Exercise Type */}
        <View className="mb-4 px-6">
          <SingleSelectDropdown
            data={exerciseTypeOptions}
            value={exerciseType}
            onChange={setExerciseType}
            placeholder="Exercise Type"
          />
        </View>

        {/* Primary Muscle */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={muscleOptions}
            value={selectedPrimaryMuscle}
            IconComponent={Ionicons}
            icon="body"
            onChange={setSelectedPrimaryMuscle}
            placeholder="Primary Muscle"
          />
        </View>

        {/* Secondary Muscle */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={muscleOptions}
            value={selectedSecondaryMuscle}
            IconComponent={Ionicons}
            icon="body-outline"
            onChange={setSelectedSecondaryMuscle}
            placeholder="Secondary Muscle"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 items-center bg-primary py-4">
        <MainButton
          text="Save"
          width="50%"
          height={40}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
