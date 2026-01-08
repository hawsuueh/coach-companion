import React from 'react';
import { View, Text } from 'react-native';

interface GameHeaderProps {
  gameName: string;
  date?: string;
  subtitle?: string;
  variant?: 'default' | 'compact';
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameName,
  date,
  subtitle,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <View>
        <Text className="mb-2 mt-2 text-center text-lg font-semibold text-black">
          {gameName}
        </Text>
        {subtitle && (
          <Text className="text-center text-sm text-gray-600">
            {subtitle}
          </Text>
        )}
      </View>
    );
  }

  // Default variant (used in roster)
  return (
    <View className="items-center px-4 py-4">
      <Text className="mb-1 text-center text-xl font-bold text-black">
        {gameName}
      </Text>
      {date && (
        <Text className="text-center text-base text-gray-600">
          {date}
        </Text>
      )}
      {subtitle && (
        <Text className="text-center text-base text-gray-600">
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default GameHeader;

