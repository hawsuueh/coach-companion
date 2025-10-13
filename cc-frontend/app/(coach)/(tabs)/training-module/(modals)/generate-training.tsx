import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import DateInput from '@/components/training-module/inputs/DateInput';
import MultiSelectCalendar from '@/components/training-module/inputs/MultiSelectCalendar';
import TimeInput from '@/components/training-module/inputs/TimeInput';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';

export default function GenerateTrainingModal() {
  const { setTitle } = useHeader();
  const router = useRouter();
  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false); // 👈 toggle state
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');

  const handleAthleteSelectChange = (values: string[]) => {
    setSelectedAthletes(values);
  };

  const handleEquipmentSelectChange = (values: string[]) => {
    setSelectedEquipments(values);
  };

  const sampleAthleteData = [
    { label: '23 Doe, John', value: '1' },
    { label: '10 Smith, Alex', value: '2' },
    { label: '7 Lee, James', value: '3' }
  ];
  const sampleEquipmentData = [
    { label: 'Bodyweight', value: '1' },
    { label: 'Barbels', value: '2' },
    { label: 'Smith Machine', value: '3' }
  ];

  useEffect(() => {
    setTitle('Generate Training');
  });

  return (
    <View className="mb-4 mt-4 flex-1 bg-primary">
      {/* Scrollable form content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }} // so last field doesn’t get hidden behind button
        showsVerticalScrollIndicator={false}
      >
        {/* Training Name */}
        <View className="mb-4 mt-4 px-6">
          <TextInput
            label="Training Name"
            value={trainingName}
            onChangeText={setTrainingName}
          />
        </View>

        {/* Athletes */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={sampleAthleteData}
            value={selectedAthletes}
            IconComponent={Ionicons}
            icon="people-sharp"
            onChange={handleAthleteSelectChange}
            placeholder="Select athletes"
          />
        </View>
        {/* Equipments */}
        <View className="mb-4 px-6">
          <MultiSelectDropdown
            data={sampleEquipmentData}
            value={selectedEquipments}
            IconComponent={Ionicons}
            icon="barbell-outline"
            onChange={handleEquipmentSelectChange}
            placeholder="Select equipments"
          />
        </View>

        {/* Date Input */}
        <View className="px-6">
          <DateInput
            dates={dates}
            onPress={() => setShowCalendar(prev => !prev)}
          />
        </View>

        {/* Calendar */}
        {showCalendar && (
          <View className="mb-4">
            <MultiSelectCalendar
              initialDates={dates}
              onChange={selected => setDates(selected)}
            />
          </View>
        )}

        {/* Time Inputs */}
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
      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Generate"
          width="50%"
          height={40}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
