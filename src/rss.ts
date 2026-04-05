import {
  FeedParserError,
  type ParsedAuthor,
  type ParsedFeed,
  type ParsedItem,
} from "./types.ts";
import { parseXml } from "./xml.ts";
import { parsePerson, safeIso, toArray, toObject, toText } from "./utils.ts";

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

function parseRssAuthors(channel: Record<string, unknown>): ParsedAuthor[] {
  const values = [
    ...toArray(channel.author as any),
    ...toArray(channel.webMaster as any),
    ...toArray(channel.managingEditor as any),
  ];

  const out: ParsedAuthor[] = [];
  for (const value of values) {
    const text = toText(value as any);
    const parsed = parsePerson(text);
    if (!parsed.name && !parsed.email) continue;

    const duplicate = out.some((author) =>
      author.name === parsed.name && author.email === parsed.email
    );
    if (!duplicate) out.push(parsed);
  }

  return out;
}

function parseRssItems(channel: Record<string, unknown>): ParsedItem[] {
  const entries = toArray(channel.item as any);
  return entries.map((entry, index) => {
    const item = toObject(entry as any);
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
      contentHtml: toText(item["content:encoded"] as any),
      datePublished: safeIso(toText(item.pubDate)),
    };
  });
}
