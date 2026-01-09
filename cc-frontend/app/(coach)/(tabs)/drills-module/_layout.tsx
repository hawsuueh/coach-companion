import { Link, Slot, useSegments } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen width for dynamic sizing
const { width } = Dimensions.get('window');

// Define dynamic sizing constants
const TAB_HORIZONTAL_PADDING = width * 0.08;
const TAB_VERTICAL_PADDING = 12;
const FONT_SIZE = 18;

const SEPARATOR_MARGIN = width * 0.03; // Margin for the "|" separator

export default function PerformancePracticeLayout() {
  const segments: string[] = useSegments();
  const currentTab = segments[segments.length - 1] || 'practice';
  const isDetailScreen =
    segments.includes('[athleteId]') ||
    segments.includes('team_performance') ||
    segments.includes('practice_regimens');
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#f8f8f8' }}
      edges={['left', 'right']}
    >
      {!isDetailScreen && (
        <View>
          <View
            id="main"
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 0,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#eee'
            }}
          >
            {/* Practice tab button */}
            <Link href="/drills-module/practice" asChild>
              <Pressable>
                <View
                  style={[
                    styles.tabContainer, // Base style for a tab
                    {
                      paddingVertical: TAB_VERTICAL_PADDING,
                      paddingHorizontal: TAB_HORIZONTAL_PADDING
                    },
                    currentTab === 'practice' && styles.selectedTabContainer // Apply underline style if active
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel, // Base text style for tab
                      { fontSize: FONT_SIZE },
                      currentTab === 'practice' && styles.selectedTabLabel // Apply active text style if active
                    ]}
                  >
                    Practice
                  </Text>
                </View>
              </Pressable>
            </Link>

            {/* Separator text */}
            <Text
              style={{
                marginHorizontal: SEPARATOR_MARGIN,
                color: '#ccc', // Lighter color for the separator
                fontSize: FONT_SIZE
              }}
            >
              |
            </Text>

            {/* Performance tab button */}
            <Link href="/drills-module/performance" asChild>
              <Pressable>
                <View
                  style={[
                    styles.tabContainer, // Base style for a tab
                    {
                      paddingVertical: TAB_VERTICAL_PADDING,
                      paddingHorizontal: TAB_HORIZONTAL_PADDING
                    },
                    currentTab === 'performance' && styles.selectedTabContainer // Apply underline style if active
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel, // Base text style for tab
                      { fontSize: FONT_SIZE },
                      currentTab === 'performance' && styles.selectedTabLabel // Apply active text style if active
                    ]}
                  >
                    Performance
                  </Text>
                </View>
              </Pressable>
            </Link>
          </View>
        </View>
      )}
      {/* This View directly handles the Slot content and ensures it takes remaining height */}
      <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center'
  },
  selectedTabContainer: {
    borderBottomWidth: 2,
    borderBottomColor: 'red'
  },
  // Base text style for any tab label
  tabLabel: {
    color: '#333',
    fontWeight: 'bold'
  },
  // Specific style for the text of the selected tab
  selectedTabLabel: {
    color: '#000',
    fontWeight: '900'
  }
});
