export type SaveResult = "saved" | "denied" | "unavailable";

export async function saveImageToGallery(uri: string): Promise<SaveResult> {
  let ML: any;
  try {
    // Loaded here (not at the top of the file) so a missing native module can't crash the app
    ML = require("expo-media-library");
  } catch {
    return "unavailable";
  }

  try {
    // Write-only access: the app can add images but never reads your gallery
    let granted = false;
    try {
      const r = await ML.requestPermissionsAsync(true);
      granted = r?.granted ?? r?.status === "granted";
    } catch {
      const r = await ML.requestPermissionsAsync();
      granted = r?.granted ?? r?.status === "granted";
    }
    if (!granted) return "denied";

    if (typeof ML.saveToLibraryAsync === "function") {
      await ML.saveToLibraryAsync(uri);
    } else if (ML.Asset?.create) {
      await ML.Asset.create(uri);
    } else {
      return "unavailable";
    }
    return "saved";
  } catch (e) {
    const message = String((e as any)?.message ?? e);
    if (/native module/i.test(message)) return "unavailable";
    throw e;
  }
}