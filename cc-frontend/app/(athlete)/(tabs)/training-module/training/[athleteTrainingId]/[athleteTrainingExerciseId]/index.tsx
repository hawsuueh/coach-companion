import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useExerciseTimer } from '@/hooks/useExerciseTimer';
import { mockAthleteTraining } from '@/mocks/mockAthleteTraining';
import { mockAthleteTrainingExercises } from '@/mocks/mockAthleteTrainingExercises';

export default function AthleteTrainingExerciseExecution() {
  const router = useRouter();
  const { setTitle } = useHeader();
  const exerciseTimer = useExerciseTimer();
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();

  /* ---------------- LOCAL STATE ---------------- */
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ---------------- ATHLETE TRAINING INFO ---------------- */
  const [athleteTraining, setAthleteTraining] = useState(
    mockAthleteTraining(athleteTrainingId)
  );

  /* ---------------- DUMMY DATA (CAMEL CASE + SETS DIVIDED) ---------------- */
  const [athleteTrainingExercises, setAthleteTrainingExercises] = useState(
    mockAthleteTrainingExercises
  );

  // Set header2 title whenever this screen loads
  useEffect(() => {
    if (athleteTraining?.name) {
      setTitle('Training');
    }
  }, [athleteTraining, setTitle]);

  /* ---------------- FLATTENED EXERCISE SETS ---------------- */
  const exerciseExecutionList = useMemo(() => {
    return athleteTrainingExercises.flatMap(exercise => {
      const perSetDuration = Math.floor(exercise.duration / exercise.sets);

      return Array.from({ length: exercise.sets }).map((_, setIndex) => ({
        ...exercise,
        setIndex: setIndex + 1,
        totalSets: exercise.sets,
        totalReps: exercise.reps,
        setDuration: perSetDuration
      }));
    });
  }, [athleteTrainingExercises]);

  /* ---------------- CURRENT EXERCISE ---------------- */
  const currentExercise = exerciseExecutionList[currentIndex];
  const isLastExercise = currentIndex === exerciseExecutionList.length - 1;

  /* ---------------- TOTAL TRAINING TIMER ---------------- */
  const { remainingSeconds: overallRemaining, start: startOverallCountdown } =
    useCountdownTimer(athleteTraining.duration);

  /* ---------------- CURRENT EXERCISE TIMER ---------------- */
  const startExerciseCountdown = () => {
    if (!currentExercise) return;
    exerciseTimer.start(currentExercise.setDuration);
  };

  /* ---------------- HANDLERS ---------------- */
  const handleStart = () => {
    startOverallCountdown(); // start overall countdown
    startExerciseCountdown(); // start first exercise countdown
    setHasStarted(true);
  };

  const handleNext = () => {
    if (!currentExercise) return;

    const elapsedSeconds = exerciseTimer.stop();

    setAthleteTrainingExercises(prev =>
      prev.map(ex =>
        ex.athleteTrainingExerciseId ===
        currentExercise.athleteTrainingExerciseId
          ? { ...ex, timeElapsed: ex.timeElapsed + elapsedSeconds }
          : ex
      )
    );

    if (!isLastExercise) {
      setCurrentIndex(prev => prev + 1);
      startExerciseCountdown();
    }
  };

  const handleFinish = () => {
    const elapsedSeconds = exerciseTimer.stop();

    if (currentExercise) {
      setAthleteTrainingExercises(prev =>
        prev.map(ex =>
          ex.athleteTrainingExerciseId ===
          currentExercise.athleteTrainingExerciseId
            ? { ...ex, timeElapsed: ex.timeElapsed + elapsedSeconds }
            : ex
        )
      );
    }

    const now = new Date();

    setAthleteTraining(prev => ({
      ...prev,
      status: 'done',
      timeElapsed: prev.duration - overallRemaining,
      dateExecuted: now.toISOString().split('T')[0]
    }));

    router.replace(`/training-module/training/${athleteTrainingId}/summary`);
  };

  useEffect(() => {
    console.log('UPDATED athleteTraining:', athleteTraining);
  }, [athleteTraining]);

  useEffect(() => {
    console.log('UPDATED athleteTraining:', athleteTrainingExercises);
  }, [athleteTrainingExercises]);

  /* ---------------- RENDER ---------------- */
  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      <View>
        <TrainingCard
          name={athleteTraining.name}
          date={athleteTraining.date}
          time={athleteTraining.time}
        />
      </View>

      <ExerciseProgressBar
        total={exerciseExecutionList.length}
        completedIndex={currentIndex - 1}
      />

      <View className="flex-row justify-between">
        <TimerCard remainingSeconds={overallRemaining} />
        <TimerCard remainingSeconds={exerciseTimer.remainingSeconds} />
      </View>

      <Text className="text-body2 mb-1 text-center text-gray-500">
        Set {currentExercise.setIndex} of {currentExercise.totalSets} •{' '}
        {currentExercise.reps} reps
      </Text>

      <Text className="text-title1 mb-2 text-center">
        {currentExercise.name}
      </Text>

      <VideoCard youtubeUrl={currentExercise.videoUrl} />

      <View className="mb-8 mt-4">
        <NumberListCard
          title="Instructions"
          items={currentExercise.instructions}
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
