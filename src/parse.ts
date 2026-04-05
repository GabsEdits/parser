import { parseAtom } from "./atom.ts";
import { parseJsonFeed } from "./json.ts";
import { parseRss } from "./rss.ts";
import { type FeedFormat, FeedParserError, type ParsedFeed } from "./types.ts";
import { detectXmlKind } from "./utils.ts";

/**
 * Detects the wire format of a raw feed string.
 *
 * Inspects the beginning of the input to determine whether it is an RSS 2.0
 * document, an Atom 1.0 document, or a JSON Feed.
 *
 * @param input Raw feed text (XML or JSON).
 * @returns `"rss"`, `"atom"`, or `"json"`.
 * @throws {FeedParserError} When the format cannot be determined.
 *
 * @example
 * ```ts
 * import { detectFormat } from "jsr:@feed/parser";
 *
 * const format = detectFormat('<rss version="2.0">…</rss>'); // "rss"
 * ```
 */
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

/**
 * Auto-detects the format of `input` and returns a normalised {@linkcode ParsedFeed}.
 *
 * Delegates to {@linkcode parseRss}, {@linkcode parseAtom}, or
 * {@linkcode parseJsonFeed} based on the result of {@linkcode detectFormat}.
 *
 * @param input Raw feed text (XML or JSON).
 * @returns A normalised {@linkcode ParsedFeed} object.
 * @throws {FeedParserError} When the format is unknown or the document is invalid.
 *
 * @example
 * ```ts
 * import { parseFeed } from "jsr:@feed/parser";
 *
 * const feed = parseFeed(xmlOrJson);
 * console.log(feed.format, feed.title);
 * ```
 */
export function parseFeed(input: string): ParsedFeed {
  const format = detectFormat(input);
  if (format === "rss") return parseRss(input);
  if (format === "atom") return parseAtom(input);
  return parseJsonFeed(input);
}

export { parseAtom, parseJsonFeed, parseRss };
