import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingActionButton from '@/components/buttons/FloatingActionButton';
import Header from '@/components/headers/Header';

// Mock data - in the future this will come from Supabase
const MOCK_ATHLETES = {
  '1': { id: '1', number: '10', name: 'John Smith', position: 'Forward' },
  '2': { id: '2', number: '7', name: 'Mike Johnson', position: 'Midfielder' },
  '3': { id: '3', number: '23', name: 'David Wilson', position: 'Defender' },
  '4': { id: '4', number: '1', name: 'Tom Brown', position: 'Goalkeeper' },
  '5': { id: '5', number: '9', name: 'Alex Davis', position: 'Forward' },
  '6': { id: '6', number: '4', name: 'Chris Miller', position: 'Defender' },
  '7': { id: '7', number: '8', name: 'Ryan Taylor', position: 'Midfielder' },
  '8': { id: '8', number: '11', name: 'Kevin Lee', position: 'Forward' }
};

// Mock injury data - in the future this will come from Supabase
const MOCK_INJURIES = {
  '1': [
    {
      type: 'Ankle Injuries',
      icon: 'walk-outline',
      incidents: 0,
      color: '#FF6B6B'
    },
    {
      type: 'Leg Injuries',
      icon: 'fitness-outline',
      incidents: 0,
      color: '#4ECDC4'
    },
    {
      type: 'Shoulder Injuries',
      icon: 'body-outline',
      incidents: 0,
      color: '#45B7D1'
    },
    {
      type: 'Finger Injuries',
      icon: 'hand-left-outline',
      incidents: 0,
      color: '#96CEB4'
    },
    {
      type: 'Achilles Tendon Injuries',
      icon: 'medical-outline',
      incidents: 0,
      color: '#FFEAA7'
    }
  ],
  '2': [
    {
      type: 'Ankle Injuries',
      icon: 'walk-outline',
      incidents: 0,
      color: '#FF6B6B'
    },
    {
      type: 'Leg Injuries',
      icon: 'fitness-outline',
      incidents: 0,
      color: '#4ECDC4'
    },
    {
      type: 'Shoulder Injuries',
      icon: 'body-outline',
      incidents: 0,
      color: '#45B7D1'
    },
    {
      type: 'Finger Injuries',
      icon: 'hand-left-outline',
      incidents: 0,
      color: '#96CEB4'
    },
    {
      type: 'Achilles Tendon Injuries',
      icon: 'medical-outline',
      incidents: 0,
      color: '#FFEAA7'
    }
  ]
};

interface InjuryCardProps {
  type: string;
  icon: string;
  incidents: number;
  color: string;
  onPress?: () => void;
}

function InjuryCard({
  type,
  icon,
  incidents,
  color,
  onPress
}: InjuryCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 rounded-xl bg-white p-4"
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left side - Icon and Type */}
        <View className="flex-1 flex-row items-center">
          {/* Injury Icon */}
          <View
            className="mr-4 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Ionicons name={icon as any} size={24} color={color} />
          </View>

          {/* Injury Type */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-black">{type}</Text>
            <Text
              className={`text-sm ${incidents > 0 ? 'font-medium text-red-500' : 'text-gray-500'}`}
            >
              {incidents > 0
                ? `${incidents} incident${incidents > 1 ? 's' : ''}`
                : 'No incidents'}
            </Text>
          </View>
        </View>

        {/* Right side - Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

export default function InjuriesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Get athlete data - in the future this will be fetched from Supabase
  const athlete = MOCK_ATHLETES[id as keyof typeof MOCK_ATHLETES];
  const injuries =
    MOCK_INJURIES[id as keyof typeof MOCK_INJURIES] || MOCK_INJURIES['1'];

  const handleBackPress = () => {
    router.back();
  };

  const handleInjuryPress = (injuryType: string) => {
    console.log(
      'View injury details:',
      injuryType,
      'for athlete:',
      athlete?.name
    );
    // Navigate to injury details screen
  };

  const handleAddInjury = () => {
    console.log('Add new injury for athlete:', athlete?.name);
    // Navigate to add injury screen
  };

  if (!athlete) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-gray-500">
            Athlete not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Header */}
      <Header
        title="Injury Records"
        showBack={true}
        showNotifications={false}
        showMenu={false}
        onBackPress={handleBackPress}
      />

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Athlete Profile Section */}
        <View className="items-center px-4 py-4 sm:py-6">
          <Text className="mb-1 text-center text-xl font-bold text-black sm:text-2xl">
            {athlete.name}
          </Text>
          <Text className="text-center text-base text-gray-600 sm:text-lg">
            {athlete.position}
          </Text>
        </View>

        {/* Injury Categories List */}
        <View className="px-4 pb-20">
          {injuries.map((injury, index) => (
            <InjuryCard
              key={index}
              type={injury.type}
              icon={injury.icon}
              incidents={injury.incidents}
              color={injury.color}
              onPress={() => handleInjuryPress(injury.type)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={handleAddInjury}
        color="#FF0000"
        size="medium"
        position="bottom-right"
      />
    </SafeAreaView>
  );
}
