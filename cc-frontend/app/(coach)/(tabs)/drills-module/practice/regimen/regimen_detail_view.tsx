// view when a regimen is selected
// Shows list of athletes; Assigned, Not Assigned, Missed Done of that regimen
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import athlete_list from '../../performance/athlete_list';

import {
  AssignedRegimenDatabase,
  getAllAssignedRegimenByRegimenId
} from '../../services/assigned_regimen';
import { getRegimenById } from '../../services/regimen';

const CollapsibleSection = ({ title, count, children }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={1}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.countText}>{count}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

export default function RegimenDetailView({
  regimenId
}: {
  regimenId: number;
}) {
  const [regimen, setRegimen] = useState<any>(null);
  const [assignments, setAssignments] = useState<AssignedRegimenDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignmentData = useCallback(async () => {
    setLoading(true);
    try {
      const assignmentData = await getAllAssignedRegimenByRegimenId(regimenId);
      if (assignmentData) setAssignments(assignmentData);

      const regimenData = await getRegimenById(regimenId);

      // Access the first index if it's an array
      if (regimenData && Array.isArray(regimenData) && regimenData.length > 0) {
        setRegimen(regimenData[0]);
      } else if (regimenData && !Array.isArray(regimenData)) {
        setRegimen(regimenData); // In case it's already an object
      }
    } catch (error) {
      console.error('Error fetching regimen data:', error);
    } finally {
      setLoading(false);
    }
  }, [regimenId]);

  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  const doneAthletes = athlete_list.filter(athlete =>
    assignments.some(
      assignment =>
        assignment.assigned_athlete_id === athlete.athlete_no &&
        assignment.status === 'completed'
    )
  );

  const assignedAthletes = athlete_list.filter(athlete =>
    assignments.some(
      assignment =>
        assignment.assigned_athlete_id === athlete.athlete_no &&
        assignment.status !== 'completed'
    )
  );

  const notAssignedAthletes = athlete_list.filter(
    athlete =>
      !assignments.some(
        assignment => assignment.assigned_athlete_id === athlete.athlete_no
      )
  );

  const missedAthletes = athlete_list.filter(a =>
    assignments.some(
      ar => ar.assigned_athlete_id === a.athlete_no && ar.status === 'missed'
    )
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.headerPadding}>
        <Text style={styles.mainTitle}>{regimen?.name}</Text>
        <Text style={styles.subTitle}>
          Due:{' '}
          {regimen?.due_date ? new Date(regimen.due_date).toLocaleString() : ''}
        </Text>
      </View>

      <CollapsibleSection title="Assigned" count={assignedAthletes.length}>
        {assignedAthletes.map(a => (
          <Text key={a.athlete_no} style={styles.item}>
            {a.first_name} {a.last_name}
          </Text>
        ))}
      </CollapsibleSection>

      <CollapsibleSection
        title="Not Assigned"
        count={notAssignedAthletes.length}
      >
        {notAssignedAthletes.map(a => (
          <Text key={a.athlete_no} style={styles.item}>
            {a.first_name} {a.last_name}
          </Text>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Missed" count={missedAthletes.length}>
        {missedAthletes.map(a => (
          <Text key={a.athlete_no} style={styles.item}>
            {a.first_name} {a.last_name}
          </Text>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Done" count={doneAthletes.length}>
        {doneAthletes.map(a => (
          <Text key={a.athlete_no} style={styles.item}>
            {a.first_name} {a.last_name}
          </Text>
        ))}
      </CollapsibleSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerPadding: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  mainTitle: { fontSize: 22, fontWeight: 'bold' },
  subTitle: { color: '#666', marginTop: 4 },
  sectionContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center'
  },
  sectionTitle: { fontSize: 16, fontWeight: '500' },
  sectionBody: { padding: 16, backgroundColor: '#fafafa' },
  countText: { marginRight: 10, color: '#666' },
  item: { paddingVertical: 4, color: '#444' }
});
