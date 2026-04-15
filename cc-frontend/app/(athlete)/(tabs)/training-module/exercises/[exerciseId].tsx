// ExerciseDetails.tsx
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import VideoCard from '@/components/training-module/cards/VideoCard';
import NumberListCard from '@/components/training-module/cards/NumberListCard';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';
import { getExerciseVM } from '@/view-models/training-module';

export default function ExerciseDetails() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { setTitle } = useHeader();

  // single object, not array
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const vm = await getExerciseVM(exerciseId); // ✅ pass exerciseId
      setExercise(vm);
      setLoading(false);
    };
    fetchData();
  }, [exerciseId]);

  useEffect(() => {
    setTitle('Exercise Details');
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-title1 text-black">Loading exercise...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-white">No exercise found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary px-4 pt-4">
      {/* Exercise Name */}
      <View className="mb-5 items-center">
        <Text className="text-title1">{exercise.name}</Text>
      </View>

      <View className="mb-5">
        {/* use url from VM */}
        <VideoCard youtubeUrl={exercise.url} />
      </View>

      <View className="mb-5">
        <NumberListCard title="Instructions" items={exercise.instructions} />
      </View>
    </View>
  );
}
