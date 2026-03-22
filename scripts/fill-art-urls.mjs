import fs from "fs";
import path from "path";

const ARTS_PATH = path.resolve("src/data/arts.json");
const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchWikimedia(title, artist) {
  // Try multiple search queries
  const queries = [
    `${title} ${artist}`,
    `${title} painting`,
    title,
  ];

  for (const query of queries) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "DailySeed/1.0 (dailyseed.net@gmail.com)" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const results = data.query?.search || [];

      // Filter for image files
      for (const r of results) {
        const fileTitle = r.title; // e.g. "File:Something.jpg"
        if (!/\.(jpg|jpeg|png|svg|tif|tiff)$/i.test(fileTitle)) continue;

        // Get the actual image URL
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json`;
        const infoRes = await fetch(infoUrl, {
          headers: { "User-Agent": "DailySeed/1.0 (dailyseed.net@gmail.com)" },
          signal: AbortSignal.timeout(10000),
        });

        if (!infoRes.ok) continue;

        const infoData = await infoRes.json();
        const pages = infoData.query?.pages || {};
        const page = Object.values(pages)[0];
        const imageInfo = page?.imageinfo?.[0];

        if (imageInfo) {
          // Use thumbnail URL (resized) if available, otherwise original
          const imgUrl = imageInfo.thumburl || imageInfo.url;
          return imgUrl;
        }
      }
    } catch (err) {
      // Try next query
    }
  }

  return null;
}

async function run() {
  let filled = 0;
  let notFound = 0;
  let alreadyHas = 0;

  for (let i = 0; i < arts.length; i++) {
    const item = arts[i];

    // Skip items that already have an image URL
    if (item.image_url) {
      alreadyHas++;
      continue;
    }

    console.log(`[${i}] Searching: ${item.title} — ${item.artist}`);
    const url = await searchWikimedia(item.title, item.artist);

    if (url) {
      item.image_url = url;
      filled++;
      console.log(`  → Found: ${url.substring(0, 80)}...`);
    } else {
      notFound++;
      console.log(`  → Not found`);
    }

    await sleep(1000);
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  console.log(`\nDone! filled=${filled} notFound=${notFound} alreadyHas=${alreadyHas}`);
}

run();
