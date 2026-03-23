import fs from "fs";
import path from "path";
import sharp from "sharp";
import Anthropic from "@anthropic-ai/sdk";

// Parse .env
const envFile = fs.readFileSync(path.resolve(".env"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  process.env[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
}

const RESULTS_PATH = path.resolve("scripts/verify-results.json");
const ARTS_PATH = path.resolve("src/data/arts.json");
const IMAGES_DIR = path.resolve("public/images/arts");
const LOG_PATH = path.resolve("scripts/fix-art-log.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FROM_IDX = (() => { const i = args.indexOf("--from"); return i !== -1 ? parseInt(args[i+1]) : 0; })();
const TO_IDX = (() => { const i = args.indexOf("--to"); return i !== -1 ? parseInt(args[i+1]) : 9999; })();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const client = new Anthropic();

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
const mismatches = results.filter((r) => r.match === false);

function loadLog() {
  try { return JSON.parse(fs.readFileSync(LOG_PATH, "utf-8")); }
  catch { return []; }
}
function saveLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + "\n");
}

// Use Haiku to get English title for Wikimedia search
async function getEnglishInfo(title, artist) {
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `What is the standard English title and artist name for this artwork?
Title (Korean): "${title}"
Artist (Korean): "${artist}"

Reply in JSON only: {"en_title": "...", "en_artist": "...", "alt_titles": ["..."]}
Include common alternative titles in alt_titles. JSON only.`
    }]
  });
  const text = resp.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); }
  catch { return null; }
}

// Search Wikimedia Commons with multiple query strategies
async function searchWikimedia(enTitle, enArtist, altTitles = []) {
  const queries = [
    `"${enTitle}" ${enArtist}`,
    `${enTitle} ${enArtist} painting`,
    `${enTitle} ${enArtist}`,
    ...altTitles.map(t => `${t} ${enArtist}`),
    enTitle,
  ];

  for (const query of queries) {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
      const searchResp = await fetch(searchUrl);
      const searchData = await searchResp.json();

      if (!searchData.query?.search?.length) continue;

      for (const result of searchData.query.search) {
        const fileTitle = result.title;
        if (/\.(svg|pdf|ogg|ogv|webm|mp3|mp4|wav|flac|djvu|tif|tiff)$/i.test(fileTitle)) continue;

        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&format=json`;
        const infoResp = await fetch(infoUrl);
        const infoData = await infoResp.json();
        const pages = infoData.query?.pages;
        if (!pages) continue;

        const page = Object.values(pages)[0];
        const imageInfo = page?.imageinfo?.[0];
        if (!imageInfo) continue;
        if (!imageInfo.mime?.startsWith("image/")) continue;
        if (imageInfo.width < 300 || imageInfo.height < 300) continue;

        return {
          url: imageInfo.url,
          fileTitle,
          width: imageInfo.width,
          height: imageInfo.height,
          source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle).replace(/%20/g, '_')}`,
        };
      }
    } catch (err) {
      // skip
    }
    await sleep(300);
  }
  return null;
}

// Download image and convert to webp with retry
async function downloadAndConvert(url, outputPath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'DailySeedBot/1.0 (https://dailyseed.net; jinmahnseo@gmail.com) node-fetch',
          'Accept': 'image/*',
        }
      });
      if (resp.status === 429) {
        const wait = attempt * 10000;
        console.log(`    429 - waiting ${wait/1000}s (attempt ${attempt}/${retries})`);
        await sleep(wait);
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buffer = Buffer.from(await resp.arrayBuffer());

      await sharp(buffer)
        .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      return fs.statSync(outputPath).size;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(5000);
    }
  }
  throw new Error("Max retries exceeded");
}

async function run() {
  console.log(`총 불일치: ${mismatches.length}건`);
  console.log(`처리 범위: index ${FROM_IDX} ~ ${TO_IDX}`);
  if (DRY_RUN) console.log("** DRY RUN **\n");

  const log = loadLog();
  const doneDays = new Set(log.filter(l => l.status === "replaced" || l.status === "found_dry").map(l => l.day));

  const items = mismatches.slice(FROM_IDX, TO_IDX + 1).filter(m => !doneDays.has(m.day));
  console.log(`처리 대상: ${items.length}건 (${doneDays.size}건 이미 처리됨)\n`);

  let success = 0, failed = 0;

  for (let i = 0; i < items.length; i++) {
    const m = items[i];
    const dayNum = m.day;
    const art = arts[dayNum - 1];

    console.log(`[${i+1}/${items.length}] Day ${dayNum}: "${art.title}" by ${art.artist}`);

    // Step 1: Get English title
    const enInfo = await getEnglishInfo(art.title, art.artist);
    if (!enInfo) {
      console.log(`  Failed to get English title`);
      log.push({ day: dayNum, status: "translate_error", title: art.title });
      failed++;
      continue;
    }
    console.log(`  EN: "${enInfo.en_title}" by ${enInfo.en_artist}`);

    // Step 2: Search Wikimedia
    const result = await searchWikimedia(enInfo.en_title, enInfo.en_artist, enInfo.alt_titles || []);

    if (result) {
      console.log(`  Found: ${result.fileTitle}`);

      if (!DRY_RUN) {
        try {
          const outputPath = path.join(IMAGES_DIR, `day-${dayNum}.webp`);
          const size = await downloadAndConvert(result.url, outputPath);
          console.log(`  Saved: ${(size/1024).toFixed(0)}KB`);

          arts[dayNum - 1].source_url = result.source_url;
          arts[dayNum - 1].source_label = "Wikimedia Commons";

          log.push({
            day: dayNum, status: "replaced",
            title: art.title, en_title: enInfo.en_title,
            wikimedia_file: result.fileTitle, source_url: result.source_url,
          });
          success++;
        } catch (err) {
          console.error(`  Download error: ${err.message}`);
          log.push({ day: dayNum, status: "download_error", title: art.title, error: err.message });
          failed++;
        }
      } else {
        log.push({ day: dayNum, status: "found_dry", title: art.title, en_title: enInfo.en_title, wikimedia_file: result.fileTitle });
        success++;
      }
    } else {
      console.log(`  NOT FOUND on Wikimedia`);
      log.push({ day: dayNum, status: "not_found", title: art.title, en_title: enInfo.en_title, artist: art.artist, en_artist: enInfo.en_artist });
      failed++;
    }

    if ((i + 1) % 5 === 0) {
      saveLog(log);
      if (!DRY_RUN) fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
      console.log(`  [saved]\n`);
    }

    await sleep(8000); // 8s to avoid Wikimedia rate limit
  }

  saveLog(log);
  if (!DRY_RUN) fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${success}, 실패(못 찾음): ${failed}`);

  const notFound = log.filter(l => l.status === "not_found");
  if (notFound.length > 0) {
    console.log(`\n=== 못 찾은 항목 (대체 작품 필요) ===`);
    notFound.forEach(l => console.log(`  Day ${l.day}: "${l.title}" (${l.artist}) / EN: "${l.en_title}"`));
  }
}

run();
