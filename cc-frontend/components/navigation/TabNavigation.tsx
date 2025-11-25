import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Tab<T = string> {
  id: T;
  label: string;
}

interface TabNavigationProps<T = string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  activeColor?: string;
  inactiveColor?: string;
  borderColor?: string;
}

const TabNavigation = <T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  activeColor = 'text-red-500',
  inactiveColor = 'text-gray-500',
  borderColor = 'border-red-500'
}: TabNavigationProps<T>) => {
  return (
    <View className="flex-row border-b border-gray-200">
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          className={`flex-1 py-4 ${
            activeTab === tab.id ? `border-b-2 ${borderColor}` : ''
          }`}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === tab.id ? activeColor : inactiveColor
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabNavigation;

