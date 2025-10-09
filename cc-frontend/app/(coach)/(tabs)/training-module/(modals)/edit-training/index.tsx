import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useHeader } from '@/components/training-module/contexts/HeaderContext';

const EditTrainingModal = () => {
  const { setTitle } = useHeader();
  // Set Header2 title whenever this modal loads
  useEffect(() => {
    setTitle('Edit Training');
  });

  return <View className="flex-1 items-center bg-primary"></View>;
};

export default EditTrainingModal;
