/** The wire format of a parsed feed. */
export type FeedFormat = "rss" | "atom" | "json";

/** A person or organisation associated with a feed or feed item. */
export interface ParsedAuthor {
  /** Display name of the author. */
  name?: string;
  /** E-mail address of the author. */
  email?: string;
  /** URL of the author's website or profile. */
  url?: string;
}

/** A single entry / article within a feed. */
export interface ParsedItem {
  /**
   * Stable, unique identifier for the item.
   * Derived from `guid`, `id`, the item URL, or the title as a fallback.
   */
  id: string;
  /** Title of the item. */
  title?: string;
  /** Canonical URL of the item. */
  url?: string;
  /** Short plain-text summary. */
  summary?: string;
  /** Full plain-text body of the item. */
  contentText?: string;
  /** Full HTML body of the item. */
  contentHtml?: string;
  /** ISO 8601 publication date. */
  datePublished?: string;
  /** ISO 8601 last-modified date. */
  dateModified?: string;
  /** Authors specific to this item (not always present). */
  authors?: ParsedAuthor[];
}

/** Normalised representation of an RSS, Atom, or JSON Feed document. */
export interface ParsedFeed {
  /** Original wire format of the feed. */
  format: FeedFormat;
  /** Title of the feed. */
  title: string;
  /** Short description or subtitle of the feed. */
  description?: string;
  /** URL of the website the feed belongs to. */
  homePageUrl?: string;
  /** Self-referential URL of the feed document. */
  feedUrl?: string;
  /** Globally unique identifier for the feed (Atom / JSON Feed). */
  id?: string;
  /** BCP 47 language tag for the feed's primary language (RSS). */
  language?: string;
  /** ISO 8601 date the feed was last updated. */
  dateModified?: string;
  /** Authors of the feed. */
  authors: ParsedAuthor[];
  /** Items / entries contained in the feed. */
  items: ParsedItem[];
  /** Raw parsed document as returned by the underlying parser. */
  raw?: unknown;
}

/**
 * Thrown when a feed cannot be parsed or does not conform to a known format.
 *
 * @example
 * ```ts
 * import { parseFeed, FeedParserError } from "jsr:@feed/parser";
 *
 * try {
 *   parseFeed("not a feed");
 * } catch (err) {
 *   if (err instanceof FeedParserError) {
 *     console.error("Bad feed:", err.message);
 *   }
 * }
 * ```
 */
export class FeedParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedParserError";
  }
}
