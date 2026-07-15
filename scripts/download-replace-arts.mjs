import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/images/arts");
const MAX_WIDTH = 1280;
const UA = "DailySeed/1.0 (dailyseed.net@gmail.com)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia Commons file titles for the 5 replacement artworks
const replacements = [
  { day: 14, file: "File:'David'_by_Michelangelo_Fir_JBU002.jpg", name: "다비드상" },
  { day: 46, file: "File:Ghent_Altarpiece_-_Adoration_of_the_Lamb.jpg", name: "겐트 제단화" },
  { day: 177, file: "File:Venus_de_Milo_Louvre_Ma399.jpg", name: "밀로의 비너스" },
  { day: 311, file: "File:Winged_Victory_of_Samothrace,_front.jpg", name: "사모트라케의 니케" },
  { day: 328, file: "File:Rodin_-_The_Gates_of_Hell_-_Mus%C3%A9e_Rodin.jpg", name: "지옥문" },
];

async function getImageUrl(fileTitle) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=${MAX_WIDTH}&format=json`;
  const res = await fetch(apiUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API failed: ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url || null;
}

async function searchAndGetUrl(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.query?.search || [];

  for (const r of results) {
    if (!/\.(jpg|jpeg|png|tif|tiff)$/i.test(r.title)) continue;
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(r.title)}&prop=imageinfo&iiprop=url&iiurlwidth=${MAX_WIDTH}&format=json`;
    const infoRes = await fetch(infoUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15000),
    });
    if (!infoRes.ok) continue;
    const infoData = await infoRes.json();
    const pages = infoData.query?.pages || {};
    const page = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    if (info?.thumburl || info?.url) return info.thumburl || info.url;
  }
  return null;
}

async function downloadAndConvert(imageUrl, outPath) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outPath);
}

async function main() {
  for (const item of replacements) {
    const outPath = path.join(OUT_DIR, `day-${item.day}.webp`);
    console.log(`\n[Day ${item.day}] ${item.name}...`);

    try {
      // Try direct file title first
      let url = await getImageUrl(item.file);

      // Fallback: search
      if (!url) {
        console.log(`  Direct lookup failed, searching...`);
        const searches = [
          item.name === "다비드상" ? "David Michelangelo sculpture" : null,
          item.name === "겐트 제단화" ? "Ghent Altarpiece Adoration Lamb" : null,
          item.name === "밀로의 비너스" ? "Venus de Milo Louvre" : null,
          item.name === "사모트라케의 니케" ? "Winged Victory Samothrace" : null,
          item.name === "지옥문" ? "Gates of Hell Rodin" : null,
        ].filter(Boolean);
        for (const q of searches) {
          url = await searchAndGetUrl(q);
          if (url) break;
        }
      }

      if (!url) {
        console.log(`  ❌ No image found`);
        continue;
      }

      console.log(`  Downloading: ${url.substring(0, 80)}...`);
      await downloadAndConvert(url, outPath);
      const stat = fs.statSync(outPath);
      console.log(`  ✅ Saved (${Math.round(stat.size / 1024)} KB)`);
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }

    await sleep(1500);
  }
}

main();
