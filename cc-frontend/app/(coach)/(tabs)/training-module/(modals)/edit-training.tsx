import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import MultiDateInput from '@/components/training-module/inputs/MultiDateInput';
import MultiSelectCalendar from '@/components/training-module/inputs/MultiSelectCalendar';
import TimeInput from '@/components/training-module/inputs/TimeInput';
import MainButton from '@/components/training-module/buttons/MainButton';

export default function EditTrainingModal() {
  const { setTitle } = useHeader();
  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false); // 👈 toggle state
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

  useEffect(() => {
    setTitle('Edit Training');
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
            data={sampleDropdownData}
            value={selectedAthletes}
            onChange={handleSelectChange}
            placeholder="Select athletes"
          />
        </View>

        {/* Date Input */}
        <View className="px-6">
          <MultiDateInput
            title="Select Dates"
            onPress={() => setShowCalendar(prev => !prev)}
          />
        </View>

        {/* Selected Dates */}
        {dates.length > 0 && (
          <View className="mb-4 mt-4 flex-row flex-wrap px-6">
            {dates.map(d => (
              <Text key={d} className="mr-2 text-black">
                {d}
              </Text>
            ))}
          </View>
        )}

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
          text="Save Changes"
          width="50%"
          height={40}
          onPress={() => console.log('Button pressed!')}
        />
      </View>
    </View>
  );
}
