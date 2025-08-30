import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export default function FloatingActionButton({
  icon,
  onPress,
  color = '#FF0000',
  size = 'medium',
  position = 'bottom-right',
  className = ''
}: FloatingActionButtonProps) {
  // Size configurations
  const sizeConfig = {
    small: { container: 'h-12 w-12', icon: 20 },
    medium: { container: 'h-14 w-14', icon: 28 },
    large: { container: 'h-16 w-16', icon: 32 }
  };

  // Position configurations
  const positionConfig = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const currentSize = sizeConfig[size];
  const currentPosition = positionConfig[position];

  return (
    <View
      className={`absolute ${currentPosition} z-10 rounded-lg ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      }}
    >
      <TouchableOpacity
        className={`${currentSize.container} items-center justify-center rounded-lg`}
        style={{ backgroundColor: color }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={currentSize.icon} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
