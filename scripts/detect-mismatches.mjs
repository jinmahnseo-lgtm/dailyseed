import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "data");

const english = JSON.parse(fs.readFileSync(path.join(DATA, "english.json"), "utf-8"));
const worlds = JSON.parse(fs.readFileSync(path.join(DATA, "worlds.json"), "utf-8"));
const whys = JSON.parse(fs.readFileSync(path.join(DATA, "whys.json"), "utf-8"));
const themes = JSON.parse(fs.readFileSync(path.join(DATA, "themes.json"), "utf-8"));

// Extract Korean proper nouns (2+ chars, likely place/person names) from text
function extractKoNouns(text) {
  // Split by punctuation and spaces, get 2+ char Korean words
  return text
    .replace(/[.,!?;:()—\-""''「」『』]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && /[가-힣]/.test(w))
    // Remove common particles/endings
    .map(w => w.replace(/(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|까지|처럼|보다|에게|한테|서|야|아|라고|이라|이야|거야|이지|인|해|돼|어|지|고|며|면|때|것|거|할|수|대|들|한|된|년|간|개|명)$/g, ""))
    .filter(w => w.length >= 2);
}

// Extract English proper nouns and key terms from text
function extractEnTerms(text) {
  const terms = [];
  // Capitalized words (proper nouns)
  const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  terms.push(...matches.map(m => m.toLowerCase()));
  // Also get individual capitalized words
  const words = text.match(/[A-Z][a-z]{2,}/g) || [];
  terms.push(...words.map(w => w.toLowerCase()));
  return [...new Set(terms)];
}

// === 세계문화 불일치 ===
const worldMismatches = [];

for (let day = 1; day <= 365; day++) {
  const eng = english.find(e => e.day === day);
  const w = worlds.find(x => x.day === day);
  if (!eng || !w) continue;

  const ws = eng.sentences.find(s => s.source === "세계문화");
  if (!ws) continue;

  const enText = ws.en;
  const koText = ws.ko;

  // World content
  const worldAllText = [w.title, w.story, w.culture_point, w.food, w.fun_fact].filter(Boolean).join(" ");

  // Strategy 1: Check if country name appears in ko
  const countryInKo = koText.includes(w.country) ||
    koText.includes(w.country.replace("공화국", "")) ||
    koText.includes(w.country.replace("(에콰도르)", "")) ||
    koText.includes(w.country.replace("(이라크)", ""));

  // Strategy 2: Extract Korean nouns from EN ko translation and world content, check overlap
  const koNouns = extractKoNouns(koText);
  const worldKoNouns = extractKoNouns(worldAllText);
  // Find meaningful overlapping nouns (3+ chars to avoid common words)
  const koOverlap = koNouns.some(n => n.length >= 3 && worldKoNouns.some(wn => wn.includes(n) || n.includes(wn)));

  // Strategy 3: Extract English terms from EN sentence and world content
  const enTerms = extractEnTerms(enText);
  const worldEnTerms = extractEnTerms(worldAllText);
  const enOverlap = enTerms.some(t => t.length > 3 && worldEnTerms.some(wt => wt === t));

  // Strategy 4: Check if any 4+ char Korean noun from world title/story appears in ko
  const worldTitleNouns = extractKoNouns(w.title + " " + w.country);
  const titleOverlap = worldTitleNouns.some(n => n.length >= 2 && koText.includes(n));

  const isMatch = countryInKo || koOverlap || enOverlap || titleOverlap;

  if (!isMatch) {
    const t = themes[day - 1];
    worldMismatches.push({
      day,
      keyword: t?.keyword || "?",
      country: w.country,
      worldTitle: w.title,
      en: ws.en,
      ko: ws.ko,
    });
  }
}

// === 과학(왜왜왜) 불일치 ===
const whyMismatches = [];

for (let day = 1; day <= 365; day++) {
  const eng = english.find(e => e.day === day);
  const w = whys.find(x => x.day === day);
  if (!eng || !w) continue;

  const ws = eng.sentences.find(s => s.source === "왜왜왜");
  if (!ws) continue;

  const koText = ws.ko;
  const enText = ws.en;

  const whyAllText = [w.question, w.short_answer, w.deep_dive].filter(Boolean).join(" ");

  // Strategy 1: Korean noun overlap between ko translation and whys content
  const koNouns = extractKoNouns(koText);
  const whyKoNouns = extractKoNouns(whyAllText);
  const koOverlap = koNouns.some(n => n.length >= 3 && whyKoNouns.some(wn => wn.includes(n) || n.includes(wn)));

  // Strategy 2: English term overlap
  const enTerms = extractEnTerms(enText);
  const whyEnTerms = extractEnTerms(whyAllText);
  const enOverlap = enTerms.some(t => t.length > 3 && whyEnTerms.some(wt => wt === t));

  // Strategy 3: Question keyword overlap with ko
  const questionNouns = extractKoNouns(w.question);
  const qOverlap = questionNouns.some(n => n.length >= 2 && koText.includes(n));

  const isMatch = koOverlap || enOverlap || qOverlap;

  if (!isMatch) {
    const t = themes[day - 1];
    whyMismatches.push({
      day,
      keyword: t?.keyword || "?",
      question: w.question,
      en: ws.en,
      ko: ws.ko,
    });
  }
}

// Output
console.log("=== 세계문화 불일치: " + worldMismatches.length + "건 ===\n");
for (const m of worldMismatches) {
  console.log(`${m.day} | ${m.keyword} | ${m.country} | ${m.worldTitle.substring(0, 30)}`);
  console.log(`  EN: ${m.en.substring(0, 90)}`);
  console.log(`  KO: ${m.ko.substring(0, 50)}`);
  console.log();
}

console.log("\n=== 과학 불일치: " + whyMismatches.length + "건 ===\n");
for (const m of whyMismatches) {
  console.log(`${m.day} | ${m.keyword} | ${m.question.substring(0, 35)}`);
  console.log(`  EN: ${m.en.substring(0, 90)}`);
  console.log(`  KO: ${m.ko.substring(0, 50)}`);
  console.log();
}

// Save results
fs.writeFileSync(
  path.join(__dirname, "mismatch_results.json"),
  JSON.stringify({ worldMismatches, whyMismatches }, null, 2),
  "utf-8"
);
console.log("\n저장: scripts/mismatch_results.json");
