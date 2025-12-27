// app/(coach)/(tabs)/training-module/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import TrainingTabs from '@/components/training-module/navigations/TrainingTabs';
import Header2 from '@/components/headers/Header2';
import {
  HeaderProvider,
  useHeader
} from '@/components/training-module/contexts/HeaderContext';

function TrainingModuleContent() {
  const pathname = usePathname();
  const { title } = useHeader();

  const landingPaths = [
    '/training-module/training',
    '/training-module/exercises',
    '/training-module/upcoming-training',
    '/training-module/tracking',
    '/training-module/analysis'
  ];

  const isLandingPath = landingPaths.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Show TrainingTabs only on landing paths */}
      {isLandingPath && <TrainingTabs />}

      {/* Show Header2 only on deeper paths */}
      {!isLandingPath && <Header2 title={title} />}

      {/* Stack handles actual screen rendering */}
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </View>
  );
}

export default function TrainingModuleLayout() {
  return (
    <HeaderProvider>
      <TrainingModuleContent />
    </HeaderProvider>
  );
}
