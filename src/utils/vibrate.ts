import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";

export function vibrateSuccess() {
  if (Platform.OS === "android") {
    Vibration.vibrate(300); // plain vibration motor, works even when haptics are off
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}