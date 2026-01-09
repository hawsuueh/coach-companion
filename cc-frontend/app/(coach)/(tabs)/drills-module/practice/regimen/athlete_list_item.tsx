// creates list items of athletes for the practice_regimens
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AthleteListItemProps {
  athlete: any;
  status?: string;
  onPress: () => void;
}

export default function AthleteListItem({
  athlete,
  status,
  onPress
}: AthleteListItemProps) {
  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{athlete.player_no}</Text>
        </View>
        <View>
          <Text style={styles.name}>
            {athlete.first_name} {athlete.last_name}
          </Text>
          <Text style={styles.subtext}>{athlete.position}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {status && (
          <View
            style={[
              styles.statusBadge,
              status === 'completed' ? styles.done : styles.pending
            ]}
          >
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  subtext: {
    fontSize: 12,
    color: '#888'
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8
  },
  done: { backgroundColor: '#E8F5E9' },
  pending: { backgroundColor: '#FFF3E0' },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#444'
  }
});
