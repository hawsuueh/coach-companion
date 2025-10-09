import { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import SearchBar from '@/components/training-module/inputs/SearchBar';
import IconButton from '@/components/training-module/buttons/IconButton';
import List1 from '@/components/training-module/lists/List1';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

export default function Exercises() {
  const handleAthletePress = () => {
    console.log('Athlete button pressed');
  };

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Athlete Icon Button */}
      <View className="mb-1 items-end p-2">
        <IconButton
          IconComponent={Ionicons}
          icon="people-sharp"
          onPress={handleAthletePress}
        />
      </View>
    </View>
  );
}
