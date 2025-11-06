/////////////////////////////// START OF IMPORTS /////////////
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useHeader } from '@/components/contexts/HeaderContext';
import supabase from '@/config/supabaseClient';
import AttributeContentCard from '@/components/cards/AttributeContentCard';
////////////////////////////// END OF IMPORTS ////////////////

/////////////////////////////// START OF DATABASE INTERFACES /////////////
/**
 * Database Interfaces - These match the structure of your Supabase tables
 * Example: When fetching from Supabase, the data comes in this exact format
 */

// Example: { athlete_no: 1, first_name: "John", middle_name: "M", last_name: "Doe", position: "Forward", player_no: 10, gmail: "john@example.com" }
interface DatabaseAthlete {
  athlete_no: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  position: string | null;
  player_no: number | null;
  gmail: string | null;
}

// Example: { attribute_no: 1, attribute_type: "Height" }
interface DatabaseAttribute {
  attribute_no: number;
  attribute_type: string | null;
}

// Example: { "athlete_attributes_no.": 1, attribute_no: 1, athlete_no: 1, value: "6'6\"", Attributes: { attribute_no: 1, attribute_type: "Height" } }
interface DatabaseAthleteAttribute {
  'athlete_attributes_no.': number;
  attribute_no: number | null;
  athlete_no: number | null;
  value: string | null;
  Attributes?: DatabaseAttribute;
}
////////////////////////////// END OF DATABASE INTERFACES ////////////////

/////////////////////////////// START OF UI INTERFACES /////////////
/**
 * UI Interfaces - These are the transformed formats used in the component
 * Example: These are easier to work with in React Native than the raw database format
 */

// Example: { id: "1", number: "10", name: "John Doe", position: "Forward" }
interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

// Example: { label: "Height", primary: "6'6\"", secondary: "" }
interface Attribute {
  label: string;
  primary: string;
  secondary: string;
}

// Props for the AttributeRow component (each row in the attributes list)
interface AttributeRowProps {
  label: string; // Example: "Height"
  primary: string; // Example: "6'6\""
  secondary: string; // Example: "" (empty in your database)
  onEdit?: () => void; // Function called when edit button is pressed
  onDelete?: () => void; // Function called when delete button is pressed
}
////////////////////////////// END OF UI INTERFACES ////////////////

/////////////////////////////// ATTRIBUTE CARD COMPONENT /////////////
/**
 * Note: AttributeContentCard component is now imported from @/components/cards/AttributeContentCard
 * This keeps the code cleaner and allows reuse across the app
 */
////////////////////////////// END OF ATTRIBUTE CARD COMPONENT ////////////////

/////////////////////////////// START OF MAIN COMPONENT /////////////
export default function AttributesScreen() {
  /////////////////////////////// START OF STATE AND CONFIGURATION /////////////
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Gets the athlete ID from the URL (e.g., if URL is /athletes-module/5, id = "5")
  const { setTitle } = useHeader();

  // State management
  // Example: athlete = { id: "1", number: "10", name: "John Doe", position: "Forward" }
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  
  // Example: attributes = [{ label: "Height", primary: "6'6\"", secondary: "" }, { label: "Weight", primary: "212 lbs", secondary: "" }]
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  
  const [loading, setLoading] = useState(true); // Shows loading spinner while fetching data
  const [error, setError] = useState<string | null>(null); // Stores error message if fetch fails
  ////////////////////////////// END OF STATE AND CONFIGURATION ////////////////

  /////////////////////////////// START OF USE EFFECTS /////////////
  /**
   * Set the header title when component mounts
   * Runs once when the screen loads
   */
  useEffect(() => {
    setTitle('Attributes');
  }, [setTitle]);

  /**
   * Fetch athlete and attributes data from Supabase
   * Runs when component mounts AND whenever the id changes
   * Example: If user navigates from athlete 5 to athlete 3, this runs again with new id
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Validate that id exists and is a string
      // Example: If id is undefined or 123 (number), show error
      if (!id || typeof id !== 'string') {
        setError('Invalid athlete ID.');
        setLoading(false);
        return;
      }

      try {
        ////////////////////////////// STEP 1: FETCH ATHLETE DATA /////////////
        /**
         * Query: Get athlete from Athlete table where athlete_no matches the id
         * Example: If id = "5", fetches athlete with athlete_no = 5
         * 
         * .maybeSingle() = Returns null if no record found (instead of throwing error)
         * Result: { athlete_no: 5, first_name: "John", last_name: "Doe", ... }
         */
        const { data: athleteData, error: athleteError } = await supabase
          .from('Athlete')
          .select('*')
          .eq('athlete_no', id)
          .maybeSingle();

        if (athleteError) {
          throw athleteError;
        }

        if (athleteData) {
          // Transform database format to UI format
          // Example: Combines first_name + middle_name + last_name into full name
          // Input: { first_name: "John", middle_name: "M", last_name: "Doe" }
          // Output: "John M Doe"
          const fullName = [
            athleteData.first_name,
            athleteData.middle_name,
            athleteData.last_name,
          ]
            .filter(name => name && name.trim() !== '')
            .join(' ');

          setAthlete({
            id: athleteData.athlete_no.toString(), // Convert number to string
            number: athleteData.player_no?.toString() || '0',
            name: fullName || 'Unknown Player',
            position: athleteData.position || 'Unknown',
          });
        }

        ////////////////////////////// STEP 2: FETCH ATHLETE ATTRIBUTES /////////////
        /**
         * Query: Get all attributes for this athlete by joining Athlete_attributes with Attributes table
         * Example: If id = "5", fetches all attributes where athlete_no = 5
         * 
         * .select() with join:
         *   - value = the actual measurement value (e.g., "6'6\"")
         *   - Attributes!inner(attribute_type) = joins with Attributes table to get the type (e.g., "Height")
         * 
         * Result: [
         *   { value: "6'6\"", Attributes: { attribute_type: "Height" } },
         *   { value: "212 lbs", Attributes: { attribute_type: "Weight" } }
         * ]
         */
        const { data: athleteAttributesData, error: attributesError } =
          await supabase
            .from('Athlete_attributes')
            .select(
              `
              value,
              Attributes!inner(attribute_type)
            `
            )
            .eq('athlete_no', id);

        if (attributesError) {
          throw attributesError;
        }

        if (athleteAttributesData) {
          // Transform database format to UI format
          // Example Input: { value: "6'6\"", Attributes: { attribute_type: "Height" } }
          // Example Output: { label: "Height", primary: "6'6\"", secondary: "" }
          const transformedAttributes: Attribute[] = athleteAttributesData.map(
            (item: any) => ({
              label: item.Attributes?.attribute_type || 'Unknown', // Gets "Height" from joined table
              primary: item.value || '', // Gets "6'6\"" from Athlete_attributes table
              secondary: '', // Empty because your database only stores one value
            })
          );

          setAttributes(transformedAttributes);
        }
      } catch (err) {
        console.error('Error fetching athlete attributes:', err);
        setError('Failed to load athlete attributes.');
        setAthlete(null);
        setAttributes([]);
      } finally {
        setLoading(false); // Always set loading to false when done (success or error)
      }
    };

    fetchData();
  }, [id]); // Dependency: Re-fetch when id changes
  ////////////////////////////// END OF USE EFFECTS ////////////////

  /////////////////////////////// START OF EVENT HANDLERS /////////////
  /**
   * Called when user clicks the edit (pencil) icon on an attribute row
   * Example: User clicks edit on "Height" row → logs "Edit attribute: Height for athlete: John Doe"
   */
  const handleEditAttribute = (label: string) => {
    console.log('Edit attribute:', label, 'for athlete:', athlete?.name);
    // Navigate to edit attribute screen (TODO: implement navigation)
  };

  /**
   * Called when user clicks the delete (trash) icon on an attribute row
   * Example: User clicks delete on "Weight" row → logs "Delete attribute: Weight for athlete: John Doe"
   */
  const handleDeleteAttribute = (label: string) => {
    console.log('Delete attribute:', label, 'for athlete:', athlete?.name);
    // Show confirmation dialog and delete (TODO: implement delete functionality)
  };
  ////////////////////////////// END OF EVENT HANDLERS ////////////////

  /////////////////////////////// START OF CONDITIONAL RENDERS /////////////
  /**
   * Show loading state while fetching data from Supabase
   * Example: Displays "Loading athlete attributes..." spinner
   */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#FEF2F2' }}>
            <Ionicons name="fitness" size={32} color="#DC2626" />
          </View>
          <Text className="text-lg font-semibold text-gray-700">
            Loading attributes...
          </Text>
          <Text className="mt-2 text-sm text-gray-500">
            Fetching athlete data
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Show error state if fetch failed or athlete not found
   * Example: Displays "Failed to load athlete attributes." or "Athlete not found"
   */
  if (error || !athlete) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <View className="items-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#FEF2F2' }}>
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
          </View>
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            {error || 'Athlete not found'}
          </Text>
          <Text className="text-center text-sm text-gray-500">
            Unable to load athlete attributes. Please try again.
          </Text>
        </View>
      </View>
    );
  }
  ////////////////////////////// END OF CONDITIONAL RENDERS ////////////////

  /////////////////////////////// START OF JSX RETURN /////////////
  /**
   * Main UI Render - Modern Design
   * Displays:
   *   1. Hero header with athlete info (gradient background)
   *   2. Individual attribute cards in grid layout
   *   3. Each attribute card has icon, label, value, and action buttons
   *   4. "Add New Measurement" floating button
   */
  return (
    <View className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Header Section */}
        <View
          className="px-6 pb-6 pt-8"
          style={{
            backgroundColor: '#DC2626',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32
          }}
        >
          <View className="items-center">
            {/* Athlete Avatar */}
            <View
              className="mb-3 h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>

            {/* Athlete Info */}
            <Text className="mb-1 text-center text-2xl font-bold text-white">
              {athlete.name}
            </Text>
            <View className="flex-row items-center">
              <View className="mr-2 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Text className="text-sm font-semibold text-white">
                  #{athlete.number}
                </Text>
              </View>
              <Text className="text-base text-white opacity-90">
                {athlete.position}
              </Text>
            </View>
          </View>
        </View>

        {/* Attributes Grid Section */}
        <View className="px-4 pb-8 pt-4">
          {/* Section Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Measurements
            </Text>
            <View className="flex-row items-center rounded-lg px-3 py-1.5" style={{ backgroundColor: '#FEF2F2' }}>
              <Ionicons name="fitness" size={16} color="#DC2626" />
              <Text className="ml-1.5 text-xs font-semibold text-red-600">
                {attributes.length} Total
              </Text>
            </View>
          </View>

          {/* Attributes List */}
          {attributes.length === 0 ? (
            // Empty State
            <View className="items-center rounded-2xl bg-white py-12 px-6" style={{ borderWidth: 1, borderColor: '#F3F4F6' }}>
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#FEF2F2' }}>
                <Ionicons name="fitness-outline" size={32} color="#DC2626" />
              </View>
              <Text className="mb-2 text-lg font-semibold text-gray-900">
                No Attributes Yet
              </Text>
              <Text className="text-center text-sm text-gray-500">
                Start tracking this athlete's physical measurements
              </Text>
            </View>
          ) : (
            // Attributes Grid
            <View>
              {attributes.map((attribute, index) => (
                <AttributeContentCard
                  key={index}
                  label={attribute.label}
                  primary={attribute.primary}
                  secondary={attribute.secondary}
                  onEdit={() => handleEditAttribute(attribute.label)}
                  onDelete={() => handleDeleteAttribute(attribute.label)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing for Floating Button */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: '#DC2626',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
////////////////////////////// END OF JSX RETURN ////////////////
////////////////////////////// END OF MAIN COMPONENT ////////////////
