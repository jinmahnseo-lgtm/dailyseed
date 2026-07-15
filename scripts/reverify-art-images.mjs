import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// Parse .env manually
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

const TARGET_DAYS = [
  32,36,38,42,55,58,59,64,73,74,201,76,93,107,110,111,114,115,120,126,131,
  186,195,203,215,218,224,234,235,237,238,239,245,249,255,256,262,276,277,
  278,282,285,287,293,298,307,310,312,316,318,320,321,324,330,333,334,340,
  343,347,349,350,355,356,357,360,361,363,365
];

const ARTS_PATH = path.resolve("src/data/arts.json");
const IMAGES_DIR = path.resolve("public/images/arts");
const OUTPUT_PATH = path.resolve("scripts/reverify-results.json");

const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
const client = new Anthropic();

const BATCH_SIZE = 5;
const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    max_tokens: 3000,
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
  console.log(`=== 교체 이미지 재검증 (${TARGET_DAYS.length}일) ===\n`);

  const items = [];
  for (const dayNum of TARGET_DAYS) {
    const idx = dayNum - 1;
    if (idx < 0 || idx >= arts.length) {
      console.log(`Day ${dayNum}: arts.json에 없음, skip`);
      continue;
    }
    const imagePath = path.join(IMAGES_DIR, `day-${dayNum}.webp`);
    if (!fs.existsSync(imagePath)) {
      console.log(`Day ${dayNum}: 이미지 파일 없음, skip`);
      continue;
    }
    items.push({
      dayNum,
      title: arts[idx].title,
      artist: arts[idx].artist,
      imagePath,
    });
  }

  console.log(`검증 대상: ${items.length}개 이미지\n`);

  const allResults = [];
  const mismatches = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(items.length / BATCH_SIZE);

    console.log(
      `Batch ${batchNum}/${totalBatches}: Day ${batch.map((b) => b.dayNum).join(", ")}`
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
        } else if (r.match === true) {
          console.log(`  O Day ${r.day}: OK (${r.confidence})`);
        } else {
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

    // Save after each batch
    allResults.sort((a, b) => a.day - b.day);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2) + "\n");

    if (i + BATCH_SIZE < items.length) {
      await sleep(DELAY_MS);
    }
  }

  // Final save
  allResults.sort((a, b) => a.day - b.day);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allResults, null, 2) + "\n");

  // Summary
  const matched = allResults.filter((r) => r.match === true).length;
  const unmatched = allResults.filter((r) => r.match === false).length;
  const unknown = allResults.filter((r) => r.match === null).length;

  console.log(`\n========================================`);
  console.log(`=== 검증 완료 ===`);
  console.log(`  총 검증: ${allResults.length}`);
  console.log(`  일치: ${matched}`);
  console.log(`  불일치: ${unmatched}`);
  console.log(`  확인불가: ${unknown}`);
  console.log(`  결과 저장: ${OUTPUT_PATH}`);

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
