import { Stack, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoachNavigation from '@/components/navigations/CoachNavigation';
import { DrawerProvider, useDrawer } from '@/contexts/DrawerContext';
import Header1 from '@/components/headers/Header1';
import SideDrawer from '@/components/navigations/SideDrawer';
import '@/global.css';

// Inner component — now inside DrawerProvider
function CoachLayoutContent() {
  const pathname = usePathname();
  const { openDrawer } = useDrawer(); // useDrawer() safely called here

  // Landing paths
  // Define the paths you want to have the Header1 here
  const landingPaths = [
    '/home',
    '/training-module/training',
    '/training-module/exercises',
    '/training-module/analysis',
    '/training-module/tracking',
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
      <CoachNavigation />
      <SideDrawer />
    </>
  );
}

export default function CoachLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ✅ Provider wraps everything that needs drawer access */}
      <DrawerProvider>
        <CoachLayoutContent />
      </DrawerProvider>
    </SafeAreaView>
  );
}
