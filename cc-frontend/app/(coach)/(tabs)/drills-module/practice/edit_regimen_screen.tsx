import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import athleteList from '../performance/athlete_list';
import { DatabaseDrill, getAllDrills } from '../services/drill';
import { DatabasePractice, getAllPractices } from '../services/practice';

import {
  createAssignedRegimen,
  deleteAssignedRegimenByRegimenId,
  getAllAssignedRegimenByRegimenId,
  getAssignedRegimenByRegimenIdAndAthleteId,
  updateAssignedRegimen
} from '../services/assigned_regimen';
import {
  createAssignedRegimenDrill,
  deleteAssignedRegimenDrillByAssignedRegimenId
} from '../services/assigned_regimen_drill';
import { createRegimen, updateRegimen } from '../services/regimen';

interface DrillAssignment {
  athleteId: number;
  drills: DatabaseDrill[];
  attentionAreas: string[];
}

interface RegimenState {
  id: number | null;
  name: string;
  duration: number;
  due_date: string;
  assigned_athletes: string[];
  focus: any;
  limit_drills: number;
  drillAssignments: Record<number, DrillAssignment>;
  isEditing?: boolean;
}

export default function EditRegimenScreen() {
  const { regimenData } = useLocalSearchParams();
  const router = useRouter();

  const initialData = regimenData ? JSON.parse(regimenData as string) : null;
  const [regimen, setRegimen] = useState<RegimenState>({
    id: initialData?.id || null,
    name: initialData?.name || '',
    duration: initialData?.duration || 0,
    due_date: initialData?.due_date || new Date().toISOString(),
    assigned_athletes: initialData?.assigned_athletes || [],
    focus: initialData?.focus || 'athleteSpecific',
    limit_drills: initialData?.limit_drills || 3,
    // Ensure drillAssignments is always an object, even if initialData is null
    drillAssignments: initialData?.drillAssignments || {},
    isEditing: initialData?.isEditing || false
  });

  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [activeAthleteId, setActiveAthleteId] = useState<number | null>(null);

  const [dbPractices, setDbPractices] = useState<DatabasePractice[]>([]);
  const [dbDrills, setDbDrills] = useState<DatabaseDrill[]>([]);
  useEffect(() => {
    const loadData = async () => {
      const [drills, practices] = await Promise.all([
        getAllDrills(),
        getAllPractices()
      ]);
      if (drills) setDbDrills(drills);
      if (practices) setDbPractices(practices);
    };
    loadData();
  }, []);

  const handleFinalSave = async () => {
    try {
      const assignmentEntries = Object.values(regimen.drillAssignments);
      if (assignmentEntries.length === 0) {
        Alert.alert('Error', 'No drills assigned to athletes.');
        return;
      }

      let regimenId = regimen.id;

      if (regimen.isEditing && regimenId) {
        // 1. Update the Main Regimen Metadata
        await updateRegimen(regimenId, {
          name: regimen.name,
          duration: regimen.duration,
          due_date: regimen.due_date,
          assigned_athletes: regimen.assigned_athletes,
          focus: regimen.focus,
          limit_drills: regimen.limit_drills
        });

        // 2. Sync Athlete Assignments
        // Get existing assignments from DB to see who to remove/update
        const existingAssignments =
          await getAllAssignedRegimenByRegimenId(regimenId);

        if (existingAssignments) {
          // Find athletes that are no longer in the list and delete them
          const currentAthleteIds = regimen.assigned_athletes.map(id =>
            parseInt(id)
          );
          const toDelete = existingAssignments.filter(
            ea => !currentAthleteIds.includes(ea.assigned_athlete_id)
          );

          for (const record of toDelete) {
            if (record.id) await deleteAssignedRegimenByRegimenId(record.id); // Service handles drill deletion via FK or manual call
          }
        }
      } else {
        // Create path: Create Main Regimen
        const regResponse = await createRegimen({
          name: regimen.name,
          duration: regimen.duration,
          due_date: regimen.due_date,
          assigned_athletes: regimen.assigned_athletes,
          focus: regimen.focus,
          limit_drills: regimen.limit_drills
        });
        regimenId = (regResponse as any[])?.[0]?.id;
      }

      if (!regimenId) throw new Error('Regimen ID not found/created');

      // 3. Process Drill Assignments (Create or Update)
      for (const assignment of assignmentEntries) {
        // Check if this athlete already has an assignment record for this regimen
        const existingAssignResponse =
          await getAssignedRegimenByRegimenIdAndAthleteId(
            regimenId,
            assignment.athleteId
          );

        let assignedRegimenId: number;

        if (existingAssignResponse && existingAssignResponse.length > 0) {
          // UPDATE: Update existing assignment record (e.g. attention areas)
          assignedRegimenId = existingAssignResponse[0].id!;
          await updateAssignedRegimen(assignedRegimenId, {
            regimen_id: regimenId,
            assigned_athlete_id: assignment.athleteId,
            status: existingAssignResponse[0].status,
            attention_areas: assignment.attentionAreas
          });

          // Clear existing drills to replace them with the new selection
          await deleteAssignedRegimenDrillByAssignedRegimenId(
            assignedRegimenId
          );
        } else {
          // CREATE: Create new assignment record
          const newAssignResponse = await createAssignedRegimen({
            regimen_id: regimenId,
            assigned_athlete_id: assignment.athleteId,
            status: 'pending',
            attention_areas: assignment.attentionAreas
          });
          assignedRegimenId = (newAssignResponse as any)?.[0]?.id;
        }

        // 4. Insert the new set of Drills
        if (assignedRegimenId && assignment.drills.length > 0) {
          await Promise.all(
            assignment.drills.map(drill =>
              createAssignedRegimenDrill({
                assigned_regimen_id: assignedRegimenId,
                drill_id: drill.id!,
                status: 'pending'
              })
            )
          );
        }
      }

      router.replace('/drills-module/practice');
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'Failed to save regimen changes.');
    }
  };

  const handleCancel = () => {
    router.replace('/drills-module/practice'); // Return to index without saving
  };

  const removeDrillFromAthlete = (athleteId: number, drillId: number) => {
    const currentAssignment = regimen.drillAssignments[athleteId];
    if (!currentAssignment) return;

    const updatedAssignments = { ...regimen.drillAssignments };

    updatedAssignments[athleteId] = {
      ...currentAssignment,
      drills: currentAssignment.drills.filter(d => d.id !== drillId)
    };

    setRegimen({
      ...regimen,
      drillAssignments: updatedAssignments
    });
  };

  const addManualDrill = (drillId: number) => {
    if (activeAthleteId === null) return;

    // 1. Get the current assignment object for this athlete
    const currentAssignment = regimen.drillAssignments[activeAthleteId];
    if (!currentAssignment) return;

    // 2. Check if the drill ID already exists in the drills array
    const alreadyHasDrill = currentAssignment.drills.some(
      d => d.id === drillId
    );

    if (!alreadyHasDrill) {
      // 3. Find the full drill object from your database list
      const drillToAdd = dbDrills.find(d => d.id === drillId);
      if (!drillToAdd) return;

      const updatedAssignments = { ...regimen.drillAssignments };

      // 4. Update only the drills array within that specific athlete's object
      updatedAssignments[activeAthleteId] = {
        ...currentAssignment,
        drills: [...currentAssignment.drills, drillToAdd]
      };

      setRegimen({ ...regimen, drillAssignments: updatedAssignments });
    }
    setIsManualModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Recommendations</Text>
        <Text style={styles.subtitle}>Customize drills for each athlete</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {Object.entries(regimen.drillAssignments).map(
          ([athleteIdStr, assignment]) => {
            const athleteId = parseInt(athleteIdStr);
            const athlete = athleteList.find(a => a.athlete_no === athleteId);

            return (
              <View key={athleteId} style={styles.athleteCard}>
                <Text style={styles.athleteName}>
                  {athlete?.first_name} {athlete?.last_name}
                </Text>

                {/* Display Attention Areas (New UI) */}
                {assignment.attentionAreas.length > 0 && (
                  <Text style={styles.attentionText}>
                    Focus: {assignment.attentionAreas.join(', ')}
                  </Text>
                )}

                <View style={styles.drillList}>
                  {assignment.drills.map(drill => (
                    <View key={drill.id} style={styles.drillRow}>
                      <Text style={styles.drillName}>{drill.name}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          removeDrillFromAthlete(athleteId, drill.id!)
                        }
                      >
                        <Feather name="x-circle" size={20} color="#EC1D25" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.addDrillButton}
                  onPress={() => {
                    setActiveAthleteId(athleteId);
                    setIsManualModalVisible(true);
                  }}
                >
                  <Feather name="plus-circle" size={20} color="#007AFF" />
                  <Text style={styles.addDrillText}>Add Drill</Text>
                </TouchableOpacity>
              </View>
            );
          }
        )}
      </ScrollView>

      {/* Manual Drill Selection Modal */}
      <Modal visible={isManualModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Drill</Text>
          <ScrollView>
            {dbPractices.map(practice => (
              <View key={practice.id} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{practice.name}</Text>
                {dbDrills
                  .filter(drill => drill.from_practice_id === practice.id)
                  .map(drill => (
                    <TouchableOpacity
                      key={drill.id}
                      style={styles.modalDrillRow}
                      onPress={() => addManualDrill(drill.id!)}
                    >
                      <Text>{drill.name}</Text>
                      <Feather name="plus-circle" size={18} color="#4CAF50" />
                    </TouchableOpacity>
                  ))}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsManualModalVisible(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleFinalSave}>
          <Text style={styles.saveButtonText}>Confirm & Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1C1E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  scroll: { flex: 1, padding: 16 },
  athleteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC1D25',
    marginBottom: 12
  },
  attentionText: { fontSize: 14, color: '#EC1D25', marginBottom: 8 },
  drillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  drillList: { flexDirection: 'column' },
  drillName: { fontSize: 14, color: '#333' },
  addDrillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8
  },
  addDrillText: { color: '#007AFF', marginLeft: 8, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#EC1D25',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButtonText: { color: '#666', fontWeight: '700', fontSize: 16 },
  modalContainer: { flex: 1, padding: 20, paddingTop: 60 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  categorySection: { marginBottom: 20 },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4
  },
  modalDrillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  closeModalButton: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 12
  },
  closeModalText: { fontWeight: '700', color: '#333' }
});
