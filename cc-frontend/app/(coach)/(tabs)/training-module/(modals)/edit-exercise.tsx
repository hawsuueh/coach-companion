import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import NumberedTextArea from '@/components/training-module/inputs/NumberedTextArea';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';
import { getExerciseVM, updateExerciseVM } from '@/view-models/training-module';
import { getEquipmentOptionsVM } from '@/view-models/training-module';
import { getMuscleOptionsVM } from '@/view-models/training-module';
import supabase from '@/config/supabaseClient';

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

  // 🔹 Dropdown options
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [muscleOptions, setMuscleOptions] = useState<any[]>([]);

  // 🔹 Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Edit Exercise');

    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch exercise details (only base fields)
      const vm = await getExerciseVM(exerciseId);
      if (vm) {
        setExerciseName(vm.name);
        setExerciseUrl(vm.url);
        setInstructions(vm.instructions);
      }

      // 2. Fetch relations for prefill
      const { data: relData } = await supabase
        .from('exercise')
        .select(
          `
    exercise_equipment ( equipment_id ),
    exercise_muscle ( muscle_id, is_primary )
  `
        )
        .eq('exercise_id', exerciseId)
        .maybeSingle();

      if (relData) {
        setSelectedEquipments(
          relData.exercise_equipment?.map((eq: any) =>
            eq.equipment_id.toString()
          ) || []
        );
        setSelectedPrimaryMuscle(
          relData.exercise_muscle
            ?.filter((m: any) => m.is_primary)
            .map((m: any) => m.muscle_id.toString()) || []
        );
        setSelectedSecondaryMuscle(
          relData.exercise_muscle
            ?.filter((m: any) => !m.is_primary)
            .map((m: any) => m.muscle_id.toString()) || []
        );
      }

      // 3. Fetch dropdown options
      const eqOptions = await getEquipmentOptionsVM();
      const mOptions = await getMuscleOptionsVM();
      setEquipmentOptions(eqOptions);
      setMuscleOptions(mOptions);

      setLoading(false);
    };

    fetchData();
  }, [exerciseId, setTitle]);

  const handleSave = async () => {
    const result = await updateExerciseVM(
      exerciseId,
      exerciseName,
      exerciseUrl,
      instructions,
      selectedEquipments,
      selectedPrimaryMuscle,
      selectedSecondaryMuscle
    );

    if (result.success) {
      Alert.alert('Success', 'Exercise updated successfully');
      router.back();
    } else {
      Alert.alert('Error', 'Failed to update exercise');
      console.error(result.error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">Loading exercise...</Text>
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

      <View className="absolute bottom-0 left-0 right-0 items-center bg-primary py-4">
        <MainButton text="Save" width="50%" height={40} onPress={handleSave} />
      </View>
    </View>
  );
}
