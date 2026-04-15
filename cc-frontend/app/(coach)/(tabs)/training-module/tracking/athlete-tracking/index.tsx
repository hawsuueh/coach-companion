import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href } from 'expo-router';
import AthleteList from '@/components/training-module/lists/AthleteList';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getAthletesVM } from '@/view-models/training-module';

export default function AthleteListTracking() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Athlete Tracking');
  }, [setTitle]);

  useEffect(() => {
    const fetchAthletes = async () => {
      setLoading(true);
      try {
        const vm = await getAthletesVM();
        setAthletes(vm);
      } catch (err) {
        console.error('Error fetching athletes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAthletes();
  }, []);

  const filteredAthletes = athletes.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFilterPress = () => console.log('Filter athletes');
  const handleAthletePress = (athleteId: string) => {
    router.push(
      `/training-module/tracking/athlete-tracking/${athleteId}` as Href
    );
  };

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Search */}
      <View className="mb-5">
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>

      {/* Filter Button */}
      <View className="mb-1 items-end p-2">
        <IconButton
          IconComponent={Ionicons}
          icon="filter-outline"
          onPress={handleFilterPress}
        />
      </View>

      {/* Athlete List */}
      {loading ? (
        <View className="mt-10 items-center">
          <Text className="text-base text-gray-500">Loading athletes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAthletes}
          keyExtractor={item => item.athleteId}
          renderItem={({ item }) => (
            <AthleteList
              athlete={item}
              onPress={() => handleAthletePress(item.athleteId)}
            />
          )}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-base text-gray-500">No athletes found</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 5 }}
        />
      )}
    </View>
  );
}
