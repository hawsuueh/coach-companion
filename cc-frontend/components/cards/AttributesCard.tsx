import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface AttributesCardProps {
  title: string;
  description: string;
  onPress?: () => void;
  className?: string;
}

export default function AttributesCard({
  title,
  description,
  onPress,
  className = ''
}: AttributesCardProps) {
  return (
    <TouchableOpacity
      className={`mb-3 rounded-xl bg-white p-4 ${className || ''}`}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Content */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-black">{title}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>

        {/* Navigation Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
}
