import {
  detectFormat,
  FeedParserError,
  parseAtom,
  parseFeed,
  parseJsonFeed,
  parseRss,
} from "./mod.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

Deno.test("detectFormat detects RSS/Atom/JSON", () => {
  assertEquals(detectFormat("<rss version=\"2.0\"></rss>"), "rss", "Detect RSS");
  assertEquals(detectFormat("<feed xmlns=\"http://www.w3.org/2005/Atom\"></feed>"), "atom", "Detect Atom");
  assertEquals(detectFormat('{"version":"https://jsonfeed.org/version/1"}'), "json", "Detect JSON");
});

Deno.test("parseRss parses basic feed fields", () => {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RSS Example</title>
    <description>RSS Description</description>
    <link>https://example.com</link>
    <webMaster>owner@example.com (Owner)</webMaster>
    <item>
      <title>Item 1</title>
      <link>https://example.com/item-1</link>
      <guid>item-1</guid>
      <pubDate>Sat, 19 Oct 2024 15:12:56 GMT</pubDate>
      <description>Item description</description>
    </item>
  </channel>
</rss>`;

  const parsed = parseRss(rss);
  assertEquals(parsed.format, "rss", "Format");
  assertEquals(parsed.title, "RSS Example", "Title");
  assertEquals(parsed.items.length, 1, "Item count");
  assertEquals(parsed.items[0].id, "item-1", "Item id");
  assertEquals(parsed.authors[0].email, "owner@example.com", "Author email");
});

Deno.test("parseAtom parses feed and entry", () => {
  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Example</title>
  <subtitle>Atom Description</subtitle>
  <link rel="alternate" href="https://example.com"/>
  <id>https://example.com/feed</id>
  <updated>2024-10-19T15:12:56.000Z</updated>
  <author>
    <name>Jane</name>
    <uri>https://example.com/about</uri>
  </author>
  <entry>
    <title>Entry 1</title>
    <link href="https://example.com/entry-1"/>
    <id>entry-1</id>
    <updated>2024-10-19T15:12:56.000Z</updated>
    <summary>Entry summary</summary>
  </entry>
</feed>`;

  const parsed = parseAtom(atom);
  assertEquals(parsed.format, "atom", "Format");
  assertEquals(parsed.title, "Atom Example", "Title");
  assertEquals(parsed.items.length, 1, "Item count");
  assertEquals(parsed.items[0].id, "entry-1", "Entry id");
  assertEquals(parsed.authors[0].name, "Jane", "Author name");
});

Deno.test("parseJsonFeed parses feed and items", () => {
  const json = JSON.stringify({
    version: "https://jsonfeed.org/version/1",
    title: "JSON Example",
    home_page_url: "https://example.com",
    feed_url: "https://example.com/feed.json",
    date_modified: "2024-10-19T15:12:56.000Z",
    items: [
      {
        id: "1",
        title: "Post",
        url: "https://example.com/post",
        date_published: "2024-10-19T15:12:56.000Z",
        content_html: "<p>Hello</p>",
      },
    ],
  });

  const parsed = parseJsonFeed(json);
  assertEquals(parsed.format, "json", "Format");
  assertEquals(parsed.title, "JSON Example", "Title");
  assertEquals(parsed.items.length, 1, "Item count");
  assertEquals(parsed.items[0].id, "1", "Item id");
});

Deno.test("parseFeed auto-detects and parses", () => {
  const rss = "<rss version=\"2.0\"><channel><title>T</title></channel></rss>";
  const parsed = parseFeed(rss);
  assertEquals(parsed.format, "rss", "Auto format");
  assertEquals(parsed.title, "T", "Auto title");
});

Deno.test("parseFeed throws on unknown format", () => {
  let didThrow = false;
  try {
    parseFeed("not a feed");
  } catch (err) {
    didThrow = err instanceof FeedParserError;
  }
  assert(didThrow, "Expected FeedParserError for unknown format");
});

