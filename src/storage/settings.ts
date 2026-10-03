import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "app:settings";

export type AppSettings = { vibrate: boolean; sound: boolean; beepId: string };

export const DEFAULT_SETTINGS: AppSettings = {
  vibrate: true,
  sound: true,
  beepId: "beep1",
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(partial: Partial<AppSettings>) {
  const current = await loadSettings();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }));
}