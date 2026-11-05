import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseFeed } from "./parse.mjs";

const { tabs, feeds } = JSON.parse(await readFile("feeds.json", "utf8"));

async function load(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: { "User-Agent": "daily-reads (+https://github.com/lucybichakhchyan/daily-reads)" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const items = parseFeed(await response.text(), feed.id, feed.limit);
    if (!items.length) throw new Error("no headlines found");
    return { ok: true, items };
  } catch (error) {
    console.error(`${feed.name}: ${error.message}`);
    return { ok: false, items: [] };
  }
}

const results = await Promise.all(feeds.map(load));
const working = results.filter((result) => result.ok).length;
if (!working) throw new Error("Every feed failed, so the last good page was kept.");

await mkdir("data", { recursive: true });
await writeFile("data/feeds.json", JSON.stringify({
  updatedAt: new Date().toISOString(),
  tabs,
  sources: feeds.map(({ id, name, tab }, index) => ({ id, name, tab, ok: results[index].ok })),
  items: results.flatMap((result) => result.items),
}, null, 2));
console.log(`Saved headlines from ${working} of ${feeds.length} feeds.`);
