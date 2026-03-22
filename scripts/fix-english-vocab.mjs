import fs from "fs";

const english = JSON.parse(fs.readFileSync("src/data/english.json", "utf-8"));

// Replace vocab words that no longer appear in any sentence
// Key: day index (0-based), Value: { old word -> new { word, meaning } }
const vocabFixes = {
  // Day 61: defy → realistic (from art sentence)
  60: { old: "defy", new: { word: "realistic", meaning: "사실적인" } },
  // Day 63: execute → flame (from art sentence)
  62: { old: "execute", new: { word: "flame", meaning: "불꽃" } },
  // Day 72: longing → blindfolded (from art sentence)
  71: { old: "longing", new: { word: "blindfolded", meaning: "눈이 가려진" } },
  // Day 106: column → perspective (from art sentence)
  105: { old: "column", new: { word: "perspective", meaning: "원근법, 관점" } },
  // Day 173: chaos → trample (from art sentence)
  172: { old: "chaos", new: { word: "trample", meaning: "짓밟다" } },
  // Day 185: anatomy → hygiene (from art sentence)
  184: { old: "anatomy", new: { word: "hygiene", meaning: "위생" } },
  // Day 191: anxiety → terrified, overwhelming → scatter (from art sentence)
  190: [
    { old: "anxiety", new: { word: "terrified", meaning: "공포에 질린" } },
    { old: "overwhelming", new: { word: "scatter", meaning: "흩어지다" } }
  ],
  // Day 208: urinal → sculpt (from art sentence)
  207: { old: "urinal", new: { word: "sculpt", meaning: "조각하다" } },
  // Day 209: perceive → humble (from art sentence)
  208: { old: "perceive", new: { word: "humble", meaning: "소박한, 겸손한" } },
  // Day 211: loneliness → embrace (from art sentence)
  210: { old: "loneliness", new: { word: "embrace", meaning: "포옹하다" } },
  // Day 213: solitary → boundary (from art sentence)
  212: { old: "solitary", new: { word: "boundary", meaning: "경계" } },
  // Day 264: delicately → dusk, glow → poetic (from art sentence)
  263: [
    { old: "delicately", new: { word: "dusk", meaning: "황혼" } },
    { old: "glow", new: { word: "poetic", meaning: "시적인" } }
  ],
  // Day 274: cathedral → cloak (from art sentence)
  273: { old: "cathedral", new: { word: "cloak", meaning: "망토" } },
  // Day 275: harmony → pit, conductor → focused (from art sentence)
  274: [
    { old: "harmony", new: { word: "pit", meaning: "(오케스트라) 연주석" } },
    { old: "conductor", new: { word: "focused", meaning: "집중한" } }
  ],
  // Day 328: portrait → mythology (from art sentence)
  327: { old: "portrait", new: { word: "mythology", meaning: "신화" } }
};

let count = 0;
for (const [idx, fixes] of Object.entries(vocabFixes)) {
  const i = Number(idx);
  const fixArray = Array.isArray(fixes) ? fixes : [fixes];

  for (const fix of fixArray) {
    const vocabIdx = english[i].vocab.findIndex(v => v.word === fix.old);
    if (vocabIdx !== -1) {
      english[i].vocab[vocabIdx] = fix.new;
      console.log(`Day ${i + 1}: ${fix.old} → ${fix.new.word} (${fix.new.meaning})`);
      count++;
    } else {
      console.log(`Day ${i + 1}: ⚠️ "${fix.old}" not found in vocab`);
    }
  }
}

// Verify: check all replaced days have no missing vocab
const days = [61,63,69,72,106,173,185,191,202,208,209,211,213,264,273,274,275,328];
let issues = 0;
for (const d of days) {
  const e = english[d - 1];
  const allText = e.sentences.map(s => s.en.toLowerCase()).join(" ");
  const missing = e.vocab.filter(v => !allText.includes(v.word.toLowerCase()));
  if (missing.length > 0) {
    console.log(`\n⚠️ Day ${d} still missing: ${missing.map(v => v.word).join(", ")}`);
    issues++;
  }
}

fs.writeFileSync("src/data/english.json", JSON.stringify(english, null, 2) + "\n");
console.log(`\nDone! ${count}개 vocab 교체 완료` + (issues ? `, ${issues}개 이슈 남음` : ", 모든 vocab 검증 통과 ✅"));
