import { Ionicons } from '@expo/vector-icons';
import { Dimensions, TouchableOpacity, View } from 'react-native';

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
  color = '#EC1D25',
  size = 'medium',
  position = 'bottom-right',
  className = ''
}: FloatingActionButtonProps) {
  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375; // iPhone SE and smaller
  const isTablet = width >= 768; // iPad and larger

  // Responsive size configurations using NativeWind
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: isSmallScreen
            ? 'h-10 w-10'
            : isTablet
              ? 'h-14 w-14'
              : 'h-12 w-12',
          icon: isSmallScreen ? 16 : isTablet ? 24 : 20
        };
      case 'medium':
        return {
          container: isSmallScreen
            ? 'h-12 w-12'
            : isTablet
              ? 'h-16 w-16'
              : 'h-14 w-14',
          icon: isSmallScreen ? 20 : isTablet ? 28 : 24
        };
      case 'large':
        return {
          container: isSmallScreen
            ? 'h-14 w-14'
            : isTablet
              ? 'h-20 w-20'
              : 'h-16 w-16',
          icon: isSmallScreen ? 24 : isTablet ? 32 : 28
        };
      default:
        return {
          container: isSmallScreen
            ? 'h-12 w-12'
            : isTablet
              ? 'h-16 w-16'
              : 'h-14 w-14',
          icon: isSmallScreen ? 20 : isTablet ? 28 : 24
        };
    }
  };

  // Responsive position configurations with safe area considerations
  const getPositionClasses = () => {
    const basePosition = 'absolute';
    const spacing = isSmallScreen
      ? 'right-3'
      : isTablet
        ? 'right-6'
        : 'right-4';

    switch (position) {
      case 'bottom-right':
        return `${basePosition} ${spacing}`;
      case 'bottom-left':
        return `${basePosition} ${isSmallScreen ? 'left-3' : isTablet ? 'left-6' : 'left-4'}`;
      case 'top-right':
        return `${basePosition} ${isSmallScreen ? 'top-3 right-3' : isTablet ? 'top-6 right-6' : 'top-4 right-4'}`;
      case 'top-left':
        return `${basePosition} ${isSmallScreen ? 'top-3 left-3' : isTablet ? 'top-6 left-6' : 'top-4 left-4'}`;
      default:
        return `${basePosition} ${spacing}`;
    }
  };

  const sizeClasses = getSizeClasses();
  const positionClasses = getPositionClasses();

  return (
    <View
      className={`${positionClasses} z-50 shadow-2xl ${className}`}
      style={{
        bottom: 150, // Position much higher above bottom navigation bar
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 12
      }}
    >
      <TouchableOpacity
        className={`${sizeClasses.container} items-center justify-center rounded-lg shadow-xl`}
        style={{
          backgroundColor: color,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 6
          },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 10
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={sizeClasses.icon} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
