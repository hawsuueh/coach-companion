import { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import TrainingReminderCard from '@/components/training-module/cards/TrainingReminderCard';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getAthleteTrainingsVM } from '@/view-models/training-module';
import { formatDate } from '@/utils/formatDate';

export default function AthleteTraining() {
  const [searchText, setSearchText] = useState('');
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { athleteNo } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vm = await getAthleteTrainingsVM(athleteNo);
      setTrainings(vm);
      setLoading(false);
    };
    fetchData();
  }, [athleteNo]);

  const handleFilterPress = () => console.log('Filter button pressed');
  const handleTrainingPress = (athleteTrainingId: string) => {
    router.push(`/training-module/training/${athleteTrainingId}` as Href);
  };

  // Filter trainings by search text
  const filteredTrainings = trainings.filter(item =>
    item.trainingName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Training for the present day (first one that matches today's date)
  const today = new Date().toISOString().split('T')[0];
  const trainingToday = trainings.find(t => t.date === formatDate(today));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-black">Loading trainings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Training for the Present Day */}
      {trainingToday && (
        <View className="mb-5">
          <TrainingReminderCard
            name={trainingToday.trainingName}
            date={trainingToday.date}
            time={trainingToday.time}
            onPress={() => handleTrainingPress(trainingToday.athleteTrainingId)}
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
        contentContainerStyle={{ paddingBottom: 5 }}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No trainings found</Text>
          </View>
        }
      />
    </View>
  );
}
