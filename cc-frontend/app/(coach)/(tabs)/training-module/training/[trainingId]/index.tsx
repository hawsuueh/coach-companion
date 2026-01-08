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

export default function TrainingDetails() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  // Dummy training (metadata)
  const training = {
    trainingId: trainingId,
    name: 'Core Strength Training',
    date: 'Sept 15, 2025',
    time: '7:00 AM',
    duration: 3600
  };

  // Dummy athlete_training data
  const athleteTrainings = [
    {
      athleteTrainingId: '1',
      number: '23',
      name: 'John Doe',
      position: 'Guard'
    },
    {
      athleteTrainingId: '2',
      number: '10',
      name: 'Alex Smith',
      position: 'Forward'
    },
    {
      athleteTrainingId: '3',
      number: '7',
      name: 'James Lee',
      position: 'Center'
    },
    {
      athleteTrainingId: '4',
      number: '15',
      name: 'Michael Cruz',
      position: 'Guard'
    }
  ];

  const filteredAthletes = athleteTrainings.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFilterPress = () => console.log('Filter athletes');
  const handleFloatingPress = () =>
    console.log('Floating button pressed in training details');

  const handleAthletePress = (athleteTrainingId: string) => {
    router.push(
      `/training-module/training/${trainingId}/${athleteTrainingId}` as Href
    );
  };

  // Set header2 title whenever this screen loads
  useEffect(() => {
    if (training?.name) {
      setTitle('Training Details');
    }
  }, [training, setTitle]);

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
