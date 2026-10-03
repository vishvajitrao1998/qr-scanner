import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ScanRecord } from "../types/scan";
import { SOURCE_LABELS, formatLabel, parseScan } from "./parseScan";

export type ExportKind = "txt" | "csv";

const pad = (n: number) => String(n).padStart(2, "0");


function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fileStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}`;
}

function sourceLabel(item: ScanRecord) {
  return SOURCE_LABELS[item.source];
}

function buildTxt(items: ScanRecord[]) {
  const lines: string[] = [
    "Scan History",
    `Exported: ${formatDate(Date.now())}`,
    `Total scans: ${items.length}`,
    "",
  ];

  items.forEach((item, i) => {
    const parsed = parseScan(item.data, item.format);
    lines.push(
      "------------------------------------------------------------",
      `#${i + 1}  ${formatDate(item.timestamp)}`,
      `Type: ${parsed.label}`,
      `Format: ${formatLabel(item.format)}`,
      `Source: ${sourceLabel(item)}`,
      "Content:",
      item.data,
      ""
    );
  });

  return lines.join("\n");
}

function csvCell(value: string) {
  let v = value;
  // Stops spreadsheet apps from running text like "=1+1" as a formula
  // (plain phone-number style values are left alone)
  if (/^[=+\-@]/.test(v) && !/^[+-]?[\d\s().-]+$/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
}

function buildCsv(items: ScanRecord[]) {
  const header = ["Date", "Type", "Format", "Source", "Content"].map(csvCell).join(",");
  const rows = items.map((item) => {
    const parsed = parseScan(item.data, item.format);
    return [
      formatDate(item.timestamp),
      parsed.label,
      formatLabel(item.format),
      sourceLabel(item),
      item.data,
    ]
      .map(csvCell)
      .join(",");
  });
  // BOM at the start so Excel reads non-English characters correctly
  return "\uFEFF" + [header, ...rows].join("\r\n");
}

export async function exportHistory(items: ScanRecord[], kind: ExportKind) {
  const content = kind === "csv" ? buildCsv(items) : buildTxt(items);
  const file = new File(Paths.cache, `scan-history-${fileStamp()}.${kind}`);

  if (file.exists) file.delete();
  file.create();
  await file.write(content);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: kind === "csv" ? "text/csv" : "text/plain",
    UTI: kind === "csv" ? "public.comma-separated-values-text" : "public.plain-text",
    dialogTitle: kind === "csv" ? "Export history as CSV" : "Export history as TXT",
  });
}