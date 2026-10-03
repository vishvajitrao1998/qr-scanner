import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import { useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from "react-native";
import { Row, Section } from "../components/SettingsUI";
import { APP_NAME, DEVELOPER_NAME, STORE_URL, SUPPORT_EMAIL } from "../constants/app";
import { RootStackParamList } from "../navigation/RootNavigator";
import { AppSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from "../storage/settings";
import { useTheme } from "../theme/ThemeContext";
import { BEEP_OPTIONS } from "../utils/sounds";
import { vibrateSuccess } from "../utils/vibrate";

// Each option has its own player, so tapping it previews that exact sound
function BeepRow({
  option,
  selected,
  onSelect,
}: {
  option: (typeof BEEP_OPTIONS)[number];
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const player = useAudioPlayer(option.source);

  return (
    <Row
      icon="musical-note-outline"
      label={option.label}
      onPress={() => {
        onSelect(option.id);
        try {
          player.seekTo(0);
          player.play();
        } catch {}
      }}
      right={
        <Ionicons
          name={selected ? "radio-button-on" : "radio-button-off"}
          size={22}
          color={selected ? c.primary : c.subtext}
        />
      }
    />
  );
}

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [permission] = useCameraPermissions();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const update = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    saveSettings(partial);
  };

  const goToTab = (tab: "Scanner" | "History") => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Main", state: { index: 0, routes: [{ name: tab }] } }],
    });
  };

  const shareApp = () =>
    Share.share({
      message: `Check out ${APP_NAME}: scan QR codes and barcodes fast and privately.${
        STORE_URL ? `\n${STORE_URL}` : ""
      }`,
    });

  const rateApp = () => {
    if (!STORE_URL) {
      Alert.alert("Not available yet", "Rating will be available once the app is published on the store.");
      return;
    }
    Linking.openURL(STORE_URL).catch(() => {});
  };

  const contactSupport = () =>
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} feedback`)}`
    ).catch(() => {});

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const toggle = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: c.border, true: c.primary }}
      thumbColor="#fff"
    />
  );

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
    >
      {/* Quick actions */}
      <View style={styles.tiles}>
        <Pressable
          style={[styles.tile, { backgroundColor: c.primary }]}
          onPress={() => goToTab("Scanner")}
        >
          <Ionicons name="scan" size={26} color="#fff" />
          <Text style={[styles.tileText, { color: "#fff" }]}>Open scanner</Text>
        </Pressable>
        <Pressable
          style={[styles.tile, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}
          onPress={() => goToTab("History")}
        >
          <Ionicons name="time" size={26} color={c.primary} />
          <Text style={[styles.tileText, { color: c.text }]}>Open history</Text>
        </Pressable>
      </View>

      <Section title="Scanning">
        <Row
          icon="phone-portrait-outline"
          label="Vibration"
          subtitle="Vibrate when a code is scanned"
          right={toggle(settings.vibrate, (v) => {
            update({ vibrate: v });
            if (v) vibrateSuccess();
          })}
        />
        <Row
          icon="volume-high-outline"
          label="Sound"
          subtitle="Play a beep when a code is scanned"
          right={toggle(settings.sound, (v) => update({ sound: v }))}
        />
      </Section>

      <Section title="Beep sound">
        {BEEP_OPTIONS.map((option) => (
          <BeepRow
            key={option.id}
            option={option}
            selected={settings.beepId === option.id}
            onSelect={(id) => update({ beepId: id })}
          />
        ))}
      </Section>

      <Section title="Appearance">
        <Row
          icon={theme.dark ? "moon-outline" : "sunny-outline"}
          label="Dark mode"
          right={toggle(theme.dark, toggleTheme)}
        />
      </Section>

      <Section title="Privacy & permissions">
        <Row
          icon="camera-outline"
          label="Camera permission"
          subtitle="Tap to manage in system settings"
          value={permission?.granted ? "Allowed" : "Not allowed"}
          onPress={() => Linking.openSettings()}
        />
        <Row
          icon="shield-checkmark-outline"
          label="Privacy policy"
          subtitle="Your scans stay on your device"
          onPress={() => navigation.navigate("Legal", { doc: "privacy" })}
        />
        <Row
          icon="document-text-outline"
          label="Terms of use"
          onPress={() => navigation.navigate("Legal", { doc: "terms" })}
        />
      </Section>

      <Section title="Support">
        <Row icon="share-social-outline" label="Share app" onPress={shareApp} />
        <Row icon="star-outline" label="Rate app" onPress={rateApp} />
        <Row icon="mail-outline" label="Contact support" subtitle={SUPPORT_EMAIL} onPress={contactSupport} />
      </Section>

      <Section title="About">
        <Row
          icon="information-circle-outline"
          label="About app"
          onPress={() => navigation.navigate("About")}
        />
        <Row icon="pricetag-outline" label="App version" value={version} />
      </Section>

      <Text style={[styles.footer, { color: c.subtext }]}>
        © {new Date().getFullYear()} {DEVELOPER_NAME}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  tiles: { flexDirection: "row", gap: 12, marginBottom: 24 },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
    borderRadius: 18,
  },
  tileText: { fontSize: 15, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 13, marginTop: 4 },
});