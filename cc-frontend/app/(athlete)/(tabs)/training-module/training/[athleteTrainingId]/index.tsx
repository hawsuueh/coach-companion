// Data that is here IS the particular training for the athlete
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href, Link } from 'expo-router';
import List1 from '@/components/training-module/lists/List1';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import { TimerCard } from '@/components/training-module/cards/TimerCard';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

export default function AthleteTrainingDetails() {
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();
  const router = useRouter();
  const { setTitle } = useHeader();

  // Dummy training (metadata)
  const athleteTraining = {
    athleteTrainingId: athleteTrainingId,
    name: 'Speed & Conditioning',
    date: 'Sept 15, 2025',
    time: '7:00 AM',
    duration: 3600, // total seconds including rests (example)
    status: 'assigned',
    timeElapsed: 0,
    dateExecuted: null
  };

  // Dummy athlete_training_exercises data
  const athleteTrainingExercises = [
    {
      athleteTrainingExerciseId: '1',
      exerciseId: '1',
      exerciseName: 'Defensive Slides',
      description: 'Strengthens chest, shoulders, and triceps'
    },
    {
      athleteTrainingExerciseId: '2',
      exerciseId: '2',
      exerciseName: 'Suicide Sprints',
      description: 'Targets quads, hamstrings, and glutes'
    },
    {
      athleteTrainingExerciseId: '3',
      exerciseId: '3',
      exerciseName: 'Plank Hold',
      description: 'Improves core strength and stability'
    },
    {
      athleteTrainingExerciseId: '4',
      exerciseId: '4',
      exerciseName: 'Jump Squats',
      description: 'Enhances balance and strengthens legs'
    }
  ];

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/training-module/exercises/${exerciseId}` as Href);
  };

  const handleStartPress = (athleteTrainingId: string) => {
    const firstExercise = athleteTrainingExercises[0];

    if (!firstExercise) return;

    router.push(
      `/training-module/training/${athleteTrainingId}/${firstExercise.athleteTrainingExerciseId}` as Href
    );
  };

  // Set header2 title whenever this screen loads
  useEffect(() => {
    if (athleteTraining?.name) {
      setTitle('Training');
    }
  }, [athleteTraining, setTitle]);

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Training Card */}
      <View>
        <TrainingCard
          name={athleteTraining.name}
          date={athleteTraining.date}
          time={athleteTraining.time}
        />
      </View>

      <View className="items-center">
        <TimerCard remainingSeconds={athleteTraining.duration} />
      </View>

      {/* Exercises List */}
      <FlatList
        className="mb-20"
        data={athleteTrainingExercises}
        keyExtractor={item => item.exerciseId}
        renderItem={({ item }) => (
          <List1
            title={item.exerciseName}
            subtitle={item.description}
            onPress={() => handleExercisePress(item.exerciseId)}
            onLongPress={() => console.log(`Long pressed ${item.exerciseName}`)}
          />
        )}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No trainings found</Text>
          </View>
        }
      />

      {/* Main Button */}
      <View className="absolute bottom-5 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Start"
          width="50%"
          height={40}
          onPress={() => handleStartPress(athleteTrainingId)}
        />
      </View>
    </View>
  );
}
