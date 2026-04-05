import { FeedParserError, type ParsedFeed, type ParsedItem } from "./types.ts";
import { ensureObject, safeIso } from "./utils.ts";

/**
 * Parses a JSON Feed 1.x document string into a normalised {@linkcode ParsedFeed}.
 *
 * @param input Raw JSON Feed text (must be valid JSON).
 * @returns A normalised {@linkcode ParsedFeed} with `format: "json"`.
 * @throws {FeedParserError} When the input is not valid JSON, the root is not
 *   an object, the version field is missing or unsupported, or the title is
 *   absent. Also thrown when any item is not an object.
 *
 * @example
 * ```ts
 * import { parseJsonFeed } from "jsr:@feed/parser";
 *
 * const feed = parseJsonFeed(jsonText);
 * console.log(feed.title, feed.items.length);
 * ```
 */
export function parseJsonFeed(input: string): ParsedFeed {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new FeedParserError("Invalid JSON Feed: malformed JSON");
  }

  const feed = ensureObject(data, "Invalid JSON Feed: expected object root");
  const version = typeof feed.version === "string" ? feed.version : "";
  if (!version.startsWith("https://jsonfeed.org/version/")) {
    throw new FeedParserError(
      "Invalid JSON Feed: unsupported or missing version",
    );
  }

  const title = typeof feed.title === "string" ? feed.title : undefined;
  if (!title) {
    throw new FeedParserError("Invalid JSON Feed: missing title");
  }

  const rawItems = Array.isArray(feed.items) ? feed.items : [];
  const items: ParsedItem[] = rawItems.map((item, index) => {
    const node = ensureObject(item, `Invalid JSON Feed item at index ${index}`);
    const id = typeof node.id === "string" ? node.id : `item-${index + 1}`;

    return {
      id,
      title: typeof node.title === "string" ? node.title : undefined,
      url: typeof node.url === "string" ? node.url : undefined,
      summary: typeof node.summary === "string" ? node.summary : undefined,
      contentText: typeof node.content_text === "string"
        ? node.content_text
        : undefined,
      contentHtml: typeof node.content_html === "string"
        ? node.content_html
        : undefined,
      datePublished: safeIso(
        typeof node.date_published === "string"
          ? node.date_published
          : undefined,
      ),
      dateModified: safeIso(
        typeof node.date_modified === "string" ? node.date_modified : undefined,
      ),
    };
  });

  return {
    format: "json",
    title,
    description: typeof feed.description === "string"
      ? feed.description
      : undefined,
    homePageUrl: typeof feed.home_page_url === "string"
      ? feed.home_page_url
      : undefined,
    feedUrl: typeof feed.feed_url === "string" ? feed.feed_url : undefined,
    dateModified: safeIso(
      typeof feed.date_modified === "string" ? feed.date_modified : undefined,
    ),
    authors: [],
    items,
    raw: feed,
  };
}
