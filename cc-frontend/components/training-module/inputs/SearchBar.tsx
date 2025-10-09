import { Ionicons } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

type SearchBarProps = {
  searchText: string;
  setSearchText: (text: string) => void;
};

export default function SearchBar({
  searchText,
  setSearchText
}: SearchBarProps) {
  return (
    <View className="mx-1 my-1 flex-row items-center rounded-xl bg-white px-4 py-1 shadow-sm">
      <Ionicons name="search" size={24} color="black" className="mr-2" />
      <TextInput
        className="text-body1 flex-1"
        placeholder="Search..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#00000080"
      />
    </View>
  );
}
