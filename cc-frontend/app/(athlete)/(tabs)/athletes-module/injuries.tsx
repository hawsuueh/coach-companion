import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/config/supabaseClient';

// Mock injury data - matching coach view consistency
const MOCK_INJURIES = [
  { type: 'Ankle Injuries', icon: 'walk-outline', incidents: 0, color: '#FF6B6B' },
  { type: 'Leg Injuries', icon: 'fitness-outline', incidents: 0, color: '#4ECDC4' },
  { type: 'Shoulder Injuries', icon: 'body-outline', incidents: 0, color: '#45B7D1' },
  { type: 'Finger Injuries', icon: 'hand-left-outline', incidents: 0, color: '#96CEB4' },
  { type: 'Achilles Tendon Injuries', icon: 'medical-outline', incidents: 0, color: '#FFEAA7' }
];

interface InjuryCardProps {
  type: string;
  icon: string;
  incidents: number;
  color: string;
  onPress?: () => void;
}

function InjuryCard({ type, icon, incidents, color, onPress }: InjuryCardProps) {
  return (
    <TouchableOpacity
      className="mb-4 rounded-2xl bg-white p-5 flex-row items-center border border-gray-100 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="mr-5 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon as any} size={28} color={color} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{type}</Text>
        <Text className={`text-xs mt-1 font-bold uppercase tracking-wider ${incidents > 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {incidents > 0 ? `${incidents} recorded incidents` : 'Clear record'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

export default function AthleteInjuriesScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { athleteNo, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState('My Athlete');
  const [athletePosition, setAthletePosition] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('My Medical Records');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!athleteNo) {
        setError('No athlete profile found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: athleteData } = await supabase
          .from('Athlete')
          .select('first_name, last_name, position')
          .eq('athlete_no', athleteNo)
          .single();
          
        if (athleteData) {
          setAthleteName(`${athleteData.first_name || ''} ${athleteData.last_name || ''}`.trim());
          setAthletePosition(athleteData.position || '');
        }
      } catch (err) {
        console.error('Error fetching athlete details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [athleteNo, authLoading]);

  if (loading || authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-500 font-medium">Loading records...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white px-6 py-10 items-center shadow-sm border-b border-gray-100">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <Ionicons name="medical" size={48} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{athleteName}</Text>
          <Text className="mt-1 text-lg text-gray-500 font-medium">{athletePosition}</Text>
        </View>

        {/* Categories Section */}
        <View className="px-5 py-8">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">
            Injury Categorization
          </Text>

          {MOCK_INJURIES.map((injury, index) => (
            <InjuryCard
              key={index}
              type={injury.type}
              icon={injury.icon}
              incidents={injury.incidents}
              color={injury.color}
              onPress={() => console.log('Details for:', injury.type)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
