import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href } from 'expo-router';
import AthleteTrainingCard from '@/components/training-module/cards/AthleteTrainingCard';
import List1 from '@/components/training-module/lists/List1';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getAthleteTrainingCoachVM } from '@/view-models/training-module';
import { getAthleteTrainingExerciseVM } from '@/view-models/training-module';

export default function AthleteTraining() {
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  const [athleteTraining, setAthleteTraining] = useState<any | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vmTraining = await getAthleteTrainingCoachVM(athleteTrainingId);
      const vmExercises = await getAthleteTrainingExerciseVM(athleteTrainingId);
      setAthleteTraining(vmTraining);
      setExercises(vmExercises);
      setLoading(false);
    };
    fetchData();
  }, [athleteTrainingId]);

  useEffect(() => {
    if (athleteTraining?.trainingName) {
      setTitle('Athlete Training');
    }
  }, [athleteTraining, setTitle]);

  const filteredExercises = exercises.filter(item =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFilterPress = () => console.log('Filter exercises');
  const handleExercisePress = (exerciseId: string) => {
    router.push(`/training-module/exercises/${exerciseId}` as Href);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-black">Loading athlete training...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Athlete Training Card */}
      {athleteTraining && (
        <View className="mb-4">
          <AthleteTrainingCard
            athleteName={athleteTraining.athleteName}
            position={athleteTraining.position}
            trainingName={athleteTraining.trainingName}
            date={athleteTraining.date}
            time={athleteTraining.time}
          />
        </View>
      )}

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
            subtitle={item.subtitle}
            onPress={() => handleExercisePress(item.exerciseId)}
            onLongPress={() => console.log(`Long pressed ${item.exerciseName}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 5 }}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No exercises found</Text>
          </View>
        }
      />
    </View>
  );
}
