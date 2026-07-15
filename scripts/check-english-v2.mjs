import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const english = JSON.parse(readFileSync(join(dataDir, 'english.json'), 'utf-8'));
const classics = JSON.parse(readFileSync(join(dataDir, 'classics.json'), 'utf-8'));
const arts = JSON.parse(readFileSync(join(dataDir, 'arts.json'), 'utf-8'));
const worlds = JSON.parse(readFileSync(join(dataDir, 'worlds.json'), 'utf-8'));
const whys = JSON.parse(readFileSync(join(dataDir, 'whys.json'), 'utf-8'));

// ========== 1. 고전 교차검증 ==========
// Build index: for each classic, extract title keywords that can identify it
console.log('=== 1. 고전 문장 교차검증 ===\n');

const classicIssues = [];
for (let i = 0; i < english.length; i++) {
  const eng = english[i];
  const classic = classics[i];
  if (!eng?.sentences || !classic) continue;

  const sent = eng.sentences.find(s => s.source === '고전');
  if (!sent) continue;

  const en = sent.en || '';
  const ko = sent.ko || '';

  // Check: does this sentence mention a specific classic that ISN'T the day's classic?
  // Search all classics to see if this sentence matches a DIFFERENT day's classic better
  for (let j = 0; j < classics.length; j++) {
    if (j === i) continue;
    const otherClassic = classics[j];
    if (!otherClassic) continue;

    const otherTitle = otherClassic.title || '';
    const otherAuthor = otherClassic.author || '';

    // Check if English sentence explicitly mentions another classic's title
    // Only check for distinctive titles (skip very generic ones)
    if (otherTitle.length >= 3) {
      // Check Korean title in Korean text
      if (ko.includes(otherTitle) && !ko.includes(classic.title)) {
        classicIssues.push({
          day: i + 1,
          issue: `한국어 문장에 "${otherTitle}" 언급 (Day ${j+1}의 고전)`,
          currentClassic: `${classic.title} (${classic.author})`,
          en: en.substring(0, 100)
        });
        break;
      }
    }
  }

  // Also check well-known quotes that are unmistakably from specific works
  const unmistakableQuotes = [
    { pattern: /Happy families are all alike/i, work: '안나 카레니나' },
    { pattern: /행복한 가정은 모두/i, work: '안나 카레니나' },
    { pattern: /Call me Ishmael/i, work: '모비딕' },
    { pattern: /It was the best of times/i, work: '두 도시 이야기' },
    { pattern: /All animals are equal/i, work: '동물농장' },
    { pattern: /bright cold day in April.*clocks/i, work: '1984' },
    { pattern: /Gregor Samsa/i, work: '변신' },
    { pattern: /그레고르 잠자/i, work: '변신' },
    { pattern: /Gatsby believed in the green light/i, work: '위대한 개츠비' },
    { pattern: /truth universally acknowledged.*single man/i, work: '오만과 편견' },
    { pattern: /Mother died today|Maman died today|Aujourd'hui, maman est morte/i, work: '이방인' },
  ];

  for (const { pattern, work } of unmistakableQuotes) {
    if ((pattern.test(en) || pattern.test(ko)) && classic.title !== work && !classic.title.includes(work)) {
      classicIssues.push({
        day: i + 1,
        issue: `"${work}"의 유명 인용문이 "${classic.title}" 항목에 있음`,
        currentClassic: `${classic.title} (${classic.author})`,
        en: en.substring(0, 100)
      });
      break;
    }
  }
}

if (classicIssues.length > 0) {
  console.log(`${classicIssues.length}건 불일치:\n`);
  for (const m of classicIssues) {
    console.log(`  Day ${m.day}: ${m.issue}`);
    console.log(`    당일 고전: ${m.currentClassic}`);
    console.log(`    영어: ${m.en}`);
    console.log('');
  }
} else {
  console.log('불일치 없음\n');
}

// ========== 2. 명화 교차검증 ==========
console.log('=== 2. 명화 문장 교차검증 ===\n');

const artIssues = [];
for (let i = 0; i < english.length; i++) {
  const eng = english[i];
  const art = arts[i];
  if (!eng?.sentences || !art) continue;

  const sent = eng.sentences.find(s => s.source === '명화');
  if (!sent) continue;

  const en = sent.en || '';
  const ko = sent.ko || '';
  const artArtist = (art.artist || '').toLowerCase();
  const artTitle = art.title || '';

  // Extract artist name mentioned in the English sentence
  // Pattern: "Artist's Work" or "Artist painted/created"
  const artistMatch = en.match(/^(\w[\w\s]*?)'s\s/);
  const artistMatch2 = en.match(/^(\w[\w\s]*?)\s(?:painted|created|carved|drew|designed|sculpted|captured|used|composed|built|showed|portrayed|placed|arranged|depicted|filled|turned|set|made|transformed|broke|blurred|hung|stacked|wrapped|dripped|placed|poured)/);

  const mentionedArtist = (artistMatch?.[1] || artistMatch2?.[1] || '').toLowerCase().trim();

  if (mentionedArtist && mentionedArtist.length > 2) {
    // Check if this artist matches the day's art entry
    // Normalize for comparison
    const normalize = s => s.toLowerCase()
      .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u')
      .replace(/[ôó]/g, 'o').replace(/[ïî]/g, 'i').replace(/ü/g, 'u')
      .replace(/ñ/g, 'n').replace(/ç/g, 'c');

    const normMentioned = normalize(mentionedArtist);
    const normArtArtist = normalize(artArtist);

    // Check if the mentioned artist's last name appears in the art artist field
    const lastNameMentioned = normMentioned.split(/\s+/).pop();
    const lastNameArt = normArtArtist.split(/\s+/).pop();

    // Also check first name for single-name artists (Rembrandt, Caravaggio, etc.)
    const isMatch = normArtArtist.includes(lastNameMentioned) ||
                    normMentioned.includes(lastNameArt) ||
                    normArtArtist.includes(normMentioned) ||
                    normMentioned.includes(normArtArtist);

    if (!isMatch) {
      // Also try matching Korean artist name
      const koArtistPatterns = [
        /(\S+)의/, /(\S+)는/, /(\S+)가/
      ];
      let koMatch = false;
      for (const p of koArtistPatterns) {
        const m = ko.match(p);
        if (m && artArtist.includes(m[1])) {
          koMatch = true;
          break;
        }
      }

      if (!koMatch) {
        // Verify it's a real mismatch by checking if the mentioned artist exists in arts.json
        const foundInOtherDay = arts.findIndex((a, idx) => {
          if (idx === i || !a) return false;
          const normOther = normalize((a.artist || '').toLowerCase());
          return normOther.includes(lastNameMentioned) || lastNameMentioned.includes(normOther.split(/\s+/).pop());
        });

        artIssues.push({
          day: i + 1,
          issue: `영어 문장 작가 "${mentionedArtist}" ≠ 당일 명화 작가 "${art.artist}"`,
          artTitle: artTitle,
          en: en.substring(0, 120),
          possibleDay: foundInOtherDay >= 0 ? foundInOtherDay + 1 : null
        });
      }
    }
  }
}

if (artIssues.length > 0) {
  console.log(`${artIssues.length}건 불일치:\n`);
  for (const m of artIssues) {
    console.log(`  Day ${m.day}: ${m.issue}`);
    console.log(`    당일 명화: ${m.artTitle}`);
    console.log(`    영어: ${m.en}`);
    if (m.possibleDay) console.log(`    → 이 작가는 Day ${m.possibleDay}의 명화 작가와 일치할 수 있음`);
    console.log('');
  }
} else {
  console.log('불일치 없음\n');
}

// ========== 3. 세계문화 교차검증 ==========
console.log('=== 3. 세계문화 문장 교차검증 ===\n');

const worldIssues = [];
for (let i = 0; i < english.length; i++) {
  const eng = english[i];
  const world = worlds[i];
  if (!eng?.sentences || !world) continue;

  const sent = eng.sentences.find(s => s.source === '세계문화');
  if (!sent) continue;

  const en = sent.en || '';
  const ko = sent.ko || '';
  const worldCountry = world.country || '';

  // Build a map of country name -> english keywords (only very specific ones)
  // Use word-boundary matching to avoid false positives
  const countryPatterns = [
    { countries: ['일본'], pattern: /\bJapan(?:ese)?\b|\b기모노\b|\b사무라이\b|\b스시\b|\bsamurai\b|\bkimono\b|\bsushi\b|\bsake\b|\borigami\b|\bwabi[\s-]sabi\b|\bikigai\b|\bhaiku\b|\bshinto\b|\bkabuki\b|\bsumo\b|\bTokyo\b|\bKyoto\b|\bOsaka\b/i },
    { countries: ['프랑스'], pattern: /\bFrance\b|\bFrench\b|\bParis\b|\bcroissant\b|\bEiffel\b|\bVersailles\b|\bNapoleon\b|\bMolière\b|\bBastille\b|\bchateau\b|\bchâteau\b|\bliberté\b/i },
    { countries: ['중국'], pattern: /\bChin(?:a|ese)\b.*(?:dynasty|emperor|calligraphy|silk|porcelain|chopstick|dim sum|Great Wall|Beijing|Shanghai|Confuci)/i },
    { countries: ['인도'], pattern: /\bIndia(?:n)?\b.*(?:curry|Bollywood|yoga|dharma|karma|sari|chai|Gandhi|Hindi|Sanskrit|Diwali|caste|Namaste|Taj|Ganges|Mumbai|Delhi)/i },
    { countries: ['멕시코'], pattern: /\bMexic(?:o|an)\b/i },
    { countries: ['브라질'], pattern: /\bBrazil(?:ian)?\b/i },
    { countries: ['아르헨티나'], pattern: /\bArgentin(?:a|e|ian)\b/i },
    { countries: ['러시아'], pattern: /\bRussia(?:n)?\b.*(?:vodka|ballet|Moscow|Kremlin|tsar|czar|Soviet)/i },
    { countries: ['이탈리아'], pattern: /\bItal(?:y|ian)\b.*(?:Rome|pizza|pasta|Renaissance|Venice|opera|espresso|gelato|Florence|Milan)/i },
    { countries: ['독일'], pattern: /\bGerman(?:y)?\b.*(?:Berlin|beer|sausage|Oktoberfest|autobahn|Bach|Beethoven|Wagner)/i },
    { countries: ['스페인'], pattern: /\bSpain\b|\bSpanish\b.*(?:flamenco|tapas|siesta|bullfight|Madrid|Barcelona)/i },
    { countries: ['영국'], pattern: /\bBritish\b|\bEngland\b|\bUnited Kingdom\b|\bLondon\b.*(?:tea|parliament|cricket|royal)/i },
    { countries: ['한국'], pattern: /\bKorea(?:n)?\b/i },
    { countries: ['태국'], pattern: /\bThai(?:land)?\b/i },
    { countries: ['베트남'], pattern: /\bVietnam(?:ese)?\b/i },
    { countries: ['이집트'], pattern: /\bEgypt(?:ian)?\b/i },
    { countries: ['그리스'], pattern: /\bGreek\b|\bGreece\b/i },
    { countries: ['터키', '튀르키예'], pattern: /\bTurk(?:ey|ish)\b|\bTürkiye\b|\bOttoman\b|\bIstanbul\b/i },
  ];

  // Simple country name extraction from the beginning of the sentence
  // Pattern: "In [Country], ..." or "The [Adjective] [noun] of/from/in [Country]..."
  const inCountryMatch = en.match(/\bIn\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),/);
  const ofCountryMatch = en.match(/(?:of|from|in)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);

  // Check if the sentence is about a completely different country
  let detectedCountry = null;
  for (const { countries, pattern } of countryPatterns) {
    if (pattern.test(en)) {
      // Check if the detected country matches the world entry
      const isMatch = countries.some(c => worldCountry.includes(c));
      if (!isMatch) {
        // Make sure it's the main subject, not a passing reference
        // Check if the country appears in the first 60 chars
        const first60 = en.substring(0, 60);
        if (pattern.test(first60)) {
          detectedCountry = countries[0];
          break;
        }
      }
    }
  }

  if (detectedCountry) {
    worldIssues.push({
      day: i + 1,
      issue: `영어 문장이 "${detectedCountry}" 관련, 당일 세계문화는 "${worldCountry}"`,
      worldTitle: world.title,
      en: en.substring(0, 120)
    });
  }
}

if (worldIssues.length > 0) {
  console.log(`${worldIssues.length}건 불일치:\n`);
  for (const m of worldIssues) {
    console.log(`  Day ${m.day}: ${m.issue}`);
    console.log(`    당일 세계: ${m.worldTitle}`);
    console.log(`    영어: ${m.en}`);
    console.log('');
  }
} else {
  console.log('불일치 없음\n');
}

// ========== 4. date 필드 현황 ==========
console.log('=== 4. date 필드 현황 ===\n');

const dataFiles = {
  'english.json': english,
  'classics.json': classics,
  'arts.json': arts,
  'worlds.json': worlds,
  'whys.json': whys
};

for (const [name, data] of Object.entries(dataFiles)) {
  let withDate = 0;
  let withoutDate = 0;
  for (const entry of data) {
    if (entry.date) withDate++;
    else withoutDate++;
  }
  console.log(`${name}: ${data.length}개 항목, date 있음=${withDate}, date 없음=${withoutDate}`);
}

console.log('\n=== 검사 완료 ===');
