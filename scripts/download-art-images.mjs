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

// Extract filename from wikimedia URL
function getWikiFilename(url) {
  // e.g. https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Some_File.jpg/1280px-Some_File.jpg
  // or   https://upload.wikimedia.org/wikipedia/commons/5/5d/Some_File.jpg
  const match = url.match(/\/([^/]+\.(jpg|jpeg|png|svg|tif|tiff))(?:\/|$)/i);
  if (match) return `File:${decodeURIComponent(match[1])}`;
  return null;
}

// Get thumbnail URL via Wikimedia API (avoids direct hotlink rate limits)
async function getThumbnailUrl(imageUrl) {
  const fileTitle = getWikiFilename(imageUrl);
  if (!fileTitle) return null;

  try {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=${MAX_WIDTH}&format=json`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    return info?.thumburl || info?.url || null;
  } catch {
    return null;
  }
}

// Search Wikimedia Commons for art with no URL
async function searchWikimedia(title, artist) {
  const queries = [`${title} ${artist}`, `${title} painting`, title];

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

async function downloadOne(item, index) {
  const filename = `day-${index + 1}.webp`;
  const outPath = path.join(OUT_DIR, filename);

  // Already downloaded
  if (item.image_url?.startsWith("/images/")) {
    skipped++;
    return;
  }

  // Already have the file locally
  if (fs.existsSync(outPath)) {
    item.image_url = `/images/arts/${filename}`;
    updated++;
    skipped++;
    return;
  }

  let downloadUrl = null;

  if (item.image_url) {
    // Has a wikimedia URL — get thumbnail via API
    downloadUrl = await getThumbnailUrl(item.image_url);
    if (!downloadUrl) {
      // API lookup failed, try direct URL as fallback
      downloadUrl = item.image_url;
    }
  } else {
    // No URL — search Wikimedia Commons
    console.log(`[${index}] Searching: ${item.title} — ${item.artist}`);
    downloadUrl = await searchWikimedia(item.title, item.artist);
    if (!downloadUrl) {
      console.error(`[${index}] NOT FOUND: ${item.title}`);
      failed++;
      return;
    }
    console.log(`[${index}] Found URL for: ${item.title}`);
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
    await downloadOne(arts[i], i);
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  console.log(`\nDone! updated=${updated} failed=${failed} skipped=${skipped}`);
}

run();
