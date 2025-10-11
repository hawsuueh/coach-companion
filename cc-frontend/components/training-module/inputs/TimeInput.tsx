import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome6 } from '@expo/vector-icons';

type TimeInputProps = {
  label: string;
  mode: 'time' | 'duration';
  value: string;
  onChange: (val: string) => void;
};

export default function TimeInput({
  label,
  mode,
  value,
  onChange
}: TimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempHours, setTempHours] = useState(0);
  const [tempMinutes, setTempMinutes] = useState(0);

  const togglePicker = () => setShowPicker(prev => !prev);

  // Handle time picker change
  const onTimeChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formatted = selectedDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      onChange(formatted);
    }
  };

  // Handle duration picker confirmation
  const handleDurationConfirm = () => {
    const formatted = `${tempHours}h ${tempMinutes}m`;
    onChange(formatted);
    setShowPicker(false);
  };

  return (
    <View>
      {/* Input Field */}
      <TouchableOpacity
        onPress={togglePicker}
        className="flex-row items-center justify-between rounded-xl bg-white px-3 py-4"
        style={{ borderWidth: 0.5 }}
      >
        <Text className="text-body1" style={{ color: '#00000080' }}>
          {value || `Select ${mode}`}
        </Text>
        <FontAwesome6 name="clock" size={24} color="black" />
      </TouchableOpacity>

      {/* TIME PICKER */}
      {showPicker && mode === 'time' && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* DURATION PICKER (Custom Modal) */}
      {showPicker && mode === 'duration' && (
        <Modal transparent animationType="fade" visible={showPicker}>
          <View className="flex-1 items-center justify-center bg-black/40">
            <View className="w-72 rounded-2xl bg-white p-6">
              <Text className="mb-4 text-center text-lg font-semibold">
                Select Duration
              </Text>

              {/* Hours */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-medium">Hours</Text>
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity
                    onPress={() => setTempHours(h => Math.max(0, h - 1))}
                    className="rounded-lg bg-gray-200 px-3 py-1"
                  >
                    <Text className="text-lg">-</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold">{tempHours}</Text>
                  <TouchableOpacity
                    onPress={() => setTempHours(h => h + 1)}
                    className="rounded-lg bg-gray-200 px-3 py-1"
                  >
                    <Text className="text-lg">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Minutes */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-base font-medium">Minutes</Text>
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity
                    onPress={() => setTempMinutes(m => Math.max(0, m - 5))}
                    className="rounded-lg bg-gray-200 px-3 py-1"
                  >
                    <Text className="text-lg">-</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold">{tempMinutes}</Text>
                  <TouchableOpacity
                    onPress={() => setTempMinutes(m => Math.min(55, m + 5))}
                    className="rounded-lg bg-gray-200 px-3 py-1"
                  >
                    <Text className="text-lg">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View className="flex-row justify-around">
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  className="rounded-lg bg-gray-300 px-4 py-2"
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDurationConfirm}
                  className="rounded-lg bg-blue-500 px-4 py-2"
                >
                  <Text className="text-white">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
