import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import VideoCard from '@/components/training-module/cards/VideoCard';
import NumberListCard from '@/components/training-module/cards/NumberListCard';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function ExerciseDetails() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { setTitle } = useHeader();

  // Dummy exercise
  const exercise = {
    exerciseId: exerciseId,
    name: 'Plank Hold',
    url: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    instructions: ['Lie on bench', 'Lower Bar', 'Press up'],
    equipment: 'Barbell',
    type: 'Strength',
    bodypart: 'Chest',
    primaryMuscle: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii'],
    secondaryMuscle: [
      'Pectoralis Minor',
      'Serratus Anterior',
      'Rotator Cuff',
      'Biceps Brachii',
      'Core Muscles'
    ]
  };

  // Set header2 title whenever this screen loads
  useEffect(() => {
    setTitle('Exercise Details');
  });

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Exercise Name */}
      <View className="mb-5 items-center">
        <Text className="text-title1">{exercise.name}</Text>
      </View>

      <View className="mb-5">
        <VideoCard youtubeUrl={exercise.url} />
      </View>

      <View className="mb-5">
        <NumberListCard title="Instructions" items={exercise.instructions} />
      </View>
    </View>
  );
}
