import { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getTrainingsVM } from '@/view-models/training-module';

export default function Tracking() {
  const [searchText, setSearchText] = useState('');
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { coachNo } = useAuth();

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      const vm = await getTrainingsVM(coachNo);
      setTrainings(vm);
      setLoading(false);
    };
    fetchTrainings();
  }, [coachNo]);

  const handleFilterPress = () => {
    console.log('Filter button pressed');
  };

  const handleAthletePress = () => {
    router.push(`/training-module/tracking/athlete-tracking` as Href);
  };

  const handleTrainingPress = (trainingId: string) => {
    router.push(`/training-module/tracking/${trainingId}` as Href);
  };

  // Filter trainings by search text (case-insensitive)
  const filteredTrainings = trainings.filter(item =>
    item.trainingName.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">Loading trainings...</Text>
      </View>
    );
  }

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
        keyExtractor={item => item.trainingId}
        renderItem={({ item }) => (
          <List1
            title={item.trainingName}
            // ✅ VM already formats date + time + duration
            subtitle={`${item.dateTime} • ${item.duration}`}
            onPress={() => handleTrainingPress(item.trainingId)}
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
