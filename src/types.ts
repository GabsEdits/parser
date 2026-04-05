export type FeedFormat = "rss" | "atom" | "json";

export interface ParsedAuthor {
  name?: string;
  email?: string;
  url?: string;
}

export interface ParsedItem {
  id: string;
  title?: string;
  url?: string;
  summary?: string;
  contentText?: string;
  contentHtml?: string;
  datePublished?: string;
  dateModified?: string;
  authors?: ParsedAuthor[];
}

export interface ParsedFeed {
  format: FeedFormat;
  title: string;
  description?: string;
  homePageUrl?: string;
  feedUrl?: string;
  id?: string;
  language?: string;
  dateModified?: string;
  authors: ParsedAuthor[];
  items: ParsedItem[];
  raw?: unknown;
}

export class FeedParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedParserError";
  }
}
