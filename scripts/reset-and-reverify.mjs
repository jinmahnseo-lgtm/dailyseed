import fs from "fs";
import path from "path";

// Reset verify-results for replaced days so they can be re-verified
const LOG_PATH = path.resolve("scripts/fix-art-log.json");
const RESULTS_PATH = path.resolve("scripts/verify-results.json");

const log = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
const results = JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));

// Get days that were replaced
const replacedDays = new Set(
  log.filter(l => l.status === "replaced" || l.status === "not_found" || l.status === "download_error")
    .map(l => l.day)
);

console.log(`교체된 day 수: ${replacedDays.size}`);
console.log(`Days: ${[...replacedDays].sort((a,b) => a-b).join(", ")}`);

// Remove those entries from verify-results
const filtered = results.filter(r => !replacedDays.has(r.day));
console.log(`기존 결과: ${results.length}개 → 리셋 후: ${filtered.length}개 (${results.length - filtered.length}개 제거)`);

fs.writeFileSync(RESULTS_PATH, JSON.stringify(filtered, null, 2) + "\n");
console.log("저장 완료. 이제 verify-art-images.mjs를 다시 실행하면 됩니다.");
