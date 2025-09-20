import { Stack } from 'expo-router';
import { View } from 'react-native';
import CoachNavigation from '@/components/navigations/CoachNavigation';
import Header1 from '@/components/headers/Header1';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CoachLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Custom Header */}
      <Header1
        onNotificationPress={() => {
          console.log('Notifications pressed');
        }}
        onMenuPress={() => {
          console.log('Menu pressed');
        }}
      />

      {/* Main content (screens + bottom navigation) */}
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }} />
        <CoachNavigation />
      </View>
    </SafeAreaView>
  );
}
