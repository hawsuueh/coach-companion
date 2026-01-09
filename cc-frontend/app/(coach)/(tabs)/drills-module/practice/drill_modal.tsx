import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface DrillModalProps {
  drill: {
    id: number;
    from_practice_id: number;
    name: string;
    description: string;
    steps: string[];
    good_for?: string[];
    media?: string;
  };
  onClose: () => void;
  showCompleteButton?: boolean; // when viewed from athlete regimen screen
  onMarkComplete?: (drillId: number) => void;
  isCompleted?: boolean;
}
const getStatDisplayName = (statKey: string): string => {
  // If not found default to the key itself.
  return STAT_OPTIONS[statKey] || statKey;
};

export default function DrillModal({
  drill,
  onClose,
  showCompleteButton = false,
  onMarkComplete,
  isCompleted = false,
}: DrillModalProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{drill.name}</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>{drill.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps:</Text>
          {drill.steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {drill.good_for && drill.good_for.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This drill is good for:</Text>
            <View style={styles.skillsContainer}>
              {drill.good_for.map((skillKey, index) => {
                const displayName = getStatDisplayName(skillKey);

                let backgroundColor = "#e3f2fd";
                if (index === 0) backgroundColor = "#7CEE6D";
                else if (index === 1) backgroundColor = "#fef29aff";
                else if (index === 2) backgroundColor = "#ffc3a3ff";

                return (
                  <View
                    key={index}
                    style={[styles.skillTag, { backgroundColor }]}
                  >
                    <Text style={styles.skillText}>{displayName}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {showCompleteButton && (
          <Pressable
            style={[
              styles.completeButton,
              isCompleted && { backgroundColor: "#8E8E93" }, // Grey out if completed
            ]}
            onPress={() => onMarkComplete?.(drill.id)}
          >
            <Text style={styles.completeButtonText}>
              {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#444",
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillTag: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "#000",
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
