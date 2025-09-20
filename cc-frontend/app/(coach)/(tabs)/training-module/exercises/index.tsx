import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

export default function Exercises() {
  const [searchText, setSearchText] = useState('');

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleFloatingPress = () => {
    console.log('Floating button pressed');
  };

  // Sample data (replace with actual data later)
  const exercises = [
    {
      id: '1',
      exerciseName: 'Push-Ups',
      description: 'Strengthens chest, shoulders, and triceps'
    },
    {
      id: '2',
      exerciseName: 'Squats',
      description: 'Targets quads, hamstrings, and glutes'
    },
    {
      id: '3',
      exerciseName: 'Plank',
      description: 'Improves core strength and stability'
    },
    {
      id: '4',
      exerciseName: 'Lunges',
      description: 'Enhances balance and strengthens legs'
    },
    {
      id: '5',
      exerciseName: 'Burpees',
      description: 'Full-body exercise for strength and endurance'
    },
    {
      id: '6',
      exerciseName: 'Jump Rope',
      description: 'Boosts cardiovascular endurance and coordination'
    }
  ];

  // Filter exercises by search text (case-insensitive)
  const filteredTrainings = exercises.filter(item =>
    item.exerciseName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search + Filter */}
      <View className="mb-4">
        <View className="mb-5">
          <SearchBar searchText={searchText} setSearchText={setSearchText} />
        </View>

        <View className="items-end p-2">
          <IconButton
            IconComponent={Ionicons}
            icon="filter-outline"
            onPress={handleFilterPress}
          />
        </View>
      </View>

      {/* Trainings List */}
      <FlatList
        data={filteredTrainings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List1
            title={item.exerciseName}
            subtitle={item.description}
            onPress={() => console.log(`Pressed ${item.exerciseName}`)}
            onLongPress={() => console.log(`Long pressed ${item.exerciseName}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 10 }} // extra space for FAB
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No trainings found</Text>
          </View>
        }
      />

      {/* Floating Button */}
      <FloatingButton
        onPress={handleFloatingPress}
        icon="add"
        IconComponent={FontAwesome6}
      />
    </View>
  );
}
