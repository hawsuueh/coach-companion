import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import NumberedTextArea from '@/components/training-module/inputs/NumberedTextArea';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';
import { addExerciseService } from '@/services/training-module';
import { getEquipmentOptionsVM } from '@/view-models/training-module';
import { getMuscleOptionsVM } from '@/view-models/training-module';

export default function AddExerciseModal() {
  const { setTitle } = useHeader();
  const router = useRouter();

  const [exerciseName, setExerciseName] = useState('');
  const [exerciseUrl, setExerciseUrl] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedPrimaryMuscle, setSelectedPrimaryMuscle] = useState<string[]>(
    []
  );
  const [selectedSecondaryMuscle, setSelectedSecondaryMuscle] = useState<
    string[]
  >([]);

  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [muscleOptions, setMuscleOptions] = useState<any[]>([]);

  useEffect(() => {
    setTitle('Add Exercise');

    const fetchOptions = async () => {
      const eqOptions = await getEquipmentOptionsVM();
      const mOptions = await getMuscleOptionsVM();
      setEquipmentOptions(eqOptions);
      setMuscleOptions(mOptions);
    };

    fetchOptions();
  }, [setTitle]);

  const handleAddPress = async () => {
    try {
      const newExercise = await addExerciseService(
        exerciseName,
        exerciseUrl,
        instructions,
        selectedEquipments,
        selectedPrimaryMuscle,
        selectedSecondaryMuscle
      );
      Alert.alert('Success', `Exercise "${newExercise.name}" added!`);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to add exercise');
      console.error(err);
    }
  };

  return (
    <View className="mb-4 mt-4 flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 mt-4 px-6">
          <TextInput
            label="Exercise Name"
            value={exerciseName}
            onChangeText={setExerciseName}
          />
        </View>

        <View className="mb-4 px-6">
          <TextInput
            label="Video Link"
            value={exerciseUrl}
            onChangeText={setExerciseUrl}
          />
        </View>

        <View className="mb-4 px-6">
          <NumberedTextArea
            label="Instructions"
            value={instructions}
            onChange={setInstructions}
          />
        </View>

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

      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Add"
          width="50%"
          height={40}
          onPress={handleAddPress}
        />
      </View>
    </View>
  );
}
