import { ContentType } from "../types/scan";

export type ParsedScan = {
  contentType: ContentType;
  label: string;
  details: { label: string; value: string }[];
  actionLabel?: string;
  actionUrl?: string;
};

const PRODUCT_FORMATS = ["ean13", "ean8", "upc_a", "upc_e"];

const FORMAT_LABELS: Record<string, string> = {
  qr: "QR Code",
  ean13: "EAN-13",
  ean8: "EAN-8",
  upc_a: "UPC-A",
  upc_e: "UPC-E",
  code128: "Code 128",
  code39: "Code 39",
  code93: "Code 93",
  itf14: "ITF-14",
  codabar: "Codabar",
  datamatrix: "Data Matrix",
  pdf417: "PDF417",
  aztec: "Aztec",
};

export function formatLabel(format: string) {
  return FORMAT_LABELS[format] ?? format.toUpperCase();
}

// Splits on an unescaped separator and removes backslash escapes
function splitUnescaped(s: string, sep: string) {
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\" && i + 1 < s.length) {
      cur += s[i + 1];
      i++;
    } else if (ch === sep) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

function parseKeyValues(body: string) {
  const out: Record<string, string> = {};
  for (const part of splitUnescaped(body, ";")) {
    const idx = part.indexOf(":");
    if (idx > 0) out[part.slice(0, idx).toUpperCase()] = part.slice(idx + 1);
  }
  return out;
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function pickAll(text: string, regex: RegExp) {
  return Array.from(text.matchAll(regex))
    .map((m) => m[1].trim())
    .filter(Boolean);
}

function parseQuery(query: string) {
  const out: Record<string, string> = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const i = pair.indexOf("=");
    const key = safeDecode((i === -1 ? pair : pair.slice(0, i)).toLowerCase());
    const val = i === -1 ? "" : safeDecode(pair.slice(i + 1).replace(/\+/g, " "));
    out[key] = val;
  }
  return out;
}



function pick(text: string, regex: RegExp) {
  return text.match(regex)?.[1]?.trim();
}

function compact(details: { label: string; value?: string }[]) {
  return details.filter((d) => d.value) as { label: string; value: string }[];
}


export function parseScan(data: string, format: string): ParsedScan {
  const value = data.trim();
  const lower = value.toLowerCase();




  // URL
  if (/^https?:\/\//i.test(value) || /^www\./i.test(value)) {
    const url = /^www\./i.test(value) ? `https://${value}` : value;
    return {
      contentType: "url",
      label: "Website",
      details: [],
      actionLabel: "Open link",
      actionUrl: url,
    };
  }

  // Wi-Fi
  if (lower.startsWith("wifi:")) {
    const kv = parseKeyValues(value.slice(5));
    return {
      contentType: "wifi",
      label: "Wi-Fi Network",
      details: compact([
        { label: "Network", value: kv.S },
        { label: "Password", value: kv.P },
        { label: "Security", value: kv.T },
      ]),
    };
  }

  // Email (mailto: format)
  // Email (mailto: format)
  if (lower.startsWith("mailto:")) {
    const rest = value.slice(7);
    const q = rest.indexOf("?");
    const address = safeDecode(q === -1 ? rest : rest.slice(0, q));
    const params = parseQuery(q === -1 ? "" : rest.slice(q + 1));
    return {
      contentType: "email",
      label: "Email",
      details: compact([
        { label: "To", value: address },
        { label: "CC", value: params.cc },
        { label: "BCC", value: params.bcc },
        { label: "Subject", value: params.subject },
        { label: "Message", value: params.body },
      ]),
      actionLabel: "Send email",
      actionUrl: value,
    };
  }

  // Email (MATMSG format, used by many QR generators)
  // Email (MATMSG format)
  if (/^MATMSG:/i.test(value)) {
    const kv = parseKeyValues(value.slice(7));
    const query = [
      kv.SUB ? `subject=${encodeURIComponent(kv.SUB)}` : "",
      kv.BODY ? `body=${encodeURIComponent(kv.BODY)}` : "",
    ]
      .filter(Boolean)
      .join("&");
    return {
      contentType: "email",
      label: "Email",
      details: compact([
        { label: "To", value: kv.TO },
        { label: "Subject", value: kv.SUB },
        { label: "Message", value: kv.BODY },
      ]),
      actionLabel: "Send email",
      actionUrl: `mailto:${kv.TO ?? ""}${query ? `?${query}` : ""}`,
    };
  }

  // Phone
  if (lower.startsWith("tel:")) {
    return {
      contentType: "phone",
      label: "Phone Number",
      details: [{ label: "Number", value: value.slice(4) }],
      actionLabel: "Call",
      actionUrl: value,
    };
  }

  // SMS
  if (lower.startsWith("smsto:") || lower.startsWith("sms:")) {
    const body = value.slice(value.indexOf(":") + 1);
    const [number, ...rest] = body.split(":");
    const cleanNumber = number.split("?")[0];
    return {
      contentType: "sms",
      label: "SMS",
      details: compact([
        { label: "Number", value: cleanNumber },
        { label: "Message", value: rest.join(":") || undefined },
      ]),
      actionLabel: "Send SMS",
      actionUrl: `sms:${cleanNumber}`,
    };
  }

  // Location
  if (lower.startsWith("geo:")) {
    const coords = value.slice(4).split("?")[0];
    return {
      contentType: "geo",
      label: "Location",
      details: [{ label: "Coordinates", value: coords }],
      actionLabel: "Open in Maps",
      actionUrl: `https://maps.google.com/?q=${coords}`,
    };
  }

  // Contact (vCard / MECARD)
  // Contact (vCard)
  if (/^BEGIN:VCARD/i.test(value)) {
    const n = pick(value, /^N:(.*)$/im);
    const [last, first] = n ? n.split(";") : [];
    const nameFromN = [first, last].filter(Boolean).join(" ") || undefined;
    const adr = pick(value, /^ADR[^:]*:(.*)$/im);

    return {
      contentType: "contact",
      label: "Contact",
      details: compact([
        { label: "Name", value: pick(value, /^FN:(.*)$/im) ?? nameFromN },
        { label: "Phone", value: pickAll(value, /^TEL[^:]*:(.*)$/gim).join(", ") },
        { label: "Email", value: pickAll(value, /^EMAIL[^:]*:(.*)$/gim).join(", ") },
        { label: "Organization", value: pick(value, /^ORG:(.*)$/im) },
        { label: "Job title", value: pick(value, /^TITLE:(.*)$/im) },
        { label: "Address", value: adr?.split(";").filter(Boolean).join(", ") },
        { label: "Website", value: pick(value, /^URL[^:]*:(.*)$/im) },
      ]),
    };
  }
  // Contact (MECARD)
  if (/^MECARD:/i.test(value)) {
    const kv = parseKeyValues(value.slice(7));
    return {
      contentType: "contact",
      label: "Contact",
      details: compact([
        { label: "Name", value: kv.N?.split(",").reverse().join(" ").trim() },
        { label: "Phone", value: kv.TEL },
        { label: "Email", value: kv.EMAIL },
        { label: "Organization", value: kv.ORG },
        { label: "Address", value: kv.ADR },
        { label: "Website", value: kv.URL },
      ]),
    };
  }

  // Calendar event
  if (/^BEGIN:(VEVENT|VCALENDAR)/i.test(value)) {
    return {
      contentType: "event",
      label: "Calendar Event",
      details: compact([
        { label: "Title", value: pick(value, /^SUMMARY:(.*)$/im) },
        { label: "Starts", value: pick(value, /^DTSTART[^:]*:(.*)$/im) },
        { label: "Location", value: pick(value, /^LOCATION:(.*)$/im) },
      ]),
    };
  }

  // Product / ISBN (numeric retail barcodes)
  if (PRODUCT_FORMATS.includes(format) && /^\d+$/.test(value)) {
    if (format === "ean13" && /^97[89]/.test(value)) {
      return {
        contentType: "isbn",
        label: "Book (ISBN)",
        details: [{ label: "ISBN", value }],
      };
    }
    return {
      contentType: "product",
      label: "Product Code",
      details: [{ label: "Code", value }],
      actionLabel: "Search online",
      actionUrl: `https://www.google.com/search?q=${value}`,
    };
  }

  return { contentType: "text", label: "Text", details: [] };
}