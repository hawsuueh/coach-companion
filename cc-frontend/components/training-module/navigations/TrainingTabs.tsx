import React from 'react';
import { ScrollView, View } from 'react-native';
import { usePathname, useRouter, Href } from 'expo-router';
import TabsButton from '@/components/training-module/buttons/TabsButton';

const tabs = [
  { name: 'Training', href: '/training-module/training' },
  { name: 'Exercises', href: '/training-module/exercises' },
  { name: 'Tracking', href: '/training-module/tracking' },
  { name: 'Analysis', href: '/training-module/analysis' }
] as const;

export default function TrainingTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="bg-primary py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <TabsButton
              key={tab.name}
              label={tab.name}
              isActive={isActive}
              onPress={() => router.push(tab.href as Href)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
