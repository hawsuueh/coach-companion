import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AthleteCard from '@/components/cards/AthleteCard';
import FloatingActionButton from '@/components/buttons/FloatingActionButton';
import GameCard from '@/components/cards/GameCard';
import Header from '@/components/headers/Header';
import SearchBar from '@/components/inputs/SearchBar';
import SubTab from '@/components/navigations/SUBTAB';

interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

interface Game {
  id: string;
  gameName: string;
  date: string;
}

const MOCK_ATHLETES: Athlete[] = [
  { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  { id: '2', number: '7', name: 'Mike Johnson', position: 'Midfielder' },
  { id: '3', number: '23', name: 'David Wilson', position: 'Defender' },
  { id: '4', number: '1', name: 'Tom Brown', position: 'Goalkeeper' },
  { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  { id: '6', number: '4', name: 'Chris Miller', position: 'Defender' },
  { id: '7', number: '8', name: 'Ryan Taylor', position: 'Midfielder' },
  { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
];

const MOCK_GAMES: Game[] = [
  {
    id: '1',
    gameName: 'UNC Basketball Team vs State University',
    date: 'Oct 15, 2025'
  },
  { id: '2', gameName: 'Game 2', date: 'Date' },
  { id: '3', gameName: 'Game 3', date: 'Date' },
  { id: '4', gameName: 'Game 4', date: 'Date' },
  { id: '5', gameName: 'Game 5', date: 'Date' },
  { id: '6', gameName: 'Game 6', date: 'Date' }
];

export default function AthleteScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('athletes');
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>(MOCK_ATHLETES);
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);

  const athleteTabs = [
    { id: 'athletes', label: 'Athletes' },
    { id: 'games', label: 'Games' }
  ];

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleAthletePress = (athlete: Athlete) => {
    console.log('Athlete pressed:', athlete.name);
    // Navigate to athlete detail screen
    router.push(`/(coach)/(tabs)/athletes-module/${athlete.id}` as any);
  };

  const handleAddAthlete = () => {
    console.log('Add athlete pressed');
    // TODO: Navigate to add athlete screen when created
    // router.push('/(coach)/(tabs)/athletes-module/add-athlete' as any);
    alert('Add Athlete functionality coming soon!');
  };

  const handleAddGame = () => {
    console.log('Add game pressed');
    // TODO: Navigate to add game screen when created
    // router.push('/(coach)/(tabs)/athletes-module/add-game' as any);
    alert('Add Game functionality coming soon!');
  };

  const handleGamePress = (game: Game) => {
    console.log('Game pressed:', game.gameName);
    // Navigate to team roster screen for this specific game
    router.push(
      `/(coach)/(tabs)/athletes-module/game/${game.id}/roster` as any
    );
  };

  const filteredAthletes = athletes.filter(
    athlete =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.number.includes(searchQuery) ||
      athlete.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGames = games.filter(
    game =>
      game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAthleteCard = ({ item }: { item: Athlete }) => (
    <AthleteCard
      playerNumber={item.number}
      playerName={item.name}
      position={item.position}
      onPress={() => handleAthletePress(item)}
    />
  );

  const renderGameCard = ({ item }: { item: Game }) => (
    <GameCard
      gameName={item.gameName}
      date={item.date}
      onPress={() => handleGamePress(item)}
    />
  );

  return (
    <View className="flex-1" style={{ position: 'relative' }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        {/* Header Section - Using reusable Header component */}
        <Header
          title="Athletes & Games"
          onNotificationPress={handleNotificationPress}
          onMenuPress={handleMenuPress}
        />

        {/* Tab Navigation - Using reusable SubTab component */}
        <SubTab
          tabs={athleteTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Search and Filter Section - Using reusable SearchBar component */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={handleFilterPress}
        />

        {/* Athlete/Game List */}
        <View className="flex-1 px-3">
          {activeTab === 'athletes' ? (
            <FlatList
              data={filteredAthletes}
              renderItem={renderAthleteCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 8
              }}
            />
          ) : (
            <FlatList
              data={filteredGames}
              renderItem={renderGameCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100,
                paddingHorizontal: 8
              }}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={activeTab === 'athletes' ? 'person-add' : 'add'}
        onPress={activeTab === 'athletes' ? handleAddAthlete : handleAddGame}
        color="#FF0000"
        size="medium"
        position="bottom-right"
      />
    </View>
  );
}
