import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Context-Aware SearchBar Component
 *
 * Usage Examples:
 *
 * // Athletes Screen - Batch Filtering
 * <SearchBar
 *   filterType="batch"
 *   onFilterPress={() => setShowBatchModal(true)}
 *   placeholder="Search athletes..."
 * />
 *
 * // Games Screen - Game Filtering (Future)
 * <SearchBar
 *   filterType="game"
 *   onFilterPress={() => setShowGameFilterModal(true)}
 *   placeholder="Search games..."
 * />
 *
 * // Stats Screen - Stats Filtering (Future)
 * <SearchBar
 *   filterType="stats"
 *   onFilterPress={() => setShowStatsFilterModal(true)}
 *   placeholder="Search stats..."
 * />
 */

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  filterType?: 'batch' | 'game' | 'position' | 'stats' | 'custom';
  className?: string;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  onFilterPress,
  showFilter = true,
  filterType = 'custom',
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
          onPress={() => {
            // Context-aware filter handling
            console.log(`Filter pressed for type: ${filterType}`);
            onFilterPress?.();
          }}
        >
          <Ionicons name="funnel" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}
