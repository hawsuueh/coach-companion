import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

export default function Exercises() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleFloatingPress = () => {
    console.log('Floating button pressed');
  };

  // Sample data (replace with actual data later)
  const exercises = [
    {
      exerciseId: '1',
      exerciseName: 'Plank Hold',
      description: 'Strengthens chest, shoulders, and triceps'
    },
    {
      exerciseId: '2',
      exerciseName: 'Squats',
      description: 'Targets quads, hamstrings, and glutes'
    },
    {
      exerciseId: '3',
      exerciseName: 'Plank',
      description: 'Improves core strength and stability'
    },
    {
      exerciseId: '4',
      exerciseName: 'Lunges',
      description: 'Enhances balance and strengthens legs'
    },
    {
      exerciseId: '5',
      exerciseName: 'Burpees',
      description: 'Full-body exercise for strength and endurance'
    },
    {
      exerciseId: '6',
      exerciseName: 'Jump Rope',
      description: 'Boosts cardiovascular endurance and coordination'
    }
  ];

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

      {/* Floating Button */}
      <Link
        href="/(coach)/(tabs)/training-module/(modals)/add-exercise"
        asChild
      >
        <FloatingButton icon="add" IconComponent={FontAwesome6} />
      </Link>
    </View>
  );
}
