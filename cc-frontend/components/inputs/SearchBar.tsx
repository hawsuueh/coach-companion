import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  className?: string;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  onFilterPress,
  showFilter = true,
  className = ''
}: SearchBarProps) {
  return (
    <View className={`flex-row items-center px-5 py-4 ${className}`}>
      <View className="flex-1 flex-row items-center rounded-lg bg-white px-3 py-2">
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          className="ml-2 flex-1 text-base"
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
      {showFilter && (
        <TouchableOpacity
          className="ml-3 rounded-lg bg-white p-2"
          onPress={onFilterPress}
        >
          <Ionicons name="funnel" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}
