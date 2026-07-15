import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('src/data/english.json', 'utf-8'));

function wordAppearsIn(word, text) {
  const w = word.toLowerCase();
  const t = text.toLowerCase();

  if (t.includes(w)) return true;

  // plural/singular
  if (t.includes(w + 's') || t.includes(w + 'es')) return true;
  if (w.endsWith('s') && t.includes(w.slice(0, -1))) return true;
  if (w.endsWith('es') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('ies') && t.includes(w.slice(0, -3) + 'y')) return true;
  // y → ies
  if (w.endsWith('y') && t.includes(w.slice(0, -1) + 'ies')) return true;

  // verb forms
  if (t.includes(w + 'ed') || t.includes(w + 'd')) return true;
  if (t.includes(w + 'ing')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'ing')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'ed')) return true;
  // y → ied
  if (w.endsWith('y') && t.includes(w.slice(0, -1) + 'ied')) return true;
  if (w.endsWith('ed') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('ed') && w.length > 3 && w[w.length-3] === w[w.length-4] && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ing') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ing') && t.includes(w.slice(0, -3) + 'e')) return true;
  // double consonant
  const last = w[w.length-1];
  if ('bcdfgklmnprst'.includes(last)) {
    if (t.includes(w + last + 'ed') || t.includes(w + last + 'ing')) return true;
  }

  // -ly
  if (t.includes(w + 'ly')) return true;
  if (w.endsWith('ly') && t.includes(w.slice(0, -2))) return true;

  // -ment, -ness, -tion, -sion, -ity, -ance, -ence
  if (w.endsWith('ment') && t.includes(w.slice(0, -4))) return true;
  if (w.endsWith('ness') && t.includes(w.slice(0, -4))) return true;
  if (w.endsWith('tion') && t.includes(w.slice(0, -4))) return true;
  if (w.endsWith('tion') && t.includes(w.slice(0, -3) + 'e')) return true;
  if (w.endsWith('sion') && t.includes(w.slice(0, -4))) return true;
  if (w.endsWith('ity') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ity') && t.includes(w.slice(0, -3) + 'e')) return true;
  if (w.endsWith('ance') && t.includes(w.slice(0, -4))) return true;
  if (w.endsWith('ence') && t.includes(w.slice(0, -4))) return true;
  if (t.includes(w + 'tion') || t.includes(w + 'ation')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'ation')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'tion')) return true;

  // -er, -est, -ous, -ive, -al
  if (w.endsWith('er') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('est') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ous') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ive') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('al') && t.includes(w.slice(0, -2))) return true;

  // un-, re-, dis-, in-, im- prefix
  if (w.startsWith('un') && t.includes(w.slice(2))) return true;
  if (w.startsWith('re') && t.includes(w.slice(2))) return true;
  if (w.startsWith('dis') && t.includes(w.slice(3))) return true;

  // -ful, -less
  if (w.endsWith('ful') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('less') && t.includes(w.slice(0, -4))) return true;

  return false;
}

const notFoundAnywhere = [];
const wrongIndex = [];

for (const entry of data) {
  const { day, sentences, vocab } = entry;
  if (!vocab || !sentences) continue;

  for (let i = 0; i < vocab.length; i++) {
    const word = vocab[i].word;
    if (i >= sentences.length) continue;

    // Check in corresponding sentence
    if (wordAppearsIn(word, sentences[i].en)) continue;

    // Check if it appears in ANY sentence
    const foundIn = sentences.findIndex(s => wordAppearsIn(word, s.en));
    if (foundIn >= 0) {
      wrongIndex.push({
        day, vocabIndex: i, word: vocab[i].word, meaning: vocab[i].meaning,
        expectedSource: sentences[i].source,
        actualSource: sentences[foundIn].source,
        actualIndex: foundIn
      });
    } else {
      notFoundAnywhere.push({
        day, vocabIndex: i, word: vocab[i].word, meaning: vocab[i].meaning,
        source: sentences[i].source,
        sentence: sentences[i].en
      });
    }
  }
}

console.log(`=== 검증 결과 요약 ===`);
console.log(`총 365일 × 4단어 = ${data.length * 4}개 검증`);
console.log(`정상: ${data.length * 4 - notFoundAnywhere.length - wrongIndex.length}개`);
console.log(`인덱스 불일치 (다른 문장에서 발견): ${wrongIndex.length}개`);
console.log(`어떤 문장에도 없음: ${notFoundAnywhere.length}개\n`);

// Save detailed results as JSON
const results = {
  summary: {
    total: data.length * 4,
    ok: data.length * 4 - notFoundAnywhere.length - wrongIndex.length,
    wrongIndex: wrongIndex.length,
    notFound: notFoundAnywhere.length
  },
  notFoundAnywhere,
  wrongIndex
};

writeFileSync('scripts/vocab-check-results.json', JSON.stringify(results, null, 2));
console.log('상세 결과: scripts/vocab-check-results.json\n');

console.log(`=== 어떤 문장에도 없는 단어 (${notFoundAnywhere.length}건) ===\n`);
notFoundAnywhere.forEach(m => {
  console.log(`Day ${m.day} | vocab[${m.vocabIndex}] "${m.word}" (${m.meaning}) | ${m.source}`);
  console.log(`  문장: ${m.sentence.substring(0, 120)}${m.sentence.length > 120 ? '...' : ''}\n`);
});
