import {
  FeedParserError,
  type ParsedAuthor,
  type ParsedFeed,
  type ParsedItem,
} from "./types.ts";
import { parseXml, type XmlObject } from "./xml.ts";
import { safeIso, toArray, toObject, toText } from "./utils.ts";

export function parseAtom(input: string): ParsedFeed {
  const doc = parseXml(input);
  const feed = toObject(doc.feed);
  if (!feed) {
    throw new FeedParserError("Invalid Atom feed: missing <feed> root");
  }

  const title = toText(feed.title);
  if (!title) {
    throw new FeedParserError("Invalid Atom feed: missing feed title");
  }

  return {
    format: "atom",
    title,
    description: toText(feed.subtitle),
    homePageUrl: pickAtomLink(feed, "alternate"),
    feedUrl: pickAtomLink(feed, "self"),
    id: toText(feed.id),
    dateModified: safeIso(toText(feed.updated)),
    authors: parseAtomAuthors(feed),
    items: parseAtomEntries(feed),
    raw: doc,
  };
}

function parseAtomAuthors(feed: XmlObject): ParsedAuthor[] {
  const authors = toArray(feed.author);
  return authors.map((author) => {
    const node = toObject(author);
    if (!node) return {};

    return {
      name: toText(node.name),
      email: toText(node.email),
      url: toText(node.uri),
    };
  }).filter((author) => author.name || author.email || author.url);
}

function parseAtomEntries(feed: XmlObject): ParsedItem[] {
  const entries = toArray(feed.entry);
  return entries.map((entry, index) => {
    const node = toObject(entry);
    if (!node) {
      throw new FeedParserError(`Invalid Atom entry at index ${index}`);
    }

    const id = toText(node.id) ?? toText(node.title) ?? `entry-${index + 1}`;
    const content = toObject(node.content);
    const contentType = toText(content?.["@_type"]);

    return {
      id,
      title: toText(node.title),
      url: pickAtomLink(node),
      summary: toText(node.summary),
      contentText: content ? toText(content["#text"]) : toText(node.content),
      contentHtml: content && contentType === "html"
        ? toText(content["#text"])
        : undefined,
      datePublished: safeIso(toText(node.published)),
      dateModified: safeIso(toText(node.updated)),
    };
  });
}

function pickAtomLink(
  node: XmlObject,
  rel = "alternate",
): string | undefined {
  const links = toArray(node.link);

  for (const link of links) {
    const linkObj = toObject(link);
    if (!linkObj) continue;

    const href = toText(linkObj["@_href"]);
    const linkRel = toText(linkObj["@_rel"]) ?? "alternate";
    if (href && linkRel === rel) {
      return href;
    }
  }

  return undefined;
}
