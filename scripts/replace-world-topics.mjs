import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// dotenv v17 호환 - 수동 파싱
const envContent = fs.readFileSync(path.join(ROOT, ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-20250514";

// ── 교체 대상 43건 ──
const TARGETS = [
  // 부탄 — 국민총행복 4회→1회
  { day: 192, topicHint: "부탄 활 쏘기 — 국기(國技)에 담긴 행복" },
  { day: 277, topicHint: "부탄의 조(dzong) 건축 — 종교와 행정을 포용하는 성채" },
  { day: 306, topicHint: "부탄의 TV 금지 해제(1999) — 전통과 현대의 충돌" },
  // 멕시코 — 죽은 자의 날 3회→1회
  { day: 195, topicHint: "멕시코 이민자 — 국경을 넘는 슬픔과 희망" },
  { day: 230, topicHint: "멕시코 루차 리브레 — 마스크 뒤의 축제" },
  // 캄보디아 — 앙코르와트 4회→1회
  { day: 288, topicHint: "캄보디아 압사라 춤 — 몸으로 새기는 추억" },
  { day: 329, topicHint: "캄보디아 톤레삽 수상마을 — 물 위에 구축한 삶" },
  { day: 360, topicHint: "캄보디아 크메르어 — 동남아 문자의 뿌리" },
  // 일본 — 와비사비 2회→1회
  { day: 291, topicHint: "일본 킨츠기 — 깨진 도자기를 금으로 보존하는 미학" },
  // 호주 — 드림타임 2회→1회
  { day: 154, topicHint: "호주 산불과 재생 — 꿈결처럼 되살아나는 유칼립투스" },
  // 미국 — 실리콘밸리 2회→1회
  { day: 201, topicHint: "미국 NASA — 달에 도달한 동기의 힘" },
  // 영국 — 스피커스코너 2회→1회
  { day: 314, topicHint: "영국 애프터눈 티 — 단순한 의식이 만든 문화" },
  // 스위스 — CERN 2회→1회
  { day: 144, topicHint: "스위스 시계 산업 — 원자처럼 정밀한 장인 정신" },
  // 갈라파고스 — 다윈 2회→1회
  { day: 146, topicHint: "에콰도르 적도 실험 — 진화하는 과학 교육" },
  // 포르투갈 — 사우다지 2회→1회, 항해 2회→1회
  { day: 196, topicHint: "포르투갈 파두 음악 — 기쁨과 슬픔이 공존하는 선율" },
  { day: 335, topicHint: "포르투갈 아줄레주 타일 — 벽에 항해한 예술" },
  // 탄자니아 — 세렝게티 2회→1회
  { day: 342, topicHint: "탄자니아 스와힐리어 — 아프리카 언어의 합류점" },
  // 파푸아뉴기니 — 800개 언어 4회→2회
  { day: 303, topicHint: "파푸아뉴기니 싱싱 축제 — 부족의 풍경을 담은 장식" },
  { day: 332, topicHint: "파푸아뉴기니 코코포 화산 — 불의 섬 탐험" },
  // 아르헨티나 — 탱고 2회→1회
  { day: 289, topicHint: "아르헨티나 아사도 — 향수를 불러일으키는 불꽃의 요리" },
  // 에스토니아 — 디지털 3회→1회
  { day: 278, topicHint: "에스토니아 노래 혁명 — 노래로 독립을 배우다" },
  { day: 346, topicHint: "에스토니아 중세 탈린 — 투명하게 보존된 구시가지" },
  // 조지아 — 와인 3회→1회
  { day: 202, topicHint: "조지아 폴리포니 합창 — 유네스코 무형유산의 의지" },
  { day: 343, topicHint: "조지아 수프라 — 건배사 순서가 정해진 연회 문화" },
  // 네팔 — 셰르파 3회→1회
  { day: 200, topicHint: "네팔 룸비니 — 부처 탄생지의 자존심" },
  { day: 336, topicHint: "네팔 계단식 논 — 히말라야를 등반하듯 쌓은 농경" },
  // 터키 — 동서양교차 2회→1회
  { day: 171, topicHint: "터키 하맘 — 목욕탕으로 이주한 사교 문화" },
  // 이스라엘 — 예루살렘 2회→1회
  { day: 158, topicHint: "이스라엘 키부츠 — 공동체가 실험한 종교적 이상" },
  // 캐나다 — 모자이크 2회→1회
  { day: 304, topicHint: "캐나다 이누이트 — 북극의 리듬으로 살아가는 사람들" },
  // 트리니다드토바고 — 스틸팬 2회→1회
  { day: 283, topicHint: "트리니다드토바고 피치 레이크 — 자연이 배신한 아스팔트 호수" },
  // 수리남 — 다문화 2회→1회
  { day: 269, topicHint: "수리남 열대우림 — 남미에서 탄생한 생태 보물" },
  // 부르키나파소 — 정직한사람들 2회→1회
  { day: 345, topicHint: "부르키나파소 FESPACO — 아프리카 영화제의 순수한 열정" },
  // 몬테네그로 — 검은산전사 2회→1회
  { day: 276, topicHint: "몬테네그로 코토르 만 — 자연이 극복한 지형의 기적" },
  // 르완다 — 천의언덕/재건 중복
  { day: 331, topicHint: "르완다 고릴라 트레킹 — 멸종위기종 재건의 성공 사례" },
  { day: 364, topicHint: "르완다 ICT 허브 — 아프리카 실리콘 사바나의 새싹" },
  // 모로코 — 마라케시 2회→1회
  { day: 299, topicHint: "모로코 사하라 유목민 — 감각으로 사막을 읽는 베르베르인" },
  // 우즈베키스탄 — 실크로드 4회→2회
  { day: 300, topicHint: "우즈베키스탄 수자니 자수 — 실 위의 촉감 예술" },
  { day: 350, topicHint: "우즈베키스탄 플로프 — 중앙아시아의 국민 밥상" },
  // 스웨덴 — 노벨 2회→1회
  { day: 186, topicHint: "스웨덴 IKEA — 모두를 위한 디자인" },
  // 아일랜드 — 문학 2회→1회
  { day: 104, topicHint: "아일랜드 펍 문화 — 구전 문학이 살아 숨 쉬는 술집" },
  // 아르메니아 — 아라라트 2회→1회
  { day: 211, topicHint: "아르메니아 라바시 빵 — 후회 없는 전통 발효의 맛" },
  // 룩셈부르크 — 작지만 2회→1회
  { day: 326, topicHint: "룩셈부르크 다국어 교육 — 3개 국어를 축소 없이 구사하는 나라" },
  // 가나 — 관(棺) 2회→1회
  { day: 285, topicHint: "가나 카카오 농장 — 초콜릿 원료에서 탈출하지 못하는 경제" },
];

// ── 데이터 로드 ──
function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf-8"));
}
function saveJSON(relPath, data) {
  fs.writeFileSync(
    path.join(ROOT, relPath),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}

function extractJSON(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) return JSON.parse(m[1].trim());
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1) return JSON.parse(text.slice(start, end + 1));
  throw new Error("JSON을 추출할 수 없습니다: " + text.slice(0, 200));
}

// ── 프롬프트 ──
function worldPrompt(batch, themes, worldsData) {
  const items = batch
    .map((t) => {
      const theme = themes[t.day - 1];
      const existing = worldsData
        .filter((w) => w.day !== t.day && w.country === t.currentCountry)
        .map((w) => w.title);
      return `- Day ${t.day}: 키워드 "${theme.keyword}" (${theme.desc})
  국가: ${t.currentCountry} (${t.flag}, ${t.region})
  주제 힌트: ${t.topicHint}
  이 국가의 기존 주제(겹치지 않게): ${existing.join(", ")}`;
    })
    .join("\n\n");

  return `너는 세계문화 큐레이터야. 한국 청소년에게 세계 각국의 문화를 소개해.

아래 국가들의 **새로운 주제**로 세계문화 콘텐츠를 작성해줘.
각 국가는 이미 다른 주제로 등장한 적이 있어 — 기존 주제와 절대 겹치지 않는 새로운 측면을 다뤄야 해.

${items}

각 항목 요구사항:
- day: Day 번호 (숫자)
- country: 나라 이름 (한국어) — 기존과 동일하게
- flag: 국기 이모지 — 기존과 동일하게
- region: 지역 — 기존과 동일하게
- title: 문화 소개 제목 (키워드와 자연스럽게 연결)
- story: 문화 이야기 (150~250자, 반말체)
- culture_point: 핵심 문화 포인트 (100~150자, 반말체)
- food: 음식 소개 (100~150자, 반말체)
- fun_fact: 재미있는 사실 (50~100자, 반말체)
- quiz: { question, options(4개), answer(0-3 인덱스) }

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "day": 0, "country": "...", "flag": "...", "region": "...", "title": "...", "story": "...", "culture_point": "...", "food": "...", "fun_fact": "...", "quiz": { "question": "...", "options": ["..."], "answer": 0 } }]
\`\`\``;
}

function englishPrompt(batch, englishData) {
  const items = batch
    .map((t) => {
      const eng = englishData.find((e) => e.day === t.day);
      const otherSentences = eng
        ? eng.sentences.filter((s) => s.source !== "세계문화")
        : [];
      const otherVocab = otherSentences.map(
        (s) => s.en.split(" ").slice(0, 5).join(" ") + "..."
      );
      return `- Day ${t.day}: 국가 ${t.currentCountry}, 새 세계문화 주제: "${t.newTitle}"
  기존 다른 문장들: ${otherSentences.map((s) => `[${s.source}] ${s.en.slice(0, 60)}...`).join(" / ")}`;
    })
    .join("\n\n");

  return `너는 영어 교육 콘텐츠 작가야. 새로운 세계문화 주제에 맞는 영어 문장과 단어를 만들어줘.

${items}

각 Day별 요구사항:
- day: Day 번호 (숫자)
- sentence: 1개 (source: "세계문화", emoji: "🌍")
  - en: 새 세계문화 내용 기반 영어 문장 (중학생~고1 수준, 15~25단어)
  - ko: 한국어 번역
  - note: 문법/표현 설명 (반말체, 100~150자)
- vocab: 1개 단어 (sentence에서 추출, 동사=원형, 명사=단수형)
  - word: 영어 단어
  - meaning: 한국어 뜻

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "day": 0, "sentence": { "source": "세계문화", "emoji": "🌍", "en": "...", "ko": "...", "note": "..." }, "vocab": { "word": "...", "meaning": "..." } }]
\`\`\``;
}

// ── 메인 ──
async function main() {
  const worlds = loadJSON("src/data/worlds.json");
  const english = loadJSON("src/data/english.json");
  const themes = loadJSON("src/data/themes.json");

  const worldMap = new Map(worlds.map((w) => [w.day, w]));
  const englishMap = new Map(english.map((e) => [e.day, e]));

  // 교체 대상에 현재 country/flag/region 추가
  const enriched = TARGETS.map((t) => {
    const w = worldMap.get(t.day);
    return {
      ...t,
      currentCountry: w.country,
      flag: w.flag,
      region: w.region,
    };
  });

  // 배치 처리 (5건씩)
  const BATCH_SIZE = 5;
  const batches = [];
  for (let i = 0; i < enriched.length; i += BATCH_SIZE) {
    batches.push(enriched.slice(i, i + BATCH_SIZE));
  }

  console.log(`총 ${enriched.length}건, ${batches.length}개 배치로 처리`);

  let worldResults = [];
  let englishResults = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `\n── 배치 ${i + 1}/${batches.length} (Day ${batch.map((b) => b.day).join(", ")}) ──`
    );

    // 1) 세계문화 생성
    console.log("  세계문화 생성 중...");
    const wp = worldPrompt(batch, themes, worlds);
    const wRes = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: wp }],
    });
    const wText = wRes.content[0].text;
    const newWorlds = extractJSON(wText);
    worldResults.push(...newWorlds);
    console.log(`  → ${newWorlds.length}건 생성 완료`);

    // batch에 newTitle 추가 (영어 프롬프트용)
    for (const nw of newWorlds) {
      const target = batch.find((b) => b.day === nw.day);
      if (target) target.newTitle = nw.title;
    }

    // 2) 영어 문장 생성
    console.log("  영어 문장 생성 중...");
    const ep = englishPrompt(batch, english);
    const eRes = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: ep }],
    });
    const eText = eRes.content[0].text;
    const newEnglish = extractJSON(eText);
    englishResults.push(...newEnglish);
    console.log(`  → ${newEnglish.length}건 생성 완료`);

    // rate limit 방지
    if (i < batches.length - 1) {
      console.log("  3초 대기...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // ── worlds.json 업데이트 ──
  console.log("\n── worlds.json 업데이트 ──");
  let worldUpdateCount = 0;
  for (const nw of worldResults) {
    const idx = worlds.findIndex((w) => w.day === nw.day);
    if (idx === -1) {
      console.warn(`  ⚠ Day ${nw.day} 를 worlds.json에서 찾을 수 없음`);
      continue;
    }
    worlds[idx] = { ...nw };
    worldUpdateCount++;
  }
  saveJSON("src/data/worlds.json", worlds);
  console.log(`  ${worldUpdateCount}건 교체 완료`);

  // ── english.json 업데이트 ──
  console.log("\n── english.json 업데이트 ──");
  let engUpdateCount = 0;
  for (const ne of englishResults) {
    const idx = english.findIndex((e) => e.day === ne.day);
    if (idx === -1) {
      console.warn(`  ⚠ Day ${ne.day} 를 english.json에서 찾을 수 없음`);
      continue;
    }
    const entry = english[idx];

    // source: "세계문화" 문장 교체
    const sentIdx = entry.sentences.findIndex(
      (s) => s.source === "세계문화"
    );
    if (sentIdx !== -1 && ne.sentence) {
      entry.sentences[sentIdx] = ne.sentence;
    }

    // vocab에서 세계문화 관련 단어 교체 (보통 2번째 = index 1 또는 source 순서대로)
    // 안전하게: 기존 vocab 중 세계문화 문장에서 유래한 단어를 찾기 어려우므로
    // sentences 순서 기준 (고전=0, 명화=1, 세계문화=2, 왜왜왜=3) → vocab[2] 교체
    if (ne.vocab) {
      // source 순서로 세계문화 위치 찾기
      const worldVocabIdx = entry.sentences.findIndex(
        (s) => s.source === "세계문화"
      );
      if (worldVocabIdx !== -1 && worldVocabIdx < entry.vocab.length) {
        entry.vocab[worldVocabIdx] = ne.vocab;
      }
    }

    engUpdateCount++;
  }
  saveJSON("src/data/english.json", english);
  console.log(`  ${engUpdateCount}건 교체 완료`);

  console.log("\n✅ 모든 교체 완료!");
  console.log(
    `  세계문화: ${worldUpdateCount}건, 영어: ${engUpdateCount}건`
  );
}

main().catch((e) => {
  console.error("오류 발생:", e);
  process.exit(1);
});
