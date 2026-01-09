import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { modalFormStyles } from "./modalFormStyles";

// focus stats options
const STAT_OPTIONS: { [key: string]: string } = {
  FG_PCT: "FG% Efficiency",
  _2PTS_PCT: "2PT% Efficiency",
  _3PTS_PCT: "3PT% Efficiency",
  FT_PCT: "FT% Efficiency",
  REB: "Rebounding (Total)",
  assists: "Assists",
  steals: "Steals (Defense)",
  blocks: "Blocks (Defense)",
  turnovers: "Turnovers",
  points: "Scoring (Points)",
};

// Convert options to an array for easy mapping rendering
const STAT_KEYS = Object.keys(STAT_OPTIONS);
interface DrillFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drill: {
    id: number | null;
    from_practice_id: number;
    name: string;
    description: string;
    steps: string[];
    good_for: string[];
    media?: string;
  }) => void;
  initialDrill?: {
    id: number;
    from_practice_id: number;
    name: string;
    description: string;
    steps: string[];
    good_for: string[];
    media?: string;
  } | null;
  categoryId: number;
  practices: { id: number; skill: string[] }[];
}

const DrillFormModal: React.FC<DrillFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDrill,
  categoryId,
  practices,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [fromId, setFromId] = useState<number>(categoryId);

  const primarySkillKey =
    practices.find((p) => p.id === categoryId)?.skill[0] || "";

  useEffect(() => {
    if (initialDrill) {
      setName(initialDrill.name);
      setDescription(initialDrill.description);
      setSteps([...initialDrill.steps]);
      setSkills([...initialDrill.good_for]);
      setCurrentId(initialDrill.id);
      setFromId(initialDrill.from_practice_id);
    } else {
      // Set default values for new drill
      setName("");
      setDescription("");
      setSteps([""]);
      // Pre-fill the first skill with the category's primary skill
      setSkills([primarySkillKey, "", ""]);
      setCurrentId(null);
    }
  }, [initialDrill, visible, categoryId, primarySkillKey]);

  const handleSave = () => {
    if (name.trim() === "") {
      Alert.alert("Error", "Drill name cannot be empty.");
      return;
    }

    if (steps.length === 0 || steps[0].trim() === "") {
      Alert.alert("Error", "Please add at least one step.");
      return;
    }

    const validSkills = skills.filter(
      (skill) => skill.trim() !== "" && STAT_OPTIONS[skill]
    );
    if (validSkills.length === 0) {
      Alert.alert("Error", "Please add at least one valid skill.");
      return;
    }

    onSave({
      id: currentId,
      from_practice_id: fromId,
      name: name.trim(),
      description: description.trim(),
      steps: steps.filter((step) => step.trim() !== ""),
      good_for: validSkills,
    });
  };

  const handleStepChange = (text: string, index: number) => {
    const cleanText = text.replace(/^\d+\.?\s*/, "");
    const newSteps = [...steps];
    newSteps[index] = cleanText;
    setSteps(newSteps);
  };

  const addStep = () => {
    if (steps.length < 10) {
      setSteps([...steps, ""]);
    }
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

  // handler for selecting a stat key
  const handleSkillSelection = (selectedStatKey: string, index: number) => {
    const newSkills = [...skills];
    newSkills[index] = selectedStatKey;
    setSkills(newSkills);
  };

  const addSkill = () => {
    if (skills.length < 3) {
      // Add an empty string to represent an unselected skill slot
      setSkills([...skills, ""]);
    }
  };

  const removeSkill = (index: number) => {
    // one skill always required
    if (skills.length > 1) {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
    }
  };

  const modalTitle = initialDrill ? "Edit Drill" : "Add New Drill";
  const saveButtonText = initialDrill ? "Update" : "Add";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalFormStyles.centeredView}>
        <View style={modalFormStyles.modalView}>
          <Text style={modalFormStyles.modalTitle}>{modalTitle}</Text>

          <ScrollView style={modalFormStyles.scrollView}>
            <Text style={modalFormStyles.label}>Drill Name</Text>
            <TextInput
              style={modalFormStyles.input}
              placeholder="e.g., Three Point Shooting"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />

            <Text style={modalFormStyles.label}>Description</Text>
            <TextInput
              style={[modalFormStyles.input, modalFormStyles.textArea]}
              placeholder="Describe the drill..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            {/* Steps Section */}
            <View style={modalFormStyles.section}>
              <View style={modalFormStyles.sectionHeader}>
                <Text style={modalFormStyles.label}>Steps</Text>
                {steps.length < 10 && (
                  <Pressable
                    onPress={addStep}
                    style={modalFormStyles.addButton}
                  >
                    <Text style={modalFormStyles.addButtonText}>
                      + Add Step
                    </Text>
                  </Pressable>
                )}
              </View>
              {steps.map((step, index) => (
                <View key={index} style={modalFormStyles.stepContainer}>
                  <Text style={modalFormStyles.stepNumber}>{index + 1}.</Text>
                  <TextInput
                    style={[modalFormStyles.input, modalFormStyles.stepInput]}
                    placeholder={`Step ${index + 1}`}
                    value={step}
                    onChangeText={(text) => handleStepChange(text, index)}
                    multiline
                  />
                  {steps.length > 1 && (
                    <Pressable
                      onPress={() => removeStep(index)}
                      style={modalFormStyles.removeButton}
                    >
                      <Text style={modalFormStyles.removeButtonText}>×</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {/* Skills Selection */}
            <View style={modalFormStyles.section}>
              <View style={modalFormStyles.sectionHeader}>
                <Text style={modalFormStyles.label}>Focus Stats (Max 3)</Text>
                {skills.length < 3 && (
                  <Pressable
                    onPress={addSkill}
                    style={modalFormStyles.addButton}
                  >
                    <Text style={modalFormStyles.addButtonText}>
                      + Add Stat
                    </Text>
                  </Pressable>
                )}
              </View>
              {skills.map((skillKey, index) => (
                <View key={index} style={modalFormStyles.skillContainer}>
                  <Picker
                    selectedValue={skillKey}
                    style={[
                      modalFormStyles.input,
                      modalFormStyles.skillInput,
                      { flex: 1, height: 60 },
                    ]}
                    onValueChange={(itemValue) =>
                      handleSkillSelection(itemValue as string, index)
                    }
                  >
                    <Picker.Item label="Select a stat..." value="" />
                    {STAT_KEYS.map((key) => (
                      <Picker.Item
                        key={key}
                        label={STAT_OPTIONS[key]}
                        value={key}
                      />
                    ))}
                  </Picker>
                  {skills.length > 1 && (
                    <Pressable
                      onPress={() => removeSkill(index)}
                      style={modalFormStyles.removeButton}
                    >
                      <Text style={modalFormStyles.removeButtonText}>×</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
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
              <Text style={modalFormStyles.buttonText}>{saveButtonText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DrillFormModal;
