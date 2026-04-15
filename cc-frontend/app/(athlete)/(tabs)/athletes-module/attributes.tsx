/////////////////////////////// START OF IMPORTS /////////////
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useAuth } from '@/contexts/AuthContext';
import AttributeContentCard from '@/components/cards/AttributeContentCard';
import supabase from '@/config/supabaseClient';
import { getAthleteById, transformDatabaseAthlete, type Athlete } from '@/services/athleteService';
////////////////////////////// END OF IMPORTS ////////////////

interface Attribute {
  label: string;
  primary: string;
  secondary: string;
}

export default function AthleteAttributesScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { athleteNo, loading: authLoading } = useAuth();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('My Attributes');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!athleteNo) {
        setError('No athlete profile associated with this account.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Athlete Data
        const athleteData = await getAthleteById(athleteNo);
        if (athleteData) {
          setAthlete(transformDatabaseAthlete(athleteData));
        }

        // 2. Fetch Attributes
        const { data: athleteAttributesData, error: attributesError } =
          await supabase
            .from('Athlete_attributes')
            .select(`
              value,
              Attributes!inner(attribute_type)
            `)
            .eq('athlete_no', athleteNo);

        if (attributesError) throw attributesError;

        if (athleteAttributesData) {
          const transformedAttributes: Attribute[] = athleteAttributesData.map(
            (item: any) => ({
              label: item.Attributes?.attribute_type || 'Unknown',
              primary: item.value || '',
              secondary: '',
            })
          );
          setAttributes(transformedAttributes);
        }
      } catch (err) {
        console.error('Error fetching athlete attributes:', err);
        setError('Failed to load your attributes.');
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
        <Text className="mt-4 text-gray-500 font-medium">Loading attributes...</Text>
      </View>
    );
  }

  if (error || !athlete) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-lg font-semibold text-gray-900">
          {error || 'Profile not found'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-red-600 px-6 pb-10 pt-8 rounded-b-[32px]">
          <View className="items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-2xl font-bold text-white">{athlete.name}</Text>
            <View className="mt-2 flex-row items-center">
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-xs">#{athlete.number}</Text>
              </View>
              <Text className="ml-2 text-white/90 font-medium">{athlete.position}</Text>
            </View>
          </View>
        </View>

        {/* List Section */}
        <View className="px-4 py-8">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Physical Profile</Text>
            <View className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex-row items-center">
              <Ionicons name="fitness" size={16} color="#EF4444" />
              <Text className="ml-1.5 text-xs font-bold text-red-600 uppercase">
                {attributes.length} Metrics
              </Text>
            </View>
          </View>

          {attributes.length === 0 ? (
            <View className="items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
              <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
              <Text className="mt-4 text-gray-500 font-medium">No recorded measurements found.</Text>
            </View>
          ) : (
            <View>
              {attributes.map((attribute, index) => (
                <AttributeContentCard
                  key={index}
                  label={attribute.label}
                  primary={attribute.primary}
                  secondary={attribute.secondary}
                  // Read-only for athlete
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
