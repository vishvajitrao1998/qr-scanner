import { Ionicons } from "@expo/vector-icons";
import {
  NavigationProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useAudioPlayer } from "expo-audio";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import ScannerOverlay from "../components/ScannerOverlay";
import { RootStackParamList } from "../navigation/RootNavigator";
import { addScan } from "../storage/history";
import { AppSettings, DEFAULT_SETTINGS, loadSettings } from "../storage/settings";
import { useTheme } from "../theme/ThemeContext";
import { ScanRecord, ScanSource } from "../types/scan";
import { parseScan } from "../utils/parseScan";

// Only formats that expo-camera exposes
const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "code93",
  "itf14",
  "codabar",
  "datamatrix",
  "pdf417",
  "aztec",
] as const;

const DUPLICATE_WINDOW_MS = 3000;

export default function ScannerScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();

  const [torch, setTorch] = useState(false);
  const [processing, setProcessing] = useState(false);

  const busy = useRef(false);
  const lastScan = useRef<{ data: string; time: number } | null>(null);
  const settings = useRef<AppSettings>(DEFAULT_SETTINGS);

  const player = useAudioPlayer(require("../../assets/sounds/beep.mp3"));

  // When the screen gains focus: unlock scanning, restart the duplicate cooldown, reload settings.
  // When it loses focus: switch the torch off.
  useFocusEffect(
    useCallback(() => {
      busy.current = false;
      setProcessing(false);
      if (lastScan.current) lastScan.current.time = Date.now();
      loadSettings().then((s) => (settings.current = s));
      return () => setTorch(false);
    }, [])
  );

  const feedback = () => {
    if (settings.current.vibrate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (settings.current.sound) {
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }
  };

  const handleDetected = (data: string, format: string, source: ScanSource) => {
    const parsed = parseScan(data, format);
    const record: ScanRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      data,
      format,
      contentType: parsed.contentType,
      source,
      timestamp: Date.now(),
    };
    feedback();
    addScan(record).catch(() => {});
    navigation.navigate("Result", { scan: record });
  };

  const onBarcodeScanned = ({ data, type }: BarcodeScanningResult) => {
    if (busy.current || !data) return;

    const now = Date.now();
    const last = lastScan.current;
    if (last && last.data === data && now - last.time < DUPLICATE_WINDOW_MS) return;

    busy.current = true; // block further callbacks immediately
    lastScan.current = { data, time: now };
    handleDetected(data, type, "camera");
  };

  const pickFromGallery = async () => {
    if (busy.current) return;
    busy.current = true;
    setProcessing(true);
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (picked.canceled) {
        busy.current = false;
        setProcessing(false);
        return;
      }

      const results = await CameraView.scanFromURLAsync(
        picked.assets[0].uri,
        [...BARCODE_TYPES]
      );

      if (!results.length) {
        Alert.alert("No code found", "We couldn't find a QR code or barcode in that image.");
        busy.current = false;
        setProcessing(false);
        return;
      }

      const { data, type } = results[0];
      lastScan.current = { data, time: Date.now() };
      handleDetected(data, type, "gallery");
    } catch {
      Alert.alert("Something went wrong", "We couldn't read that image. Please try another one.");
      busy.current = false;
      setProcessing(false);
    }
  };

  // ---- Permission states ----
  if (!permission) {
    return <View style={[styles.fill, { backgroundColor: c.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <View style={[styles.iconWrap, { backgroundColor: c.surface }]}>
          <Ionicons name="camera-outline" size={44} color={c.primary} />
        </View>
        <Text style={[styles.permTitle, { color: c.text }]}>Camera access needed</Text>
        <Text style={[styles.permText, { color: c.subtext }]}>
          We use your camera only to scan QR codes and barcodes. Nothing is uploaded.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={[styles.primaryBtn, { backgroundColor: c.primary }]} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Allow camera</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.primaryBtn, { backgroundColor: c.primary }]} onPress={() => Linking.openSettings()}>
            <Text style={styles.primaryBtnText}>Open settings</Text>
          </Pressable>
        )}
        <Pressable onPress={pickFromGallery} hitSlop={8} style={{ marginTop: 18 }}>
          <Text style={{ color: c.primary, fontWeight: "600", fontSize: 15 }}>
            Scan from a photo instead
          </Text>
        </Pressable>
      </View>
    );
  }

  // ---- Scanner ----
  return (
    <View style={styles.fill}>
      {isFocused && (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          />

          <ScannerOverlay>
            <View style={styles.controls}>
              <View style={styles.controlItem}>
                <Pressable
                  onPress={() => setTorch((t) => !t)}
                  style={[styles.roundBtn, torch && styles.roundBtnActive]}
                >
                  <Ionicons name={torch ? "flash" : "flash-outline"} size={26} color="#fff" />
                </Pressable>
                <Text style={styles.controlLabel}>{torch ? "Flash on" : "Flash"}</Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable onPress={pickFromGallery} style={styles.roundBtn}>
                  {processing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="images-outline" size={26} color="#fff" />
                  )}
                </Pressable>
                <Text style={styles.controlLabel}>Gallery</Text>
              </View>
            </View>
          </ScannerOverlay>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  permText: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  primaryBtn: { paddingHorizontal: 32, paddingVertical: 15, borderRadius: 16 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  controls: { flexDirection: "row", gap: 40 },
  controlItem: { alignItems: "center", gap: 8 },
  roundBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  roundBtnActive: { backgroundColor: "#6366F1" },
  controlLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
});