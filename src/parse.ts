import { parseAtom } from "./atom.ts";
import { parseJsonFeed } from "./json.ts";
import { parseRss } from "./rss.ts";
import { type FeedFormat, FeedParserError, type ParsedFeed } from "./types.ts";
import { detectXmlKind } from "./utils.ts";

export function detectFormat(input: string): FeedFormat {
  const text = input.trim();
  if (!text) {
    throw new FeedParserError("Unable to detect format: input is empty");
  }

  if (text.startsWith("{")) {
    return "json";
  }

  const kind = detectXmlKind(text);
  if (kind === "rss" || kind === "atom") {
    return kind;
  }

  throw new FeedParserError("Unable to detect feed format");
}

export function parseFeed(input: string): ParsedFeed {
  const format = detectFormat(input);
  if (format === "rss") return parseRss(input);
  if (format === "atom") return parseAtom(input);
  return parseJsonFeed(input);
}

export { parseAtom, parseJsonFeed, parseRss };
