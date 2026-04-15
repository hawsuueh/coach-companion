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
        name="generate-training"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />

      <Stack.Screen
        name="edit-training"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
      
      <Stack.Screen
        name="add-exercise"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />

      <Stack.Screen
        name="edit-exercise"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  );
}
