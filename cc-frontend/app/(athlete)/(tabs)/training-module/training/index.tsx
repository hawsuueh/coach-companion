// What is inside this ARE the training for the particular athlete using AthleteTraining --AthleteTraining(s)
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import TrainingReminderCard from '@/components/training-module/cards/TrainingReminderCard';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import { Ionicons, Entypo } from '@expo/vector-icons';

export default function AthleteTraining() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  // Dummy training at the present day (metadata)
  const trainingToday = {
    athleteTrainingId: '1',
    trainingId: '1',
    name: 'Training Name',
    date: 'Sept 15, 2025',
    time: '7:00 AM'
  };

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleTrainingPress = (athleteTrainingId: string) => {
    router.push(`/training-module/training/${athleteTrainingId}` as Href);
  };

  // Sample data (replace with actual data later)
  // This is collection of Training gathered using AthleteTraining of Athlete, this exclude excempted trainings
  const athleteTraining = [
    {
      athleteTrainingId: '1',
      trainingName: 'Core Strength Training',
      dateTime: 'Sept 15, 2025 - 7:00 AM'
    },
    {
      athleteTrainingId: '2',
      trainingName: 'Upper Body Strength',
      dateTime: 'Sept 16, 2025 - 5:00 PM'
    },
    {
      athleteTrainingId: '3',
      trainingName: 'Explosive Power Workout',
      dateTime: 'Sept 17, 2025 - 6:30 AM'
    },
    {
      athleteTrainingId: '4',
      trainingName: 'Core Strength Training',
      dateTime: 'Sept 15, 2025 - 7:00 AM'
    },
    {
      athleteTrainingId: '5',
      trainingName: 'Upper Body Strength',
      dateTime: 'Sept 16, 2025 - 5:00 PM'
    },
    {
      athleteTrainingId: '6',
      trainingName: 'Explosive Power Workout',
      dateTime: 'Sept 17, 2025 - 6:30 AM'
    }
  ];

  // Filter trainings by search text (case-insensitive)
  const filteredTrainings = athleteTraining.filter(item =>
    item.trainingName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Training for the Present Day */}
      <View className="mb-5">
        <TrainingReminderCard
          name={trainingToday.name}
          date={trainingToday.date}
          time={trainingToday.time}
          onPress={() => handleTrainingPress(trainingToday.athleteTrainingId)}
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

      {/* Trainings List */}
      <FlatList
        data={filteredTrainings}
        keyExtractor={item => item.athleteTrainingId}
        renderItem={({ item }) => (
          <List1
            title={item.trainingName}
            subtitle={item.dateTime}
            onPress={() => handleTrainingPress(item.athleteTrainingId)}
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
