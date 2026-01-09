// athlete profile consisting of assigned regimens
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  AssignedRegimenDatabase,
  getAllAssignedRegimenByAthleteId
} from '../../services/assigned_regimen';
import { getAllRegimens } from '../../services/regimen';
import AssignedRegimenModal from './assigned_regimen_modal';

interface Props {
  athleteId: number;
  athleteName: string;
}

const CollapsibleCategory = ({ title, count, children }: any) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={1}
      >
        <Text style={styles.categoryTitle}>{title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countText}>{count}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#666"
          />
        </View>
      </TouchableOpacity>
      {expanded && <View>{children}</View>}
    </View>
  );
};

export default function AthletePracticeRegimens({
  athleteId,
  athleteName
}: Props) {
  const [selectedAssignedId, setSelectedAssignedId] = useState<number | null>(
    null
  );
  const [assignments, setAssignments] = useState<AssignedRegimenDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const assignedData = await getAllAssignedRegimenByAthleteId(athleteId);
      const allRegimens = await getAllRegimens();

      if (assignedData && allRegimens) {
        const enrichedAssignments = assignedData.map(assign => {
          const details = allRegimens.find(r => r.id === assign.regimen_id);
          return { ...assign, regimenDetails: details };
        });
        setAssignments(enrichedAssignments);
      }
    } catch (error) {
      console.error('Error fetching athlete regimens:', error);
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Categorize based on DB status

  const handleModalClose = () => {
    setSelectedAssignedId(null); // Close the modal
    fetchContent(); // Refresh the data
  };

  const renderRegimenItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.regimenRow}
      onPress={() => setSelectedAssignedId(item.id)}
      activeOpacity={1}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="fitness" size={20} color="white" />
      </View>
      <View style={styles.regimenInfo}>
        {/* Accessing the enriched name from the joined regimen details */}
        <Text style={styles.regimenName}>
          {item.regimenDetails?.name || 'Unnamed Regimen'}
        </Text>
        <Text style={styles.regimenDate}>
          Due: {item.regimenDetails?.due_date || 'No date'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.athleteHeader}>
          <Text style={styles.athleteNameText}>{athleteName}</Text>
          <Text style={styles.athleteSub}>Practice Overview</Text>
        </View>

        <CollapsibleCategory
          title="Assigned"
          count={
            assignments.filter(
              a => a.status === 'assigned' || a.status === 'pending'
            ).length
          }
        >
          {assignments
            .filter(a => a.status === 'assigned' || a.status === 'pending')
            .map(renderRegimenItem)}
        </CollapsibleCategory>

        <CollapsibleCategory
          title="Missed"
          count={assignments.filter(a => a.status === 'missed').length}
        >
          {assignments
            .filter(a => a.status === 'missed')
            .map(renderRegimenItem)}
        </CollapsibleCategory>

        <CollapsibleCategory
          title="Done"
          count={assignments.filter(a => a.status === 'completed').length}
        >
          {assignments
            .filter(a => a.status === 'completed')
            .map(renderRegimenItem)}
        </CollapsibleCategory>
      </ScrollView>

      {selectedAssignedId && (
        <Modal
          visible={!!selectedAssignedId}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleModalClose} activeOpacity={1}>
                <Ionicons name="close" size={28} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Regimen Details</Text>
              <View style={{ width: 28 }} />
            </View>
            <AssignedRegimenModal
              assignedRegimenId={selectedAssignedId}
              onClose={handleModalClose}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  athleteHeader: { padding: 20, backgroundColor: 'white', marginBottom: 8 },
  athleteNameText: { fontSize: 22, fontWeight: 'bold' },
  athleteSub: { color: '#666', fontSize: 14 },
  categoryContainer: {
    backgroundColor: 'white',
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center'
  },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: '#444' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  countText: { marginRight: 8, color: '#888' },
  regimenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  regimenInfo: { flex: 1 },
  regimenName: { fontSize: 15, fontWeight: '500', color: '#333' },
  regimenDate: { fontSize: 12, color: '#888', marginTop: 2 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600'
  }
});
