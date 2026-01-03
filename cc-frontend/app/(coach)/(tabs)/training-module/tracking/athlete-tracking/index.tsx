import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import AthleteList from '@/components/training-module/lists/AthleteList';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function AthleteListTracking() {
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const { setTitle } = useHeader();

  // Dummy athlete data
  const athletes = [
    {
      athleteId: '1',
      number: '23',
      name: 'John Doe',
      position: 'Guard'
    },
    {
      athleteId: '2',
      number: '10',
      name: 'Alex Smith',
      position: 'Forward'
    },
    {
      athleteId: '3',
      number: '7',
      name: 'James Lee',
      position: 'Center'
    },
    {
      athleteId: '4',
      number: '15',
      name: 'Michael Cruz',
      position: 'Guard'
    }
  ];

  const filteredAthletes = athletes.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFilterPress = () => console.log('Filter athletes');
  const handleFloatingPress = () =>
    console.log('Floating button pressed in training details');

  const handleAthletePress = (athleteId: string) => {
    router.push(
      `/training-module/tracking/athlete-tracking/${athleteId}` as Href
    );
  };

  // Set header2 title whenever this screen loads
  useEffect(() => {
    setTitle('Athlete Tracking');
  });

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
    </View>
  );
}
