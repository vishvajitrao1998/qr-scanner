import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanRecord } from "../types/scan";

const KEY = "scan:history";
const MAX_ITEMS = 500;

export async function getHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanRecord[]) : [];
  } catch {
    return [];
  }
}

export async function addScan(record: ScanRecord) {
  const history = await getHistory();
  const next = [record, ...history].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function deleteScan(id: string) {
  const history = await getHistory();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(history.filter((item) => item.id !== id))
  );
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEY);
}