import { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import DeleteModal from '@/components/training-module/modal/DeleteModal';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import {
  getExercisesVM,
  deleteExerciseVM
} from '@/view-models/training-module';

export default function Exercises() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleLongPress = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setDeleteModalVisible(true); // ✅ open modal
  };

  const handleDelete = async () => {
    if (!selectedExerciseId) return;
    const result = await deleteExerciseVM(selectedExerciseId);
    if (result.success) {
      setExercises(prev =>
        prev.filter(ex => ex.exerciseId !== selectedExerciseId)
      );
    } else {
      console.error(result.error);
    }
    setDeleteModalVisible(false);
  };

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
        <Text className="text-body1 text-black">Loading exercises...</Text>
      </View>
    );
  }

  const handleFilterPress = () => {
    console.log('Filter button pressed');
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
            onLongPress={() => handleLongPress(item.exerciseId)} // ✅ use handler
          />
        )}
        contentContainerStyle={{ paddingBottom: 5 }}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No exercises found</Text>
          </View>
        }
      />

      {/* Floating Button */}
      <Link
        href="/(coach)/(tabs)/training-module/(modals)/add-exercise"
        asChild
      >
        <FloatingButton icon="add" IconComponent={FontAwesome6} />
      </Link>

      {/* Delete Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDelete}
      />
    </View>
  );
}
