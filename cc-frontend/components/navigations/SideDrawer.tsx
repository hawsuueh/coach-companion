import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
  showBorder?: boolean;
}

function DrawerItem({
  icon,
  title,
  onPress,
  color = '#000',
  showBorder = true
}: DrawerItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-6 py-4 ${showBorder ? 'border-b border-gray-100' : ''}`}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text className="ml-4 text-base font-medium" style={{ color }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function SideDrawer() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  // Get screen dimensions for responsive design
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 375;
  const isTablet = screenWidth >= 768;

  // Responsive drawer width
  const drawerWidth = isTablet
    ? 320
    : isSmallScreen
      ? screenWidth * 0.85
      : screenWidth * 0.8;

  React.useEffect(() => {
    if (isDrawerOpen) {
      // Reset animations when opening
      slideAnim.setValue(-drawerWidth);
      overlayOpacity.setValue(0);

      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isDrawerOpen, slideAnim, overlayOpacity, drawerWidth]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      // Only close after animation completes
      closeDrawer();
    });
  };

  const handleProfilePress = () => {
    console.log('Profile/Account pressed');
    animateClose();
    // TODO: Navigate to profile screen
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    animateClose();
    // TODO: Navigate to settings screen
  };

  const handleLogoutPress = () => {
    console.log('Logout pressed from drawer');

    // Show confirmation dialog
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('Logout cancelled');
          }
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            animateClose();

            // Use the signOut function from AuthContext
            try {
              await signOut();
              console.log('✅ User logged out successfully');

              // Force redirect to login screen after logout
              router.replace('/');
            } catch (error) {
              console.error('❌ Logout error:', error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Don't render Modal at all when closed to prevent overlay issues
  if (!isDrawerOpen) return null;

  return (
    <Modal
      transparent
      visible={isDrawerOpen}
      animationType="none"
      onRequestClose={animateClose}
    >
      <View style={{ flex: 1 }}>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={animateClose}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              opacity: overlayOpacity
            }}
          />
        </TouchableWithoutFeedback>

        {/* Drawer */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            backgroundColor: '#fff',
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: {
              width: 2,
              height: 0
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header Section */}
            <View className="border-b border-gray-200 bg-gray-50 px-6 py-6">
              {/* Close Button */}
              <TouchableOpacity
                onPress={animateClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white p-2"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>

              {/* User Info */}
              <View className="mt-4">
                {/* Avatar */}
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="person" size={32} color="#EC1D25" />
                </View>

                {/* User Details */}
                <Text
                  className="text-lg font-bold text-gray-800"
                  numberOfLines={1}
                >
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'User Name'}
                </Text>
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                  {user?.email || 'user@email.com'}
                </Text>
                {profile?.role && (
                  <View className="mt-2 self-start rounded-full bg-red-100 px-3 py-1">
                    <Text className="text-xs font-medium text-red-700">
                      {profile.role.charAt(0).toUpperCase() +
                        profile.role.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menu Items */}
            <View className="flex-1 py-2">
              <DrawerItem
                icon="person-outline"
                title="Profile & Account"
                onPress={handleProfilePress}
                color="#333"
              />

              <DrawerItem
                icon="settings-outline"
                title="Settings"
                onPress={handleSettingsPress}
                color="#333"
              />

              {/* Spacer */}
              <View className="flex-1" />

              {/* Logout - at bottom with different styling */}
              <View className="border-t border-gray-200 pt-2">
                <DrawerItem
                  icon="log-out-outline"
                  title="Logout"
                  onPress={handleLogoutPress}
                  color="#EC1D25"
                  showBorder={false}
                />
              </View>
            </View>

            {/* Footer */}
            <View className="border-t border-gray-100 px-6 py-4">
              <Text className="text-center text-xs text-gray-500">
                Coach Companion v1.0
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
