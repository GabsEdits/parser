# @feed/parser

A zero-dependency feed parser for RSS, Atom, and JSON Feed.

## Install

```ts
import { parseFeed } from "jsr:@feed/parser";
```

## Usage

```ts
import { detectFormat, parseFeed } from "jsr:@feed/parser";

const input = await Deno.readTextFile("./feed.xml");
const format = detectFormat(input);
const parsed = parseFeed(input);

console.log(format, parsed.title, parsed.items.length);
```

## API

- `detectFormat(input: string): "rss" | "atom" | "json"`
- `parseFeed(input: string): ParsedFeed`
- `parseRss(input: string): ParsedFeed`
- `parseAtom(input: string): ParsedFeed`
- `parseJsonFeed(input: string): ParsedFeed`

