import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { PoetsenOne_400Regular } from '@expo-google-fonts/poetsen-one';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';
import { AuthProvider } from '@/contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterLight: Inter_300Light,
    InterRegular: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterBold: Inter_700Bold,
    PoetsenOne: PoetsenOne_400Regular
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
