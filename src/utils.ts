import { FeedParserError } from "./types.ts";
import type { XmlObject, XmlValue } from "./xml.ts";

export function ensureObject(
  value: unknown,
  message: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FeedParserError(message);
  }
  return value as Record<string, unknown>;
}

export function detectXmlKind(input: string): "rss" | "atom" | "unknown" {
  const lower = input.toLowerCase();
  if (lower.includes("<rss")) return "rss";
  if (lower.includes("<feed")) return "atom";
  return "unknown";
}

export function first(value: XmlValue | undefined): XmlValue | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function toObject(value: XmlValue | undefined): XmlObject | undefined {
  const one = first(value);
  if (!one || typeof one === "string" || Array.isArray(one)) return undefined;
  return one;
}

export function toText(value: XmlValue | undefined): string | undefined {
  const one = first(value);
  if (typeof one === "string") {
    const text = one.trim();
    return text.length ? text : undefined;
  }

  if (!one || Array.isArray(one)) return undefined;

  const textNode = one["#text"];
  if (typeof textNode === "string") {
    const text = textNode.trim();
    return text.length ? text : undefined;
  }

  return undefined;
}

export function toArray(value: XmlValue | undefined): XmlValue[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parsePerson(value: string | undefined): {
  name?: string;
  email?: string;
} {
  if (!value) return {};
  const withName = value.match(/^([^\s]+)\s*\((.+)\)$/);
  if (withName) {
    return { email: withName[1].trim(), name: withName[2].trim() };
  }
  if (value.includes("@")) {
    return { email: value.trim() };
  }
  return { name: value.trim() };
}

export function safeIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}
