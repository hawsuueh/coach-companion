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
import { getAthletesAndEquipmentsVM } from '@/view-models/training-module';
import { generateTrainingService } from '@/services/training-generator.service';

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

  const handleGenerate = async () => {
    try {
      const training = await generateTrainingService({
        coachNo: 1, // or get from logged-in coach context
        trainingName,
        date: dates[0], // pick first selected date
        time: startTime,
        duration: Number(duration),
        athleteNos: selectedAthletes.map(Number),
        selectedEquipments
      });

      console.log('Training generated:', training.training_id);
      router.back();
    } catch (err) {
      console.error('Error generating training', err);
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
            data={athleteData}
            value={selectedAthletes}
            IconComponent={Ionicons}
            icon="people-sharp"
            onChange={handleAthleteSelectChange}
            placeholder={loading ? 'Loading athletes...' : 'Select athletes'}
          />
        </View>

        {/* Equipments */}
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
          onPress={handleGenerate}
        />
      </View>
    </View>
  );
}
