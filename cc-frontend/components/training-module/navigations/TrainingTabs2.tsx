import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePathname, useRouter, Href } from 'expo-router';

const tabs = [
  { name: 'Training', href: '/training-module/training' },
  { name: 'Exercises', href: '/training-module/exercises' }
] as const;

export default function TrainingTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="bg-primary">
      {/* Container for the tabs */}
      <View className="flex-row">
        {tabs.map(tab => {
          // Determine if this tab is the current route
          const isActive = pathname.startsWith(tab.href);

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.7}
              onPress={() => router.push(tab.href as Href)}
              // flex-1 makes sure the two tabs split the screen 50/50
              className="flex-1 items-center justify-center py-5"
            >
              <Text
                className={`text-h3 ${
                  isActive ? 'text-black' : 'text-gray-500'
                }`}
              >
                {tab.name}
              </Text>

              {/* The Underline Indicator */}
              <View
                className={`mt-2 h-[3px] w-3/4 rounded-full ${
                  isActive ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
