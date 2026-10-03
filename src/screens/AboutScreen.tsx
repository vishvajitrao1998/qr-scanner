import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { APP_NAME, DEVELOPER_NAME, TAGLINE } from "../constants/app";
import { useTheme } from "../theme/ThemeContext";

const FEATURES = [
  "Scan QR codes and most common barcodes",
  "Scan from images in your gallery",
  "Recognises links, Wi-Fi, contacts, email and more",
  "Scan history with export to TXT and CSV",
  "Works offline, no account needed",
  "Light and dark modes",
];

export default function AboutScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: c.primary }]}>
          <Ionicons name="qr-code" size={44} color="#fff" />
        </View>
        <Text style={[styles.name, { color: c.text }]}>{APP_NAME}</Text>
        <Text style={[styles.version, { color: c.subtext }]}>Version {version}</Text>
        <Text style={[styles.tagline, { color: c.subtext }]}>{TAGLINE}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>What it does</Text>
        {FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={c.primary} />
            <Text style={[styles.feature, { color: c.text }]}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Your privacy</Text>
        <Text style={[styles.body, { color: c.subtext }]}>
          The camera is used only to scan codes. Your scans are stored on your device and are never uploaded.
        </Text>
      </View>

      <Text style={[styles.footer, { color: c.subtext }]}>
        © {new Date().getFullYear()} {DEVELOPER_NAME}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginVertical: 20 },
  logo: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  name: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  version: { fontSize: 14, marginTop: 4 },
  tagline: { fontSize: 15, textAlign: "center", marginTop: 10, lineHeight: 22 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  feature: { fontSize: 15, flex: 1 },
  body: { fontSize: 15, lineHeight: 22 },
  footer: { textAlign: "center", fontSize: 13, marginTop: 8 },
});