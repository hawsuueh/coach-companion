// components/common/SubTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePathname, useRouter, Href } from 'expo-router';

interface TabItem {
  name: string;
  href: string;
}

interface SubTabsProps {
  tabs: TabItem[];
}

export default function SubTabs({ tabs }: SubTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="bg-primary">
      <View className="flex-row">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.7}
              onPress={() => router.push(tab.href as Href)}
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
