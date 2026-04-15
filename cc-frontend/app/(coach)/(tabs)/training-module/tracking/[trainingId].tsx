import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import DropdownList from '@/components/training-module/lists/DropdownList';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getTrainingTrackingVM } from '@/view-models/training-module';
import { TimerCard } from '@/components/training-module/cards/TimerCard';

export default function TrainingTracking() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();
  const { setTitle } = useHeader();

  const [training, setTraining] = useState<any>(null);
  const [athleteTracking, setAthleteTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Training Tracking');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vm = await getTrainingTrackingVM(trainingId);
        setTraining(vm.training);
        setAthleteTracking(vm.athleteTracking);
      } catch (err) {
        console.error('Error fetching training tracking', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trainingId]);

  const formatData = (status: string) =>
    athleteTracking
      .filter(a => a.status === status)
      .map(a => ({
        id: a.trackingId,
        contentTitle: `${a.number}   ${a.name}`,
        contentRightText: a.position
      }));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">Loading tracking...</Text>
      </View>
    );
  }

  if (!training) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">No training found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Training Card */}
      <View className="mt-5">
        <TrainingCard
          name={training.name}
          date={training.date}
          time={training.time}
        />
      </View>

      <View className="items-center">
        <TimerCard remainingSeconds={training.duration} />
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
