import { TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type DateInputProps = {
  date?: string | null; // 👈 for single date
  dates?: string[]; // 👈 for multiple dates
  onPress: () => void;
  onLongPress?: () => void;
  placeholder?: string;
};

export default function DateInput({
  date,
  dates,
  onPress,
  onLongPress,
  placeholder = 'Select date(s)'
}: DateInputProps) {
  // Determine what to display
  const displayText =
    dates && dates.length > 0 ? dates.join(', ') : date ? date : placeholder;

  const isPlaceholder = (!dates || dates.length === 0) && !date;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center justify-between rounded-xl bg-white px-3 py-4"
      style={{
        borderWidth: 0.5,
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}
    >
      {/* Display date(s) or placeholder */}
      <View className="mr-2 flex-1">
        <Text
          className={`text-body1 flex-wrap ${
            isPlaceholder ? 'text-[#00000080]' : 'text-black'
          }`}
        >
          {displayText}
        </Text>
      </View>

      {/* Icon */}
      <FontAwesome name="calendar" size={22} color="black" />
    </TouchableOpacity>
  );
}
