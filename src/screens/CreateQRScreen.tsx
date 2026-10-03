import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import { saveImageToGallery } from "../utils/saveToGallery";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Linking,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import { useTheme } from "../theme/ThemeContext";
import { QR_TYPES, QRType, buildQRContent } from "../utils/qrBuilders";
import { addScan } from "../storage/history";
import { ScanRecord } from "../types/scan";
import { parseScan } from "../utils/parseScan";

const QR_SIZE = Math.min(Dimensions.get("window").width - 120, 240);

// Dark colours only, so the code stays easy to scan on the white background
const COLORS = ["#000000", "#1E3A8A", "#4F46E5", "#7C3AED", "#047857", "#B91C1C"];

export default function CreateQRScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const [typeId, setTypeId] = useState<QRType>("text");
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [color, setColor] = useState(COLORS[0]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [galleryDone, setGalleryDone] = useState(false);
  const cardRef = useRef<View>(null);

  const type = QR_TYPES.find((t) => t.id === typeId)!;
  const current = values[typeId] ?? {};
  const content = buildQRContent(typeId, current);
  const canUse = !!content && !qrError;


  const saveKey = `${content}|${color}`;
  const isSaved = savedKey === saveKey;

  const saveToHistory = async () => {
    if (!content || qrError || isSaved) return;
    const record: ScanRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      data: content,
      format: "qr",
      contentType: parseScan(content, "qr").contentType,
      source: "created",
      timestamp: Date.now(),
      color,
    };
    try {
      await addScan(record);
      setSavedKey(saveKey);
    } catch { }
  };

  const setField = (key: string, value: string) => {
    setQrError(false);
    setValues((prev) => ({ ...prev, [typeId]: { ...prev[typeId], [key]: value } }));
  };

  const clearForm = () => {
    setQrError(false);
    setValues((prev) => ({ ...prev, [typeId]: {} }));
  };

  const copyContent = async () => {
    if (!content) return;
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    saveToHistory();
  };

  const shareImage = async () => {
    if (!canUse || sharing) return;
    setSharing(true);
    saveToHistory();

    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing unavailable");
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share QR code" });
    } catch {
      Alert.alert("Couldn't share", "Something went wrong while creating the image. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const downloadToGallery = async () => {
    if (!canUse || downloading) return;
    setDownloading(true);
    saveToHistory();
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      const result = await saveImageToGallery(uri);

      if (result === "denied") {
        Alert.alert(
          "Permission needed",
          "Allow photo access so the QR code can be saved to your gallery.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        setGalleryDone(true);
        setTimeout(() => setGalleryDone(false), 2000);
      }
    } catch {
      Alert.alert("Couldn't save", "Something went wrong while saving the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          {QR_TYPES.map((t) => {
            const active = t.id === typeId;
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  setTypeId(t.id);
                  setQrError(false);
                }}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: c.primary, borderColor: c.primary }
                    : { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Ionicons name={t.icon} size={18} color={active ? "#fff" : c.text} />
                <Text style={[styles.chipText, { color: active ? "#fff" : c.text }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{type.label} details</Text>
            <Pressable onPress={clearForm} hitSlop={8}>
              <Text style={{ color: c.primary, fontWeight: "600", fontSize: 14 }}>Clear</Text>
            </Pressable>
          </View>

          {type.fields.map((field) => {
            if (field.kind === "select") {
              const selected = current[field.key] ?? field.default;
              return (
                <View key={field.key} style={styles.field}>
                  <Text style={[styles.label, { color: c.subtext }]}>{field.label}</Text>
                  <View style={styles.segment}>
                    {field.options.map((opt) => {
                      const on = selected === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => setField(field.key, opt)}
                          style={[
                            styles.segmentItem,
                            on
                              ? { backgroundColor: c.primary, borderColor: c.primary }
                              : { backgroundColor: c.surface, borderColor: c.border },
                          ]}
                        >
                          <Text style={{ color: on ? "#fff" : c.text, fontWeight: "600" }}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            }

            if (field.kind === "switch") {
              const on = (current[field.key] ?? String(field.default)) === "true";
              return (
                <View key={field.key} style={[styles.field, styles.switchRow]}>
                  <Text style={[styles.switchLabel, { color: c.text }]}>{field.label}</Text>
                  <Switch
                    value={on}
                    onValueChange={(v) => setField(field.key, String(v))}
                    trackColor={{ false: c.border, true: c.primary }}
                    thumbColor="#fff"
                  />
                </View>
              );
            }

            return (
              <View key={field.key} style={styles.field}>
                <Text style={[styles.label, { color: c.subtext }]}>{field.label}</Text>
                <TextInput
                  value={current[field.key] ?? ""}
                  onChangeText={(t) => setField(field.key, t)}
                  placeholder={field.placeholder}
                  placeholderTextColor={c.subtext}
                  multiline={field.multiline}
                  keyboardType={field.keyboard}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.capitalize ?? "none"}
                  autoCorrect={false}
                  maxLength={field.maxLength}
                  style={[
                    styles.input,
                    { backgroundColor: c.surface, borderColor: c.border, color: c.text },
                    field.multiline && styles.inputMulti,
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Preview */}
        <View style={styles.previewWrap}>
          <View ref={cardRef} collapsable={false} style={styles.qrCard}>
            {canUse ? (
              <QRCode
                value={content!}
                size={QR_SIZE}
                color={color}
                backgroundColor="#FFFFFF"
                ecl="M"
                onError={() => setQrError(true)}
              />
            ) : (
              <View style={[styles.placeholder, { width: QR_SIZE, height: QR_SIZE }]}>
                <Ionicons name="qr-code-outline" size={56} color="#9CA3AF" />
                <Text style={styles.placeholderText}>
                  {qrError
                    ? "This content is too long for a QR code"
                    : "Fill in the details to see your QR code"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Colour */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text, marginBottom: 12 }]}>Colour</Text>
          <View style={styles.swatches}>
            {COLORS.map((col) => (
              <Pressable
                key={col}
                onPress={() => setColor(col)}
                style={[
                  styles.swatch,
                  { backgroundColor: col },
                  color === col && { borderColor: c.primary, borderWidth: 3 },
                ]}
              >
                {color === col && <Ionicons name="checkmark" size={18} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={downloadToGallery}
            disabled={!canUse || downloading}
            style={[
              styles.primaryBtn,
              { backgroundColor: c.primary },
              (!canUse || downloading) && styles.disabled,
            ]}
          >
            <Ionicons
              name={galleryDone ? "checkmark-circle" : "download-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.primaryText}>
              {downloading ? "Saving…" : galleryDone ? "Saved to gallery" : "Save to gallery"}
            </Text>
          </Pressable>

          <Pressable
            onPress={shareImage}
            disabled={!canUse || sharing}
            style={[
              styles.primaryBtn,
              { backgroundColor: c.primary },
              (!canUse || sharing) && styles.disabled,
            ]}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.primaryText}>{sharing ? "Preparing…" : "Share QR image"}</Text>
          </Pressable>

          <View style={styles.btnRow}>
            <Pressable
              onPress={saveToHistory}
              disabled={!canUse || isSaved}
              style={[
                styles.secondaryBtn,
                styles.flex1,
                { backgroundColor: c.surface, borderColor: c.border },
                (!canUse || isSaved) && styles.disabled,
              ]}
            >
              <Ionicons name={isSaved ? "checkmark" : "bookmark-outline"} size={20} color={c.text} />
              <Text style={[styles.secondaryText, { color: c.text }]}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </Pressable>

            <Pressable
              onPress={copyContent}
              disabled={!canUse}
              style={[
                styles.secondaryBtn,
                styles.flex1,
                { backgroundColor: c.surface, borderColor: c.border },
                !canUse && styles.disabled,
              ]}
            >
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color={c.text} />
              <Text style={[styles.secondaryText, { color: c.text }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tileText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  btnRow: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  chipText: { fontSize: 14, fontWeight: "600" },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  inputMulti: { minHeight: 92, textAlignVertical: "top" },
  segment: { flexDirection: "row", gap: 8 },
  segmentItem: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { fontSize: 16, fontWeight: "600" },
  previewWrap: { alignItems: "center" },
  qrCard: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 24 },
  placeholder: { alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 16 },
  placeholderText: { color: "#6B7280", fontSize: 14, textAlign: "center", lineHeight: 20 },
  swatches: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "transparent" },
  actions: { gap: 10, marginTop: 4 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16, borderWidth: 1 },
  secondaryText: { fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.4 },
});