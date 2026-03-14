import React from 'react';
import { TouchableOpacity, Text, DimensionValue } from 'react-native';

type MainButtonProps = {
  text: string;
  width?: DimensionValue;
  height?: DimensionValue;
  onPress?: () => void;
  disabled?: boolean;
};

export default function MainButton({
  text,
  width = '100%',
  height = 50,
  disabled = false,
  onPress
}: MainButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{ width, height }}
      className="items-center justify-center rounded-xl bg-accent shadow-lg"
    >
      <Text className="text-body1 text-white">{text}</Text>
    </TouchableOpacity>
  );
}
