import fs from "fs";
import path from "path";
import sharp from "sharp";

const ARTS_PATH = path.resolve("src/data/arts.json");
const OUT_DIR = path.resolve("public/images/arts");
const MAX_WIDTH = 1280;
const DELAY_MS = 2500;
const UA = "DailySeed/1.0 (dailyseed.net@gmail.com)";

const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
fs.mkdirSync(OUT_DIR, { recursive: true });

let updated = 0;
let failed = 0;
let skipped = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Manual English title mappings for artworks whose source_url is a File: reference
const englishTitles = {
  117: "Pilgrims Going to Mecca Jean-Leon Belly",
  120: "Concert Gerard van Honthorst",
  123: "Bridge at Narni Corot",
  191: "Uncertainty of the Poet Giorgio de Chirico",
  195: "Motherhood Eugène Carrière",
  207: "Portrait Old Woman Balthasar Denner",
  210: "Caesar crossing Rubicon",
  212: "Self-Portrait Ferdinand Bol",
  240: "Spanish Girl Robert Henri",
  243: "Moonlight night Dnieper Kuindzhi",
  247: "Vision Saint Augustine Carpaccio",
  248: "Embroiderer Georg Friedrich Kersting",
  250: "Bookworm Carl Spitzweg",
  265: "Winter Nicolas Lancret painting",
  266: "Bay Naples moonlight Aivazovsky",
  272: "Days Creation Edward Burne-Jones",
  274: "Kiss sculpture Brancusi",
  287: "Mnemosyne Dante Gabriel Rossetti",
  288: "Embarkation Cythera Watteau",
  294: "Oedipus Sphinx Gustave Moreau",
  308: "Still Life Shells Balthasar van der Ast",
  323: "Monastery Temptation David Roberts",
  325: "Battle Alexander Issus Altdorfer",
  326: "Woman Sewing Lamplight Millet",
  327: "Tower Babel Abel Grimmer",
  330: "Karl Bryullov painting",
  333: "Autumn Spies Grapes Promised Land Poussin",
  335: "Ships Distress Rocky Coast Bakhuizen",
  341: "Birch grove Ivan Shishkin",
  342: "Sunset Ivry Armand Guillaumin",
  343: "Coronation Virgin Fra Angelico",
  344: "Still Life Quince Cabbage Juan Sanchez Cotan",
  352: "Buchdruckerei Jost Amman printing",
  354: "Tommaso da Modena Dominican portrait",
  355: "Kiprensky portrait painting",
  358: "Mowers Grigoriy Myasoyedov",
  359: "Still Life Louise Moillon oranges",
};

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
  const dayNum = index + 1;
  const filename = `day-${dayNum}.webp`;
  const outPath = path.join(OUT_DIR, filename);

  // Already done
  if (item.image_url?.startsWith("/images/") || fs.existsSync(outPath)) {
    if (fs.existsSync(outPath)) item.image_url = `/images/arts/${filename}`;
    skipped++;
    return;
  }

  const enTitle = englishTitles[dayNum];
  if (!enTitle) {
    skipped++;
    return;
  }

  const queries = [enTitle, `${enTitle} painting`];
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
    if (englishTitles[i + 1]) await sleep(DELAY_MS);
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  console.log(`\nDone! updated=${updated} failed=${failed} skipped=${skipped}`);
}

run();
