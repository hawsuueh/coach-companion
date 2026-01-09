import { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import { Ionicons } from '@expo/vector-icons';
import { getExercisesVM } from '@/view-models/training-module';

export default function Exercises() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vm = await getExercisesVM();
      setExercises(vm);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-title1 text-black">Loading exercises...</Text>
      </View>
    );
  }

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleFloatingPress = () => {
    console.log('Floating button pressed');
  };

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/training-module/exercises/${exerciseId}` as Href);
  };

  // Filter exercises by search text (case-insensitive)
  const filteredExercises = exercises.filter(item =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search + Filter */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

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
        keyExtractor={item => item.exerciseId}
        renderItem={({ item }) => (
          <List1
            title={item.exerciseName}
            subtitle={item.description}
            onPress={() => handleExercisePress(item.exerciseId)}
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
    </View>
  );
}
