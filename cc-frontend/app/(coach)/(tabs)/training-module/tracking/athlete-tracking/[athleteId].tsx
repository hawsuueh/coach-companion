import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import AthleteCard from '@/components/training-module/cards/AthleteCard';
import DropdownList from '@/components/training-module/lists/DropdownList';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function TrainingTracking() {
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const { setTitle } = useHeader();

  const athlete = {
    athleteId,
    name: 'Doe, John',
    position: 'Guard'
  };

  const trainingTracking = [
    {
      trackingId: '1',
      trainingId: '1',
      number: '23',
      name: 'Core Strength Training',
      dateTime: 'Sept 15, 2025 - 7:00 AM',
      status: 'assigned'
    },
    {
      trackingId: '2',
      trainingId: '2',
      name: 'Upper Body Strength',
      dateTime: 'Sept 16, 2025 - 5:00 PM',
      status: 'assigned'
    },
    {
      trackingId: '3',
      trainingId: '3',
      name: 'Explosive Power Workout',
      dateTime: 'Sept 17, 2025 - 6:30 AM',
      status: 'missed'
    }
  ];

  useEffect(() => {
    setTitle('Athlete Tracking');
  });

  // Helper function to format dropdown data
  const formatData = (status: string) =>
    trainingTracking
      .filter(a => a.status === status)
      .map(a => ({
        id: a.trackingId,
        contentTitle: a.name,
        contentRightText: a.dateTime
      }));

  return (
    <View className="flex-1 bg-primary">
      {/* Athlete Card */}
      <View className="mb-10 mt-10">
        <AthleteCard name={athlete.name} position={athlete.position} />
      </View>

      {/* Dropdown Lists */}
      <DropdownList
        title="Assigned"
        leftText={formatData('assigned').length}
        data={formatData('assigned')}
      />
      <DropdownList
        title="Exempted"
        leftText={formatData('exempted').length}
        data={formatData('exempted')}
      />
      <DropdownList
        title="Missed"
        leftText={formatData('missed').length}
        data={formatData('missed')}
      />
      <DropdownList
        title="Done"
        leftText={formatData('done').length}
        data={formatData('done')}
      />
    </View>
  );
}
