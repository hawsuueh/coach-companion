import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  searchAthletesByName, 
  linkAthleteToAccount, 
  transformDatabaseAthlete,
  type Athlete as UIAthlete,
  type DatabaseAthlete
} from '@/services/athleteService';
import { useHeader } from '@/components/contexts/HeaderContext';
import { useEffect } from 'react';

export default function LinkProfileScreen() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const { profile, refreshAthleteNo } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UIAthlete[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    setTitle('Find Your Profile');
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchAthletesByName(query);
      setResults(data.map(transformDatabaseAthlete));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = (athlete: UIAthlete) => {
    if (!profile?.account_no) return;

    Alert.alert(
      'Claim Profile',
      `Are you sure you want to link your account to ${athlete.name} (#${athlete.number})? This action will associate your login with this player's data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
             setLinking(true);
             try {
               const success = await linkAthleteToAccount(parseInt(athlete.id), profile.account_no);
               if (success) {
                 // Refresh AuthContext to pick up the new athleteNo
                 await refreshAthleteNo();
                 Alert.alert('Success', 'Profile linked successfully!', [
                   { text: 'Great!', onPress: () => router.replace('/(athlete)/(tabs)/athletes-module') }
                 ]);
               } else {
                 Alert.alert('Error', 'Failed to link profile. Please try again.');
               }
             } catch (err) {
               console.error('Linking error:', err);
             } finally {
               setLinking(false);
             }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: UIAthlete }) => (
    <TouchableOpacity
      className="mb-3 rounded-2xl bg-white p-4 flex-row items-center border border-gray-100 shadow-sm"
      onPress={() => handleLink(item)}
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <Text className="text-red-600 font-bold">#{item.number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.position}</Text>
      </View>
      <Ionicons name="checkmark-circle-outline" size={24} color="#EF4444" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 px-5 pt-6">
      <Text className="text-gray-500 mb-6 font-medium">
        Search for your name to link your game records to your login.
      </Text>

      {/* Search Input */}
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-200 px-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 py-3 text-gray-900"
            placeholder="Search your name..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-red-600 px-5 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-bold">Find</Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" className="mt-10" />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.length > 0 ? (
              <View className="items-center justify-center mt-20">
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text className="mt-4 text-gray-400 text-center font-medium px-10">
                  No unlinked profiles found matching "{query}".
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Linking Overlay */}
      {linking && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center shadow-lg">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="mt-4 font-bold text-gray-900">Linking your profile...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
