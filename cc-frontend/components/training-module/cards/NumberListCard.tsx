import React from 'react';
import { View, Text } from 'react-native';

type NumberListCardProps = {
  title?: string;
  items: string[];
  containerClassName?: string;
};

const NumberListCard = ({
  title = 'List',
  items,
  containerClassName = ''
}: NumberListCardProps) => {
  return (
    <View
      className={`w-full rounded-xl border border-black/10 bg-white p-4 ${containerClassName}`}
    >
      {/* Title */}
      <Text className="text-title1 mb-3">{title}</Text>

      {/* Numbered List */}
      {items.map((item, index) => (
        <View key={index} className="mb-1 flex-row">
          <Text className="text-body1 mr-2">{index + 1}.</Text>

          <Text className="text-body1 flex-1">{item}</Text>
        </View>
      ))}
    </View>
  );
};

export default NumberListCard;
