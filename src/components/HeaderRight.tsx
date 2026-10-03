import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function HeaderRight() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const c = theme.colors;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={toggleTheme}
        hitSlop={8}
        style={[styles.btn, { backgroundColor: c.surface }]}
      >
        <Ionicons
          name={theme.dark ? "sunny-outline" : "moon-outline"}
          size={20}
          color={c.text}
        />
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Settings")}
        hitSlop={8}
        style={[styles.btn, { backgroundColor: c.surface }]}
      >
        <Ionicons name="settings-outline" size={20} color={c.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});