import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

/////////////////////////////// START OF INTERFACES /////////////
interface AttributeContentCardProps {
  label: string; // Example: "Height"
  primary: string; // Example: "180 cm"
  secondary: string; // Example: "" (empty in your database)
  onEdit?: () => void; // Function called when edit button is pressed
  onDelete?: () => void; // Function called when delete button is pressed
}
////////////////////////////// END OF INTERFACES ////////////////

/////////////////////////////// START OF HELPER FUNCTIONS /////////////
/**
 * Helper function to convert units between imperial and metric
 * Example: Converts "180 cm" to "180 cm" and "5'11"" (both displayed)
 */
function convertUnits(value: string, label: string): { primary: string; secondary: string } {
  if (!value) return { primary: '', secondary: '' };

  const lowerLabel = label.toLowerCase();
  const lowerValue = value.toLowerCase().trim();

  // Check if it's a length measurement (height, wingspan, reach, etc.)
  const isLengthMeasurement =
    lowerLabel.includes('height') ||
    lowerLabel.includes('wingspan') ||
    lowerLabel.includes('reach') ||
    lowerLabel.includes('span');

  // Check if it's a weight measurement
  const isWeightMeasurement = lowerLabel.includes('weight');

  // Check if it's a jump/vertical measurement
  const isJumpMeasurement = lowerLabel.includes('jump') || lowerLabel.includes('vertical');

  // Extract number from value (handle formats like "180 cm", "6'6\"", "180", etc.)
  const numberMatch = lowerValue.match(/([\d.]+)/);
  if (!numberMatch) return { primary: value, secondary: '' };

  const num = parseFloat(numberMatch[1]);

  // Handle length measurements (cm ↔ feet/inches)
  if (isLengthMeasurement) {
    if (lowerValue.includes('cm') || (!lowerValue.includes("'") && !lowerValue.includes('ft'))) {
      // Input is in cm, convert to feet/inches
      const totalInches = num / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return {
        primary: `${Math.round(num)} cm`,
        secondary: `${feet}'${inches}"`
      };
    } else if (lowerValue.includes("'") || lowerValue.includes('ft') || lowerValue.includes('"')) {
      // Input is in feet/inches, convert to cm
      // Parse feet'inches" format (e.g., "6'6\"", "5'11\"")
      const feetMatch = lowerValue.match(/(\d+)['ft]/);
      const inchesMatch = lowerValue.match(/(\d+)[\"]/);
      const feet = feetMatch ? parseFloat(feetMatch[1]) : 0;
      const inches = inchesMatch ? parseFloat(inchesMatch[1]) : 0;
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      return {
        primary: `${cm} cm`,
        secondary: `${feet}'${inches}"`
      };
    }
  }

  // Handle weight measurements (kg ↔ lbs)
  if (isWeightMeasurement) {
    if (lowerValue.includes('kg')) {
      // Input is in kg, convert to lbs
      const lbs = Math.round(num * 2.20462);
      return {
        primary: `${Math.round(num)} kg`,
        secondary: `${lbs} lbs`
      };
    } else if (lowerValue.includes('lbs') || lowerValue.includes('lb')) {
      // Input is in lbs, convert to kg
      const kg = Math.round(num / 2.20462);
      return {
        primary: `${Math.round(num)} lbs`,
        secondary: `${kg} kg`
      };
    }
  }

  // Handle jump/vertical measurements (cm ↔ inches)
  if (isJumpMeasurement) {
    if (lowerValue.includes('cm')) {
      // Input is in cm, convert to inches
      const inches = Math.round(num / 2.54);
      return {
        primary: `${Math.round(num)} cm`,
        secondary: `${inches}"`
      };
    } else if (lowerValue.includes('"') || lowerValue.includes('in')) {
      // Input is in inches, convert to cm
      const cm = Math.round(num * 2.54);
      return {
        primary: `${Math.round(num)}"`,
        secondary: `${cm} cm`
      };
    }
  }

  // Default: return as-is
  return { primary: value, secondary: '' };
}
////////////////////////////// END OF HELPER FUNCTIONS ////////////////

/////////////////////////////// START OF ATTRIBUTE CONTENT CARD COMPONENT /////////////
/**
 * AttributeContentCard Component
 * Displays a single attribute measurement with icon, label, primary value, secondary converted value, and action buttons
 *
 * Usage Example:
 * <AttributeContentCard
 *   label="Height"
 *   primary="180 cm"
 *   secondary=""
 *   onEdit={() => console.log('Edit height')}
 *   onDelete={() => console.log('Delete height')}
 * />
 */
export default function AttributeContentCard({
  label,
  primary,
  secondary,
  onEdit,
  onDelete
}: AttributeContentCardProps) {
  // Icon mapping for different attribute types
  const getAttributeIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('height') || lowerLabel.includes('reach')) return 'resize';
    if (lowerLabel.includes('weight')) return 'scale';
    if (lowerLabel.includes('jump') || lowerLabel.includes('vertical')) return 'arrow-up';
    if (lowerLabel.includes('wingspan') || lowerLabel.includes('span')) return 'expand';
    return 'fitness';
  };

  // Convert units to show both imperial and metric
  const { primary: displayPrimary, secondary: displaySecondary } = convertUnits(primary, label);

  return (
    <View
      className="mb-3 rounded-xl bg-white px-4 py-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6'
      }}
    >
      <View className="flex-row items-center">
        {/* Icon */}
        <Ionicons
          name={getAttributeIcon(label)}
          size={24}
          color="#DC2626"
          style={{ marginRight: 12 }}
        />

        {/* Content */}
        <View className="flex-1">
          <Text className="mb-1 text-sm font-medium text-gray-600">
            {label}
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
              {displayPrimary}
            </Text>
            {displaySecondary && (
              <Text className="ml-2 text-sm font-medium text-gray-500" numberOfLines={1}>
                {displaySecondary}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={onEdit}
            className="mr-2 h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#F9FAFB' }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#FEF2F2' }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
////////////////////////////// END OF ATTRIBUTE CONTENT CARD COMPONENT ////////////////

