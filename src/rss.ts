import {
  FeedParserError,
  type ParsedAuthor,
  type ParsedFeed,
  type ParsedItem,
} from "./types.ts";
import { parseXml, type XmlObject, type XmlValue } from "./xml.ts";
import { parsePerson, safeIso, toArray, toObject, toText } from "./utils.ts";

/**
 * Parses an RSS 2.0 feed string into a normalised {@linkcode ParsedFeed}.
 *
 * @param input Raw RSS 2.0 XML text.
 * @returns A normalised {@linkcode ParsedFeed} with `format: "rss"`.
 * @throws {FeedParserError} When required elements (`<rss>`, `<channel>`, or
 *   `<title>`) are missing or when an `<item>` is structurally invalid.
 *
 * @example
 * ```ts
 * import { parseRss } from "jsr:@feed/parser";
 *
 * const feed = parseRss(xmlText);
 * console.log(feed.title, feed.items.length);
 * ```
 */
export function parseRss(input: string): ParsedFeed {
  const doc = parseXml(input);
  const rss = toObject(doc.rss);
  if (!rss) {
    throw new FeedParserError("Invalid RSS feed: missing <rss> root");
  }

  const channel = toObject(rss.channel);
  if (!channel) {
    throw new FeedParserError("Invalid RSS feed: missing <channel>");
  }

  const title = toText(channel.title);
  if (!title) {
    throw new FeedParserError("Invalid RSS feed: missing channel title");
  }

  const authors = parseRssAuthors(channel);
  const items = parseRssItems(channel);

  return {
    format: "rss",
    title,
    description: toText(channel.description),
    homePageUrl: toText(channel.link),
    language: toText(channel.language),
    dateModified: safeIso(toText(channel.lastBuildDate)),
    authors,
    items,
    raw: doc,
  };
}

function parseRssAuthors(channel: XmlObject): ParsedAuthor[] {
  const values = [
    ...toArray(channel.author),
    ...toArray(channel.webMaster),
    ...toArray(channel.managingEditor),
  ];

  const out: ParsedAuthor[] = [];
  for (const value of values) {
    const text = toText(value);
    const parsed = parsePerson(text);
    if (!parsed.name && !parsed.email) continue;

    const duplicate = out.some((author) =>
      author.name === parsed.name && author.email === parsed.email
    );
    if (!duplicate) out.push(parsed);
  }

  return out;
}

function parseRssItems(channel: XmlObject): ParsedItem[] {
  const entries = toArray(channel.item);
  return entries.map((entry, index) => {
    const item = toObject(entry);
    if (!item) {
      throw new FeedParserError(`Invalid RSS item at index ${index}`);
    }

    const guid = toText(item.guid);
    const link = toText(item.link);
    const title = toText(item.title);

    return {
      id: guid ?? link ?? title ?? `item-${index + 1}`,
      title,
      url: link,
      summary: toText(item.description),
      contentHtml: toText(item["content:encoded"] as XmlValue | undefined),
      datePublished: safeIso(toText(item.pubDate)),
    };
  });
}
