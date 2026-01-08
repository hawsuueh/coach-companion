import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="mb-4 text-center text-lg font-semibold text-red-500">
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="rounded-lg bg-red-500 px-4 py-2"
      >
        <Text className="font-semibold text-white">Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorScreen;

