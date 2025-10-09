import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import TextInput from '@/components/training-module/inputs/TextInput';
import MultiSelectDropdown from '@/components/training-module/inputs/MultiSelectDropdown';
import MultiDateInput from '@/components/training-module/inputs/MultiDateInput';

export default function GenerateTrainingModal() {
  const { setTitle } = useHeader();
  const [trainingName, setTrainingName] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const handleSelectChange = (values: string[]) => {
    console.log('Selected athlete IDs:', values);
    setSelectedAthletes(values);
  };

  const sampleDropdownData = [
    { label: '23 Doe, John', value: '1' },
    { label: '10 Smith, Alex', value: '2' },
    { label: ' 7 Lee, James', value: '3' }
  ];

  useEffect(() => {
    setTitle('Generate Training');
  }, [setTitle]);

  return (
    <View className="flex-1 bg-primary px-6 pt-6">
      <View className="mb-3">
        <TextInput
          label="Training Name"
          value={trainingName}
          onChangeText={setTrainingName}
        />
      </View>
      <View className="mb-3">
        <MultiSelectDropdown
          data={sampleDropdownData}
          value={selectedAthletes}
          onChange={handleSelectChange}
          placeholder="Select athletes"
        />
      </View>
      <View>
        <MultiDateInput
          title=""
          subtitle=""
          onPress={() => console.log('Input pressed')}
        />
      </View>
    </View>
  );
}
