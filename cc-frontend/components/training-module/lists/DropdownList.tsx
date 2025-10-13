import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

type DropdownItem = {
  contentTitle: string;
  contentRightText?: string;
};

type DropdownListProps = {
  title: string; // parent title (e.g., Assigned, Done)
  leftText: string | number; // count or label on the right side
  data: DropdownItem[];
};

export default function DropdownList({
  title,
  leftText,
  data
}: DropdownListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="rounded-lg bg-white">
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsOpen(prev => !prev)}
        className="flex-row items-center justify-between px-5 py-5"
      >
        {/* Left: Title */}
        <Text className="text-title1">{title}</Text>

        {/* Right: Count + Icon */}
        <View className="flex-row items-center">
          <Text
            className={`text-label2 mr-2 ${
              title.toLowerCase() === 'missed' ? 'text-red-500' : 'text-black'
            }`}
          >
            {leftText}
          </Text>
          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="black"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown content */}
      {isOpen && (
        <View className="px-5 py-2">
          {data.length > 0 ? (
            <FlatList
              data={data}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="flex-row justify-between py-1">
                  <Text className="text-label2">{item.contentTitle}</Text>
                  {item.contentRightText && (
                    <Text className="text-label2">{item.contentRightText}</Text>
                  )}
                </View>
              )}
            />
          ) : (
            <Text className="text-label4">No records found.</Text>
          )}
        </View>
      )}
    </View>
  );
}
