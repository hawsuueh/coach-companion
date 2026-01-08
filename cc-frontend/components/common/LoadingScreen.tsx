import React from 'react';
import { View, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-semibold text-gray-500">
        {message}
      </Text>
    </View>
  );
};

export default LoadingScreen;

