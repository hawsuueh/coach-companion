import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SimpleStatRowProps {
  label: string;
  value: number;
  onUpdate: (value: number) => void;
  isLast?: boolean;
}

export default function SimpleStatRow({
  label,
  value,
  onUpdate,
  isLast = false
}: SimpleStatRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between ${!isLast ? 'mb-3' : ''}`}
    >
      <Text className="font-medium text-black">{label}</Text>
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center rounded-full bg-white"
          onPress={() => onUpdate(Math.max(0, value - 1))}
        >
          <Text className="font-bold text-gray-600">-</Text>
        </TouchableOpacity>
        <Text className="w-8 text-center font-medium">{value}</Text>
        <TouchableOpacity
          className="h-8 w-8 items-center justify-center rounded-full bg-white"
          onPress={() => onUpdate(value + 1)}
        >
          <Text className="font-bold text-gray-600">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
