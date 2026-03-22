import fs from "fs";
import path from "path";
import sharp from "sharp";

const ARTS_PATH = path.resolve("src/data/arts.json");
const OUT_DIR = path.resolve("public/images/arts");
const MAX_WIDTH = 1280;
const DELAY_MS = 2000;
const UA = "DailySeed/1.0 (dailyseed.net@gmail.com)";

const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
fs.mkdirSync(OUT_DIR, { recursive: true });

let updated = 0;
let failed = 0;
let skipped = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Extract English title from source_url
// e.g. https://en.wikipedia.org/wiki/The_Two_Fridas → "The Two Fridas"
// e.g. https://en.wikipedia.org/wiki/Pandora_(Rossetti_painting) → "Pandora"
function extractEnglishTitle(sourceUrl) {
  if (!sourceUrl) return null;
  const match = sourceUrl.match(/\/wiki\/(.+)$/);
  if (!match) return null;
  let title = decodeURIComponent(match[1]);
  // Remove disambiguation like "(Rossetti_painting)"
  title = title.replace(/_\(.*?\)$/, "").replace(/\(.*?\)$/, "");
  title = title.replace(/_/g, " ").trim();
  return title;
}

// Search Wikimedia Commons with English title
async function searchWikimedia(queries) {
  for (const query of queries) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const results = data.query?.search || [];

      for (const r of results) {
        if (!/\.(jpg|jpeg|png|tif|tiff)$/i.test(r.title)) continue;

        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(r.title)}&prop=imageinfo&iiprop=url&iiurlwidth=${MAX_WIDTH}&format=json`;
        const infoRes = await fetch(infoUrl, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(10000),
        });
        if (!infoRes.ok) continue;

        const infoData = await infoRes.json();
        const pages = infoData.query?.pages || {};
        const page = Object.values(pages)[0];
        const info = page?.imageinfo?.[0];
        if (info) return info.thumburl || info.url;
      }
    } catch {
      // try next query
    }
  }
  return null;
}

async function processOne(item, index) {
  const filename = `day-${index + 1}.webp`;
  const outPath = path.join(OUT_DIR, filename);

  // Already done
  if (item.image_url?.startsWith("/images/") || fs.existsSync(outPath)) {
    if (fs.existsSync(outPath)) item.image_url = `/images/arts/${filename}`;
    skipped++;
    return;
  }

  const enTitle = extractEnglishTitle(item.source_url);
  if (!enTitle) {
    console.error(`[${index}] NO EN TITLE: ${item.title}`);
    failed++;
    return;
  }

  // Build search queries: English title + artist, English title + painting, English title alone
  const queries = [
    `${enTitle} painting`,
    enTitle,
    `${enTitle} ${item.artist}`,
  ];

  console.log(`[${index}] Searching: "${enTitle}" (${item.title})`);
  const downloadUrl = await searchWikimedia(queries);

  if (!downloadUrl) {
    console.error(`[${index}] NOT FOUND: ${enTitle} (${item.title})`);
    failed++;
    return;
  }

  try {
    const res = await fetch(downloadUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[${index}] HTTP ${res.status}: ${item.title}`);
      failed++;
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    item.image_url = `/images/arts/${filename}`;
    updated++;
    console.log(`[${index}] OK: ${item.title} → ${filename}`);
  } catch (err) {
    console.error(`[${index}] FAIL: ${item.title} — ${err.message}`);
    failed++;
  }
}

async function run() {
  for (let i = 0; i < arts.length; i++) {
    await processOne(arts[i], i);
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  console.log(`\nDone! updated=${updated} failed=${failed} skipped=${skipped}`);
}

run();
