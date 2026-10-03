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

export type ScanSource = "camera" | "gallery";

export type ScanRecord = {
  id: string;
  data: string;
  format: string;
  contentType: ContentType;
  source: ScanSource;
  timestamp: number;
};