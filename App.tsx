import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const BOX_SIZE = Math.min(Dimensions.get("window").width * 0.75, 320);

type ScanResult = { type: string; data: string };

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const locked = useRef(false); // prevents repeated scans of the same code

  const handleScan = ({ type, data }: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResult({ type, data });
  };

  const scanAgain = () => {
    locked.current = false;
    setResult(null);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.subtitle}>
          We use your camera only to scan QR codes and barcodes.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>Scan a code</Text>
      <Text style={styles.subtitle}>Place the code inside the box</Text>

      {/* Square camera box */}
      <View style={styles.box}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={result ? undefined : handleScan}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code128",
              "code39",
              "code93",
              "itf14",
              "pdf417",
              "aztec",
              "datamatrix",
            ],
          }}
        />
      </View>

      {/* Result */}
      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultType}>{result.type.toUpperCase()}</Text>
          <Text style={styles.resultData} selectable>
            {result.data}
          </Text>
          <Pressable style={styles.button} onPress={scanAgain}>
            <Text style={styles.buttonText}>Scan again</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>Scanning…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#6366F1",
    backgroundColor: "#000",
  },
  hint: { color: "#9CA3AF", marginTop: 24, fontSize: 14 },
  resultCard: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "#16161D",
    borderRadius: 20,
    padding: 20,
  },
  resultType: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  resultData: { color: "#fff", fontSize: 16, lineHeight: 22, marginBottom: 16 },
  button: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});