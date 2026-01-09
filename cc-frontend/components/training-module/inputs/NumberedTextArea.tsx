import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

type NumberedTextAreaProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  minItems?: number;
  autoAdd?: boolean;
};

const NumberedTextArea = ({
  label,
  value,
  onChange,
  placeholder = '',
  minItems = 1,
  autoAdd = true
}: NumberedTextAreaProps) => {
  const updateItem = (text: string, index: number) => {
    const updated = [...value];
    updated[index] = text;

    if (autoAdd && index === value.length - 1 && text.trim() !== '') {
      updated.push('');
    }

    onChange(updated);
  };

  const removeItem = (index: number) => {
    if (value.length <= minItems) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <View className="w-full rounded-xl border border-black/30 bg-white p-3">
      {/* Label */}
      <Text className="text-label1 mb-2">{label}</Text>

      {value.map((item, index) => (
        <View key={index} className="mb-2 flex-row items-start">
          {/* Number */}
          <Text className="text-body1 mr-2 mt-3">{index + 1}.</Text>

          {/* Input */}
          <TextInput
            value={item}
            onChangeText={text => updateItem(text, index)}
            placeholder={placeholder}
            multiline
            className="text-body1 flex-1"
          />

          {/* Remove */}
          {value.length > minItems && (
            <Pressable onPress={() => removeItem(index)} className="ml-2 mt-2">
              <Text className="text-red-500">✕</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
};

export default NumberedTextArea;
