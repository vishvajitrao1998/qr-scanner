export type SaveResult = "saved" | "denied" | "unavailable";

export async function saveImageToGallery(uri: string): Promise<SaveResult> {
  // 1) Older API: works in Expo Go
  try {
    const legacy = require("expo-media-library/legacy");

    // Write-only access: the app can add images but never reads your gallery
    const permission = await legacy.requestPermissionsAsync(true);
    if (!permission.granted) return "denied";

    await legacy.saveToLibraryAsync(uri);
    return "saved";
  } catch (e) {
    console.warn("Gallery save (legacy) failed:", e);
  }

  // 2) Newer API: used if the first one isn't available
  try {
    const { Asset, requestPermissionsAsync } = require("expo-media-library");

    const permission = await requestPermissionsAsync(true);
    if (!permission.granted) return "denied";

    await Asset.create(uri);
    return "saved";
  } catch (e) {
    console.warn("Gallery save (new) failed:", e);
    return "unavailable";
  }
}