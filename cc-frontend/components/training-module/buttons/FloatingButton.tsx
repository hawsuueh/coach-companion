import React from 'react';
import { TouchableOpacity } from 'react-native';

type FloatingButtonProps = {
  onPress: () => void;
  icon: string;
  IconComponent: React.ComponentType<any>;
  size?: number;
  color?: string;
};

export default function FloatingButton({
  onPress,
  icon,
  IconComponent,
  size = 30,
  color = 'white'
}: FloatingButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-xl bg-accent shadow-lg"
      onPress={onPress}
    >
      <IconComponent name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}
