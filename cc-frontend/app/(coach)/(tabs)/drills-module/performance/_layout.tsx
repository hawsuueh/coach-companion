import { Stack } from 'expo-router';
import React from 'react';

export default function PerformanceLayout() {
  return (
    <Stack>
      {/* default screen for the performance tab */}
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Athlete Performance',
          headerShown: false
        }}
      />
      {/* This defines the route for individual athlete views.
          '[athleteId]' makes the ID a dynamic parameter in the URL. */}
      <Stack.Screen
        name="[athleteId]"
        options={{
          headerTitle: 'Athlete Performance',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="team_performance"
        options={{
          headerTitle: 'Team Performance'
        }}
      />
    </Stack>
  );
}
