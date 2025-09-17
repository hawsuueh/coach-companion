import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface Athlete {
  id: string;
  number: string;
  name: string;
  position: string;
}

interface AthleteDropdownProps {
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  onSelectAthlete: (athlete: Athlete) => void;
  placeholder?: string;
}

export default function AthleteDropdown_StatsForm({
  athletes,
  selectedAthlete,
  onSelectAthlete,
  placeholder = 'Select an athlete'
}: AthleteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (athlete: Athlete) => {
    onSelectAthlete(athlete);
    setIsOpen(false);
  };

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3"
      >
        <Text
          className={`flex-1 ${selectedAthlete ? 'text-black' : 'text-gray-500'}`}
        >
          {selectedAthlete
            ? `${selectedAthlete.name} - #${selectedAthlete.number}`
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="mx-4 mt-20 rounded-lg bg-white shadow-lg">
            <View className="border-b border-gray-200 px-4 py-3">
              <Text className="text-lg font-semibold text-black">
                Select an athlete
              </Text>
            </View>
            <View className="max-h-80">
              {athletes.map(athlete => (
                <TouchableOpacity
                  key={athlete.id}
                  onPress={() => handleSelect(athlete)}
                  className="border-b border-gray-100 px-4 py-3"
                >
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <Text className="font-bold text-gray-600">
                        {athlete.number}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-black">
                        {athlete.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {athlete.position}
                      </Text>
                    </View>
                    {selectedAthlete?.id === athlete.id && (
                      <Ionicons name="checkmark" size={20} color="#EC1D25" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
