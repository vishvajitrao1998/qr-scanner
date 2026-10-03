import { Ionicons } from "@expo/vector-icons";
import { Children, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const items = Children.toArray(children);

  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.sectionTitle, { color: c.subtext }]}>{title}</Text> : null}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: c.border }]} />}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  icon: IconName;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  dimmed?: boolean;
};

export function Row({ icon, label, subtitle, value, onPress, right, dimmed }: RowProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const body = (
    <View style={[styles.row, dimmed && { opacity: 0.45 }]}>
      <View style={[styles.iconBox, { backgroundColor: c.surface }]}>
        <Ionicons name={icon} size={20} color={c.primary} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: c.subtext }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, { color: c.subtext }]}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={c.subtext} /> : null)}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 6,
  },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  textCol: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 13, marginTop: 2 },
  value: { fontSize: 15 },
});