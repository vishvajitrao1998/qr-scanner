import { Ionicons } from "@expo/vector-icons";
import { ContentType } from "../types/scan";

export const CONTENT_ICONS: Record<
  ContentType,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  url: "link",
  wifi: "wifi",
  email: "mail",
  phone: "call",
  sms: "chatbubble",
  geo: "location",
  contact: "person",
  event: "calendar",
  product: "pricetag",
  isbn: "book",
  text: "document-text",
};