import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  type: 'shooting' | 'rebounds' | 'simple';
  stats: any;
  onUpdate: (field: string, value: number) => void;
}

export default function StatCard({
  title,
  type,
  stats,
  onUpdate
}: StatCardProps) {
  const renderShootingStats = () => {
    const made = stats?.made || 0;
    const attempted = stats?.attempted || 0;
    const missed = attempted - made;
    const percentage =
      attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';

    return (
      <>
        {/* Summary Display */}
        <View className="mb-4 items-center">
          <Text className="text-3xl font-bold text-black">
            {made}/{attempted}
          </Text>
          <Text className="text-sm text-gray-600">{percentage}%</Text>
        </View>

        {/* Made Controls */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-medium text-black">Made</Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('made', Math.max(0, made - 1))}
            >
              <Text className="font-bold text-gray-600">-</Text>
            </TouchableOpacity>
            <Text className="w-8 text-center font-medium">{made}</Text>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('made', made + 1)}
            >
              <Text className="font-bold text-gray-600">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Missed Controls */}
        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-black">Missed</Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('attempted', Math.max(0, attempted - 1))}
            >
              <Text className="font-bold text-gray-600">-</Text>
            </TouchableOpacity>
            <Text className="w-8 text-center font-medium">{missed}</Text>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('attempted', attempted + 1)}
            >
              <Text className="font-bold text-gray-600">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const renderReboundsStats = () => {
    const offensive = stats?.offensive || 0;
    const defensive = stats?.defensive || 0;
    const total = offensive + defensive;

    return (
      <>
        {/* Summary Display */}
        <View className="mb-4 items-center">
          <Text className="text-3xl font-bold text-black">{total}</Text>
          <Text className="text-sm text-gray-600">
            Total ({offensive} OFF, {defensive} DEF)
          </Text>
        </View>

        {/* Offensive Controls */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-medium text-black">Offensive</Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('offensive', Math.max(0, offensive - 1))}
            >
              <Text className="font-bold text-gray-600">-</Text>
            </TouchableOpacity>
            <Text className="w-8 text-center font-medium">{offensive}</Text>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('offensive', offensive + 1)}
            >
              <Text className="font-bold text-gray-600">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Defensive Controls */}
        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-black">Defensive</Text>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('defensive', Math.max(0, defensive - 1))}
            >
              <Text className="font-bold text-gray-600">-</Text>
            </TouchableOpacity>
            <Text className="w-8 text-center font-medium">{defensive}</Text>
            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
              onPress={() => onUpdate('defensive', defensive + 1)}
            >
              <Text className="font-bold text-gray-600">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const renderSimpleStats = () => {
    const value = stats || 0;

    return (
      <View className="flex-row items-center justify-between">
        <Text className="font-medium text-black">{title}</Text>
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full bg-white"
            onPress={() => onUpdate('value', Math.max(0, value - 1))}
          >
            <Text className="font-bold text-gray-600">-</Text>
          </TouchableOpacity>
          <Text className="w-8 text-center font-medium">{value}</Text>
          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full bg-white"
            onPress={() => onUpdate('value', value + 1)}
          >
            <Text className="font-bold text-gray-600">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="mb-4 rounded-lg bg-gray-100 p-4">
      <Text className="mb-3 text-lg font-semibold text-black">{title}</Text>
      {type === 'shooting' && renderShootingStats()}
      {type === 'rebounds' && renderReboundsStats()}
      {type === 'simple' && renderSimpleStats()}
    </View>
  );
}
