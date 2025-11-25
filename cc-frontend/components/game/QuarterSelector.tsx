import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuarterSelectorProps {
  currentQuarter: number;
  onQuarterChange: (quarter: number) => void;
  onReset: () => void;
}

const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  currentQuarter,
  onQuarterChange,
  onReset
}) => {
  return (
    <View className="border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Text className="mr-3 text-sm font-medium text-gray-700">
            Quarter:
          </Text>
          <View className="flex-row space-x-1.5">
            {[1, 2, 3, 4].map(quarter => (
              <TouchableOpacity
                key={quarter}
                onPress={() => onQuarterChange(quarter)}
                className={`rounded-lg px-3 py-1.5 ${
                  currentQuarter === quarter ? 'bg-red-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    currentQuarter === quarter ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Q{quarter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          onPress={onReset}
          className="ml-3 rounded-lg bg-gray-900 px-3 py-1.5"
        >
          <Text className="text-sm font-medium text-white">Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuarterSelector;

