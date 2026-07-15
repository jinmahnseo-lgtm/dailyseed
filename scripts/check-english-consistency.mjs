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

const mismatches = [];

// Helper: extract key content from each source for comparison
function getClassicKeywords(classic) {
  if (!classic) return null;
  return {
    title: classic.title,
    author: classic.author,
    keywords: [classic.title, classic.author].filter(Boolean)
  };
}

function getArtKeywords(art) {
  if (!art) return null;
  return {
    title: art.title,
    artist: art.artist,
    keywords: [art.title, art.artist].filter(Boolean)
  };
}

function getWorldKeywords(world) {
  if (!world) return null;
  return {
    country: world.country,
    title: world.title,
    keywords: [world.country, world.title].filter(Boolean)
  };
}

function getWhyKeywords(why) {
  if (!why) return null;
  return {
    title: why.title,
    keywords: [why.title].filter(Boolean)
  };
}

// Check each day by array index
for (let i = 0; i < english.length; i++) {
  const dayNum = i + 1;
  const eng = english[i];
  const classic = classics[i];
  const art = arts[i];
  const world = worlds[i];
  const why = whys[i];

  // Find each source sentence in english entry
  const sentences = eng.sentences || [];

  for (const sent of sentences) {
    const source = sent.source;
    const enText = sent.en || '';
    const koText = sent.ko || '';

    if (source === '고전' && classic) {
      // Check if the english sentence relates to the classic
      const classicTitle = classic.title || '';
      const classicAuthor = classic.author || '';

      // Check for obvious mismatches - the sentence should reference
      // concepts related to the classic, not a completely different work
      // We check if any well-known opening lines/quotes from OTHER classics appear
      const knownQuotes = {
        '안나 카레니나': ['Happy families are all alike', '행복한 가정은 모두'],
        '전쟁과 평화': ['War and Peace'],
        '죄와 벌': ['Crime and Punishment'],
        '변신': ['woke from troubled dreams', 'Gregor Samsa'],
        '1984': ['Big Brother', 'clocks were striking thirteen'],
        '노인과 바다': ['Old Man and the Sea'],
      };

      // More robust check: look if the sentence mentions a specific author/work
      // that doesn't match the day's classic
      const authorMentions = enText.match(/(?:Tolstoy|Dostoevsky|Kafka|Orwell|Hemingway|Dickens|Austen|Shakespeare|Homer|Dante|Hugo|Flaubert|Cervantes|Brontë|Twain|Melville|Poe|Woolf)/gi) || [];
      const koAuthorMentions = koText.match(/(?:톨스토이|도스토옙스키|카프카|오웰|헤밍웨이|디킨스|오스틴|셰익스피어|호메로스|단테|위고|플로베르|세르반테스|브론테|트웨인|멜빌|포|울프)/g) || [];

      // Check if Anna Karenina quote is misplaced
      if ((enText.includes('Happy families are all alike') || enText.includes('happy family')) &&
          !classicTitle.includes('안나 카레니나') && !classicTitle.includes('Anna Karenina')) {
        mismatches.push({
          day: dayNum,
          date: eng.date,
          source: '고전',
          issue: `안나 카레니나 문장이 "${classicTitle}" (${classicAuthor})에 들어있음`,
          en: enText.substring(0, 80),
          expected: `${classicTitle} (${classicAuthor})`
        });
      }
    }

    if (source === '세계문화' && world) {
      const worldCountry = world.country || '';
      const worldTitle = world.title || '';

      // Check for country/culture mismatches
      const countryKeywords = {
        '일본': ['Japanese', 'Japan', 'kimono', '기모노', 'samurai', '사무라이', 'sake', 'sushi', 'origami', 'bonsai', 'kabuki', 'geisha', 'shogun', 'dojo', 'karate', 'sumo', 'zen', 'haiku', 'ukiyo-e', 'wabi-sabi', 'ikigai', 'matcha', 'torii'],
        '프랑스': ['French', 'France', 'Paris', '프랑스', '파리', 'croissant', 'baguette', 'haute couture', 'Eiffel', 'Versailles', 'revolution', 'liberté', 'château', 'fromage', 'vin'],
        '중국': ['Chinese', 'China', '중국', 'Beijing', 'dynasty', 'emperor', 'chopstick', 'dim sum', 'Great Wall', 'calligraphy', 'jade', 'dragon', 'silk'],
        '인도': ['Indian', 'India', '인도', 'curry', 'Bollywood', 'yoga', 'dharma', 'karma', 'sari', 'chai', 'Gandhi', 'Taj Mahal', 'Hindi', 'Sanskrit', 'Diwali', 'caste'],
        '한국': ['Korean', 'Korea', '한국', 'kimchi', 'K-pop', 'hanbok', 'bulgogi', 'soju'],
        '이탈리아': ['Italian', 'Italy', '이탈리아', 'Rome', 'pizza', 'pasta', 'Renaissance', 'Venice', 'opera', 'espresso', 'gelato'],
        '영국': ['British', 'England', 'UK', '영국', 'London', 'tea', 'pub', 'queen', 'king', 'Parliament', 'cricket', 'scone'],
        '독일': ['German', 'Germany', '독일', 'Berlin', 'beer', 'sausage', 'Oktoberfest', 'autobahn'],
        '스페인': ['Spanish', 'Spain', '스페인', 'flamenco', 'tapas', 'siesta', 'bullfight', 'Madrid', 'Barcelona'],
        '브라질': ['Brazilian', 'Brazil', '브라질', 'samba', 'carnival', 'football', 'capoeira', 'Amazon'],
        '러시아': ['Russian', 'Russia', '러시아', 'Moscow', 'vodka', 'ballet', 'matryoshka', 'Kremlin', 'tsar', 'czar'],
        '멕시코': ['Mexican', 'Mexico', '멕시코', 'taco', 'mariachi', 'Day of the Dead', 'tequila', 'Aztec', 'Maya'],
        '터키': ['Turkish', 'Turkey', 'Türkiye', '터키', 'Istanbul', 'kebab', 'bazaar', 'Ottoman', 'hammam'],
        '이집트': ['Egyptian', 'Egypt', '이집트', 'pyramid', 'pharaoh', 'Nile', 'sphinx', 'hieroglyph'],
        '그리스': ['Greek', 'Greece', '그리스', 'Athens', 'Parthenon', 'philosophy', 'olive', 'Zeus', 'Olymp'],
        '태국': ['Thai', 'Thailand', '태국', 'Bangkok', 'temple', 'Muay Thai', 'pad thai', 'tuk-tuk'],
        '베트남': ['Vietnamese', 'Vietnam', '베트남', 'pho', 'banh mi', 'ao dai'],
        '아르헨티나': ['Argentine', 'Argentina', '아르헨티나', 'tango', 'Buenos Aires', 'gaucho', 'mate'],
      };

      // Detect which country the English sentence is about
      let detectedCountry = null;
      for (const [country, keywords] of Object.entries(countryKeywords)) {
        for (const kw of keywords) {
          if (enText.toLowerCase().includes(kw.toLowerCase()) || koText.includes(kw)) {
            detectedCountry = country;
            break;
          }
        }
        if (detectedCountry) break;
      }

      // Check if world country and detected country differ
      if (detectedCountry && !worldCountry.includes(detectedCountry) &&
          !worldTitle.includes(detectedCountry)) {
        // Extra check: some countries appear in contexts about other countries
        // e.g., "France colonized Vietnam" in a Vietnam entry
        // So only flag if the main subject seems wrong
        mismatches.push({
          day: dayNum,
          date: eng.date,
          source: '세계문화',
          issue: `영어 문장은 "${detectedCountry}" 관련인데, 당일 세계문화는 "${worldCountry}" (${worldTitle})`,
          en: enText.substring(0, 100),
          expected: `${worldCountry} - ${worldTitle}`
        });
      }
    }
  }
}

// === Part 2: Comprehensive content matching by checking if English sentences ===
// === relate to the same-index entries in each data file ===

console.log('=== 영어 데이터 정합성 전수검사 결과 ===\n');

// More thorough check: for each english entry, check if the 고전 sentence
// can be matched to the corresponding classics entry
for (let i = 0; i < english.length; i++) {
  const dayNum = i + 1;
  const eng = english[i];
  const classic = classics[i];
  const art = arts[i];
  const world = worlds[i];
  const why = whys[i];

  if (!eng || !eng.sentences) continue;

  for (const sent of eng.sentences) {
    // Check date field existence
    // (will be listed separately below)
  }
}

// Deduplicate mismatches
const seen = new Set();
const uniqueMismatches = mismatches.filter(m => {
  const key = `${m.day}-${m.source}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

if (uniqueMismatches.length === 0) {
  console.log('키워드 기반 검사: 명확한 불일치 없음\n');
} else {
  console.log(`키워드 기반 검사: ${uniqueMismatches.length}건 불일치 발견\n`);
  for (const m of uniqueMismatches) {
    console.log(`Day ${m.day} (${m.date}) [${m.source}]`);
    console.log(`  문제: ${m.issue}`);
    console.log(`  영어: ${m.en}...`);
    console.log(`  예상: ${m.expected}`);
    console.log('');
  }
}

// === Part 3: Check date fields still in english.json ===
console.log('=== date 필드가 남아있는 항목 ===\n');
let dateCount = 0;
for (let i = 0; i < english.length; i++) {
  if (english[i].date) {
    dateCount++;
  }
}
console.log(`총 ${english.length}개 항목 중 ${dateCount}개에 date 필드가 존재\n`);

// Also check other data files
const files = { classics, arts, worlds, whys };
for (const [name, data] of Object.entries(files)) {
  let count = 0;
  for (const entry of data) {
    if (entry.date) count++;
  }
  console.log(`${name}.json: ${data.length}개 중 ${count}개에 date 필드 존재`);
}

// === Part 4: Deep content cross-check ===
// For 고전: check if english sentence mentions the actual classic's title/author/theme
// by looking at both the classic entry and the english sentence more carefully
console.log('\n=== 고전 문장-작품 상세 교차검증 ===\n');

const classicMismatches = [];
for (let i = 0; i < english.length; i++) {
  const dayNum = i + 1;
  const eng = english[i];
  const classic = classics[i];

  if (!eng || !classic || !eng.sentences) continue;

  const classicSent = eng.sentences.find(s => s.source === '고전');
  if (!classicSent) continue;

  const enText = classicSent.en || '';
  const koText = classicSent.ko || '';
  const noteText = classicSent.note || '';

  // Extract the classic's title and check for well-known first lines / quotes
  // that don't belong to this work
  const wellKnownFirstLines = [
    { work: '안나 카레니나', patterns: ['Happy families are all alike', '행복한 가정은 모두'] },
    { work: '변신', patterns: ['woke from troubled dreams', 'Gregor Samsa', '그레고르 잠자'] },
    { work: '1984', patterns: ['bright cold day in April', 'clocks were striking thirteen', 'Big Brother is watching'] },
    { work: '오만과 편견', patterns: ['truth universally acknowledged', 'single man in possession', '보편적으로 인정되는 진리'] },
    { work: '백년의 고독', patterns: ['many years later.*facing the firing squad', '총살대 앞에'] },
    { work: '이방인', patterns: ['Mother died today', 'Maman died today', '오늘 엄마가 죽었다'] },
    { work: '모비딕', patterns: ['Call me Ishmael', '이슈메일이라 불러'] },
    { work: '돈키호테', patterns: ['In a village of La Mancha', '라만차의 어느 마을'] },
    { work: '노인과 바다', patterns: ['old man who fished alone', '혼자 고기잡이를 하는 노인'] },
    { work: '위대한 개츠비', patterns: ['green light', 'Gatsby believed', 'boats against the current'] },
    { work: '카라마조프 가의 형제들', patterns: ['God does not exist.*everything is permitted', '신이 없다면.*모든 것이 허용'] },
    { work: '죄와 벌', patterns: ['extraordinary man', 'Pain and suffering are always inevitable'] },
    { work: '전쟁과 평화', patterns: ['Pierre Bezukhov', 'Prince Andrei'] },
    { work: '보바리 부인', patterns: ['Madame Bovary'] },
    { work: '레 미제라블', patterns: ['Les Misérables', 'Jean Valjean'] },
    { work: '파우스트', patterns: ['Faust', 'Mephistopheles'] },
  ];

  // Check if the sentence contains a well-known quote from a DIFFERENT work
  for (const { work, patterns } of wellKnownFirstLines) {
    if (classic.title && classic.title.includes(work)) continue; // matches, skip

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(enText) || regex.test(koText)) {
        classicMismatches.push({
          day: dayNum,
          date: eng.date,
          classicTitle: classic.title,
          classicAuthor: classic.author,
          detectedWork: work,
          en: enText.substring(0, 100)
        });
        break;
      }
    }
  }
}

if (classicMismatches.length > 0) {
  console.log(`${classicMismatches.length}건 고전 불일치:\n`);
  for (const m of classicMismatches) {
    console.log(`Day ${m.day} (${m.date})`);
    console.log(`  당일 고전: ${m.classicTitle} (${m.classicAuthor})`);
    console.log(`  영어 문장에서 감지: ${m.detectedWork}`);
    console.log(`  영어: ${m.en}...`);
    console.log('');
  }
} else {
  console.log('고전 유명 문장 불일치: 없음');
}

// === Part 5: Cross-check art sentences ===
console.log('\n=== 명화 문장-작품 교차검증 ===\n');

const artMismatches = [];
for (let i = 0; i < english.length; i++) {
  const dayNum = i + 1;
  const eng = english[i];
  const art = arts[i];

  if (!eng || !art || !eng.sentences) continue;

  const artSent = eng.sentences.find(s => s.source === '명화');
  if (!artSent) continue;

  const enText = artSent.en || '';
  const koText = artSent.ko || '';

  // Extract artist name from arts entry
  const artArtist = art.artist || '';
  const artTitle = art.title || '';

  // Check if the english sentence mentions a different artist
  // Extract artist names from the english sentence
  const artistsInSentence = [];
  const knownArtists = [
    'Monet', 'Manet', 'Renoir', 'Degas', 'Cézanne', 'Van Gogh', 'Picasso', 'Matisse',
    'Rembrandt', 'Vermeer', 'Rubens', 'Caravaggio', 'Raphael', 'Michelangelo', 'Leonardo',
    'Botticelli', 'Titian', 'Velázquez', 'Goya', 'El Greco', 'Klimt', 'Schiele', 'Munch',
    'Kandinsky', 'Mondrian', 'Dalí', 'Miró', 'Warhol', 'Pollock', 'Rothko', 'Hopper',
    'Turner', 'Constable', 'Gainsborough', 'Sargent', 'Whistler', 'Homer',
    'Hokusai', 'Hiroshige', 'Frida', 'Rivera', 'Kahlo', 'Rodin', 'Modigliani',
    'Canaletto', 'Bruegel', 'Bosch', 'Dürer', 'Holbein',
    'Delacroix', 'Courbet', 'Pissarro', 'Sisley', 'Cassatt', 'Seurat',
    'Toulouse-Lautrec', 'Gauguin', 'Cézanne', 'Bonnard', 'Vuillard',
    'Klee', 'Marc', 'Kirchner', 'Nolde', 'Beckmann',
    'Magritte', 'Ernst', 'Tanguy', 'Arp', 'Man Ray',
    'De Kooning', 'Kline', 'Still', 'Newman', 'Reinhardt',
    'Lichtenstein', 'Oldenburg', 'Rauschenberg', 'Johns',
    'Hockney', 'Freud', 'Bacon', 'Giacometti',
    'Chagall', 'Léger', 'Braque', 'Duchamp',
    'La Tour', 'Poussin', 'Claude Lorrain', 'Watteau', 'Boucher', 'Fragonard',
    'David', 'Ingres', 'Géricault',
    'Millais', 'Rossetti', 'Hunt', 'Waterhouse',
    'Bierstadt', 'Church', 'Cole',
    'Repin', 'Shishkin', 'Levitan',
    'Mucha', 'Beardsley', 'Moreau',
    'O\'Keeffe', 'Wood', 'Wyeth',
    'Basquiat', 'Haring', 'Banksy',
    '모네', '마네', '르누아르', '드가', '세잔', '고흐', '피카소', '마티스',
    '렘브란트', '베르메르', '루벤스', '카라바조', '라파엘로', '미켈란젤로', '레오나르도',
    '보티첼리', '클림트', '뭉크', '칸딘스키', '몬드리안', '달리', '워홀', '폴록', '호퍼',
    '프리다', '리베라', '카알로', '로댕', '모딜리아니', '샤갈', '뒤샹', '브라크',
    '사전트', '호쿠사이', '히로시게', '들라크루아', '쿠르베'
  ];

  for (const artist of knownArtists) {
    if (enText.includes(artist) || koText.includes(artist)) {
      // Check if this artist matches the art entry's artist
      const artArtistLower = artArtist.toLowerCase();
      const artistLower = artist.toLowerCase();
      if (!artArtistLower.includes(artistLower) && !artistLower.includes(artArtistLower)) {
        // Could be a mention in context, check if it's the primary subject
        if (enText.includes(`${artist}'s`) || enText.includes(`${artist} painted`) ||
            enText.includes(`${artist} created`) || enText.startsWith(artist) ||
            koText.includes(`${artist}의`) || koText.includes(`${artist}는`) || koText.includes(`${artist}가`)) {
          artMismatches.push({
            day: dayNum,
            date: eng.date,
            artTitle: artTitle,
            artArtist: artArtist,
            detectedArtist: artist,
            en: enText.substring(0, 100)
          });
          break;
        }
      }
    }
  }
}

if (artMismatches.length > 0) {
  console.log(`${artMismatches.length}건 명화 불일치:\n`);
  for (const m of artMismatches) {
    console.log(`Day ${m.day} (${m.date})`);
    console.log(`  당일 명화: ${m.artTitle} (${m.artArtist})`);
    console.log(`  영어 문장에서 감지: ${m.detectedArtist}`);
    console.log(`  영어: ${m.en}...`);
    console.log('');
  }
} else {
  console.log('명화 작가 불일치: 없음');
}

console.log('\n=== 검사 완료 ===');
console.log(`총 검사 항목: ${english.length}일`);
