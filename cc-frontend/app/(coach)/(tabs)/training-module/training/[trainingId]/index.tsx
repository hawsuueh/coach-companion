import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import AthleteList from '@/components/training-module/lists/AthleteList';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { TimerCard } from '@/components/training-module/cards/TimerCard';
import { getTrainingDetailsVM } from '@/view-models/training-module';

export default function TrainingDetails() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  const [training, setTraining] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vm = await getTrainingDetailsVM(trainingId);
      setTraining(vm);
      setLoading(false);
    };
    fetchData();
  }, [trainingId]);

  useEffect(() => {
    if (training?.name) {
      setTitle('Training Details');
    }
  }, [training, setTitle]);

  const filteredAthletes =
    training?.athletes?.filter((item: any) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  const handleFilterPress = () => console.log('Filter athletes');
  const handleAthletePress = (athleteTrainingId: string) => {
    router.push(
      `/training-module/training/${trainingId}/${athleteTrainingId}` as Href
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">
          Loading training details...
        </Text>
      </View>
    );
  }

  if (!training) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-black">Training not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Training Card */}
      <View>
        <TrainingCard
          name={training.name}
          date={training.date}
          time={training.time}
        />
      </View>

      <View className="items-center">
        <TimerCard remainingSeconds={training.duration} />
      </View>

      {/* Filter Button */}
      <View className="mb-1 items-end p-2">
        <IconButton
          IconComponent={Ionicons}
          icon="filter-outline"
          onPress={handleFilterPress}
        />
      </View>

      {/* Athlete List */}
      <FlatList
        data={filteredAthletes}
        keyExtractor={item => item.athleteTrainingId}
        renderItem={({ item }) => (
          <AthleteList
            athlete={item}
            onPress={() => handleAthletePress(item.athleteTrainingId)}
          />
        )}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No athletes found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 5 }}
      />

      {/* Floating Button */}
      <Link
        href="/(coach)/(tabs)/training-module/(modals)/edit-training"
        asChild
      >
        <FloatingButton icon="edit" IconComponent={AntDesign} />
      </Link>
    </View>
  );
}
