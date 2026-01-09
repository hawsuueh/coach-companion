import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

type TabsButtonProps = {
  label: string;
  onPress?: () => void;
  isActive?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
  testID?: string;
} & Omit<PressableProps, 'onPress'>;

export default function TabsButton({
  label,
  onPress,
  isActive = false,
  accessibilityLabel,
  disabled,
  testID,
  ...rest
}: TabsButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: isActive, disabled }}
      className={`mr-3 rounded-xl px-3 py-1 ${isActive ? 'bg-accent' : 'bg-white'} ${disabled ? 'opacity-50' : ''}`}
      {...rest}
    >
      <Text className={`text-body1 ${isActive ? 'text-white' : 'text-black'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
