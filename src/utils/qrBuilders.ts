import { Ionicons } from "@expo/vector-icons";
import { KeyboardTypeOptions } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type QRType =
  | "text"
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "contact"
  | "location";

export type FieldDef =
  | {
      kind?: "text";
      key: string;
      label: string;
      placeholder?: string;
      multiline?: boolean;
      keyboard?: KeyboardTypeOptions;
      secure?: boolean;
      capitalize?: "none" | "sentences" | "words";
      maxLength?: number;
    }
  | { kind: "select"; key: string; label: string; options: string[]; default: string }
  | { kind: "switch"; key: string; label: string; default: boolean };

export type QRTypeDef = {
  id: QRType;
  label: string;
  icon: IconName;
  fields: FieldDef[];
};

export const QR_TYPES: QRTypeDef[] = [
  {
    id: "text",
    label: "Text",
    icon: "document-text-outline",
    fields: [
      { key: "text", label: "Text", placeholder: "Type anything…", multiline: true, maxLength: 800, capitalize: "sentences" },
    ],
  },
  {
    id: "url",
    label: "Website",
    icon: "link-outline",
    fields: [
      { key: "url", label: "Website address", placeholder: "example.com", keyboard: "url", capitalize: "none", maxLength: 800 },
    ],
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    icon: "wifi-outline",
    fields: [
      { key: "ssid", label: "Network name", placeholder: "My Wi-Fi", capitalize: "none", maxLength: 64 },
      { key: "password", label: "Password", placeholder: "Password", secure: true, capitalize: "none", maxLength: 64 },
      { kind: "select", key: "security", label: "Security", options: ["WPA", "WEP", "None"], default: "WPA" },
      { kind: "switch", key: "hidden", label: "Hidden network", default: false },
    ],
  },
  {
    id: "email",
    label: "Email",
    icon: "mail-outline",
    fields: [
      { key: "to", label: "To", placeholder: "name@example.com", keyboard: "email-address", capitalize: "none", maxLength: 120 },
      { key: "subject", label: "Subject", placeholder: "Subject", capitalize: "sentences", maxLength: 200 },
      { key: "body", label: "Message", placeholder: "Message", multiline: true, capitalize: "sentences", maxLength: 600 },
    ],
  },
  {
    id: "phone",
    label: "Phone",
    icon: "call-outline",
    fields: [
      { key: "number", label: "Phone number", placeholder: "+91 98765 43210", keyboard: "phone-pad", maxLength: 30 },
    ],
  },
  {
    id: "sms",
    label: "SMS",
    icon: "chatbubble-outline",
    fields: [
      { key: "number", label: "Phone number", placeholder: "+91 98765 43210", keyboard: "phone-pad", maxLength: 30 },
      { key: "message", label: "Message", placeholder: "Message", multiline: true, capitalize: "sentences", maxLength: 400 },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: "person-outline",
    fields: [
      { key: "name", label: "Full name", placeholder: "Full name", capitalize: "words", maxLength: 80 },
      { key: "phone", label: "Phone", placeholder: "Phone", keyboard: "phone-pad", maxLength: 30 },
      { key: "email", label: "Email", placeholder: "Email", keyboard: "email-address", capitalize: "none", maxLength: 120 },
      { key: "org", label: "Company", placeholder: "Company", capitalize: "words", maxLength: 80 },
      { key: "website", label: "Website", placeholder: "Website", keyboard: "url", capitalize: "none", maxLength: 200 },
    ],
  },
  {
    id: "location",
    label: "Location",
    icon: "location-outline",
    fields: [
      { key: "lat", label: "Latitude", placeholder: "26.8467", keyboard: "numbers-and-punctuation", maxLength: 20 },
      { key: "lng", label: "Longitude", placeholder: "80.9462", keyboard: "numbers-and-punctuation", maxLength: 20 },
    ],
  },
];

type Values = Record<string, string>;

const val = (values: Values, key: string) => (values[key] ?? "").trim();

// Wi-Fi QR format needs these characters escaped with a backslash
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

// vCard text escaping
const escVcard = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([;,])/g, "\\$1");

// Returns the text to put in the QR code, or null if required fields are missing/invalid
export function buildQRContent(type: QRType, values: Values): string | null {
  switch (type) {
    case "text":
      return val(values, "text") || null;

    case "url": {
      const url = val(values, "url");
      if (!url) return null;
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`;
    }

    case "wifi": {
      const ssid = val(values, "ssid");
      if (!ssid) return null;
      const security = values.security ?? "WPA";
      const password = values.password ?? "";
      const hidden = values.hidden === "true";
      const t = security === "None" ? "nopass" : security;
      return (
        `WIFI:T:${t};S:${escWifi(ssid)};` +
        (security !== "None" && password ? `P:${escWifi(password)};` : "") +
        (hidden ? "H:true;" : "") +
        ";"
      );
    }

    case "email": {
      const to = val(values, "to");
      if (!/^\S+@\S+\.\S+$/.test(to)) return null;
      const subject = val(values, "subject");
      const body = val(values, "body");
      const params = [
        subject ? `subject=${encodeURIComponent(subject)}` : "",
        body ? `body=${encodeURIComponent(body)}` : "",
      ]
        .filter(Boolean)
        .join("&");
      return `mailto:${to}${params ? `?${params}` : ""}`;
    }

    case "phone": {
      const n = val(values, "number").replace(/[^\d+]/g, "");
      return n.length >= 3 ? `tel:${n}` : null;
    }

    case "sms": {
      const n = val(values, "number").replace(/[^\d+]/g, "");
      if (n.length < 3) return null;
      return `SMSTO:${n}:${val(values, "message")}`;
    }

    case "contact": {
      const name = val(values, "name");
      if (!name) return null;
      const parts = name.split(/\s+/);
      const last = parts.length > 1 ? (parts.pop() as string) : "";
      const first = parts.join(" ");
      const phone = val(values, "phone");
      const email = val(values, "email");
      const org = val(values, "org");
      const website = val(values, "website");

      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escVcard(last)};${escVcard(first)};;;`,
        `FN:${escVcard(name)}`,
        org ? `ORG:${escVcard(org)}` : "",
        phone ? `TEL;TYPE=CELL:${phone}` : "",
        email ? `EMAIL:${email}` : "",
        website ? `URL:${website}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\r\n");
    }

    case "location": {
      const lat = parseFloat(val(values, "lat"));
      const lng = parseFloat(val(values, "lng"));
      if (!isFinite(lat) || !isFinite(lng)) return null;
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
      return `geo:${lat},${lng}`;
    }
  }
}