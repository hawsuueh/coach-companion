import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RegimenDatabase } from "../../services/regimen";

interface RegimenCardProps {
  item: RegimenDatabase;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}

const screenWidth = Dimensions.get("window").width;

const RegimenCard: React.FC<RegimenCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const focusText =
    typeof item.focus === "string" ? item.focus : item.focus.category;
  const athleteCount = Array.isArray(item.assigned_athletes)
    ? item.assigned_athletes.length
    : 0;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.focusBadge}>
            <Text style={styles.focusText}>{focusText}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => item.id !== undefined && onEdit(item.id)}
          >
            <Feather name="edit-2" size={18} color="#007AFF" />
          </TouchableOpacity>

          <Pressable
            onPress={
              item.id !== undefined
                ? () => onDelete(item.id as number, item.name)
                : undefined
            }
            style={styles.iconBtn}
          >
            <Feather name="trash-2" size={18} color="#DC3545" />
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Feather name="clock" size={14} color="#8E8E93" />
          <Text style={styles.statText}>{item.duration}m</Text>
        </View>
        <View style={styles.statItem}>
          <Feather name="layers" size={14} color="#8E8E93" />
          <Text style={styles.statText}>{item.limit_drills} Drills</Text>
        </View>
        <View style={styles.statItem}>
          <Feather name="users" size={14} color="#8E8E93" />
          <Text style={styles.statText}>{athleteCount} Athletes</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dueText}>Due: {item.due_date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    width: screenWidth * 0.92,
    alignSelf: "center",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mainInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "800", color: "#1A1C1E", marginBottom: 6 },
  focusBadge: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  focusText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actions: { flexDirection: "row" },
  iconBtn: { marginLeft: 12, padding: 4 },
  divider: { height: 1, backgroundColor: "#F1F3F5", marginVertical: 12 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 5, fontSize: 13, color: "#444", fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueText: { fontSize: 12, color: "#8E8E93", fontStyle: "italic" },
  avatarStack: { flexDirection: "row" },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EC1D25",
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { color: "white", fontSize: 12, fontWeight: "bold" },
});

export default RegimenCard;
