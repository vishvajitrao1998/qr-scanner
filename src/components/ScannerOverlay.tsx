import { ReactNode, useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";

export const FRAME_SIZE = Math.min(Dimensions.get("window").width * 0.7, 300);

const ACCENT = "#818CF8";
const MASK = "rgba(0,0,0,0.65)";
const CORNER = 34;
const THICK = 4;
const RADIUS = 16;

function Corners() {
  const base = { position: "absolute", width: CORNER, height: CORNER, borderColor: ACCENT } as const;
  return (
    <>
      <View style={[base, { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: RADIUS }]} />
      <View style={[base, { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: RADIUS }]} />
      <View style={[base, { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: RADIUS }]} />
      <View style={[base, { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: RADIUS }]} />
    </>
  );
}

function ScanLine() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, FRAME_SIZE - 11],
  });

  return <Animated.View style={[styles.line, { transform: [{ translateY }] }]} />;
}

type Props = { children?: ReactNode };

export default function ScannerOverlay({ children }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Top: dimmed, holds the instruction text */}
      <View style={[styles.mask, styles.top]} pointerEvents="none">
        <Text style={styles.title}>Scan a QR code or barcode</Text>
      </View>

      {/* Middle row: dimmed sides + clear frame */}
      <View style={{ flexDirection: "row", height: FRAME_SIZE }} pointerEvents="none">
        <View style={[styles.mask, { flex: 1 }]} />
        <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
          <Corners />
          <ScanLine />
        </View>
        <View style={[styles.mask, { flex: 1 }]} />
      </View>

      {/* Bottom: dimmed, holds the controls */}
      <View style={[styles.mask, styles.bottom]} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: { backgroundColor: MASK },
  top: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 28 },
  bottom: { flex: 1, alignItems: "center", paddingTop: 32 },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  line: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});