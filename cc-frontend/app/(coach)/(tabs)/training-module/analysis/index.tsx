import { useMemo, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

/* ---------------------------------- */
/* DUMMY ANALYSIS DATA */
/* ---------------------------------- */

const trainingStats = {
  totalTrainings: 12,
  totalTimeSeconds: 18420, // ~5h 7m
  averageDurationSeconds: 1535 // ~25m
};

const exerciseAnalytics = [
  {
    id: '1',
    name: 'Defensive Slides',
    totalTimeSeconds: 3200,
    sessions: 6
  },
  {
    id: '2',
    name: 'Suicide Sprints',
    totalTimeSeconds: 4100,
    sessions: 5
  },
  {
    id: '3',
    name: 'Plank Hold',
    totalTimeSeconds: 2800,
    sessions: 7
  },
  {
    id: '4',
    name: 'Jump Squats',
    totalTimeSeconds: 2100,
    sessions: 4
  }
];

/* ---------------------------------- */
/* UTILS */
/* ---------------------------------- */

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

/* ---------------------------------- */
/* SCREEN */
/* ---------------------------------- */

export default function Analysis() {
  const [search, setSearch] = useState('');

  const filteredExercises = useMemo(() => {
    return exerciseAnalytics.filter(ex =>
      ex.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleAthletePress = () => {
    console.log('Athlete selector pressed');
  };

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* HEADER ACTIONS */}
      <View className="mb-2 items-end">
        <IconButton
          IconComponent={Ionicons}
          icon="people-sharp"
          onPress={handleAthletePress}
        />
      </View>

      {/* TITLE */}
      <View className="mb-3">
        <Text className="text-h2">Analysis</Text>
        <Text className="text-body2 text-gray-500">
          Training performance overview
        </Text>
      </View>

      {/* QUICK STATS */}
      <View className="mb-4 flex-row justify-between">
        <View className="w-[32%] items-center rounded-xl bg-white p-3">
          <Text className="text-title2">{trainingStats.totalTrainings}</Text>
          <Text className="text-label3 text-center text-gray-500">
            Trainings
          </Text>
        </View>

        <View className="w-[32%] items-center rounded-xl bg-white p-3">
          <Text className="text-title2">
            {formatTime(trainingStats.totalTimeSeconds)}
          </Text>
          <Text className="text-label3 text-center text-gray-500">
            Total Time
          </Text>
        </View>

        <View className="w-[32%] items-center rounded-xl bg-white p-3">
          <Text className="text-title2">
            {formatTime(trainingStats.averageDurationSeconds)}
          </Text>
          <Text className="text-label3 text-center text-gray-500">
            Avg Session
          </Text>
        </View>
      </View>

      {/* EXERCISE ANALYTICS LIST */}
      <FlatList
        className="mb-24 mt-3"
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List1
            title={item.name}
            subtitle={`${formatTime(item.totalTimeSeconds)} • ${
              item.sessions
            } sessions`}
            onPress={() => console.log('Open analysis for', item.name)}
          />
        )}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-body2 text-gray-500">No exercises found</Text>
          </View>
        }
      />
    </View>
  );
}
