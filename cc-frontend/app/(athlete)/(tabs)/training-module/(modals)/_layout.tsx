import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerShown: false
      }}
    >
      <Stack.Screen
        name="(modals)/generate-training/index"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />

      <Stack.Screen
        name="(modals)/generate-training/assign-training"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />

      <Stack.Screen
        name="(modals)/edit-training/"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  );
}
