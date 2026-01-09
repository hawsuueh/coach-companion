import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter, Href } from 'expo-router';
import List1 from '@/components/training-module/lists/List1';
import TrainingCard from '@/components/training-module/cards/TrainingCard';
import { TimerCard } from '@/components/training-module/cards/TimerCard';
import MainButton from '@/components/training-module/buttons/MainButton';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getAthleteTrainingVM } from '@/view-models/training-module/training.vm';
import { getAthleteTrainingExerciseVM } from '@/view-models/training-module';

export default function AthleteTrainingDetails() {
  const { athleteTrainingId } = useLocalSearchParams<{
    athleteTrainingId: string;
  }>();
  const router = useRouter();
  const { setTitle } = useHeader();

  const [athleteTraining, setAthleteTraining] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Training');
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vmTraining = await getAthleteTrainingVM(athleteTrainingId);
      const vmExercises = await getAthleteTrainingExerciseVM(athleteTrainingId);
      setAthleteTraining(vmTraining);
      setExercises(vmExercises);
      setLoading(false);
    };
    fetchData();
  }, [athleteTrainingId]);

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/training-module/exercises/${exerciseId}` as Href);
  };

  const handleStartPress = (athleteTrainingId: string) => {
    const firstExercise = exercises[0];
    if (!firstExercise) return;
    router.push(
      `/training-module/training/${athleteTrainingId}/${firstExercise.athleteTrainingExerciseId}` as Href
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-body1 text-black">Loading training...</Text>
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
        data={exercises}
        keyExtractor={item => item.athleteTrainingExerciseId}
        renderItem={({ item }) => (
          <List1
            title={item.exerciseName}
            subtitle={item.subtitle} // ✅ "2 sets • 12 reps • 00:01:30 duration"
            onPress={() => handleExercisePress(item.exerciseId)}
            onLongPress={() => console.log(`Long pressed ${item.exerciseName}`)}
          />
        )}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-base text-gray-500">No exercises found</Text>
          </View>
        }
      />

      {/* Main Button */}
      <View className="absolute bottom-5 left-0 right-0 items-center justify-center bg-primary pt-4">
        <MainButton
          text="Start"
          width="50%"
          height={40}
          onPress={() => handleStartPress(athleteTraining.athleteTrainingId)}
        />
      </View>
    </View>
  );
}
