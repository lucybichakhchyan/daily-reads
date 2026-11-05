# Daily Reads

Daily Reads is the page I use to keep up with tech, developer and AI news. It collects headlines from a short list of sources into one clean page, with a tab for each topic.

**[Read it here](https://lucybichakhchyan.github.io/daily-reads/)**

## How it works

A GitHub Action runs about once an hour. It reads the feeds in `feeds.json`, saves each headline and link, and publishes the page to GitHub Pages. It saves no article text, and every headline links to the original publisher. It needs no API keys, and it keeps the last good page if every feed fails.

Links you open are dimmed in your own browser only.

## Change the sources

Edit `feeds.json` and push the change. Each feed needs an `id`, `name`, `tab` and `url`, and an optional `limit`. Add a new entry to `tabs` to create a new topic tab.

## Run the tests

Node.js 20 or later is required:

```bash
node --test scripts/
```

## Credits

Headlines and links belong to their publishers. The page uses my personal design system, with Playfair Display and Inter under the SIL Open Font License. Their licenses are in `fonts/`.

## License

The code is available under the [MIT License](LICENSE). This does not cover my avatar or the publishers' content.
