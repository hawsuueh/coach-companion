import React from 'react';
import { View, Text, ScrollView } from 'react-native';

type NumberListCardProps = {
  title?: string;
  items: string[];
  containerClassName?: string;
  maxHeight?: number;
};

const NumberListCard = ({
  title = 'List',
  items,
  containerClassName = '',
  maxHeight = 200
}: NumberListCardProps) => {
  return (
    <View
      className={`w-full rounded-xl border border-black/10 bg-white p-4 ${containerClassName}`}
    >
      {/* Title */}
      <Text className="text-title1 mb-3">{title}</Text>

      {/* Scrollable Content */}
      <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={true}>
        {items.map((item, index) => (
          <View key={index} className="mb-2 flex-row">
            <Text className="text-body1 mr-2">{index + 1}.</Text>
            <Text className="text-body1 flex-1">{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NumberListCard;
