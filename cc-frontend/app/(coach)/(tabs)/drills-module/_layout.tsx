// app/(coach)/(tabs)/drills-module/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View, Text } from 'react-native';
import Header2 from '@/components/headers/Header2';
import SubTabs from '@/components/navigation/SubTabs';
import {
  HeaderProvider,
  useHeader
} from '@/components/training-module/contexts/HeaderContext';

function DrillsModuleContent() {
  const pathname = usePathname();
  const { title } = useHeader();

  // Define the landing paths for this module
  const landingPaths = [
    '/drills-module/practice',
    '/drills-module/performance'
  ];

  // Define the tabs for the Drills module
  const drillTabs = [
    { name: 'Practice', href: '/drills-module/practice' },
    { name: 'Performance', href: '/drills-module/performance' }
  ];

  const isLandingPath = landingPaths.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* 1. LANDING HEADER (Title + Tabs) */}
      {isLandingPath && (
        <View className="bg-white">
          {/* Red Underlined Tabs */}
          <SubTabs tabs={drillTabs} />
        </View>
      )}
      {/* Shown when you click on a specific drill or performance stat */}
      {!isLandingPath && <Header2 title={title} />}

      {/* 3. ACTUAL SCREEN CONTENT */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function DrillsModuleLayout() {
  return (
    <HeaderProvider>
      <DrillsModuleContent />
    </HeaderProvider>
  );
}
