import assert from "node:assert/strict";
import test from "node:test";
import { parseFeed } from "./parse.mjs";

test("reads an RSS item", () => {
  const [item] = parseFeed(`<rss><item><title><![CDATA[A &amp; B]]></title>
    <link>https://example.com/a</link><comments>https://example.com/c</comments>
    <pubDate>Wed, 04 Nov 2026 12:00:00 GMT</pubDate><description>Article text</description></item></rss>`, "demo");
  assert.deepEqual(item, {
    source: "demo",
    title: "A & B",
    url: "https://example.com/a",
    date: "2026-11-04T12:00:00.000Z",
    comments: "https://example.com/c",
  });
});

test("reads an Atom entry and prefers the alternate link", () => {
  const [item] = parseFeed(`<feed><entry><title>Atom post</title>
    <link rel="self" href="https://example.com/feed"/><link rel="alternate" href="https://example.com/post"/>
    <published>2026-11-04T12:00:00Z</published></entry></feed>`, "demo");
  assert.equal(item.url, "https://example.com/post");
});

test("drops anything without a web address", () => {
  assert.deepEqual(parseFeed("<rss><item><title>Bad</title><link>javascript:alert(1)</link></item></rss>", "demo"), []);
});
