import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showMenu?: boolean;
  showBack?: boolean;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  className?: string;
}

export default function Header({
  title,
  showNotifications = true,
  showMenu = true,
  showBack = false,
  onNotificationPress,
  onMenuPress,
  onBackPress,
  className = ''
}: HeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-between bg-white px-5 py-4 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3
      }}
    >
      {/* Left side - Back button or title */}
      <View className="flex-1">
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <Text className="text-xl font-bold text-black">{title}</Text>
        )}
      </View>

      {/* Center - Title (only when back button is shown) */}
      {showBack && (
        <Text
          className="flex-1 text-center text-lg font-bold text-black"
          numberOfLines={1}
        >
          {title}
        </Text>
      )}

      {/* Right side - Notifications and Menu */}
      <View className="flex-1 flex-row justify-end space-x-4">
        {showNotifications && (
          <TouchableOpacity onPress={onNotificationPress}>
            <Ionicons name="notifications" size={24} color="#000" />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
