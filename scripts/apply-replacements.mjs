import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "data");

const english = JSON.parse(fs.readFileSync(path.join(DATA, "english.json"), "utf-8"));
const replacements = JSON.parse(fs.readFileSync(path.join(__dirname, "replacement-sentences.json"), "utf-8"));

let worldCount = 0;
let whyCount = 0;
let errors = [];

// Apply world replacements
for (const r of replacements.world) {
  const engDay = english.find(e => e.day === r.day);
  if (!engDay) { errors.push(`World Day ${r.day}: english entry not found`); continue; }
  const sent = engDay.sentences.find(s => s.source === "세계문화");
  if (!sent) { errors.push(`World Day ${r.day}: 세계문화 sentence not found`); continue; }
  sent.en = r.en;
  sent.ko = r.ko;
  sent.note = r.note;
  worldCount++;
}

// Apply why replacements
for (const r of replacements.why) {
  const engDay = english.find(e => e.day === r.day);
  if (!engDay) { errors.push(`Why Day ${r.day}: english entry not found`); continue; }
  const sent = engDay.sentences.find(s => s.source === "왜왜왜");
  if (!sent) { errors.push(`Why Day ${r.day}: 왜왜왜 sentence not found`); continue; }
  sent.en = r.en;
  sent.ko = r.ko;
  sent.note = r.note;
  whyCount++;
}

// Write back
fs.writeFileSync(path.join(DATA, "english.json"), JSON.stringify(english, null, 2), "utf-8");

// Validate
JSON.parse(fs.readFileSync(path.join(DATA, "english.json"), "utf-8"));

console.log(`세계문화: ${worldCount}/${replacements.world.length}건 교체`);
console.log(`왜왜왜: ${whyCount}/${replacements.why.length}건 교체`);
console.log(`합계: ${worldCount + whyCount}건`);
if (errors.length) console.log("에러:", errors);
else console.log("에러 없음. JSON 검증 통과.");
