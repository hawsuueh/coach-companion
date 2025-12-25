import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import VideoCard from '@/components/training-module/cards/VideoCard';
import NumberListCard from '@/components/training-module/cards/NumberListCard';
import FloatingButton from '@/components/training-module/buttons/FloatingButton';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function ExerciseDetails() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { setTitle } = useHeader();

  // Dummy exercise
  const exercise = {
    exerciseId: exerciseId,
    name: 'Bench Press',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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

  const handleFloatingPress = () =>
    console.log('Floating button pressed in training details');

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

      {/* Floating Button */}
      <Link
        href="/(coach)/(tabs)/training-module/(modals)/edit-exercise"
        asChild
      >
        <FloatingButton icon="edit" IconComponent={AntDesign} />
      </Link>
    </View>
  );
}
