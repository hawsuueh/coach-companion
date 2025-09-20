// app/(coach)/(tabs)/training-module/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';
import TrainingTabs from '@/components/training-module/navigations/TrainingTabs';

export default function TrainingModuleLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Button navigation always stay mounted here */}
      <TrainingTabs />

      {/* Stack handles actual screen rendering */}
      <Stack
        screenOptions={{
          headerShown: false // hide default header
        }}
      />
    </View>
  );
}
