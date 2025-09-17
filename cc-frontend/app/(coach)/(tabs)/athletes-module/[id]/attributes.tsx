import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Mock attributes data - in the future this will come from Supabase
const MOCK_ATTRIBUTES = {
  '1': [
    { label: 'Height', primary: '6\'6"', secondary: ' 198 cm' },
    { label: 'Weight', primary: '212 lbs', secondary: ' 96 kg' },
    { label: 'Wingspan', primary: '6\'11"', secondary: ' 211 cm' },
    { label: 'Standing Reach', primary: '8\'4"', secondary: ' 254 cm' },
    { label: 'Vertical Jump', primary: '36"', secondary: ' 91 cm' }
  ],
  '2': [
    { label: 'Height', primary: '5\'11"', secondary: ' 180 cm' },
    { label: 'Weight', primary: '165 lbs', secondary: ' 75 kg' },
    { label: 'Wingspan', primary: '6\'0"', secondary: ' 183 cm' },
    { label: 'Standing Reach', primary: '7\'8"', secondary: ' 234 cm' },
    { label: 'Vertical Jump', primary: '32"', secondary: ' 81 cm' }
  ]
};

interface AttributeRowProps {
  label: string;
  primary: string;
  secondary: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function AttributeRow({
  label,
  primary,
  secondary,
  onEdit,
  onDelete
}: AttributeRowProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-2 py-3">
      {/* Label and Values */}
      <View className="mr-3 min-w-0 flex-1">
        <Text className="mb-1 text-sm text-gray-600" numberOfLines={1}>
          {label}
        </Text>
        <View className="flex-row flex-wrap items-baseline">
          <Text
            className="mr-2 text-base font-semibold text-black"
            numberOfLines={1}
          >
            {primary}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {secondary}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-shrink-0 flex-row">
        <TouchableOpacity
          onPress={onEdit}
          className="mx-1 rounded-lg bg-gray-100 p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="mx-1 rounded-lg bg-red-50 p-2"
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AttributesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Get athlete data - in the future this will be fetched from Supabase
  const athlete = MOCK_ATHLETES[id as keyof typeof MOCK_ATHLETES];
  const attributes =
    MOCK_ATTRIBUTES[id as keyof typeof MOCK_ATTRIBUTES] || MOCK_ATTRIBUTES['1']; // Fallback to first athlete

  const handleBackPress = () => {
    router.back();
  };

  const handleEditAttribute = (label: string) => {
    console.log('Edit attribute:', label, 'for athlete:', athlete?.name);
    // Navigate to edit attribute screen
  };

  const handleDeleteAttribute = (label: string) => {
    console.log('Delete attribute:', label, 'for athlete:', athlete?.name);
    // Show confirmation dialog and delete
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
        title="Attributes"
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

        {/* Attributes Card */}
        <View className="px-2 pb-6 sm:px-4">
          <View
            className="rounded-xl bg-white p-4 sm:p-6"
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
            {/* Card Header */}
            <Text className="mb-4 text-lg font-bold text-black sm:mb-6 sm:text-xl">
              Physical & Performance Measurements
            </Text>

            {/* Attributes List */}
            <View>
              {attributes.map(
                (
                  attribute: {
                    label: string;
                    primary: string;
                    secondary: string;
                  },
                  index: number
                ) => (
                  <AttributeRow
                    key={index}
                    label={attribute.label}
                    primary={attribute.primary}
                    secondary={attribute.secondary}
                    onEdit={() => handleEditAttribute(attribute.label)}
                    onDelete={() => handleDeleteAttribute(attribute.label)}
                  />
                )
              )}
            </View>

            {/* Add New Attribute Button */}
            <TouchableOpacity
              className="mt-4 flex-row items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 sm:mt-6 sm:py-3"
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={18} color="#3B82F6" />
              <Text className="ml-2 text-sm font-medium text-blue-600 sm:text-base">
                Add New Measurement
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
