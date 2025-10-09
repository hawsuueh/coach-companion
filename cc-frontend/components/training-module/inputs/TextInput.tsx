import React from 'react';
import { View } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';

type TextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  containerClassName?: string;
};

const TextInput = ({
  label,
  value,
  onChangeText,
  containerClassName = ''
}: TextInputProps) => {
  return (
    <View className={`w-full ${containerClassName}`}>
      <FloatingLabelInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        containerStyles={{
          borderWidth: 0.5,
          borderColor: 'black',
          borderRadius: 10,
          backgroundColor: 'white',
          paddingHorizontal: 10,
          paddingVertical: 5
        }}
        labelStyles={{
          fontFamily: 'InterLight',
          backgroundColor: 'white'
        }}
        inputStyles={{
          color: 'black',
          fontFamily: 'InterRegular',
          fontSize: 16
        }}
      />
    </View>
  );
};

export default TextInput;
