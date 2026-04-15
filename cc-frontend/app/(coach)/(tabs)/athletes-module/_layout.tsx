// app/(coach)/(tabs)/athletes-module/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import Header2 from '@/components/headers/Header2';
import { HeaderProvider, useHeader } from '@/components/contexts/HeaderContext';

function AthletesModuleContent() {
  const pathname = usePathname();
  const { title } = useHeader();

  const landingPaths = ['/athletes-module', '/athletes-module/[id]'];

  const isLandingPath = landingPaths.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Show Header2 only on deeper paths */}
      {!isLandingPath && <Header2 title={title} />}

      {/* Stack handles actual screen rendering */}
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </View>
  );
}

export default function AthletesModuleLayout() {
  return (
    <HeaderProvider>
      <AthletesModuleContent />
    </HeaderProvider>
  );
}
