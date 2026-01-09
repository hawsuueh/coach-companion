// View of a specific assigned regimen (what athletes see when they need to complete a regimen)
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  getAssignedRegimenById,
  updateAssignedRegimen
} from '../../services/assigned_regimen';
import {
  AssignedRegimenDrillDatabase,
  getAllAssignedRegimenDrillByAssignedRegimenId,
  updateAssignedRegimenDrill
} from '../../services/assigned_regimen_drill';
import { DatabaseDrill, getAllDrills } from '../../services/drill';
import { getRegimenById, RegimenDatabase } from '../../services/regimen';
import DrillModal from '../drill_modal';

interface Props {
  assignedRegimenId: number;
  onClose: () => void;
}

const AssignedRegimenModal: React.FC<Props> = ({ assignedRegimenId }) => {
  const [loading, setLoading] = useState(true);
  const [regimen, setRegimen] = useState<RegimenDatabase | null>(null);
  const [drillAssignments, setDrillAssignments] = useState<
    AssignedRegimenDrillDatabase[]
  >([]);
  const [dbDrills, setDbDrills] = useState<DatabaseDrill[]>([]);

  const [selectedDrill, setSelectedDrill] = useState<DatabaseDrill | null>(
    null
  );
  const [selectedDrillAssignmentId, setSelectedDrillAssignmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      // 1. Get the assignment record to find the regimen_id
      const assignData = await getAssignedRegimenById(assignedRegimenId);
      const assignmentRecord = assignData?.[0];

      if (assignmentRecord) {
        // 2. Fetch Regimen details, Drill definitions, and the specific junction table rows
        const [regimenData, drillDefs, drillAssigns] = await Promise.all([
          getRegimenById(assignmentRecord.regimen_id),
          getAllDrills(),
          getAllAssignedRegimenDrillByAssignedRegimenId(assignedRegimenId)
        ]);

        if (regimenData) setRegimen(regimenData[0]);

        if (drillDefs) setDbDrills(drillDefs);
        if (drillAssigns) setDrillAssignments(drillAssigns);
      }
      setLoading(false);
    };
    fetchContent();
  }, [assignedRegimenId]);

  const toggleDrillStatus = async (
    drillAssignment: AssignedRegimenDrillDatabase
  ) => {
    try {
      const newStatus =
        drillAssignment.status === 'pending' ? 'completed' : 'pending';

      // 1. Update the individual drill
      await updateAssignedRegimenDrill(drillAssignment.id!, {
        ...drillAssignment,
        status: newStatus
      });

      // 2. Refresh local drill state to get the most recent statuses
      const updatedDrills =
        await getAllAssignedRegimenDrillByAssignedRegimenId(assignedRegimenId);
      if (updatedDrills) {
        setDrillAssignments(updatedDrills);

        // 3. Logic to toggle the parent Regimen status
        const allCompleted = updatedDrills.every(d => d.status === 'completed');
        const currentRegimenStatus = allCompleted ? 'completed' : 'pending';

        // 4. Update the parent assigned_regimen
        // We need to fetch the current assigned_regimen first to preserve attention_areas and other fields
        const parentRecordResponse =
          await getAssignedRegimenById(assignedRegimenId);
        if (parentRecordResponse && parentRecordResponse.length > 0) {
          const parentRecord = parentRecordResponse[0];

          // Only trigger update if the status actually changed
          if (parentRecord.status !== currentRegimenStatus) {
            await updateAssignedRegimen(assignedRegimenId, {
              ...parentRecord,
              status: currentRegimenStatus
            });
            console.log(
              `Parent regimen status updated to: ${currentRegimenStatus}`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error toggling drill status:', error);
    }
  };

  const markAllCompleted = async () => {
    const updates = drillAssignments.map(async d => {
      if (d.id && d.status !== 'completed') {
        return updateAssignedRegimenDrill(d.id, { ...d, status: 'completed' });
      }
    });

    await Promise.all(updates);
    setDrillAssignments(prev => prev.map(d => ({ ...d, status: 'completed' })));
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />
    );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{regimen?.name}</Text>
        <View style={styles.infoRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {typeof regimen?.focus === 'string'
                ? regimen.focus
                : regimen?.focus.category}
            </Text>
          </View>
          <Text style={styles.dateText}>Due: {regimen?.due_date}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Drills Checklist</Text>
        <FlatList
          data={drillAssignments}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => {
            const drill = dbDrills.find(d => d.id === item.drill_id);
            const isDone = item.status === 'completed';

            return (
              <View style={[styles.drillCard, isDone && styles.drillCardDone]}>
                <View style={styles.drillInfo}>
                  <Text style={[styles.drillName, isDone && styles.textDone]}>
                    {drill?.name || `Drill ${item.drill_id}`}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isDone ? '#4caf50' : '#fb8c00' }
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {isDone ? 'Finished' : 'In Progress'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedDrill(drill || null);
                      setSelectedDrillAssignmentId(item.id || null);
                    }}
                  >
                    <Feather name="eye" size={16} color="#666" />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.checkButton,
                      isDone && { backgroundColor: '#8E8E93' }
                    ]}
                    onPress={() => toggleDrillStatus(item)}
                  >
                    <Feather
                      name={isDone ? 'rotate-ccw' : 'check'}
                      size={20}
                      color="white"
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Pressable style={styles.buttonAll} onPress={markAllCompleted}>
        <Text style={styles.buttonAllText}>Complete All Drills</Text>
      </Pressable>

      <Modal visible={!!selectedDrill} animationType="slide">
        {selectedDrill && selectedDrill.id !== undefined && (
          <DrillModal
            drill={selectedDrill as Required<DatabaseDrill>} // assert id is defined
            onClose={() => setSelectedDrill(null)}
            showCompleteButton={true}
            onMarkComplete={() => {
              const assignment = drillAssignments.find(
                d => d.id === selectedDrillAssignmentId
              );
              if (assignment) toggleDrillStatus(assignment);
            }}
            isCompleted={
              drillAssignments.find(d => d.id === selectedDrillAssignmentId)
                ?.status === 'completed'
            }
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1C1E', marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  badge: {
    backgroundColor: '#EC1D2515',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    color: '#EC1D25',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  dateText: { color: '#8E8E93', fontSize: 13 },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    marginTop: 20,
    marginBottom: 12
  },
  drillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  drillCardDone: { backgroundColor: '#F1F3F5', opacity: 0.8 },
  drillInfo: { flex: 1 },
  drillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4
  },
  textDone: { textDecorationLine: 'line-through', color: '#8E8E93' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  viewButton: { padding: 8, marginRight: 8 },
  checkButton: { backgroundColor: '#4caf50', padding: 8, borderRadius: 8 },
  buttonAll: {
    backgroundColor: '#1A1C1E',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonAllText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default AssignedRegimenModal;
