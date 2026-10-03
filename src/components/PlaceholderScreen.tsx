import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
};

export default function PlaceholderScreen({ icon, title, subtitle }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.surface }]}>
        <Ionicons name={icon} size={44} color={c.primary} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: c.subtext }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});