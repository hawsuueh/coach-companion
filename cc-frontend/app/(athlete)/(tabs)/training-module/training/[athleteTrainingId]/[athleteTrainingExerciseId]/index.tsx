import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import ExerciseProgressBar from '@/components/training-module/progress/ExerciseProgressBar';
import MainButton from '@/components/training-module/buttons/MainButton';
import VideoCard from '@/components/training-module/cards/VideoCard';
import { TimerCard } from '@/components/training-module/cards/TimerCard';
import NumberListCard from '@/components/training-module/cards/NumberListCard';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';

export default function AthleteTrainingExerciseExecution() {
  const { setTitle } = useHeader();
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();

  /* ---------------- LOCAL STATE ---------------- */
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exerciseRemaining, setExerciseRemaining] = useState(0);
  const exerciseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  /* ---------------- DUMMY DATA (CAMEL CASE + SETS DIVIDED) ---------------- */
  const athleteTrainingExercises = [
    {
      athleteTrainingExerciseId: '1',
      exerciseId: 'ex-101',
      name: 'Defensive Slides',
      videoUrl: 'https://www.youtube.com/watch?v=Y6nKz7Ff2fM',
      instructions: [
        'Start in an athletic stance',
        'Slide laterally without crossing feet',
        'Keep chest up and core tight',
        'Maintain defensive posture throughout'
      ],
      sets: 2,
      reps: 0,
      duration: 120, // total duration
      setsExecuted: 0,
      repsExecuted: 0,
      timeElapsed: 0,
      status: 'pending'
    },
    {
      athleteTrainingExerciseId: '2',
      exerciseId: 'ex-102',
      name: 'Suicide Sprints',
      videoUrl: 'https://www.youtube.com/watch?v=YFZJp5kX9bY',
      instructions: [
        'Start at the baseline',
        'Sprint to free throw line and back',
        'Sprint to half court and back',
        'Sprint to opposite free throw and back',
        'Finish at opposite baseline'
      ],
      sets: 2,
      reps: 0,
      duration: 240,
      setsExecuted: 0,
      repsExecuted: 0,
      timeElapsed: 0,
      status: 'pending'
    },
    {
      athleteTrainingExerciseId: '3',
      exerciseId: 'ex-103',
      name: 'Plank Hold',
      videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      instructions: [
        'Place elbows under shoulders',
        'Engage core and glutes',
        'Keep body in straight line',
        'Hold position without sagging hips'
      ],
      sets: 2,
      reps: 0,
      duration: 180,
      setsExecuted: 0,
      repsExecuted: 0,
      timeElapsed: 0,
      status: 'pending'
    },
    {
      athleteTrainingExerciseId: '4',
      exerciseId: 'ex-104',
      name: 'Jump Squats',
      videoUrl: 'https://www.youtube.com/watch?v=U4s4mEQ5VqU',
      instructions: [
        'Start with feet shoulder-width apart',
        'Lower into squat position',
        'Explode upward into a jump',
        'Land softly and repeat'
      ],
      sets: 1,
      reps: 0,
      duration: 90,
      setsExecuted: 0,
      repsExecuted: 0,
      timeElapsed: 0,
      status: 'pending'
    }
  ];

  /* ---------------- ATHLETE TRAINING INFO ---------------- */
  const athleteTraining = {
    athleteTrainingId: athleteTrainingId,
    name: 'Speed & Conditioning',
    date: 'Sept 15, 2025',
    time: '7:00 AM',
    duration: 990, // total seconds including rests (example)
    status: 'assigned',
    timeElapsed: 0,
    dateExecuted: null
  };

  /* ---------------- CURRENT EXERCISE ---------------- */
  const currentExercise = athleteTrainingExercises[currentIndex];
  const isLastExercise = currentIndex === athleteTrainingExercises.length - 1;

  /* ---------------- TOTAL TRAINING TIMER ---------------- */
  // const totalTrainingDuration = useMemo(() => {
  //   // Total = sum of all exercise durations + 1-min rest between each set (except last)
  //   let total = 0;
  //   athleteTrainingExercises.forEach(ex => {
  //     const perSetDuration = Math.floor(ex.duration / ex.sets);
  //     total += perSetDuration * ex.sets;
  //     total += (ex.sets - 1) * 60; // 1-min rest between sets
  //   });
  //   return total;
  // }, [athleteTrainingExercises]);

  /* ---------------- TOTAL TRAINING TIMER ---------------- */
  const { remainingSeconds: overallRemaining, start: startOverallCountdown } =
    useCountdownTimer(athleteTraining.duration);

  /* ---------------- CURRENT EXERCISE TIMER ---------------- */
  const startExerciseCountdown = () => {
    if (!currentExercise) return;

    clearInterval(exerciseIntervalRef.current!);
    // divide duration per set
    const perSetDuration = Math.floor(
      currentExercise.duration / currentExercise.sets
    );
    setExerciseRemaining(perSetDuration);

    exerciseIntervalRef.current = setInterval(() => {
      setExerciseRemaining(prev => {
        if (prev <= 1) {
          clearInterval(exerciseIntervalRef.current!);
          exerciseIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ---------------- HANDLERS ---------------- */
  const handleStart = () => {
    startOverallCountdown(); // start overall countdown
    startExerciseCountdown(); // start first exercise countdown
    setHasStarted(true);
  };

  const handleNext = () => {
    if (!isLastExercise) {
      setCurrentIndex(prev => prev + 1);
      startExerciseCountdown(); // start next exercise
    }
  };

  const handleFinish = () => {
    clearInterval(exerciseIntervalRef.current!);
    // navigate to summary later
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    setTitle('Training');
    return () => clearInterval(exerciseIntervalRef.current!);
  }, [setTitle]);

  if (!currentExercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Exercise not found</Text>
      </View>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      <View className="mb-4">
        <TrainingCard
          name={athleteTraining.name}
          date={athleteTraining.date}
          time={athleteTraining.time}
        />
      </View>

      <ExerciseProgressBar
        total={athleteTrainingExercises.length}
        completedIndex={currentIndex - 1}
      />

      <View className="mb-4 flex-row justify-between">
        <TimerCard remainingSeconds={overallRemaining} />
        <TimerCard remainingSeconds={exerciseRemaining} />
      </View>

      <Text className="text-title1 mb-4 text-center">
        {currentExercise.name}
      </Text>

      <VideoCard youtubeUrl={currentExercise.videoUrl} />

      <View className="mt-4">
        <NumberListCard
          title="Instructions"
          items={currentExercise.instructions}
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
