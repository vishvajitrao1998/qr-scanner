import { APP_NAME, DEVELOPER_NAME, SUPPORT_EMAIL } from "./app";

export type LegalDoc = "privacy" | "terms";

export const LEGAL: Record<
  LegalDoc,
  { updated: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    updated: "October 3, 2026",
    sections: [
      {
        heading: "Overview",
        body: `${APP_NAME} ("the app") is built to work on your device. This policy explains what the app accesses and what it does with it.`,
      },
      {
        heading: "Information we collect",
        body: "We do not collect, sell or share personal information. The app has no accounts, and this version does not use advertising or analytics.",
      },
      {
        heading: "Camera",
        body: "The app uses your camera only to scan QR codes and barcodes. Camera images are processed on your device and are not saved or uploaded.",
      },
      {
        heading: "Photos you choose",
        body: "If you scan from the gallery, the app reads the image you select on your device to find a code. The image is not uploaded or kept.",
      },
      {
        heading: "Scan history",
        body: "Scanned results are stored locally on your device so you can see them in History. You can delete a single scan or your entire history at any time. Uninstalling the app removes this data.",
      },
      {
        heading: "Exporting and sharing",
        body: "When you export your history or share a scan, the content goes to the app you choose. That app's own privacy policy applies.",
      },
      {
        heading: "Links and actions",
        body: "Opening a scanned link, email, phone number or location uses other apps on your device. We cannot control the content of a code. Be careful with codes from sources you do not trust.",
      },
      {
        heading: "Children",
        body: "The app is not directed at children under 13 and does not knowingly collect information from them.",
      },
      {
        heading: "Changes to this policy",
        body: "If the app starts collecting data in the future, this policy will be updated first.",
      },
      {
        heading: "Contact",
        body: `Questions about this policy? Email ${SUPPORT_EMAIL}.`,
      },
    ],
  },
  terms: {
    updated: "October 3, 2026",
    sections: [
      {
        heading: "Acceptance",
        body: `By using ${APP_NAME}, you agree to these terms. If you do not agree, please do not use the app.`,
      },
      {
        heading: "Use of the app",
        body: "The app is provided to scan and manage QR codes and barcodes. Please use it only for lawful purposes.",
      },
      {
        heading: "Scanned content",
        body: "Codes can contain links or data that may be unsafe. The app does not verify what a code contains, and you are responsible for deciding whether to open it.",
      },
      {
        heading: "No warranty",
        body: 'The app is provided "as is" without warranties of any kind. Scan results may occasionally be incomplete or inaccurate.',
      },
      {
        heading: "Limitation of liability",
        body: `To the extent permitted by law, ${DEVELOPER_NAME} is not liable for any loss or damage arising from your use of the app.`,
      },
      {
        heading: "Changes",
        body: "These terms may be updated from time to time. Continued use of the app means you accept the updated terms.",
      },
      {
        heading: "Contact",
        body: `Questions about these terms? Email ${SUPPORT_EMAIL}.`,
      },
    ],
  },
};