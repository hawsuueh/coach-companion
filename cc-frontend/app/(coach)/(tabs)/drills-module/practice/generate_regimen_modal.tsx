import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker';

import React, { useEffect, useState } from 'react';

import { Checkbox } from 'expo-checkbox';
import { router } from 'expo-router';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import athleteList from '../performance/athlete_list';
import game_record_data from '../performance/game_records';
import { Athlete } from '../performance/interfaces';
import { analyzePlayerPerformance } from '../performance/utils/performanceUtils';
import { DatabaseDrill, getAllDrills } from '../services/drill';
import { DatabasePractice, getAllPractices } from '../services/practice';
import { modalFormStyles } from './modalFormStyles';

import { buildForest, predictForestWeighted } from './randomForestAlgo';
import { generateSyntheticSamples } from './samples';

interface RegimenFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drill: {
    id: number | null;
    name: string;
    duration: number;
    due_date: string;
    assigned_athletes: string[];
    focus: string[];
    drills: string[];
  }) => void;
  initialRegimen?: {
    id: number;
    name: string;
    duration: number;
    due_date: string;
    assigned_athletes: string[];
    focus: string[];
    drills: string[];
  } | null;
}

const REVERSE_STAT_LABELS: { [key: string]: string } = {
  'FG% Efficiency': 'FG_PCT',
  '2PT% Efficiency': '_2PTS_PCT',
  '3PT% Efficiency': '_3PTS_PCT',
  'FT% Efficiency': 'FT_PCT',
  'Rebounding (Total)': 'REB',
  Assists: 'assists',
  'Steals (Defense)': 'steals',
  'Blocks (Defense)': 'blocks',
  Turnovers: 'turnovers',
  'Scoring (Points)': 'points'
};

const RegimenFormModal: React.FC<RegimenFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialRegimen: initialDrill
}) => {
  const [dbPractices, setDbPractices] = useState<DatabasePractice[]>([]);
  const [dbDrills, setDbDrills] = useState<DatabaseDrill[]>([]);
  useEffect(() => {
    if (visible) {
      const loadData = async () => {
        const [practices, drills] = await Promise.all([
          getAllPractices(),
          getAllDrills()
        ]);
        if (practices) setDbPractices(practices);
        if (drills) setDbDrills(drills);
      };
      loadData();
    }
  }, [visible]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('45');
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [drillLimit, setDrillLimit] = useState('3');
  const [selectedCategory, setSelectedCategory] =
    useState<string>('athleteSpecific');
  const [selectedPractices, setSelectedPractices] = useState<number[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>(['All']);
  const [assignmentType, setAssignmentType] = useState('all');

  const startDateTimeSelection = () => {
    setPickerMode('date');
    setPickerVisible(true);
  };

  const handleSave = () => {
    if (!name || selectedAthletes.length === 0) {
      Alert.alert('Error', 'Please fill in the name and select athletes.');
      return;
    }

    let finalAthleteIds: string[] = [];
    if (assignmentType === 'all') {
      finalAthleteIds = athleteList.map(a => a.athlete_no.toString());
    } else if (assignmentType === 'positions') {
      finalAthleteIds = athleteList
        .filter(a => selectedAthletes.includes(a.position))
        .map(a => a.athlete_no.toString());
    } else {
      finalAthleteIds = selectedAthletes;
    }

    // Object to store { athleteId: [drillId1, drillId2] }
    const assignments: Record<
      number,
      { athleteId: number; drills: any[]; attentionAreas: string[] }
    > = {};

    if (selectedCategory === 'athleteSpecific') {
      const statKeys = [
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
      // 1. Generate dynamic training data (so that it takes into account new drills)
      // drills list is all list in database
      const validDrills = dbDrills.filter(d => d.id !== undefined) as {
        id: number;
        good_for: string[];
      }[];

      const dynamicSamples = generateSyntheticSamples(
        validDrills,
        statKeys,
        300
      );

      // 2. Build the forest using the new dynamic samples
      const forest = buildForest(dynamicSamples, statKeys);

      finalAthleteIds.forEach(idStr => {
        const athleteId = parseInt(idStr);
        const { attentionAreas } = analyzePlayerPerformance(
          athleteId,
          game_record_data,
          5
        );

        const analysis = analyzePlayerPerformance(
          athleteId,
          game_record_data,
          5
        );
        const attentionAreaLabels = analysis.attentionAreas.map(a => a.stat);

        const performanceMap: Record<string, number> = {};
        attentionAreas.forEach(area => {
          const rawKey = REVERSE_STAT_LABELS[area.stat];
          if (rawKey) {
            performanceMap[rawKey] = Math.abs(area.score);
          }
        });

        // 3. Predict drills
        const recommendedDrills = predictForestWeighted(
          forest,
          performanceMap,
          validDrills
        );

        const limitedDrillIds = recommendedDrills.slice(
          0,
          parseInt(drillLimit) || 3
        );
        const fullDrills = limitedDrillIds.map(id =>
          dbDrills.find(d => d.id === id)
        );

        assignments[athleteId] = {
          athleteId: athleteId,
          drills: fullDrills, // Full objects for the UI
          attentionAreas: attentionAreaLabels // Array of strings for assigned_regimen
        };
      });
    } else {
      // Logic for Practice Categories
      const selectedDrillObjects = dbDrills.filter(d =>
        selectedPractices.includes(d.id!)
      );

      finalAthleteIds.forEach(idStr => {
        const athleteId = parseInt(idStr);
        assignments[athleteId] = {
          athleteId: athleteId,
          drills: selectedDrillObjects,
          attentionAreas: [] // Category focus might not have specific attention areas
        };
      });
    }

    const newRegimen = {
      id: Date.now(), // Temporary ID for navigation
      name,
      duration: parseInt(duration) || 0,
      due_date: date.toISOString(),
      assigned_athletes: finalAthleteIds,
      focus: selectedCategory,
      drillAssignments: assignments
    };

    onClose();
    // Navigate to edit screen with the generated data
    router.push({
      pathname: '/drills-module/practice/edit_regimen_screen',
      params: { regimenData: JSON.stringify(newRegimen) }
    });
  };

  const handlePickerChange = (event: DateTimePickerEvent, value?: Date) => {
    setPickerVisible(false);

    if (event.type === 'set' && value) {
      if (pickerMode === 'date') {
        const selectedDate = new Date(value);
        setDate(selectedDate);
        setPickerMode('time');
        setPickerVisible(true);
      } else if (pickerMode === 'time') {
        const updatedDateTime = new Date(date);
        updatedDateTime.setHours(value.getHours());
        updatedDateTime.setMinutes(value.getMinutes());
        if (updatedDateTime >= new Date()) {
          setDate(updatedDateTime);
        }
      }
    }
  };

  const handleCheckboxChange = (athleteId: string) => {
    setSelectedAthletes(prevSelected => {
      if (prevSelected.includes(athleteId)) {
        return prevSelected.filter(id => id !== athleteId);
      } else {
        return [...prevSelected, athleteId];
      }
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'athleteSpecific') {
      setSelectedPractices([]); // Reset selected practices when switching to athlete specific
    }
  };

  const togglePracticeSelection = (practice: number) => {
    if (selectedPractices.includes(practice)) {
      // Remove practice if already selected
      setSelectedPractices(prevSelected =>
        prevSelected.filter(item => item !== practice)
      );
    } else {
      // Limit selection to a maximum of 3
      if (selectedPractices.length < 3) {
        setSelectedPractices(prevSelected => [...prevSelected, practice]);
      }
    }
  };

  const modalTitle = initialDrill ? 'Edit Regimen' : 'Generate Regimen';
  const saveButtonText = initialDrill ? 'Update' : 'Add';

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

          <ScrollView
            style={modalFormStyles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text style={modalFormStyles.label}>Practice Regimen Name</Text>
            <TextInput
              style={modalFormStyles.input}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />

            <View style={modalFormStyles.separator} />

            <Text style={modalFormStyles.label}>Duration</Text>
            <TextInput
              style={[modalFormStyles.input, modalFormStyles.textArea]}
              value={duration.toString()}
              onChangeText={setDuration}
              inputMode="numeric"
              placeholder="In minutes"
              maxLength={50}
            />

            <View style={modalFormStyles.separator} />
            <Text style={modalFormStyles.label}>Due Date</Text>
            <Pressable
              onPress={startDateTimeSelection}
              style={modalFormStyles.input_text}
            >
              <Text style={{ color: '#333' }}>{date.toLocaleString()}</Text>
            </Pressable>

            {isPickerVisible && pickerMode && (
              <DateTimePicker
                value={date}
                mode={pickerMode}
                display="default"
                minimumDate={new Date()}
                is24Hour={false}
                onChange={handlePickerChange}
              />
            )}

            <View style={modalFormStyles.separator} />

            <Text style={modalFormStyles.label}>Assign to:</Text>

            <Pressable
              style={modalFormStyles.radioGroup}
              onPress={() => setAssignmentType('all')}
            >
              <Text style={modalFormStyles.listItemText}>All Athletes</Text>
              <Checkbox
                value={assignmentType === 'all'}
                onValueChange={() => setAssignmentType('all')}
                color="#EC1D25"
              />
            </Pressable>

            <Pressable
              style={modalFormStyles.radioGroup}
              onPress={() => setAssignmentType('positions')}
            >
              <Text style={modalFormStyles.listItemText}>By Positions</Text>
              <Checkbox
                value={assignmentType === 'positions'}
                onValueChange={() => setAssignmentType('positions')}
                color="#EC1D25"
              />
            </Pressable>

            <Pressable
              style={modalFormStyles.radioGroup}
              onPress={() => setAssignmentType('custom')}
            >
              <Text style={modalFormStyles.listItemText}>Custom Selection</Text>
              <Checkbox
                value={assignmentType === 'custom'}
                onValueChange={() => setAssignmentType('custom')}
                color="#EC1D25"
              />
            </Pressable>

            {assignmentType === 'positions' && (
              <View style={{ marginTop: 10 }}>
                {Array.from(new Set(athleteList.map(a => a.position))).map(
                  position => (
                    <Pressable
                      key={position}
                      style={[
                        modalFormStyles.listItem,
                        selectedAthletes.includes(position) &&
                          modalFormStyles.selectedListItem
                      ]}
                      onPress={() => handleCheckboxChange(position)}
                    >
                      <Text style={modalFormStyles.listItemText}>
                        {position}
                      </Text>
                      <Checkbox
                        value={selectedAthletes.includes(position)}
                        onValueChange={() => handleCheckboxChange(position)}
                        color="#EC1D25"
                      />
                    </Pressable>
                  )
                )}
              </View>
            )}

            {assignmentType === 'custom' && (
              <View style={{ marginTop: 10 }}>
                {athleteList.map((athlete: Athlete) => (
                  <Pressable
                    key={athlete.athlete_no}
                    style={[
                      modalFormStyles.listItem,
                      selectedAthletes.includes(
                        athlete.athlete_no.toString()
                      ) && modalFormStyles.selectedListItem
                    ]}
                    onPress={() =>
                      handleCheckboxChange(athlete.athlete_no.toString())
                    }
                  >
                    <Text
                      style={modalFormStyles.listItemText}
                    >{`${athlete.first_name} ${athlete.last_name} (${athlete.position})`}</Text>
                    <Checkbox
                      value={selectedAthletes.includes(
                        athlete.athlete_no.toString()
                      )}
                      onValueChange={() =>
                        handleCheckboxChange(athlete.athlete_no.toString())
                      }
                      color="#EC1D25"
                    />
                  </Pressable>
                ))}
              </View>
            )}

            <View style={modalFormStyles.separator} />

            <Text style={modalFormStyles.label}>Focus Area:</Text>
            <Pressable
              style={modalFormStyles.radioGroup}
              onPress={() => handleCategoryChange('athleteSpecific')}
            >
              <Text style={modalFormStyles.listItemText}>Athlete Specific</Text>
              <Checkbox
                value={selectedCategory === 'athleteSpecific'}
                onValueChange={() => handleCategoryChange('athleteSpecific')}
                color="#EC1D25"
              />
            </Pressable>

            <Pressable
              style={modalFormStyles.radioGroup}
              onPress={() => handleCategoryChange('practiceCategories')}
            >
              <Text style={modalFormStyles.listItemText}>
                Practice Categories
              </Text>
              <Checkbox
                value={selectedCategory === 'practiceCategories'}
                onValueChange={() => handleCategoryChange('practiceCategories')}
                color="#EC1D25"
              />
            </Pressable>

            {selectedCategory === 'practiceCategories' && (
              <View style={{ marginTop: 10 }}>
                {dbPractices
                  .filter(p => p.id !== undefined)
                  .map(practice => {
                    const practiceId = practice.id!;

                    return (
                      <Pressable
                        key={practiceId}
                        style={[
                          modalFormStyles.listItem,
                          selectedPractices.includes(practiceId) &&
                            modalFormStyles.selectedListItem
                        ]}
                        onPress={() => togglePracticeSelection(practiceId)}
                      >
                        <Text style={modalFormStyles.listItemText}>
                          {practice.name}
                        </Text>
                        <Checkbox
                          value={selectedPractices.includes(practiceId)}
                          onValueChange={() =>
                            togglePracticeSelection(practiceId)
                          }
                          color="#EC1D25"
                        />
                      </Pressable>
                    );
                  })}
                {selectedPractices.length >= 3 && (
                  <Text
                    style={{ color: '#EC1D25', fontSize: 12, marginTop: 5 }}
                  >
                    You can select up to 3 categories only.
                  </Text>
                )}
              </View>
            )}

            <View style={modalFormStyles.separator} />

            <Text style={modalFormStyles.label}>Max Drills Per Athlete</Text>
            <TextInput
              style={modalFormStyles.input}
              value={drillLimit}
              onChangeText={setDrillLimit}
              inputMode="numeric"
              placeholder="1-6"
              maxLength={1}
            />
          </ScrollView>

          <View style={modalFormStyles.buttonContainer}>
            <Pressable
              style={[modalFormStyles.button, modalFormStyles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={[modalFormStyles.buttonText, { color: '#666' }]}>
                Cancel
              </Text>
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

export default RegimenFormModal;
