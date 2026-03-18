import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

const PROJECT_ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const DATA_DIR = path.join(PROJECT_ROOT, "src", "data");
const DAYS_TO_GENERATE = 7;
const MODEL = "claude-sonnet-4-20250514";

if (!process.env.ANTHROPIC_API_KEY) {
  // Try reading .env manually as fallback
  try {
    const envContent = fs.readFileSync(path.join(PROJECT_ROOT, ".env"), "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^([^=]+)=(.+)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    }
  } catch {
    // ignore
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Types matching existing JSON schemas ---
interface Theme {
  date: string;
  keyword: string;
  desc: string;
}

interface NewsEntry {
  date: string;
  title: string;
  summary: string;
  insight: string;
  question: string;
  glossary: { term: string; def: string }[];
  debate: { topic: string; pro: string; con: string };
}

interface ClassicEntry {
  date: string;
  title: string;
  author: string;
  year: number;
  summary: string;
  question: string;
  author_bio: string;
  historical_context: string;
}

interface ArtEntry {
  date: string;
  title: string;
  artist: string;
  year: number;
  country: string;
  image_url: string;
  source_url: string;
  source_label: string;
  story: string;
  look_for: string;
  fun_fact: string;
  question: string;
}

interface WorldEntry {
  date: string;
  country: string;
  flag: string;
  region: string;
  title: string;
  story: string;
  culture_point: string;
  food: string;
  fun_fact: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
  };
}

interface WhyEntry {
  date: string;
  emoji: string;
  question: string;
  short_answer: string;
  deep_dive: string;
  experiment: string;
  mind_blown: string;
}

interface EnglishSentence {
  source: string;
  emoji: string;
  en: string;
  ko: string;
  note: string;
}

interface EnglishEntry {
  date: string;
  sentences: EnglishSentence[];
  vocab: { word: string; meaning: string }[];
}

interface SeedEntry {
  date: string;
  news: { title: string; summary: string; insight: string };
  classic: {
    title: string;
    author: string;
    year: number;
    summary: string;
    question: string;
  };
  sentence: {
    english: string;
    translation: string;
    grammar_point: string;
    grammar_explanation: string;
  };
}

// --- Helpers ---
function readJson<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getNextDates(lastDate: string, count: number): string[] {
  const dates: string[] = [];
  for (let i = 1; i <= count; i++) {
    dates.push(addDays(lastDate, i));
  }
  return dates;
}

async function callClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  if (block.type === "text") return block.text;
  throw new Error("Unexpected response type");
}

function extractJson<T>(response: string): T {
  // Extract JSON from markdown code blocks or raw JSON
  const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : response.trim();
  return JSON.parse(jsonStr);
}

// --- Content generation prompts ---
function themesPrompt(dates: string[], existingKeywords: string[]): string {
  return `너는 청소년 교양 교육 콘텐츠 기획자야. 매일 하나의 키워드(2글자 한국어)와 설명을 만들어.

기존에 사용된 키워드(중복 금지): ${existingKeywords.join(", ")}

아래 날짜들에 대해 새로운 키워드를 만들어줘. 키워드는 철학적이고 깊이 있는 주제여야 해.
날짜: ${dates.join(", ")}

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[
  { "date": "YYYY-MM-DD", "keyword": "키워드", "desc": "한 줄 설명" }
]
\`\`\``;
}

function newsPrompt(themes: Theme[]): string {
  return `너는 청소년용 시사 뉴스 작성자야. 한국 중고등학생이 이해할 수 있는 수준으로 최근 뉴스를 작성해.

각 날짜의 키워드와 연결되는 실제 뉴스 이슈를 다뤄야 해:
${themes.map((t) => `- ${t.date}: 키워드 "${t.keyword}" (${t.desc})`).join("\n")}

각 항목 요구사항:
- title: 뉴스 제목 (구체적, 실제 이슈 기반)
- summary: 200~400자, 구체적 수치/사례 포함, 반말체(~야, ~거든, ~이야)
- insight: 키워드와 연결되는 통찰 (1~2문장)
- question: 비판적 사고를 유도하는 질문
- glossary: 3개 용어 설명 (term + def)
- debate: topic(찬반 주제), pro(찬성 근거), con(반대 근거)

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "title": "...", "summary": "...", "insight": "...", "question": "...", "glossary": [...], "debate": {...} }]
\`\`\``;
}

function classicsPrompt(themes: Theme[], existingClassics: ClassicEntry[]): string {
  const usedList = existingClassics.map((c) => `${c.title} - ${c.author}`).join(", ");
  return `너는 세계 고전문학 큐레이터야. 한국 청소년에게 고전의 매력을 전달해.

각 날짜의 키워드와 연결되는 고전을 골라줘:
${themes.map((t) => `- ${t.date}: 키워드 "${t.keyword}" (${t.desc})`).join("\n")}

⚠️ 다음 작품은 이미 사용했으므로 절대 중복하지 마세요 (작품+작가 모두 다르게):
${usedList}

각 항목 요구사항:
- title: 작품 제목 (한국어)
- author: 작가명 (한국어)
- year: 출간/작성 연도 (기원전은 음수)
- summary: 300~500자, 줄거리와 핵심 메시지, 반말체
- question: 키워드와 연결되는 사고 질문
- author_bio: 작가 소개 (150~250자, 반말체)
- historical_context: 시대적 배경 (150~250자, 반말체)

유명한 고전을 우선 선택. 동서양 균형 맞추기.

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "title": "...", "author": "...", "year": 0, "summary": "...", "question": "...", "author_bio": "...", "historical_context": "..." }]
\`\`\``;
}

function artsPrompt(themes: Theme[], existingArts: ArtEntry[]): string {
  const usedList = existingArts.map((a) => `${a.title} - ${a.artist}`).join(", ");
  return `너는 미술사 큐레이터야. 한국 청소년에게 명화의 매력을 전달해.

각 날짜의 키워드와 연결되는 유명 회화/조각 작품을 골라줘:
${themes.map((t) => `- ${t.date}: 키워드 "${t.keyword}" (${t.desc})`).join("\n")}

⚠️ 다음 작품은 이미 사용했으므로 절대 중복하지 마세요 (작품+작가 모두 다르게):
${usedList}

각 항목 요구사항:
- title: 작품명 (한국어)
- artist: 작가명 (한국어)
- year: 제작 연도
- country: 작가 출신 국가 (한국어)
- image_url: 위키미디어 커먼즈 이미지 URL (https://upload.wikimedia.org/... 형식). 반드시 실제 존재하는 URL이어야 해
- source_url: 위키피디아 영문 페이지 URL
- source_label: "Wikipedia"
- story: 작품 배경 스토리 (150~250자, 반말체)
- look_for: 감상 포인트 (100~200자, 반말체)
- fun_fact: 재미있는 사실 (100~150자, 반말체)
- question: 감상 질문

source_url과 source_label은 반드시 포함. 위키미디어 이미지 URL은 실제 존재하는 것만 사용.

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "title": "...", "artist": "...", "year": 0, "country": "...", "image_url": "...", "source_url": "...", "source_label": "Wikipedia", "story": "...", "look_for": "...", "fun_fact": "...", "question": "..." }]
\`\`\``;
}

function worldsPrompt(themes: Theme[], existingWorlds: WorldEntry[]): string {
  const usedCountries = [...new Set(existingWorlds.map((w) => w.country))].join(", ");
  return `너는 세계문화 큐레이터야. 한국 청소년에게 세계 각국의 문화를 소개해.

각 날짜의 키워드와 연결되는 나라/문화를 골라줘:
${themes.map((t) => `- ${t.date}: 키워드 "${t.keyword}" (${t.desc})`).join("\n")}

⚠️ 다음 국가는 이미 사용했으므로 절대 중복하지 마세요:
${usedCountries}

각 항목 요구사항:
- country: 나라 이름 (한국어)
- flag: 국기 이모지
- region: 지역 (동아시아, 서유럽, 남미 등)
- title: 문화 소개 제목
- story: 문화 이야기 (150~250자, 반말체)
- culture_point: 핵심 문화 포인트 (100~150자, 반말체)
- food: 음식 소개 (100~150자, 반말체)
- fun_fact: 재미있는 사실 (50~100자, 반말체)
- quiz: { question, options(4개), answer(0-3 인덱스) }

다양한 대륙/지역에서 선택. 같은 나라 반복 지양.

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "country": "...", "flag": "...", "region": "...", "title": "...", "story": "...", "culture_point": "...", "food": "...", "fun_fact": "...", "quiz": { "question": "...", "options": ["..."], "answer": 0 } }]
\`\`\``;
}

function whysPrompt(themes: Theme[], existingWhys: WhyEntry[]): string {
  const usedQuestions = existingWhys.map((w) => w.question).join(", ");
  return `너는 과학 교육 콘텐츠 작가야. 한국 청소년의 호기심을 자극하는 과학 질문을 만들어.

각 날짜의 키워드와 연결되는 과학 질문을 만들어줘:
${themes.map((t) => `- ${t.date}: 키워드 "${t.keyword}" (${t.desc})`).join("\n")}

⚠️ 다음 질문은 이미 사용했으므로 절대 중복하지 마세요 (비슷한 주제도 피하기):
${usedQuestions}

각 항목 요구사항:
- emoji: 주제와 어울리는 이모지 1개
- question: 호기심을 자극하는 질문 (~할까? 형태)
- short_answer: 1~2문장 간결한 답
- deep_dive: 상세 설명 (200~400자, 단락 구분, 반말체)
- experiment: 집에서 할 수 있는 간단한 실험 (100~150자, 반말체)
- mind_blown: 놀라운 사실 (100~150자, 반말체)

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "emoji": "...", "question": "...", "short_answer": "...", "deep_dive": "...", "experiment": "...", "mind_blown": "..." }]
\`\`\``;
}

function englishPrompt(
  themes: Theme[],
  classicsData: ClassicEntry[],
  artsData: ArtEntry[],
  worldsData: WorldEntry[],
  whysData: WhyEntry[]
): string {
  const context = themes
    .map((t) => {
      const classic = classicsData.find((c) => c.date === t.date);
      const art = artsData.find((a) => a.date === t.date);
      const world = worldsData.find((w) => w.date === t.date);
      const why = whysData.find((w) => w.date === t.date);
      return `${t.date} (${t.keyword}):
  고전: ${classic?.title || "N/A"} by ${classic?.author || "N/A"}
  명화: ${art?.title || "N/A"} by ${art?.artist || "N/A"}
  세계: ${world?.country || "N/A"} - ${world?.title || "N/A"}
  과학: ${why?.question || "N/A"}`;
    })
    .join("\n\n");

  return `너는 영어 교육 콘텐츠 작가야. 다른 섹션(고전, 명화, 세계문화, 과학)의 실제 내용에서 영어 문장을 뽑아 문법을 가르쳐.

오늘의 콘텐츠:
${context}

각 날짜별 요구사항:
- sentences: 4개 (고전, 명화, 세계문화, 왜왜왜 각 1개)
  - source: "고전"|"명화"|"세계문화"|"왜왜왜"
  - emoji: 📖|🎨|🌍|🔬
  - en: 영어 문장 (해당 콘텐츠 내용 기반)
  - ko: 한국어 번역
  - note: 문법/표현 설명 (반말체)
- vocab: 4개 단어 (sentences에서 각 1개 추출, 동사=원형, 명사=단수형)
  - word: 영어 단어
  - meaning: 한국어 뜻

JSON 배열로 응답해. 다른 텍스트 없이 JSON만:
\`\`\`json
[{ "date": "...", "sentences": [...], "vocab": [...] }]
\`\`\``;
}

function seedsPrompt(
  themes: Theme[],
  newsData: NewsEntry[],
  classicsData: ClassicEntry[],
  englishData: EnglishEntry[]
): string {
  const entries = themes.map((t) => {
    const news = newsData.find((n) => n.date === t.date);
    const classic = classicsData.find((c) => c.date === t.date);
    const english = englishData.find((e) => e.date === t.date);
    const firstSentence = english?.sentences?.[0];

    return {
      date: t.date,
      news: news
        ? {
            title: news.title,
            summary: news.summary.slice(0, 300),
            insight: news.insight,
          }
        : null,
      classic: classic
        ? {
            title: classic.title,
            author: classic.author,
            year: classic.year,
            summary: classic.summary.slice(0, 300),
            question: classic.question,
          }
        : null,
      sentence: firstSentence
        ? {
            english: firstSentence.en,
            translation: firstSentence.ko,
            grammar_point: "",
            grammar_explanation: firstSentence.note,
          }
        : null,
    };
  });

  return JSON.stringify(entries, null, 2);
}

// --- Main ---
async function main() {
  console.log("=== DailySeed 콘텐츠 자동 생성 ===\n");

  // 1. Read existing data
  const themes = readJson<Theme>("themes.json");
  const lastDate = themes[themes.length - 1].date;
  const existingKeywords = themes.map((t) => t.keyword);

  console.log(`마지막 콘텐츠 날짜: ${lastDate}`);

  // 2. Calculate new dates
  const newDates = getNextDates(lastDate, DAYS_TO_GENERATE);
  console.log(`생성할 날짜: ${newDates[0]} ~ ${newDates[newDates.length - 1]}\n`);

  // 3. Generate themes first
  console.log("1/7 테마 생성 중...");
  const newThemes = extractJson<Theme[]>(
    await callClaude(themesPrompt(newDates, existingKeywords))
  );
  console.log(
    `  ✓ ${newThemes.length}개 테마: ${newThemes.map((t) => t.keyword).join(", ")}`
  );

  // Read existing data for deduplication
  const existingClassics = readJson<ClassicEntry>("classics.json");
  const existingArts = readJson<ArtEntry>("arts.json");
  const existingWorlds = readJson<WorldEntry>("worlds.json");
  const existingWhys = readJson<WhyEntry>("whys.json");

  // 4. Generate all content types
  console.log("2/7 뉴스 생성 중...");
  const newNews = extractJson<NewsEntry[]>(await callClaude(newsPrompt(newThemes)));
  console.log(`  ✓ ${newNews.length}개 뉴스`);

  console.log("3/7 고전 생성 중...");
  const newClassics = extractJson<ClassicEntry[]>(
    await callClaude(classicsPrompt(newThemes, existingClassics))
  );
  console.log(`  ✓ ${newClassics.length}개 고전`);

  console.log("4/7 예술 생성 중...");
  const newArts = extractJson<ArtEntry[]>(await callClaude(artsPrompt(newThemes, existingArts)));
  console.log(`  ✓ ${newArts.length}개 예술`);

  console.log("5/7 세계문화 생성 중...");
  const newWorlds = extractJson<WorldEntry[]>(
    await callClaude(worldsPrompt(newThemes, existingWorlds))
  );
  console.log(`  ✓ ${newWorlds.length}개 세계문화`);

  console.log("6/7 과학 생성 중...");
  const newWhys = extractJson<WhyEntry[]>(await callClaude(whysPrompt(newThemes, existingWhys)));
  console.log(`  ✓ ${newWhys.length}개 과학`);

  console.log("7/7 영어 생성 중...");
  const newEnglish = extractJson<EnglishEntry[]>(
    await callClaude(
      englishPrompt(newThemes, newClassics, newArts, newWorlds, newWhys)
    )
  );
  console.log(`  ✓ ${newEnglish.length}개 영어`);

  // 5. Generate seeds (aggregation - no API call needed)
  console.log("\nseeds 집계 중...");
  const seedsJson = seedsPrompt(newThemes, newNews, newClassics, newEnglish);
  const newSeeds = JSON.parse(seedsJson) as SeedEntry[];

  // Fix grammar_point from english data
  for (const seed of newSeeds) {
    const eng = newEnglish.find((e) => e.date === seed.date);
    if (eng?.sentences?.[0]?.note && seed.sentence) {
      const note = eng.sentences[0].note;
      // Extract grammar point pattern from note (first quoted term or first few words)
      const match = note.match(/[''](.+?)['']/) || note.match(/^(.{10,30}?)[—–\-\.]/);
      seed.sentence.grammar_point = match ? match[1] : note.slice(0, 40);
    }
  }

  console.log(`  ✓ ${newSeeds.length}개 seeds`);

  // 6. Append to existing JSON files
  console.log("\nJSON 파일 업데이트 중...");

  const existingNews = readJson<NewsEntry>("news.json");
  const existingEnglish = readJson<EnglishEntry>("english.json");
  const existingSeeds = readJson<SeedEntry>("seeds.json");

  writeJson("themes.json", [...themes, ...newThemes]);
  writeJson("news.json", [...existingNews, ...newNews]);
  writeJson("classics.json", [...existingClassics, ...newClassics]);
  writeJson("arts.json", [...existingArts, ...newArts]);
  writeJson("worlds.json", [...existingWorlds, ...newWorlds]);
  writeJson("whys.json", [...existingWhys, ...newWhys]);
  writeJson("english.json", [...existingEnglish, ...newEnglish]);
  writeJson("seeds.json", [...existingSeeds, ...newSeeds]);

  console.log("  ✓ 8개 JSON 파일 업데이트 완료");
  console.log(
    `\n=== 완료: ${newDates[0]} ~ ${newDates[newDates.length - 1]} (${DAYS_TO_GENERATE}일) ===`
  );
}

main().catch((err) => {
  console.error("에러:", err);
  process.exit(1);
});
