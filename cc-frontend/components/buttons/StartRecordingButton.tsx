import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View } from 'react-native';

interface StartRecordingButtonProps {
  onPress: () => void;
  isRecording?: boolean;
  className?: string;
}

export default function StartRecordingButton({
  onPress,
  isRecording = false,
  className = ''
}: StartRecordingButtonProps) {
  return (
    <TouchableOpacity
      className={`mx-4 rounded-xl border-2 border-red-500 bg-white py-4 ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8
      }}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons
          name={isRecording ? 'stop-circle' : 'play-circle'}
          size={28}
          color="#EC1D25"
        />
        <Text className="ml-3 text-xl font-bold text-red-500">
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
