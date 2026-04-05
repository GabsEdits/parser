import { FeedParserError } from "./types.ts";

interface XmlNode {
  name: string;
  attributes: Record<string, string>;
  children: XmlNode[];
  text: string;
}

export interface XmlObject {
  [key: string]: XmlValue;
}

export type XmlValue = string | XmlObject | XmlValue[];

export function parseXml(xml: string): XmlObject {
  const root: XmlNode = {
    name: "__root__",
    attributes: {},
    children: [],
    text: "",
  };
  const stack: XmlNode[] = [root];
  const tokenPattern = /<[^>]+>|[^<]+/g;

  for (const token of xml.match(tokenPattern) ?? []) {
    if (token.startsWith("<")) {
      if (
        token.startsWith("<?") ||
        token.startsWith("<!--") ||
        token.startsWith("<!DOCTYPE") ||
        token.startsWith("<![CDATA[")
      ) {
        continue;
      }

      const closeMatch = token.match(/^<\s*\/\s*([^\s>]+)\s*>$/);
      if (closeMatch) {
        const closing = closeMatch[1];
        const current = stack.pop();
        if (!current || current.name !== closing) {
          throw new FeedParserError(
            `XML parse error: unexpected closing tag </${closing}>`,
          );
        }
        continue;
      }

      const selfClosing = /\/>\s*$/.test(token);
      const openMatch = token.match(/^<\s*([^\s/>]+)([\s\S]*?)\/?\s*>$/);
      if (!openMatch) {
        throw new FeedParserError(`XML parse error: invalid tag ${token}`);
      }

      const [, name, rawAttrs] = openMatch;
      const node: XmlNode = {
        name,
        attributes: parseAttributes(rawAttrs),
        children: [],
        text: "",
      };

      stack[stack.length - 1].children.push(node);
      if (!selfClosing) {
        stack.push(node);
      }
      continue;
    }

    stack[stack.length - 1].text += token;
  }

  if (stack.length !== 1) {
    const unclosed = stack[stack.length - 1].name;
    throw new FeedParserError(`XML parse error: unclosed tag <${unclosed}>`);
  }

  const result: XmlObject = {};
  for (const child of root.children) {
    result[child.name] = nodeToValue(child);
  }
  return result;
}

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrPattern = /([:\w.-]+)\s*=\s*(["'])(.*?)\2/g;
  for (const match of raw.matchAll(attrPattern)) {
    attributes[match[1]] = match[3];
  }
  return attributes;
}

function nodeToValue(node: XmlNode): XmlValue {
  const hasAttributes = Object.keys(node.attributes).length > 0;
  const hasChildren = node.children.length > 0;
  const text = node.text.trim();

  if (!hasAttributes && !hasChildren) {
    return text;
  }

  const value: XmlObject = {};
  for (const [key, attrValue] of Object.entries(node.attributes)) {
    value[`@_${key}`] = attrValue;
  }

  for (const child of node.children) {
    const childValue = nodeToValue(child);
    const existing = value[child.name];
    if (existing === undefined) {
      value[child.name] = childValue;
    } else if (Array.isArray(existing)) {
      existing.push(childValue);
    } else {
      value[child.name] = [existing, childValue];
    }
  }

  if (text) {
    value["#text"] = text;
  }

  return value;
}


