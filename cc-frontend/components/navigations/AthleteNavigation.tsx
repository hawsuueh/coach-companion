import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Tab = {
  name: string;
  icon: string;
  route: string;
  matchPrefix?: string; // new optional field for prefix matching
};

const TABS: Tab[] = [
  {
    name: 'home',
    icon: 'home',
    route: '/(tabs)/home',
    matchPrefix: '/home'
  },
  {
    name: 'athletes',
    icon: 'account-group',
    route: '/(tabs)/athletes-module',
    matchPrefix: '/athletes-module'
  },
  {
    name: 'training',
    icon: 'arm-flex',
    route: '/(tabs)/training-module/training',
    matchPrefix: '/training-module'
  },
  {
    name: 'drills',
    icon: 'basketball',
    route: '/(tabs)/drills-module',
    matchPrefix: '/drills-module'
  }
];

const AthleteNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const normalizePath = (path: string) => path.replace('/(tabs)', '');

  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => {
        const currentPath = normalizePath(pathname);
        const tabPrefix = tab.matchPrefix || normalizePath(tab.route);

        // ✅ Active if current path starts with the module prefix
        const isActive = currentPath.startsWith(tabPrefix);

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(tab.route as any)}
            style={styles.tab}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={24}
              style={isActive ? styles.activeIcon : styles.inactiveIcon}
            />
            {isActive && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  activeIcon: {
    color: '#EC1D25'
  },
  inactiveIcon: {
    color: '#000000'
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EC1D25',
    marginTop: 4
  }
});

export default AthleteNavigation;
