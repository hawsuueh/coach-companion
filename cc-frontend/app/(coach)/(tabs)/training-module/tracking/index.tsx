import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import { Ionicons } from '@expo/vector-icons';

export default function Tracking() {
  const [searchText, setSearchText] = useState('');

  const handleAthletePress = () => {
    console.log('Athlete button pressed');
  };

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleFloatingPress = () => {
    console.log('Floating button pressed');
  };

  // Sample data (replace with actual data later)
  const trainings = [
    {
      id: '1',
      trainingName: 'Core Strength Training',
      dateTime: 'Sept 15, 2025 - 7:00 AM'
    },
    {
      id: '2',
      trainingName: 'Upper Body Strength',
      dateTime: 'Sept 16, 2025 - 5:00 PM'
    },
    {
      id: '3',
      trainingName: 'Explosive Power Workout',
      dateTime: 'Sept 17, 2025 - 6:30 AM'
    },
    {
      id: '4',
      trainingName: 'Core Strength Training',
      dateTime: 'Sept 15, 2025 - 7:00 AM'
    },
    {
      id: '5',
      trainingName: 'Upper Body Strength',
      dateTime: 'Sept 16, 2025 - 5:00 PM'
    },
    {
      id: '6',
      trainingName: 'Explosive Power Workout',
      dateTime: 'Sept 17, 2025 - 6:30 AM'
    }
  ];

  // Filter trainings by search text (case-insensitive)
  const filteredTrainings = trainings.filter(item =>
    item.trainingName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>
      {/* Athlete + Filter Icon Buttons */}
      <View className="mb-1 flex-row justify-end gap-3 p-2">
        <IconButton
          IconComponent={Ionicons}
          icon="people-sharp"
          onPress={handleAthletePress}
        />
        <IconButton
          IconComponent={Ionicons}
          icon="filter-outline"
          onPress={handleFilterPress}
        />
      </View>

      {/* Trainings List */}
      <FlatList
        data={filteredTrainings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List1
            title={item.trainingName}
            subtitle={item.dateTime}
            onPress={() => console.log(`Pressed ${item.trainingName}`)}
            onLongPress={() => console.log(`Long pressed ${item.trainingName}`)}
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
