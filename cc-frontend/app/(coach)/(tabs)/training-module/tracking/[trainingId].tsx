import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import DropdownList from '@/components/training-module/lists/DropdownList';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function TrainingTracking() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();
  const { setTitle } = useHeader();

  const training = {
    trainingId,
    name: 'Training Name',
    date: 'Sept 15, 2025',
    time: '7:00 AM'
  };

  const athleteTracking = [
    {
      trackingId: '1',
      athleteId: '1',
      number: '23',
      name: 'John Doe',
      position: 'Guard',
      status: 'assigned'
    },
    {
      trackingId: '2',
      athleteId: '2',
      number: '10',
      name: 'Alex Smith',
      position: 'Forward',
      status: 'assigned'
    },
    {
      trackingId: '3',
      athleteId: '3',
      number: '7',
      name: 'James Lee',
      position: 'Center',
      status: 'done'
    },
    {
      trackingId: '4',
      athleteId: '4',
      number: '15',
      name: 'Michael Cruz',
      position: 'Guard',
      status: 'exempted'
    }
  ];

  useEffect(() => {
    setTitle('Training Tracking');
  }, []);

  // Helper function to format dropdown data
  const formatData = (status: string) =>
    athleteTracking
      .filter(a => a.status === status)
      .map(a => ({
        id: a.trackingId,
        contentTitle: `${a.number} ${a.name}`,
        contentRightText: a.position
      }));

  return (
    <View className="flex-1 bg-primary">
      {/* Training Card */}
      <View className="mb-4 mt-4">
        <TrainingCard
          name={training.name}
          date={training.date}
          time={training.time}
        />
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
