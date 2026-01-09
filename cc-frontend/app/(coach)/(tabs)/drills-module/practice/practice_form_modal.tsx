import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet, // Added StyleSheet
  Text,
  TextInput,
  View
} from 'react-native';
import { modalFormStyles } from './modalFormStyles';

const SUGGESTED_SKILLS = [
  'FG_PCT',
  '_2PTS_PCT',
  '_3PTS_PCT',
  'FT_PCT',
  'REB',
  'assists',
  'steals',
  'blocks',
  'turnovers',
  'points'
];

interface PracticeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    id: number | null,
    name: string,
    description: string,
    skill: string[],
    image?: string
  ) => void;
  initialPractice?: {
    id: number;
    name: string;
    description: string;
    skill: string[];
    image?: string;
  } | null;
  existingPractices?: { id: number; skill: string[] }[];
}

const PracticeFormModal: React.FC<PracticeFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialPractice,
  existingPractices = []
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkills] = useState<string[]>(['']);
  const [currentId, setCurrentId] = useState<number | null>(null);

  useEffect(() => {
    if (initialPractice) {
      setName(initialPractice.name);
      setDescription(initialPractice.description);
      setSkills(
        initialPractice.skill.length > 0 ? initialPractice.skill : ['']
      );
      setCurrentId(initialPractice.id);
    } else {
      setName('');
      setDescription('');
      setSkills(['']);
      setCurrentId(null);
    }
  }, [initialPractice, visible]);

  const handleSkillChange = (text: string, index: number) => {
    const newSkills = [...skill];
    newSkills[index] = text;
    setSkills(newSkills);
  };

  const addSkillField = () => {
    if (skill.length < 3) setSkills([...skill, '']);
  };

  const removeSkillField = (index: number) => {
    const newSkills = skill.filter((_, i) => i !== index);
    setSkills(newSkills.length ? newSkills : ['']);
  };

  const duplicateSkill = skill.find(
    s =>
      s.trim() !== '' &&
      existingPractices.some(
        p => p.id !== currentId && p.skill.includes(s.trim())
      )
  );

  const handleSave = () => {
    const finalSkills = skill.map(s => s.trim()).filter(s => s !== '');
    if (!name.trim() || finalSkills.length === 0) {
      Alert.alert('Error', 'Name and at least one skill are required.');
      return;
    }
    onSave(currentId, name, description, finalSkills, initialPractice?.image);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <Text style={modalFormStyles.modalTitle}>
              {currentId ? 'Edit Practice' : 'New Practice Category'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={modalFormStyles.label}>Practice Name</Text>
              <TextInput
                style={modalFormStyles.input}
                placeholder="e.g., Shooting Practice"
                value={name}
                onChangeText={setName}
              />

              <Text style={modalFormStyles.label}>Skills (Focus)</Text>
              {skill.map((s, index) => (
                <View key={index} style={styles.skillInputRow}>
                  <TextInput
                    style={[
                      modalFormStyles.input,
                      { flex: 1, marginBottom: 0 }
                    ]}
                    placeholder={`Skill ${index + 1}`}
                    value={s}
                    onChangeText={text => handleSkillChange(text, index)}
                  />
                  {skill.length > 1 && (
                    <Pressable
                      onPress={() => removeSkillField(index)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </Pressable>
                  )}
                </View>
              ))}

              {skill.length < 3 && (
                <Pressable onPress={addSkillField} style={styles.addField}>
                  <Text style={styles.addFieldText}>+ Add Skill Slot</Text>
                </Pressable>
              )}

              {duplicateSkill && (
                <Text style={styles.warningText}>
                  Warning: {duplicateSkill} is already used in another category.
                </Text>
              )}

              <Text style={[modalFormStyles.label, { marginTop: 15 }]}>
                Suggestions
              </Text>
              <View style={styles.suggestionContainer}>
                {SUGGESTED_SKILLS.map(item => (
                  <Pressable
                    key={item}
                    style={styles.suggestionBadge}
                    onPress={() => {
                      const emptyIdx = skill.findIndex(val => val === '');
                      if (emptyIdx !== -1) handleSkillChange(item, emptyIdx);
                      else if (skill.length < 3) setSkills([...skill, item]);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={modalFormStyles.label}>Description</Text>
              <TextInput
                style={[modalFormStyles.input, modalFormStyles.textArea]}
                placeholder="Optional notes..."
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </ScrollView>

            <View style={modalFormStyles.buttonContainer}>
              <Pressable
                style={[modalFormStyles.button, modalFormStyles.buttonCancel]}
                onPress={onClose}
              >
                <Text style={modalFormStyles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[modalFormStyles.button, modalFormStyles.buttonSave]}
                onPress={handleSave}
              >
                <Text style={[modalFormStyles.buttonText, { color: 'white' }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Darken background
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5
  },
  skillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  removeBtn: {
    marginLeft: 10,
    backgroundColor: '#FFE5E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeBtnText: { color: '#FF3B30', fontWeight: 'bold' },
  addField: { paddingVertical: 8 },
  addFieldText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  warningText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10
  },
  suggestionBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  suggestionText: {
    fontSize: 11,
    color: '#3A3A3C',
    fontWeight: '500'
  }
});

export default PracticeFormModal;
