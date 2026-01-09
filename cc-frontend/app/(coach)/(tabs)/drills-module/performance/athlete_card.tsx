import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Athlete } from './interfaces'; // Import the Athlete interface

interface AthleteModalProps {
  athlete: Athlete;
  onPress: () => void;
}
export default function AthleteModal({ athlete, onPress }: AthleteModalProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Athlete Image Placeholder */}
      <View style={styles.athlete_image_placeholder}>
        <Text style={styles.athlete_number}>{athlete.player_no}</Text>
      </View>
      <Text style={styles.athlete_name}>
        {athlete.first_name} {athlete.last_name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: 150,
    height: 180,
    justifyContent: 'center'
  },
  athlete_image_placeholder: {
    width: 80,
    height: 80,
    borderRadius: 40, // Makes it a circle
    backgroundColor: '#ccc', // Grey placeholder for image
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  athlete_number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  athlete_name: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  }
});
