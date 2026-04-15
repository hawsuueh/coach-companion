import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import Header2 from '@/components/headers/Header2';
import { HeaderProvider, useHeader } from '@/components/contexts/HeaderContext';

function AthleteModuleContent() {
  const pathname = usePathname();
  const { title } = useHeader();

  // Landing path for the athlete module
  const landingPaths = ['/athletes-module'];

  // Check if we are on the landing page or a sub-page
  const isLandingPath = landingPaths.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Show Header2 only on deeper paths (attributes, injuries, game-records) */}
      {!isLandingPath && <Header2 title={title} />}

      {/* Stack handles actual screen rendering */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function AthleteModuleLayout() {
  return (
    <HeaderProvider>
      <AthleteModuleContent />
    </HeaderProvider>
  );
}
