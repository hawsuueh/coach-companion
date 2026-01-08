import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href } from 'expo-router';
import AthleteTrainingCard from '@/components/training-module/cards/AthleteTrainingCard';
import List1 from '@/components/training-module/lists/List1';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function AthleteTraining() {
  const { trainingId, athleteTrainingId } = useLocalSearchParams<{
    trainingId: string;
    athleteTrainingId: string;
  }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  // Dummy athlete_training (metadata)
  const athleteTraining = {
    athleteTrainingId: athleteTrainingId,
    athleteName: 'John Doe',
    position: 'Guard',
    trainingName: 'Core Strength Training',
    date: 'Sept 15, 2025',
    time: '7:00 AM'
  };

  // Dummy athlete_training_exercises data
  const athleteTrainingExercises = [
    {
      athleteTrainingExerciseId: '1',
      exerciseName: 'Push-Ups',
      description: 'Strengthens chest, shoulders, and triceps'
    },
    {
      athleteTrainingExerciseId: '2',
      exerciseName: 'Squats',
      description: 'Targets quads, hamstrings, and glutes'
    },
    {
      athleteTrainingExerciseId: '3',
      exerciseName: 'Plank',
      description: 'Improves core strength and stability'
    },
    {
      athleteTrainingExerciseId: '4',
      exerciseName: 'Lunges',
      description: 'Enhances balance and strengthens legs'
    },
    {
      athleteTrainingExerciseId: '5',
      exerciseName: 'Burpees',
      description: 'Full-body exercise for strength and endurance'
    },
    {
      athleteTrainingExerciseId: '6',
      exerciseName: 'Jump Rope',
      description: 'Boosts cardiovascular endurance and coordination'
    }
  ];

  const filteredExercises = athleteTrainingExercises.filter(item =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFilterPress = () => console.log('Filter athletes');
  const handleFloatingPress = () =>
    console.log('Floating button pressed in training details');

  const handleAExercisePress = (exerciseId: string) => {
    router.push(`/training-module/exercises/${exerciseId}` as Href);
  };

  // Set header2 title whenever this screen loads
  useEffect(() => {
    if (athleteTraining?.trainingName) {
      setTitle('Athlete Training');
    }
  }, [athleteTraining, setTitle]);

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Athlete Training Card */}
      <View className="mb-4">
        <AthleteTrainingCard
          athleteName={athleteTraining.athleteName}
          position={athleteTraining.position}
          trainingName={athleteTraining.trainingName}
          date={athleteTraining.date}
          time={athleteTraining.time}
        />
      </View>

      {/* Filter Button */}
      <View className="mb-1 items-end p-2">
        <IconButton
          IconComponent={Ionicons}
          icon="filter-outline"
          onPress={handleFilterPress}
        />
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.athleteTrainingExerciseId}
        renderItem={({ item }) => (
          <List1
            title={item.exerciseName}
            subtitle={item.description}
            onPress={() => handleAExercisePress(item.athleteTrainingExerciseId)}
            onLongPress={() => console.log(`Long pressed ${item.exerciseName}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 5 }} // extra space for FAB
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No trainings found</Text>
          </View>
        }
      />

      {/* Floating Button */}
      {/* <FloatingButton
        onPress={handleFloatingPress}
        icon="edit"
        IconComponent={AntDesign}
      /> */}
    </View>
  );
}
