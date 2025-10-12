import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import DateInput from '@/components/training-module/inputs/DateInput';
import SingleSelectCalendar from '@/components/training-module/inputs/SingleSelectCalendar';
import TimeInput from '@/components/training-module/inputs/TimeInput';
import MainButton from '@/components/training-module/buttons/MainButton';

export default function EditTrainingModal() {
  const { setTitle } = useHeader();
  const [isLoading, setIsLoading] = useState(true);

  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');

  const handleSelectChange = (values: string[]) => {
    setSelectedAthletes(values);
  };

  const sampleDropdownData = [
    { label: '23 Doe, John', value: '1' },
    { label: '10 Smith, Alex', value: '2' },
    { label: '7 Lee, James', value: '3' }
  ];

  // 🧠 Simulated "database" data
  const dummyTrainingData = {
    id: 1,
    name: 'Explosive Power Training',
    athletes: ['1', '2', '3'],
    date: '2025-10-20',
    start_time: '08:30',
    duration: '1h 30m'
  };

  useEffect(() => {
    setTitle('Edit Training');
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTrainingName(dummyTrainingData.name);
      setSelectedAthletes(dummyTrainingData.athletes);
      setDate(dummyTrainingData.date);
      setStartTime(dummyTrainingData.start_time);
      setDuration(dummyTrainingData.duration);

      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-h2">Loading training...</Text>
      </View>
    );
  }

  return (
    <View className="mb-4 mt-4 flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
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
            data={sampleDropdownData}
            value={selectedAthletes}
            onChange={handleSelectChange}
            placeholder="Select athletes"
          />
        </View>

        {/* Date Input (toggle calendar) */}
        <View className="mb-2 px-6">
          <DateInput
            date={date}
            onPress={() => setShowCalendar(prev => !prev)}
          />
        </View>

        {/* Calendar */}
        {showCalendar && (
          <View className="mb-4">
            <SingleSelectCalendar
              initialDate={date || undefined}
              onChange={selected => {
                setDate(selected || null);
              }}
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

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Save Changes"
          width="50%"
          height={40}
          onPress={() =>
            console.log('Updated values:', {
              trainingName,
              selectedAthletes,
              date,
              startTime,
              duration
            })
          }
        />
      </View>
    </View>
  );
}
