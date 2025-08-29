import {
  useFonts,
  PoetsenOne_400Regular
} from '@expo-google-fonts/poetsen-one';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import CoachNavigation from '@/components/navigations/CoachNavigation';

// SplashScreen.preventAutoHideAsync();

export default function CoachLayout() {
  const [loaded, error] = useFonts({
    PoetsenOne_400Regular
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <CoachNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
