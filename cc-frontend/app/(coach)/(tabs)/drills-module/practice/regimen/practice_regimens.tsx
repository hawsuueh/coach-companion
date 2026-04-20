// main view of Regimens button
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AthleteCard from '../../performance/athlete_card';
import athlete_list from '../../performance/athlete_list';
import { getAllAssignedRegimenByRegimenId } from '../../services/assigned_regimen';
import { getAllAssignedRegimenDrillByAssignedRegimenId } from '../../services/assigned_regimen_drill';
import {
  deleteRegimen,
  getAllRegimens,
  RegimenDatabase
} from '../../services/regimen';
import AthletePracticeRegimens from './athlete_practice_regimens';
import RegimenCard from './regimen_card';
import RegimenDetailView from './regimen_detail_view';
import { getAllDrills } from '../../services/drill';

export default function PracticeRegimens() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Athletes' | 'Regimens'>(
    'Regimens'
  );
  const [regimensList, setRegimensList] = useState<RegimenDatabase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(
    null
  );
  const [selectedRegimenId, setSelectedRegimenId] = useState<number | null>(
    null
  );

  const selectedAthlete = athlete_list.find(
    a => a.athlete_no === selectedAthleteId
  );

  const fetchRegimens = async () => {
    setIsLoading(true);
    const data = await getAllRegimens();
    if (data) setRegimensList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRegimens();
  }, []);

  const handleHeaderBack = () => {
    if (selectedAthleteId !== null) setSelectedAthleteId(null);
    else if (selectedRegimenId !== null) setSelectedRegimenId(null);
    else router.back();
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete Regimen', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteRegimen(id);
          if (success) {
            setRegimensList(prev => prev.filter(r => r.id !== id));
          } else {
            Alert.alert('Error', 'Failed to delete regimen from database.');
          }
        }
      }
    ]);
  };

  const handleEditRegimen = async (regimen: RegimenDatabase) => {
    if (!regimen.id) return;

    setIsLoading(true); // Show loader while fetching nested data
    try {
      const assignments = await getAllAssignedRegimenByRegimenId(regimen.id);
      const allDrills = await getAllDrills();

      const drillAssignments: Record<number, any> = {};

      if (assignments && allDrills) {
        for (const assign of assignments) {
          const drillRelations =
            await getAllAssignedRegimenDrillByAssignedRegimenId(assign.id!);

          // Map the IDs back to full Drill objects for the Edit Screen
          const fullDrills = (drillRelations || [])
            .map(rel => allDrills.find(d => d.id === rel.drill_id))
            .filter(d => d !== undefined);

          drillAssignments[assign.assigned_athlete_id] = {
            athleteId: assign.assigned_athlete_id,
            drills: fullDrills,
            attentionAreas: assign.attention_areas || []
          };
        }
      }

      const regimenData = {
        id: regimen.id,
        name: regimen.name,
        duration: regimen.duration,
        due_date: regimen.due_date,
        focus: regimen.focus,
        limit_drills: regimen.limit_drills,
        assigned_athletes: regimen.assigned_athletes || [],
        drillAssignments: drillAssignments, // Now matches the expected structure
        isEditing: true
      };

      router.push({
        pathname: '/drills-module/practice/edit_regimen_screen',
        params: { regimenData: JSON.stringify(regimenData) }
      });
    } catch (error) {
      console.error('Error preparing edit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.manualHeader}>
        <TouchableOpacity
          onPress={handleHeaderBack}
          style={styles.backButton}
          activeOpacity={1}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedAthleteId
            ? `${selectedAthlete?.first_name}'s Regimens`
            : selectedRegimenId
              ? 'Regimen Details'
              : 'Practice Regimens'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {!selectedAthleteId && !selectedRegimenId ? (
        <View style={styles.fullFlex}>
          <View style={styles.tabBar}>
            {['Regimens', 'Athletes'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginTop: 50 }}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {activeTab === 'Athletes' ? (
                <View style={styles.grid}>
                  {athlete_list.map(athlete => (
                    <AthleteCard
                      key={athlete.athlete_no}
                      athlete={athlete}
                      onPress={() => setSelectedAthleteId(athlete.athlete_no)}
                    />
                  ))}
                </View>
              ) : (
                <View>
                  {regimensList.map(reg => (
                    <TouchableOpacity
                      key={reg.id}
                      onPress={() => setSelectedRegimenId(reg.id!)}
                      activeOpacity={1}
                    >
                      <RegimenCard
                        item={reg}
                        onEdit={() => handleEditRegimen(reg)}
                        onDelete={handleDelete}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      ) : selectedAthleteId ? (
        <AthletePracticeRegimens
          athleteId={selectedAthleteId}
          athleteName={`${selectedAthlete?.first_name} ${selectedAthlete?.last_name}`}
        />
      ) : (
        <RegimenDetailView regimenId={selectedRegimenId!} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { padding: 4 },
  fullFlex: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    marginTop: 10
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#fff' },
  scrollContent: { padding: 16 },
  grid: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});
