import fs from "fs";
import path from "path";
import sharp from "sharp";

const ARTS_PATH = path.resolve("src/data/arts.json");
const OUT_DIR = path.resolve("public/images/arts");
const MAX_WIDTH = 1280;
const UA = "DailySeed/1.0 (dailyseed.net@gmail.com)";

const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchWikimedia(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=10&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.query?.search || [];
}

async function getImageUrl(fileTitle) {
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=${MAX_WIDTH}&format=json`;
  const res = await fetch(infoUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  return info ? (info.thumburl || info.url) : null;
}

async function downloadImage(dlUrl, outPath) {
  const res = await fetch(dlUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) return false;
  const buffer = Buffer.from(await res.arrayBuffer());
  await sharp(buffer).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath);
  return true;
}

// Specific file titles for exact artworks
const exactFiles = {
  // Day 185: Daumier - The Bathers / Les Baigneurs
  // Try exact known Wikimedia file names
  185: [
    "File:Honoré Daumier 032.jpg",           // Known Daumier bathers
    "File:Honoré Daumier - Baigneurs.jpg",
    "File:Daumier - Baigneuses.jpg",
  ],
  // Day 211: Murillo - Return of the Prodigal Son
  211: [
    "File:Bartolomé Esteban Murillo - Return of the Prodigal Son - Google Art Project.jpg",
    "File:Murillo - The Return of the Prodigal Son.jpg",
    "File:Bartolomé Esteban Perez Murillo - The Return of the Prodigal Son.jpg",
  ],
};

// Also try search queries as fallback
const searchQueries = {
  185: ["Daumier baigneurs oil painting", "Honoré Daumier bathers oil canvas"],
  211: ["Murillo return prodigal son painting", "Murillo hijo prodigo pintura"],
};

async function tryExactFiles(dayNum, files) {
  const filename = `day-${dayNum}.webp`;
  const outPath = path.join(OUT_DIR, filename);

  for (const fileTitle of files) {
    console.log(`[Day ${dayNum}] Trying exact: ${fileTitle}`);
    const dlUrl = await getImageUrl(fileTitle);
    if (!dlUrl) {
      console.log(`  → not found`);
      continue;
    }

    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    const ok = await downloadImage(dlUrl, outPath);
    if (ok) {
      arts[dayNum - 1].image_url = `/images/arts/${filename}`;
      console.log(`  ✅ Downloaded!`);
      return true;
    }
    await sleep(1500);
  }
  return false;
}

async function trySearch(dayNum, queries) {
  const filename = `day-${dayNum}.webp`;
  const outPath = path.join(OUT_DIR, filename);

  for (const query of queries) {
    console.log(`[Day ${dayNum}] Searching: "${query}"`);
    const results = await searchWikimedia(query);

    for (const r of results) {
      if (!/\.(jpg|jpeg|png|tif|tiff)$/i.test(r.title)) continue;
      console.log(`  Candidate: ${r.title}`);

      const dlUrl = await getImageUrl(r.title);
      if (!dlUrl) continue;

      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      const ok = await downloadImage(dlUrl, outPath);
      if (ok) {
        arts[dayNum - 1].image_url = `/images/arts/${filename}`;
        console.log(`  ✅ Downloaded from: ${r.title}`);
        return true;
      }
    }
    await sleep(1500);
  }
  return false;
}

async function run() {
  for (const dayNum of [185, 211]) {
    let ok = await tryExactFiles(dayNum, exactFiles[dayNum]);
    if (!ok) {
      ok = await trySearch(dayNum, searchQueries[dayNum]);
    }
    if (!ok) {
      console.log(`❌ Day ${dayNum}: Could not find correct image`);
    }
    await sleep(2000);
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  console.log("\nDone!");
}

run();
