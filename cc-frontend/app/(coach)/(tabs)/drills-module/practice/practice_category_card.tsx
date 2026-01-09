import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

interface PracticeCategoryModalProps {
  name: string;
  description: string;
  practiceId: number; // Pass the ID to the modal
  onEdit: (id: number) => void; // Callback for edit
  onDelete: (id: number, name: string) => void; // Callback for delete
}

// REMINDER add the image of practice category
export default function PracticeCategoryModal({
  name,
  description,
  practiceId,
  onEdit,
  onDelete
}: PracticeCategoryModalProps) {
  return (
    <View style={styles.container}>
      {/* Action buttons are absolutely positioned on top */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          onPress={() => onEdit(practiceId)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(practiceId, name)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Ionicons name="trash-outline" size={14} color="white" />
        </Pressable>
      </View>

      <View style={styles.text_container}>
        <Text style={styles.practice_name}>{name}</Text>
        <Text
          style={styles.practice_description}
          numberOfLines={6}
          ellipsizeMode="tail"
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: screenWidth * 0.92,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#EC1D25',
    justifyContent: 'center'
  },
  text_container: {
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 0,
    marginTop: 'auto'
  },
  practice_name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1C1E',
    letterSpacing: -0.5
  },
  practice_description: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 6,
    lineHeight: 20
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 1,
    backgroundColor: 'transparent'
  },
  actionButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButton: {
    backgroundColor: '#007AFF'
  },
  deleteButton: {
    backgroundColor: '#DC3545'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  }
});
