import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// Parse .env — handle = in values
const envFile = fs.readFileSync(path.resolve(".env"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx).trim();
  const val = trimmed.substring(eqIdx + 1).trim();
  process.env[key] = val;
}

// Parse CLI args: --from N --to N
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? parseInt(args[idx + 1]) : defaultVal;
}
const FROM_DAY = getArg("from", 1);
const TO_DAY = getArg("to", 365);

const ARTS_PATH = path.resolve("src/data/arts.json");
const IMAGES_DIR = path.resolve("public/images/arts");
const OUTPUT_PATH = path.resolve("scripts/verify-results.json");

const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
const client = new Anthropic();

const BATCH_SIZE = 3;
const SAVE_EVERY = 5; // save every N batches
const DELAY_MS = 20000; // 20s to stay under 10k tokens/min rate limit
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Load existing results for resume
function loadExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveResults(results) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2) + "\n");
}

async function verifyBatch(batch) {
  const content = [];

  for (const { dayNum, title, artist, imagePath } of batch) {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString("base64");

    content.push({
      type: "text",
      text: `[Day ${dayNum}] 등록된 정보: "${title}" by ${artist}`,
    });
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/webp",
        data: base64,
      },
    });
  }

  content.push({
    type: "text",
    text: `위 ${batch.length}개 이미지를 각각 분석해주세요.
각 이미지에 대해 다음 JSON 형식으로 응답해주세요:
[
  {
    "day": Day번호,
    "registered_title": "등록된 제목",
    "registered_artist": "등록된 작가",
    "identified_title": "이미지에서 식별한 실제 작품명",
    "identified_artist": "이미지에서 식별한 실제 작가",
    "match": true/false,
    "confidence": "high/medium/low",
    "note": "불일치 시 설명"
  }
]
JSON만 응답하세요.`,
  });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Failed to parse response:", text.substring(0, 200));
    return batch.map((b) => ({
      day: b.dayNum,
      registered_title: b.title,
      registered_artist: b.artist,
      match: null,
      note: "Parse error",
    }));
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    console.error("JSON parse error:", text.substring(0, 200));
    return batch.map((b) => ({
      day: b.dayNum,
      registered_title: b.title,
      registered_artist: b.artist,
      match: null,
      note: "JSON parse error",
    }));
  }
}

async function run() {
  const existing = loadExisting();
  const doneDays = new Set(
    existing.filter((r) => r.match !== null).map((r) => r.day)
  );

  console.log(`Range: Day ${FROM_DAY} ~ ${TO_DAY}`);
  console.log(`Already verified: ${doneDays.size} days (will skip)`);

  const items = [];
  for (let i = FROM_DAY - 1; i < Math.min(TO_DAY, arts.length); i++) {
    const dayNum = i + 1;
    if (doneDays.has(dayNum)) continue;
    const imagePath = path.join(IMAGES_DIR, `day-${dayNum}.webp`);
    if (!fs.existsSync(imagePath)) {
      console.log(`Day ${dayNum}: image not found, skipping`);
      continue;
    }
    items.push({
      dayNum,
      title: arts[i].title,
      artist: arts[i].artist,
      imagePath,
    });
  }

  if (items.length === 0) {
    console.log("Nothing to verify in this range.");
    return;
  }

  console.log(`To verify: ${items.length} images\n`);

  // Start with existing valid results (keep results outside our range)
  const allResults = existing.filter((r) => r.match !== null);
  const mismatches = [];
  let batchesSinceSave = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(items.length / BATCH_SIZE);

    console.log(
      `Batch ${batchNum}/${totalBatches}: Day ${batch[0].dayNum}-${batch[batch.length - 1].dayNum}`
    );

    try {
      const results = await verifyBatch(batch);
      allResults.push(...results);

      for (const r of results) {
        if (r.match === false) {
          mismatches.push(r);
          console.log(
            `  X Day ${r.day}: "${r.registered_title}" -> "${r.identified_title}" (${r.confidence})`
          );
        } else if (r.match === null) {
          console.log(`  ? Day ${r.day}: uncertain`);
        }
      }
    } catch (err) {
      console.error(`  Batch error: ${err.message}`);
      for (const b of batch) {
        allResults.push({
          day: b.dayNum,
          registered_title: b.title,
          registered_artist: b.artist,
          match: null,
          note: `Error: ${err.message}`,
        });
      }
    }

    batchesSinceSave++;
    if (batchesSinceSave >= SAVE_EVERY) {
      // Sort by day and save
      allResults.sort((a, b) => a.day - b.day);
      saveResults(allResults);
      console.log(`  [saved ${allResults.length} results]\n`);
      batchesSinceSave = 0;
    }

    if (i + BATCH_SIZE < items.length) await sleep(DELAY_MS);
  }

  // Final save
  allResults.sort((a, b) => a.day - b.day);
  saveResults(allResults);

  // Summary
  const matched = allResults.filter((r) => r.match === true).length;
  const unmatched = allResults.filter((r) => r.match === false).length;
  const unknown = allResults.filter((r) => r.match === null).length;

  console.log(`\n=== 검증 완료 ===`);
  console.log(`  일치: ${matched}`);
  console.log(`  불일치: ${unmatched}`);
  console.log(`  확인불가: ${unknown}`);
  console.log(`결과 저장: ${OUTPUT_PATH}`);

  if (mismatches.length > 0) {
    console.log(`\n=== 불일치 목록 ===`);
    for (const m of mismatches) {
      console.log(
        `Day ${m.day}: "${m.registered_title}" (${m.registered_artist}) -> "${m.identified_title}" (${m.identified_artist}) [${m.confidence}] ${m.note || ""}`
      );
    }
  }
}

run();
