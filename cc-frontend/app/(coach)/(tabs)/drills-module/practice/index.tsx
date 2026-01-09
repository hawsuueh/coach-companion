import supabase from '../../../../../config/supabaseClient';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import {
  createDrill,
  deleteDrill,
  getDrillsByPracticeId,
  updateDrill
} from '../services/drill';
import {
  createPractice,
  DatabasePractice,
  deletePractice,
  getAllPractices,
  updatePractice
} from '../services/practice';
import DrillFormModal from './drill_form_modal';
import DrillModal from './drill_modal';
import GenerateRegimenModal from './generate_regimen_modal';
import PracticeCategoryModal from './practice_category_card';
import PracticeFormModal from './practice_form_modal';

interface PracticeCategory {
  id: number;
  name: string;
  description: string;
  skill: string[];
  image?: string;
}

interface DrillItem {
  id: number;
  from_practice_id: number;
  name: string;
  description: string;
  steps: string[];
  good_for: string[];
  media?: string;
}

const PracticeScreen: React.FC = () => {
  /**
  const statKeys = [
    "FG_PCT",
    "_2PTS_PCT",
    "_3PTS_PCT",
    "FT_PCT",
    "REB",
    "assists",
    "steals",
    "blocks",
    "turnovers",
    "points",
  ];
   */

  const [searchQuery, setSearchQuery] = useState('');
  const [drillSearchQuery, setDrillSearchQuery] = useState('');

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [practices, setPractices] = useState<PracticeCategory[]>([]);

  const [drills, setDrills] = useState<DrillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const data = await getAllPractices();

        if (data) {
          console.log('Supabase Raw Data:', data);

          // Ensure data matches your interface (especially the 'skill' array)
          const formattedData = data.map((item: any) => ({
            ...item,
            // If Supabase stores it as a string "[...]", parse it. If it's already an array, use it.
            skill:
              typeof item.skill === 'string'
                ? JSON.parse(item.skill)
                : item.skill
          }));

          setPractices(formattedData);
        } else {
          console.log('No data returned from Supabase');
        }
      } catch (error) {
        console.error('Supabase Connection Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
    const practiceChannel = supabase
      .channel('practice-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'practice' },
        payload => {
          // Refresh practices list on any change
          fetchPractices();
        }
      )
      .subscribe();

    // Subscribe to Drill changes
    const drillChannel = supabase
      .channel('drill-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drill' },
        payload => {
          // If the change affects the currently viewed category, refresh drills
          if (selectedCategoryId) {
            handleCategorySelect(selectedCategoryId);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(practiceChannel);
      supabase.removeChannel(drillChannel);
    };
  }, [selectedCategoryId]);

  const [isRegimenModalVisible, setIsRegimenModalVisible] = useState(false);

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingPractice, setEditingPractice] =
    useState<PracticeCategory | null>(null);

  const [selectedDrill, setSelectedDrill] = useState<DrillItem | null>(null);
  const [isDrillModalVisible, setIsDrillModalVisible] = useState(false);

  const [isDrillFormVisible, setIsDrillFormVisible] = useState(false);
  const [editingDrill, setEditingDrill] = useState<DrillItem | null>(null);

  const filteredPractices = practices.filter(practice =>
    practice.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  filteredPractices.sort((a, b) => a.name.localeCompare(b.name));
  // Filter drills first by category, then by drill search query
  const drillsForSelectedCategory = selectedCategoryId
    ? drills.filter(drill => drill.from_practice_id === selectedCategoryId)
    : [];

  const filteredDrills = drillsForSelectedCategory.filter(
    drill =>
      drill.name.toLowerCase().includes(drillSearchQuery.toLowerCase()) ||
      drill.description
        .toLowerCase()
        .includes(drillSearchQuery.toLowerCase()) ||
      drill.steps.some(step =>
        step.toLowerCase().includes(drillSearchQuery.toLowerCase())
      )
  );
  filteredDrills.sort((a, b) => a.name.localeCompare(b.name));

  const [expandedSections, setExpandedSections] = useState({
    created: false,
    regimens: false,
    practices: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [drillsLoading, setDrillsLoading] = useState(false);

  const handleCategorySelect = async (id: number) => {
    setSelectedCategoryId(id);
    setDrillSearchQuery('');
    setDrillsLoading(true); // Start drill loading

    try {
      const data = await getDrillsByPracticeId(id);
      if (data) {
        setDrills(data);
      }
    } catch (error) {
      console.error('Error fetching drills for category:', error);
    } finally {
      setDrillsLoading(false); // End drill loading
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setDrillSearchQuery('');
  };

  const handleShowGenerateRegimenModal = () => {
    setIsRegimenModalVisible(true);
  };

  const handleGenerateRegimen = () => {
    setIsRegimenModalVisible(false);
  };

  const handleAddPractice = () => {
    setEditingPractice(null);
    setIsFormModalVisible(true);
  };

  const handleEditPractice = (id: number) => {
    const practiceToEdit = practices.find(p => p.id === id);
    if (practiceToEdit) {
      setEditingPractice(practiceToEdit);
      setIsFormModalVisible(true);
    }
  };

  const handleDeletePractice = async (id: number, name: string) => {
    Alert.alert(
      'Delete Practice',
      `Are you sure you want to delete "${name}"? This will also remove associated drills. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deletePractice(id);

              // 1. Update the local state to remove the item from the UI
              setPractices(prevPractices =>
                prevPractices.filter(p => p.id !== id)
              );

              // 2. Clear selected category if it was the one deleted
              if (selectedCategoryId === id) {
                setSelectedCategoryId(null);
              }

              console.log(`Successfully deleted practice: ${name}`);
            } catch (error) {
              console.error('Delete handler error:', error);
              Alert.alert('Error', 'Could not delete practice.');
            }
          }
        }
      ]
    );
  };

  const handleSavePractice = async (
    id: number | null,
    name: string,
    description: string,
    skill: string[],
    image?: string
  ) => {
    try {
      if (id) {
        // UPDATE CASE
        const practiceData: DatabasePractice = {
          name,
          description,
          skill,
          image: image || ''
        };
        const result = await updatePractice(id, practiceData);
        if (!result) throw new Error('Update failed');
      } else {
        // INSERT CASE
        const newPracticeData = {
          name: name,
          description: description,
          skill: skill,
          image: image || ''
        };
        const result = await createPractice(newPracticeData as any);
        if (!result) throw new Error('Insert failed');

        // Refresh the list after adding
        const updatedList = await getAllPractices();
        if (updatedList) setPractices(updatedList);
      }

      setIsFormModalVisible(false);
      setEditingPractice(null);
    } catch (error) {
      console.error('Database Error:', error);
      Alert.alert('Error', 'Failed to save practice.');
    }
  };

  const handleShowPracticeRegimens = () => {
    router.push({
      pathname: '/drills-module/practice/regimen/practice_regimens'
    });
  };

  const handleDrillPress = (drill: DrillItem) => {
    setSelectedDrill(drill);
    setIsDrillModalVisible(true);
  };

  const handleCloseDrillModal = () => {
    setIsDrillModalVisible(false);
    setSelectedDrill(null);
  };

  const handleAddDrill = () => {
    setEditingDrill(null);
    setIsDrillFormVisible(true);
  };

  const handleDeleteDrill = async (drillId: number, drillName: string) => {
    Alert.alert(
      'Delete Drill',
      `Are you sure you want to delete "${drillName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Call the service
              const result = await deleteDrill(drillId);

              // 2. Clear selection states immediately to prevent rendering errors
              if (selectedDrill?.id === drillId) {
                setSelectedDrill(null);
              }
              if (editingDrill?.id === drillId) {
                setEditingDrill(null);
              }

              // 3. Update the list state
              setDrills(prev => prev.filter(d => d.id !== drillId));

              console.log('Drill deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Could not delete drill from database.');
            }
          }
        }
      ]
    );
  };

  const handleEditDrill = (drill: DrillItem) => {
    setEditingDrill(drill);
    setIsDrillFormVisible(true);
  };

  const handleSaveDrill = async (drillData: {
    id: number | null;
    from_practice_id: number;
    name: string;
    description: string;
    steps: string[];
    good_for: string[];
  }) => {
    if (drillData.from_practice_id === 0) {
      Alert.alert(
        'Error',
        'Invalid Practice ID. Please select a practice category first.'
      );
      return;
    }

    try {
      if (drillData.id !== null) {
        // Update case
        const updated = await updateDrill(drillData.id, {
          from_practice_id: drillData.from_practice_id,
          name: drillData.name,
          description: drillData.description,
          steps: drillData.steps,
          good_for: drillData.good_for
        });

        if (updated) {
          setDrills(prev =>
            prev.map(d => (d.id === drillData.id ? updated : d))
          );
        }
      } else {
        // Insert case
        const created = await createDrill({
          from_practice_id: selectedCategoryId!,
          name: drillData.name,
          description: drillData.description,
          steps: drillData.steps,
          good_for: drillData.good_for
        });

        if (created) {
          // Add the drill returned from Supabase (which includes the real ID)
          setDrills(prev => [...prev, created]);
        }
      }

      // Close modal and reset state
      setIsDrillFormVisible(false);
      setEditingDrill(null);
      setSelectedDrill(null);
    } catch (error) {
      console.error('Failed to save drill:', error);
      Alert.alert(
        'Error',
        'There was a problem saving the drill to the database.'
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
      <View style={{ flex: 1 }}>
        {selectedCategoryId === null ? (
          <ScrollView style={styles.practices_container}>
            {/** if user is athlete, show assigned regimens, if user is coach, show created regimens
             * not implemented for now
             */}
            <Animated.View layout={LinearTransition}>
              <Pressable
                onPress={handleShowPracticeRegimens}
                style={styles.category_header}
              >
                <Text style={styles.category_text}>Created Regimens</Text>
              </Pressable>
            </Animated.View>

            <Animated.View layout={LinearTransition}>
              <Pressable
                style={styles.category_header}
                onPress={() => toggleSection('regimens')}
              >
                <Text style={styles.category_text}>
                  {expandedSections.regimens ? '▼ ' : '▶ '} My Regimens
                </Text>
              </Pressable>

              {expandedSections.regimens && (
                <View>
                  <View>
                    {/* Practice Regimens go here
                  Show the list of athletes
                  inside the athlete cards, show Practice Regimen (the regimens assigned to that specific athlete)
                  */}
                  </View>
                </View>
              )}
            </Animated.View>

            <Animated.View layout={LinearTransition}>
              <Pressable
                style={styles.category_header}
                onPress={() => toggleSection('practices')}
              >
                <Text style={styles.category_text}>
                  {expandedSections.practices ? '▼ ' : '▶ '} Practices
                </Text>
              </Pressable>

              {expandedSections.practices && (
                <View>
                  <TextInput
                    style={styles.search_input}
                    placeholder="Search practices"
                    value={searchQuery}
                    onChangeText={text => setSearchQuery(text)}
                  />
                  <View style={styles.headerControls}>
                    <Text style={styles.practicesCountText}>
                      Practices: {filteredPractices.length}
                    </Text>
                  </View>

                  {filteredPractices.length > 0 ? (
                    filteredPractices.map(practice => (
                      <Pressable
                        key={practice.id}
                        onPress={() => handleCategorySelect(practice.id)}
                        style={{ marginBottom: 10, alignItems: 'center' }}
                      >
                        {/** REMINDER add the practice image */}
                        <PracticeCategoryModal
                          name={practice.name}
                          description={practice.description}
                          practiceId={practice.id}
                          onEdit={handleEditPractice}
                          onDelete={handleDeletePractice}
                        />
                      </Pressable>
                    ))
                  ) : (
                    <Animated.Text
                      layout={LinearTransition}
                      style={styles.noPracticesText}
                    >
                      No practices found.
                    </Animated.Text>
                  )}
                </View>
              )}
            </Animated.View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.drills_screen_container}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Pressable
              onPress={handleBackToCategories}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                {<Ionicons name="arrow-back" size={20} color="red" />}{' '}
                {'Back to Practice Categories'}
              </Text>
            </Pressable>

            {selectedCategoryId && (
              <Text style={styles.mainHeader}>
                {practices.find(p => p.id === selectedCategoryId)?.name ||
                  'Drills'}
              </Text>
            )}

            <TextInput
              style={styles.search_input}
              placeholder="Search drills"
              value={drillSearchQuery}
              onChangeText={text => setDrillSearchQuery(text)}
            />

            {filteredDrills.length > 0 ? (
              <View style={styles.filteredDrillsContent}>
                {filteredDrills.map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleDrillPress(item)}
                    style={styles.drill_container}
                  >
                    {/* Action Buttons Group */}
                    <View style={styles.drillActionContainer}>
                      <Pressable
                        onPress={() => handleEditDrill(item)}
                        style={[
                          styles.smallActionButton,
                          { backgroundColor: '#007AFF' }
                        ]}
                      >
                        <Text style={styles.smallActionText}>Edit</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDeleteDrill(item.id, item.name)}
                        style={[
                          styles.smallActionButton,
                          { backgroundColor: '#DC3545' }
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color="white"
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.drill_name}>{item.name}</Text>
                    <Text style={styles.drill_description}>
                      {item.description}
                    </Text>

                    {item.steps && item.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        {item.steps.slice(0, 2).map((step, index) => (
                          <Text
                            key={index}
                            style={styles.stepText}
                            numberOfLines={1}
                          >
                            • {step}
                          </Text>
                        ))}
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.noDrillsText}>
                No drills found for this category or search.
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      {/** Floating button */}
      <View style={styles.floatingButtonsContainer}>
        <Pressable
          style={styles.addButton}
          onPress={handleShowGenerateRegimenModal}
        >
          <Text style={styles.addButtonText}>
            <FontAwesome6 name="wand-magic-sparkles" size={24} color="white" />
          </Text>
        </Pressable>

        <Pressable
          onPress={
            selectedCategoryId !== null ? handleAddDrill : handleAddPractice
          }
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>
            <Entypo name="plus" size={24} color="white" />
          </Text>
        </Pressable>
      </View>
      <Modal
        visible={isDrillModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedDrill && (
          <DrillModal drill={selectedDrill} onClose={handleCloseDrillModal} />
        )}
      </Modal>
      <GenerateRegimenModal
        visible={isRegimenModalVisible}
        onClose={() => setIsRegimenModalVisible(false)}
        onSave={handleGenerateRegimen}
      />

      <PracticeFormModal
        visible={isFormModalVisible}
        onClose={() => {
          setIsFormModalVisible(false);
          setEditingPractice(null);
        }}
        onSave={handleSavePractice}
        initialPractice={editingPractice}
        existingPractices={practices}
      />
      <DrillFormModal
        visible={isDrillFormVisible}
        onClose={() => {
          setIsDrillFormVisible(false);
          setEditingDrill(null);
        }}
        onSave={handleSaveDrill}
        initialDrill={editingDrill}
        categoryId={selectedCategoryId ?? -1}
        practices={practices}
      />
      {(loading || drillsLoading) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#EC1D25" />
            <Text style={styles.loadingText}>
              {loading ? 'Loading practices...' : 'Loading drills...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PracticeScreen;

const styles = StyleSheet.create({
  practices_container: {
    padding: 10,
    flex: 1,
    height: '100%'
  },
  category_header: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: 70,
    marginBottom: 10,
    marginTop: 10,
    width: '100%'
  },
  category_text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20
  },
  search_input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5
  },
  practicesCountText: {
    fontSize: 16,
    color: '#555',
    flex: 1
  },
  drillsCountText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10
  },
  addButton: {
    backgroundColor: '#EC1D25',
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginLeft: 10
  },
  addButtonText: {
    color: 'white',
    fontSize: 20
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    gap: 10,
    zIndex: 10
  },
  drills_screen_container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9'
  },
  backButton: {
    paddingVertical: 10,
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 16,
    color: '#EC1D25',
    fontWeight: 'bold'
  },
  drill_container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  drill_name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  drill_description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  stepsContainer: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  },
  stepText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3
  },
  practice_category_container: {
    alignItems: 'center'
  },
  filteredDrillsContent: {
    paddingBottom: 20
  },
  noDrillsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20
  },
  noPracticesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  editButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 12
  },
  editButtonText: {
    color: 'white',
    fontSize: 12
  },
  drillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5
  },
  mainHeader: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 5
  },
  category_button: {
    backgroundColor: '#acd0f8ff',
    padding: 12,
    borderRadius: 30,
    outlineWidth: 1,
    alignItems: 'center',
    marginTop: 10
  },
  category_button_text: {
    color: 'white',
    fontSize: 16
  },
  drillActionContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 1
  },
  smallActionButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  smallActionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' }
});
