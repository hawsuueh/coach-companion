import React, { useState, useEffect } from 'react';
import {View, Text, ScrollView } from 'react-native';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useRouter } from 'expo-router';

export default function EditExercisesModal() {
  const { setTitle } = useHeader();
  const router = useRouter();

  useEffect(() => {
    setTitle('Edit Exercises');
  }, [setTitle]);

  return (
    <View className="flex-1 bg-primary px-6 pt-6">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-h2 text-center">Edit Exercises</Text>
        <Text className="text-body1 text-center mt-4">
          This feature is under development.
        </Text>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Close"
          width="50%"
          height={40}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
