import { Stack, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AthleteNavigation from '@/components/navigations/AthleteNavigation';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import Header1 from '@/components/headers/Header1';
import SideDrawer from '@/components/navigations/SideDrawer';
import '@/global.css';

// Inner component — now inside DrawerProvider
function AthleteLayoutContent() {
  const pathname = usePathname();
  const { openDrawer } = useDrawer(); // useDrawer() safely called here

  // Landing paths
  // Define the paths you want to have the Header1 here
  const landingPaths = [
    '/home',
    '/training-module/training',
    '/training-module/exercises',
    '/training-module/upcoming-training',
    '/training-module/tracking',
    '/training-module/analysis',
    '/athletes-module',
    '/drills-module'
  ];

  // Check if current path is a training-module deeper route
  // const isTrainingModule = pathname.startsWith('/training-module');
  const isLandingPath = landingPaths.includes(pathname);
  const showHeader1 = isLandingPath;

  return (
    <>
      {/* Show Header1 only if not in training-module deeper pages */}
      {showHeader1 && (
        <Header1
          onNotificationPress={() => console.log('Notifications pressed')}
          onMenuPress={openDrawer} // ✅ will open drawer when menu pressed
        />
      )}

      <Stack screenOptions={{ headerShown: false }} />
      <AthleteNavigation />
      <SideDrawer />
    </>
  );
}

export default function AthleteLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ✅ Provider wraps everything that needs drawer access */}
      <DrawerProvider>
        <AthleteLayoutContent />
      </DrawerProvider>
    </SafeAreaView>
  );
}
