import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LEGAL } from "../constants/legal";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTheme } from "../theme/ThemeContext";

type Props = NativeStackScreenProps<RootStackParamList, "Legal">;

export default function LegalScreen({ route }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const doc = LEGAL[route.params?.doc ?? "privacy"];

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.updated, { color: c.subtext }]}>Last updated: {doc.updated}</Text>
      {doc.sections.map((s) => (
        <View key={s.heading} style={styles.block}>
          <Text style={[styles.heading, { color: c.text }]}>{s.heading}</Text>
          <Text style={[styles.body, { color: c.subtext }]}>{s.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  updated: { fontSize: 13, marginBottom: 20 },
  block: { marginBottom: 20 },
  heading: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 23 },
});