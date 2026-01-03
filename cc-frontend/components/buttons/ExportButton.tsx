import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, isExporting }) => {
  return (
    <TouchableOpacity
      onPress={onExport}
      disabled={isExporting}
      className={`rounded-lg border border-gray-300 px-4 py-3 ${
        isExporting ? 'bg-gray-200' : 'bg-white'
      }`}
    >
      {isExporting ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#DC2626" />
          <Text className="ml-2 text-center font-medium text-gray-600">
            Generating PDF...
          </Text>
        </View>
      ) : (
        <Text className="text-center font-medium text-black">
          Export PDF
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default ExportButton;

