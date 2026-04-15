import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import List2 from '@/components/training-module/lists/List2';
import MainButton from '@/components/training-module/buttons/MainButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* ---------------------------------- */
/* TEMP DATA (same shape as execution screen)
   Replace later with context / store / API
----------------------------------- */

const athleteTraining = {
  athleteTrainingId: '1',
  name: 'Training Name',
  date: 'Sept 15, 2025',
  time: '7:00 AM',
  duration: 3600, // seconds
  timeElapsed: 21, // 57:48
  dateExecuted: 'Day, MM-DD-YYYY',
  status: 'done'
};

const athleteTrainingExercises = [
  {
    athleteTrainingExerciseId: '1',
    name: 'Defensive Slides',
    duration: 300,
    timeElapsed: 10
  },
  {
    athleteTrainingExerciseId: '2',
    name: 'Suicide Sprints',
    duration: 300,
    timeElapsed: 5
  },
  {
    athleteTrainingExerciseId: '3',
    name: 'Plank Hold',
    duration: 600,
    timeElapsed: 3
  },
  {
    athleteTrainingExerciseId: '4',
    name: 'Jump Squats',
    duration: 300,
    timeElapsed: 3
  }
];

/* ---------------------------------- */

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export default function Summary() {
  const router = useRouter();
  const { athleteTrainingId } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-6">
      {/* HEADER */}

      <View className="mb-5">
        <TrainingCard
          name={athleteTraining.name}
          date={athleteTraining.date}
          time={athleteTraining.time}
        />
      </View>

      <View className="mb-3">
        <Text className="text-h2">Training done! Great job!</Text>
      </View>

      {/* TRAINING RESULT */}
      <View className="items-center">
        <View className="flex-row items-center gap-1 px-4 py-3">
          <MaterialCommunityIcons
            name="timer-outline"
            size={20}
            color="black"
          />
          <Text className="text-body1 text-black">
            {formatTime(athleteTraining.timeElapsed)} /{' '}
            {formatTime(athleteTraining.duration)}
          </Text>
        </View>
      </View>

      {/* EXERCISE SUMMARY */}
      <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
        {athleteTrainingExercises.map(exercise => (
          <List2
            key={exercise.athleteTrainingExerciseId}
            title={exercise.name}
            rightText={`${formatTime(
              exercise.timeElapsed
            )}/${formatTime(exercise.duration)}`}
            onPress={() => {}}
          />
        ))}
      </ScrollView>

      {/* Main Button */}
      <View className="absolute bottom-5 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Go Back"
          width="50%"
          height={40}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
