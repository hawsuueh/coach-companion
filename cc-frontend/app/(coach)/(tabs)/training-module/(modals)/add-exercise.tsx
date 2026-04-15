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

export default function AddExerciseModal() {
  const { setTitle } = useHeader();
  const router = useRouter();
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseUrl, setExerciseUrl] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedPrimaryMuscle, setSelectedPrimaryMuscle] = useState<string[]>(
    []
  );
  const [selectedSecondaryMuscle, setSelectedSecondaryMuscle] = useState<
    string[]
  >([]);
  const [exerciseType, setExerciseType] = useState<string | null>(null);

  const handleEquipmentSelectChange = (values: string[]) => {
    setSelectedEquipments(values);
  };

  const handlePrimaryMuscleSelectChange = (values: string[]) => {
    setSelectedPrimaryMuscle(values);
  };
  const handleSecondaryMuscleSelectChange = (values: string[]) => {
    setSelectedSecondaryMuscle(values);
  };

  // This is the equipments the coach will choose for the exercise
  const equipmentOptions = [
    { label: 'Bodyweight', value: '1' },
    { label: 'Barbels', value: '2' },
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

  useEffect(() => {
    setTitle('Add Exercise');
  });

  return (
    <View className="mb-4 mt-4 flex-1 bg-primary">
      {/* Scrollable form content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }} // so last field doesn’t get hidden behind button
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

        {/* Exercise URL */}
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

        {/* Equipments Selector */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={equipmentOptions}
            value={selectedEquipments}
            IconComponent={Ionicons}
            icon="barbell-outline"
            onChange={handleEquipmentSelectChange}
            placeholder="Select equipments"
          />
        </View>

        <View className="mb-4 px-6">
          {/* Exercise Type Selector */}
          <SingleSelectDropdown
            data={exerciseTypeOptions}
            value={exerciseType}
            onChange={setExerciseType}
            placeholder="Exercise Type"
          />
        </View>

        {/* Primary Muscle Selector */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={muscleOptions}
            value={selectedPrimaryMuscle}
            IconComponent={Ionicons}
            icon="body"
            onChange={handlePrimaryMuscleSelectChange}
            placeholder="Primary Muscle"
          />
        </View>

        {/* Secondary Muscle Selector */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={muscleOptions}
            value={selectedSecondaryMuscle}
            IconComponent={Ionicons}
            icon="body-outline"
            onChange={handleSecondaryMuscleSelectChange}
            placeholder="Secondary Muscle"
          />
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Add"
          width="50%"
          height={40}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
