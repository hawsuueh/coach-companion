import React from 'react';
import { View } from 'react-native';

type ExerciseProgressBarProps = {
  total: number;
  completedIndex: number; // 0-based index
};

const ExerciseProgressBar = ({
  total,
  completedIndex
}: ExerciseProgressBarProps) => {
  return (
    <View className="flex-row items-center justify-between">
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index <= completedIndex;

        return (
          <View
            key={index}
            className={`mx-1 h-1 flex-1 rounded-full ${
              isCompleted ? 'bg-red-500' : 'bg-white'
            }`}
          />
        );
      })}
    </View>
  );
};

export default ExerciseProgressBar;
