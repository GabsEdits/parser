/**
 * @module
 *
 * Zero-dependency feed parser for RSS 2.0, Atom 1.0, and JSON Feed 1.x.
 *
 * Use {@linkcode parseFeed} to auto-detect and parse any supported format, or
 * call the format-specific parsers ({@linkcode parseRss}, {@linkcode parseAtom},
 * {@linkcode parseJsonFeed}) directly.
 *
 * @example Auto-detect and parse a feed
 * ```ts
 * import { parseFeed } from "jsr:@feed/parser";
 *
 * const xml = await Deno.readTextFile("./feed.xml");
 * const feed = parseFeed(xml);
 * console.log(feed.title, feed.items.length);
 * ```
 *
 * @example Detect format before parsing
 * ```ts
 * import { detectFormat, parseFeed } from "jsr:@feed/parser";
 *
 * const input = await Deno.readTextFile("./feed.xml");
 * const format = detectFormat(input); // "rss" | "atom" | "json"
 * const feed = parseFeed(input);
 * console.log(format, feed.title);
 * ```
 */
export {
  detectFormat,
  parseAtom,
  parseFeed,
  parseJsonFeed,
  parseRss,
} from "./src/parse.ts";

export type {
  FeedFormat,
  ParsedAuthor,
  ParsedFeed,
  ParsedItem,
} from "./src/types.ts";

export { FeedParserError } from "./src/types.ts";
