import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AthleteCard from '@/components/training-module/cards/AthleteCard';
import DropdownList from '@/components/training-module/lists/DropdownList';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getAthleteTrackingVM } from '@/view-models/training-module';

export default function AthleteTracking() {
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const { setTitle } = useHeader();

  const [athlete, setAthlete] = useState<any>(null);
  const [trainingTracking, setTrainingTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Athlete Tracking');
  }, [setTitle]);

  useEffect(() => {
    if (!athleteId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const vm = await getAthleteTrackingVM(athleteId);
        setAthlete(vm.athlete);
        setTrainingTracking(vm.trainingTracking);
      } catch (err) {
        console.error('Error fetching athlete tracking', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [athleteId]);

  const formatData = (status: string) =>
    trainingTracking
      .filter(a => a.status === status)
      .map(a => ({
        id: a.athleteTrainingTrackingId?.toString() ?? '',
        contentTitle: a.name,
        contentRightText: a.dateTime
      }));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">
          Loading athlete tracking...
        </Text>
      </View>
    );
  }

  if (!athlete) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text>No athlete found</Text>
      </View>
    );
  }

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
