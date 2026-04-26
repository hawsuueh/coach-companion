import React from 'react';
import { View } from 'react-native';
import { FloatingLabelInput } from 'react-native-floating-label-input';

type NumberInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  containerClassName?: string;
};

const NumberInput = ({
  label,
  value,
  onChange,
  containerClassName = ''
}: NumberInputProps) => {
  const handleChange = (text: string) => {
    // Remove non-digit characters
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned === '') {
      onChange(null); // show placeholder / label only
      return;
    }

    onChange(parseInt(cleaned, 10)); // whole number only
  };

  return (
    <View className={`w-full ${containerClassName}`}>
      <FloatingLabelInput
        label={label}
        value={value !== null ? String(value) : ''}
        keyboardType="numeric"
        onChangeText={handleChange}
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

export default NumberInput;
