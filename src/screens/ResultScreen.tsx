import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTheme } from "../theme/ThemeContext";
import { ContentType } from "../types/scan";
import { formatLabel, parseScan } from "../utils/parseScan";
import { CONTENT_ICONS } from "../utils/contentIcons";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

const ICONS: Record<ContentType, React.ComponentProps<typeof Ionicons>["name"]> = {
  url: "link",
  wifi: "wifi",
  email: "mail",
  phone: "call",
  sms: "chatbubble",
  geo: "location",
  contact: "person",
  event: "calendar",
  product: "pricetag",
  isbn: "book",
  text: "document-text",
};

export default function ResultScreen({ route, navigation }: Props) {
  const scan = route.params?.scan;
  const { theme } = useTheme();
  const c = theme.colors;
  const [copied, setCopied] = useState(false);

  if (!scan) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, alignItems: "center", justifyContent: "center", padding: 32 }]}>
        <Text style={[styles.type, { color: c.text }]}>Nothing to show</Text>
        <Pressable
          style={[styles.primary, { backgroundColor: c.primary, paddingHorizontal: 32, marginTop: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const parsed = parseScan(scan.data, scan.format);

  const copy = async () => {
    await Clipboard.setStringAsync(scan.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const share = () => Share.share({ message: scan.data });


// 👇 add it here
  const scanAgain = () => {
    navigation.reset({
      index: 0,
      routes: [
        { name: "Main", state: { index: 0, routes: [{ name: "Scanner" }] } },
      ],
    });
  };
  const runAction = () => {
    if (parsed.actionUrl) Linking.openURL(parsed.actionUrl).catch(() => { });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: c.primary }]}>
            <Ionicons name={CONTENT_ICONS[parsed.contentType]} size={32} color="#fff" />
          </View>
          <Text style={[styles.type, { color: c.text }]}>{parsed.label}</Text>
          <View style={[styles.chip, { backgroundColor: c.surface }]}>
            <Text style={[styles.chipText, { color: c.subtext }]}>
              {formatLabel(scan.format)} · {scan.source === "gallery" ? "Gallery" : "Camera"}
            </Text>
          </View>
        </View>

        {/* Parsed details */}
        {parsed.details.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            {parsed.details.map((d, i) => (
              <View
                key={d.label}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
                ]}
              >
                <Text style={[styles.rowLabel, { color: c.subtext }]}>{d.label}</Text>
                <Text style={[styles.rowValue, { color: c.text }]} selectable>
                  {d.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Raw content */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.rowLabel, { color: c.subtext, marginBottom: 8 }]}>Content</Text>
          <Text style={[styles.raw, { color: c.text }]} selectable>
            {scan.data}
          </Text>
        </View>

        <Text style={[styles.time, { color: c.subtext }]}>
          Scanned {new Date(scan.timestamp).toLocaleString()}
        </Text>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.footer, { backgroundColor: c.background, borderTopColor: c.border }]}>
        {parsed.actionUrl && (
          <Pressable style={[styles.primary, { backgroundColor: c.primary }]} onPress={runAction}>
            <Text style={styles.primaryText}>{parsed.actionLabel}</Text>
          </Pressable>
        )}
        <View style={styles.secondaryRow}>
          <Pressable style={[styles.secondary, { backgroundColor: c.surface }]} onPress={copy}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={c.text} />
            <Text style={[styles.secondaryText, { color: c.text }]}>{copied ? "Copied" : "Copy"}</Text>
          </Pressable>
          <Pressable style={[styles.secondary, { backgroundColor: c.surface }]} onPress={share}>
            <Ionicons name="share-outline" size={18} color={c.text} />
            <Text style={[styles.secondaryText, { color: c.text }]}>Share</Text>
          </Pressable>
          <Pressable style={[styles.secondary, { backgroundColor: c.surface }]} onPress={scanAgain}>
            <Ionicons name="scan-outline" size={18} color={c.text} />
            <Text style={[styles.secondaryText, { color: c.text }]}>Scan again</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 12 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  type: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  chipText: { fontSize: 13, fontWeight: "600" },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  row: { paddingVertical: 10 },
  rowLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 },
  rowValue: { fontSize: 16 },
  raw: { fontSize: 16, lineHeight: 23 },
  time: { textAlign: "center", fontSize: 13, marginTop: 4 },
  footer: { padding: 16, paddingBottom: 28, gap: 12, borderTopWidth: StyleSheet.hairlineWidth },
  primary: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryRow: { flexDirection: "row", gap: 10 },
  secondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryText: { fontSize: 14, fontWeight: "600" },
});