const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => NAMED[name])
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : "";
}

function linkOf(block) {
  const links = block.match(/<link\b[^>]*>/g) ?? [];
  const atom = links.find((link) => /href=/.test(link) && !/rel="(?!alternate)/.test(link));
  if (atom) return atom.match(/href="([^"]+)"/)[1].replace(/&amp;/g, "&");
  return tag(block, "link");
}

/** Moves a closing "(Reporter/Publication)" out of a headline. */
export function splitAttribution(item) {
  const match = item.title.match(/^(.+?)\s*\(([^()]+)\)$/);
  if (!match) return item;
  const parts = match[2].split("/").map((part) => part.trim()).filter(Boolean);
  return {
    ...item,
    title: match[1],
    publisher: parts.at(-1),
    author: parts.length > 1 ? parts.slice(0, -1).join(" / ") : null,
  };
}

const isWebAddress = (url) => /^https?:\/\//.test(url);

/** Reads RSS or Atom text into headlines and links, with no article text. */
export function parseFeed(xml, source, limit = 30) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/g) ?? [];
  return blocks
    .map((block) => {
      const date = new Date(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated"));
      const comments = tag(block, "comments");
      return {
        source,
        title: tag(block, "title"),
        url: linkOf(block),
        date: Number.isNaN(date.getTime()) ? null : date.toISOString(),
        comments: isWebAddress(comments) ? comments : null,
      };
    })
    .filter((item) => item.title && isWebAddress(item.url))
    .slice(0, limit);
}
