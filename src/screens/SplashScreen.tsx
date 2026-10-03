import { Ionicons }  from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <LinearGradient
      colors={["#4F46E5", "#7C3AED", "#0B0B0F"]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <StatusBar style="light" />

      <Animated.View
        style={[styles.content, { opacity: fade, transform: [{ translateY: rise }] }]}
      >
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Ionicons name="qr-code" size={56} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>QR & Barcode{"\n"}Scanner</Text>
        <Text style={styles.subtitle}>
          Scan, create and save codes{"\n"}fast, simple and beautiful.
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: fade, width: "100%" }}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          onPress={() => navigation.replace("Main")}
        >
          <Text style={styles.buttonText}>Let's Start</Text>
          <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 120,
    paddingBottom: 56,
  },
  content: { alignItems: "center" },
  logoOuter: {
    width: 140,
    height: 140,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  logoInner: {
    width: 104,
    height: 104,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 20,
  },
  buttonText: { color: "#4F46E5", fontSize: 18, fontWeight: "700" },
});