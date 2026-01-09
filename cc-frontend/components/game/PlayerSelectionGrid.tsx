import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

interface PlayerSelectionGridProps {
  athletes: Athlete[];
  selectedAthleteId: string;
  onSelectAthlete: (athleteId: string) => void;
}

const PlayerSelectionGrid: React.FC<PlayerSelectionGridProps> = ({
  athletes,
  selectedAthleteId,
  onSelectAthlete
}) => {
  return (
    <View className="px-4 py-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row space-x-3">
          {athletes.map(athlete => (
            <TouchableOpacity
              key={athlete.id}
              className={`items-center rounded-lg border-2 p-3 ${
                selectedAthleteId === athlete.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => onSelectAthlete(athlete.id)}
            >
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                <Text className="font-bold text-gray-600">
                  {athlete.number}
                </Text>
              </View>
              <Text className="text-center text-sm font-medium text-black">
                {athlete.name}
              </Text>
              <Text className="text-center text-xs text-gray-500">
                {athlete.position}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PlayerSelectionGrid;

