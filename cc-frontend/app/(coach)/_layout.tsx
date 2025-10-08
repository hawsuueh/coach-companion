// app/(coach)/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import CoachNavigation from '@/components/navigations/CoachNavigation';
import Header1 from '@/components/headers/Header1';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoachLayout() {
  const pathname = usePathname();

  // Landing paths inside training-module
  const trainingLandingPaths = [
    '/training-module/training',
    '/training-module/exercises',
    '/training-module/analysis',
    '/training-module/tracking'
  ];

  // Check if current path is a training-module deeper route
  const isTrainingModule = pathname.startsWith('/training-module');
  const isLandingPath = trainingLandingPaths.includes(pathname);
  const showHeader1 = !isTrainingModule || isLandingPath;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Show Header1 only if not in training-module deeper pages */}
      {showHeader1 && (
        <Header1
          onNotificationPress={() => {
            console.log('Notifications pressed');
          }}
          onMenuPress={() => {
            console.log('Menu pressed');
          }}
        />
      )}

      {/* Main content (screens + bottom navigation) */}
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
        <CoachNavigation />
      </View>
    </SafeAreaView>
  );
}
