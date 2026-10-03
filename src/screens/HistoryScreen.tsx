import { Ionicons } from "@expo/vector-icons";
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { deleteScan, getHistory } from "../storage/history";
import { useTheme } from "../theme/ThemeContext";
import { ScanRecord } from "../types/scan";
import { CONTENT_ICONS } from "../utils/contentIcons";
import { formatLabel, parseScan } from "../utils/parseScan";

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [items, setItems] = useState<ScanRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Reload every time the tab comes into focus, so new scans appear immediately
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getHistory().then((history) => {
        if (active) {
          setItems(history);
          setLoaded(true);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const confirmDelete = (item: ScanRecord) => {
    Alert.alert("Delete scan?", "This removes it from your history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteScan(item.id);
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ScanRecord }) => {
    const parsed = parseScan(item.data, item.format);

    return (
      <Pressable
        onPress={() => navigation.navigate("Result", { scan: item })}
        onLongPress={() => confirmDelete(item)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: c.card, borderColor: c.border },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: c.surface }]}>
          <Ionicons name={CONTENT_ICONS[parsed.contentType]} size={22} color={c.primary} />
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {parsed.label}
          </Text>

          
          <Text style={[styles.data, { color: c.subtext }]} numberOfLines={1}>
            {item.data}
          </Text>
          <Text style={[styles.meta, { color: c.subtext }]}>
            {formatLabel(item.format)} · {formatTime(item.timestamp)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={c.subtext} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, items.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: c.surface }]}>
                <Ionicons name="time-outline" size={44} color={c.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.text }]}>No scans yet</Text>
              <Text style={[styles.emptyText, { color: c.subtext }]}>
                Codes you scan will appear here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  listEmpty: { flexGrow: 1, justifyContent: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "700" },
  data: { fontSize: 14 },
  meta: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", padding: 32 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 15, textAlign: "center" },
});