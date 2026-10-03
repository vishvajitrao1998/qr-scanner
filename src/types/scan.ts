export type ContentType =
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "contact"
  | "event"
  | "product"
  | "isbn"
  | "text";

export type ScanSource = "camera" | "gallery" | "created";

export type ScanRecord = {
  id: string;
  data: string;
  format: string;
  contentType: ContentType;
  source: ScanSource;
  timestamp: number;
  color?: string; // QR colour, used for codes created in the app
};