import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import ExerciseProgressBar from '@/components/training-module/progress/ExerciseProgressBar';
import MainButton from '@/components/training-module/buttons/MainButton';
import VideoCard from '@/components/training-module/cards/VideoCard';
import { TimerCard } from '@/components/training-module/cards/TimerCard';
import NumberListCard from '@/components/training-module/cards/NumberListCard';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import {
  getAthleteTrainingExecutionVM,
  finishAthleteTrainingVM,
  trackExerciseSetVM
} from '@/view-models/training-module';
import { AthleteTraining } from '@/types/training';

export default function AthleteTrainingExerciseExecution() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const exerciseTimer = useExerciseTimer();
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();

  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [athleteTraining, setAthleteTraining] =
    useState<AthleteTraining | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Training');
  }, [setTitle]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vm = await getAthleteTrainingExecutionVM(athleteTrainingId);
      setAthleteTraining(vm);
      setLoading(false);
    };
    fetchData();
  }, [athleteTrainingId]);

  const exerciseExecutionList = useMemo(() => {
    if (!athleteTraining?.exercises) return [];
    return athleteTraining.exercises.flatMap((exercise: any) => {
      const perSetDuration = Math.floor(exercise.duration / exercise.sets);
      return Array.from({ length: exercise.sets }).map((_, setIndex) => ({
        ...exercise,
        setIndex: setIndex + 1,
        totalSets: exercise.sets,
        totalReps: exercise.reps,
        setDuration: perSetDuration
      }));
    });
  }, [athleteTraining]);

  const currentExercise = exerciseExecutionList[currentIndex];
  const isLastExercise = currentIndex === exerciseExecutionList.length - 1;

  const {
    remainingSeconds: overallRemaining,
    start: startOverallCountdown,
    reset: resetOverallCountdown
  } = useCountdownTimer(0);

  useEffect(() => {
    if (athleteTraining?.duration) {
      resetOverallCountdown(athleteTraining.duration);
    }
  }, [athleteTraining?.duration]);

  const startExerciseCountdown = () => {
    if (!currentExercise) return;
    exerciseTimer.start(currentExercise.setDuration);
  };

  const handleStart = () => {
    startOverallCountdown();
    startExerciseCountdown();
    setHasStarted(true);
  };

  const handleNext = async () => {
    if (!currentExercise) return;

    const elapsedSeconds = exerciseTimer.stop();
    console.log('Raw timer stop value', elapsedSeconds);

    let newTotal = 0;

    // ✅ Update local state and compute new total
    setAthleteTraining(prev => {
      if (!prev) return prev;
      const updatedExercises = prev.exercises.map(ex =>
        ex.athleteTrainingExerciseId ===
        currentExercise.athleteTrainingExerciseId
          ? { ...ex, timeElapsed: (ex.timeElapsed ?? 0) + elapsedSeconds }
          : ex
      );

      const updatedExercise = updatedExercises.find(
        ex =>
          ex.athleteTrainingExerciseId ===
          currentExercise.athleteTrainingExerciseId
      );
      newTotal = updatedExercise?.timeElapsed ?? elapsedSeconds;

      // Persist to Supabase with the new total
      trackExerciseSetVM(currentExercise.athleteTrainingExerciseId, newTotal);

      return { ...prev, exercises: updatedExercises };
    });

    console.log('Updating exercise tracking', {
      id: currentExercise.athleteTrainingExerciseId,
      elapsed: newTotal
    });

    if (!isLastExercise) {
      setCurrentIndex(prev => prev + 1);
      startExerciseCountdown();
    }
  };

  const handleFinish = async () => {
    const elapsedSeconds = exerciseTimer.stop();
    console.log('Raw timer stop value', elapsedSeconds);

    let newTotal = 0;

    if (currentExercise) {
      setAthleteTraining(prev => {
        if (!prev) return prev;
        const updatedExercises = prev.exercises.map(ex =>
          ex.athleteTrainingExerciseId ===
          currentExercise.athleteTrainingExerciseId
            ? { ...ex, timeElapsed: (ex.timeElapsed ?? 0) + elapsedSeconds }
            : ex
        );

        const updatedExercise = updatedExercises.find(
          ex =>
            ex.athleteTrainingExerciseId ===
            currentExercise.athleteTrainingExerciseId
        );
        newTotal = updatedExercise?.timeElapsed ?? elapsedSeconds;

        // Persist to Supabase with the new total
        trackExerciseSetVM(currentExercise.athleteTrainingExerciseId, newTotal);

        return { ...prev, exercises: updatedExercises };
      });

      console.log('Updating exercise tracking', {
        id: currentExercise.athleteTrainingExerciseId,
        elapsed: newTotal
      });
    }

    await finishAthleteTrainingVM(
      athleteTrainingId,
      athleteTraining!.duration - overallRemaining
    );

    setAthleteTraining(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'done',
        timeElapsed: prev.duration - overallRemaining,
        dateExecuted: new Date().toISOString().split('T')[0]
      };
    });

    router.replace(`/training-module/training/${athleteTrainingId}/summary`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-title1 text-black">Loading training...</Text>
      </View>
    );
  }

  if (!athleteTraining) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-white">No training found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      <TrainingCard
        name={athleteTraining.name}
        date={athleteTraining.date}
        time={athleteTraining.time}
      />

      <ExerciseProgressBar
        total={exerciseExecutionList.length}
        completedIndex={currentIndex - 1}
      />

      <View className="flex-row justify-between">
        <TimerCard remainingSeconds={overallRemaining} />
        <TimerCard remainingSeconds={exerciseTimer.remainingSeconds} />
      </View>

      <Text className="text-body2 mb-1 text-center text-gray-500">
        Set {currentExercise?.setIndex} of {currentExercise?.totalSets} •{' '}
        {currentExercise?.reps} reps
      </Text>

      <Text className="text-title1 mb-2 text-center">
        {currentExercise?.name}
      </Text>

      <VideoCard youtubeUrl={currentExercise?.videoUrl} />

      <View className="mb-8 mt-4">
        <NumberListCard
          title="Instructions"
          items={currentExercise?.instructions ?? []}
          maxHeight={130}
        />
      </View>

      <View className="absolute bottom-6 left-0 right-0 items-center">
        {!hasStarted ? (
          <MainButton
            text="Start"
            width="60%"
            height={44}
            onPress={handleStart}
          />
        ) : isLastExercise ? (
          <MainButton
            text="Finish"
            width="60%"
            height={44}
            onPress={handleFinish}
          />
        ) : (
          <MainButton
            text="Next"
            width="60%"
            height={44}
            onPress={handleNext}
          />
        )}
      </View>
    </View>
  );
}
