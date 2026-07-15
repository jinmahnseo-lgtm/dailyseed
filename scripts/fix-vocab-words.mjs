import { readFileSync, writeFileSync } from 'fs';

// Reload original data (not the partially fixed version)
const data = JSON.parse(readFileSync('src/data/english.json', 'utf-8'));

// ── 1. Build existing vocab dictionary ──
const existingDict = {};
data.forEach(e => {
  (e.vocab || []).forEach(v => {
    existingDict[v.word.toLowerCase()] = v.meaning;
  });
});

// ── 2. Easy words blacklist ──
const EASY_WORDS = new Set(`
a an the this that these those it its he she his her him they them their we our us you your
i me my mine myself himself herself itself themselves ourselves yourself yourselves
is am are was were be been being have has had do does did will would can could may might
shall should must need get got gets getting
and or but if so then than because since while when where how what who whom whose which
not no nor yet also too very much many more most some any all both each every other another
such just only even still already yet again ever always often sometimes never
of in on at to for with by from into through about over under between after before above
below during without along across around against among within upon beside beyond
go went gone goes going come came comes coming take took taken takes taking
make made makes making give gave given gives giving
see saw seen sees seeing look looked looks looking
say said says saying tell told tells telling
think thought thinks thinking know knew known knows knowing
want wanted wants wanting like liked likes liking
use used uses using find found finds finding
put puts putting keep kept keeps keeping
let lets letting set sets setting turn turned turns turning
show showed shown shows showing
try tried tries trying ask asked asks asking
move moved moves moving work worked works working
call called calls calling help helped helps helping
start started starts starting begin began begun begins beginning
run ran runs running play played plays playing
leave left leaves leaving live lived lives living
stand stood stands standing sit sat sits sitting hold held holds holding
bring brought brings bringing write wrote written writes writing
read reads reading open opened opens opening close closed closes closing
pay paid pays paying feel felt feels feeling mean meant means meaning
meet met meets meeting seem seemed seems seeming
create created creates creating change changed changes changing
happen happened happens happening become became becomes becoming
believe believed believes believing carry carried carries carrying
die died dies dying grow grew grown grows growing fall fell fallen falls falling
follow followed follows following stop stopped stops stopping
lead led leads leading pass passed passes passing raise raised raises raising
lose lost loses losing hit hits hitting cut cuts cutting
spend spent spends spending build built builds building
send sent sends sending draw drew drawn draws drawing
break broke broken breaks breaking wear wore worn wears wearing
pick picked picks picking fill filled fills filling
choose chose chosen chooses choosing
deal dealt deals dealing win won wins winning
remember remembered remembers remembering
fight fought fought fights fighting watch watched watches watching
develop developed develops developing
big small large little great long short high low old new young good bad
right wrong true real own different same first last next early late
best better worst worse least less
back away out up down off here there now then
man men woman women people person thing time day year way part place
hand eye face head side room house world life home water name word end
number point fact case line question night city country state area land
well really quite rather almost enough
once twice one two three four five six seven eight nine ten hundred thousand million
kind sort type form lot able being doing having making
what's that's there's here's who's it's he's she's they're we're you're i'm
don't doesn't didn't can't won't wouldn't couldn't shouldn't
mr mrs
yes oh no
paint painted paints painting paintings painter
understand understood understands understanding
someone something everything anything nothing everyone anyone everybody
reason reasons reasonable however although though whether
beauty beautiful beautifully
children child
fail failed fails failing failure
wish wished wishes wishing
done doing
listen listened listens listening
poor rich
travel traveled travels traveling travelled travelling
discover discovered discovers discovering discovery
plan planned plans planning
collect collected collects collecting collection
complete completed completes completing completely
disappear disappeared disappears disappearing
struggle struggled struggles struggling
surprise surprised surprises surprising
gather gathered gathers gathering
whole entire
straight round
together apart
tomorrow yesterday today
unless until
size shape
goal purpose goals
adventure adventures
medicine medical
distance distant
born bear bore
ancient modern
art arts
love loved loves loving
future past present futures
political politics
impossible possible
religion religious
violent violence violently
nature natural naturally
culture cultural cultures
history historical historically
science scientific scientifically
forest forests
heart hearts
friend friends friendship
alone lonely
earth
else
except
explain explained explains explaining explanation
food foods
minute minutes
mouth
others
rest rested rests resting
save saved saves saving
season seasons seasonal
service services
simply simple
things
toward towards
careful carefully careless
busy
arrive arrived arrives arriving arrival
actual actually
afterward afterwards
book books
choice choices
divide divided divides dividing division
matter matters mattered
produce produced produces producing production
approach approached approaches approaching
height heights
curiosity curious curiously
anybody
darkness dark
animal animals
available
blind
building buildings
consider considered considers considering
continue continued continues continuing continuous continuously
decide decided decides deciding decision
degree degrees
economic economics economy
grandfather grandmother
guide guided guides guiding
heaven heavens
island islands
light lights lighted lighting
mirror mirrors mirrored
music musical musician
nickname nicknames nicknamed
page pages
path paths
pilot pilots
prefer preferred prefers preferring preference
prove proved proves proving proven
require required requires requiring requirement
return returned returns returning
road roads
second seconds
shark sharks
soon
story stories
strong stronger strongest strength
subject subjects
times
unite united unites uniting
winter winters
yellow yellows
dream dreams dreaming dreamed dreamlike
awfully awful
`.trim().split(/\s+/).map(w => w.toLowerCase()));

// Known proper nouns (artists, people, places) to always exclude
const PROPER_NOUNS = new Set(`
vermeer rembrandt caravaggio michelangelo botticelli raphael rubens
delacroix monet manet renoir degas cézanne cezanne
turner constable gainsborough reynolds hogarth
bruegel bosch cranach dürer durer holbein
velázquez velazquez goya murillo
titian tintoretto veronese giorgione bellini
klimt schiele kokoschka
munch
rodin
hokusai hiroshige hasegawa utamaro
friedrich caspar
rossetti millais hunt waterhouse
hesse hermann kafka goethe dostoevsky tolstoy dickens
gutenberg luther calvin
lancret watteau boucher fragonard
ghirlandaio perugino verrocchio
caesar brutus cleopatra
luxembourg mauritius
da vinci leonardo
van gogh
el greco
de hooch
pieter
nicolas
dante alighieri
rousseau
`.trim().split(/\s+/).map(w => w.toLowerCase()));

// ── 3. Matching function ──
function wordAppearsIn(word, text) {
  const w = word.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(w)) return true;
  if (t.includes(w + 's') || t.includes(w + 'es')) return true;
  if (w.endsWith('s') && t.includes(w.slice(0, -1))) return true;
  if (w.endsWith('es') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('ies') && t.includes(w.slice(0, -3) + 'y')) return true;
  if (w.endsWith('y') && t.includes(w.slice(0, -1) + 'ies')) return true;
  if (t.includes(w + 'ed') || t.includes(w + 'd')) return true;
  if (t.includes(w + 'ing')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'ing')) return true;
  if (w.endsWith('e') && t.includes(w.slice(0, -1) + 'ed')) return true;
  if (w.endsWith('y') && t.includes(w.slice(0, -1) + 'ied')) return true;
  if (w.endsWith('ed') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('ed') && w.length > 3 && w[w.length-3] === w[w.length-4] && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ing') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ing') && t.includes(w.slice(0, -3) + 'e')) return true;
  const last = w[w.length-1];
  if (last && 'bcdfgklmnprst'.includes(last)) {
    if (t.includes(w + last + 'ed') || t.includes(w + last + 'ing')) return true;
  }
  if (t.includes(w + 'ly')) return true;
  if (w.endsWith('ly') && t.includes(w.slice(0, -2))) return true;
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
  if (w.endsWith('er') && t.includes(w.slice(0, -2))) return true;
  if (w.endsWith('est') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ous') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('ive') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('al') && t.includes(w.slice(0, -2))) return true;
  if (w.startsWith('un') && t.includes(w.slice(2))) return true;
  if (w.startsWith('re') && w.length > 4 && t.includes(w.slice(2))) return true;
  if (w.startsWith('dis') && t.includes(w.slice(3))) return true;
  if (w.endsWith('ful') && t.includes(w.slice(0, -3))) return true;
  if (w.endsWith('less') && t.includes(w.slice(0, -4))) return true;
  return false;
}

// ── 4. Smart lemmatize: returns best base form using dictionary ──
function getBestBaseForm(surfaceForm, dict) {
  const w = surfaceForm.toLowerCase();

  // If surface form is in dictionary, use it
  if (dict[w]) return w;

  const candidates = [];

  // -ing removal
  if (w.endsWith('ing') && w.length > 5) {
    const base1 = w.slice(0, -3) + 'e'; // making → make
    const base2 = w.slice(0, -3); // painting → paint... but also runn
    // double consonant: running → run
    const baseDouble = w.slice(0, -3);
    if (baseDouble.length >= 2 && baseDouble[baseDouble.length-1] === baseDouble[baseDouble.length-2]) {
      candidates.push(baseDouble.slice(0, -1));
    }
    candidates.push(base1, base2);
  }

  // -ed removal
  if (w.endsWith('ied') && w.length > 4) {
    candidates.push(w.slice(0, -3) + 'y'); // carried → carry
  } else if (w.endsWith('ed') && w.length > 4) {
    candidates.push(w.slice(0, -1)); // gazed → gaze
    candidates.push(w.slice(0, -2)); // painted → paint
    const base = w.slice(0, -2);
    if (base.length >= 2 && base[base.length-1] === base[base.length-2]) {
      candidates.push(base.slice(0, -1)); // stopped → stop
    }
  }

  // -s/-es removal
  if (w.endsWith('ies') && w.length > 4) {
    candidates.push(w.slice(0, -3) + 'y');
  } else if (w.endsWith('ches') || w.endsWith('shes') || w.endsWith('sses') || w.endsWith('xes') || w.endsWith('zes')) {
    candidates.push(w.slice(0, -2));
  } else if (w.endsWith('es') && w.length > 3) {
    candidates.push(w.slice(0, -1)); // flames → flame
    candidates.push(w.slice(0, -2)); // produces → produc (bad) - will be filtered
  } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }

  // -ly removal
  if (w.endsWith('ly') && w.length > 4) {
    candidates.push(w.slice(0, -2));
  }

  // -er removal
  if (w.endsWith('er') && w.length > 4 && !w.endsWith('eer') && !w.endsWith('ier')) {
    candidates.push(w.slice(0, -2));
    candidates.push(w.slice(0, -1)); // closer → close
  }

  // -est removal
  if (w.endsWith('est') && w.length > 5) {
    candidates.push(w.slice(0, -3));
    candidates.push(w.slice(0, -2));
  }

  // Check candidates against dictionary, prefer matches
  for (const c of candidates) {
    if (c.length >= 3 && dict[c]) return c;
  }

  // No dictionary match found — just return surface form to avoid truncated non-words
  return w;
}

// ── 5. Proper noun detection ──
function isProperNoun(token, sentence) {
  const lower = token.toLowerCase().replace(/[^a-z]/g, '');
  // Check against known proper nouns
  if (PROPER_NOUNS.has(lower)) return true;

  // If the token starts with uppercase and is not at the start of the sentence
  const idx = sentence.indexOf(token);
  if (idx > 2 && token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
    return true;
  }
  // At start of sentence — check if it's a known word
  if (idx <= 2) {
    if (EASY_WORDS.has(lower)) return false;
    if (fullDict[lower]) return false;
    return false;
  }
  return false;
}

// ── 6. Extract candidate words from sentence ──
function extractCandidates(sentence, usedWords) {
  // Split by various separators
  const tokens = sentence.replace(/[—–\-,.:;!?'"()\[\]{}\/\\""''«»]/g, ' ').split(/\s+/).filter(Boolean);

  const candidates = [];
  const seen = new Set();

  for (const token of tokens) {
    // Skip proper nouns
    if (isProperNoun(token, sentence)) continue;

    const clean = token.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean || clean.length < 4) continue; // min 4 chars
    if (clean.includes("'")) continue;
    if (EASY_WORDS.has(clean)) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);

    // Get best base form
    const baseForm = getBestBaseForm(clean, fullDict);

    // Skip if base form is easy
    if (EASY_WORDS.has(baseForm)) continue;

    // Skip if already used
    if (usedWords.has(baseForm)) continue;

    // Check that baseForm can match back to the sentence
    if (!wordAppearsIn(baseForm, sentence)) continue;

    const meaning = fullDict[baseForm] || null;
    const score = clean.length + (meaning ? 10 : 0) + (baseForm.length >= 6 ? 3 : 0);

    candidates.push({
      surface: clean,
      base: baseForm,
      meaning,
      score
    });
  }

  // Sort by score descending (prefer words with meanings + longer words)
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

// ── 7. Supplementary dictionary ──
const SUPPLEMENT_DICT = {
  confront: '직면하다', portray: '묘사하다', convey: '전달하다',
  depict: '묘사하다', glean: '이삭을 줍다', symbolize: '상징하다',
  embody: '구현하다', flourish: '번성하다', transcend: '초월하다',
  illuminate: '비추다', evoke: '불러일으키다', manifest: '나타내다',
  perceive: '인식하다', sustain: '유지하다',
  emerge: '나타나다', resonate: '공감하다',
  cultivate: '기르다', navigate: '탐색하다',
  endure: '견디다', contemplate: '숙고하다',
  embrace: '포용하다', preserve: '보존하다', immerse: '몰입하다',
  compel: '강요하다', reclaim: '되찾다', ignite: '점화하다',
  aspire: '열망하다', inhabit: '거주하다', intertwine: '얽히다',
  reconcile: '화해하다', exploit: '활용하다',
  defy: '도전하다', blur: '흐릿하게 하다',
  advocate: '옹호하다', herald: '예고하다',
  lament: '탄식하다', subvert: '전복하다', perpetuate: '영속시키다',
  erode: '침식하다', amplify: '증폭하다', forge: '만들어내다',
  harness: '활용하다', mediate: '중재하다',
  segregate: '분리하다', galvanize: '촉발하다',
  underscore: '강조하다', traverse: '횡단하다',
  kindle: '불을 지피다', permeate: '스며들다', unveil: '공개하다',
  distill: '추출하다', encapsulate: '요약하다',
  redefine: '재정의하다', surge: '급증하다',
  abolish: '폐지하다', proclaim: '선언하다', exile: '추방하다',
  mourn: '애도하다', pioneer: '개척하다', uphold: '지지하다',
  wield: '휘두르다', ponder: '숙고하다', coexist: '공존하다',
  enrich: '풍부하게 하다', adapt: '적응하다', thrive: '번성하다',
  persist: '지속하다', accumulate: '축적하다', dominate: '지배하다',
  regulate: '규제하다', trigger: '촉발하다', absorb: '흡수하다',
  radiate: '방사하다', dissolve: '녹이다', compress: '압축하다',
  orbit: '궤도를 돌다', vibrate: '진동하다', synthesize: '합성하다',
  accelerate: '가속하다', extract: '추출하다',
  manipulate: '조작하다', circulate: '순환하다',
  deteriorate: '악화되다', excavate: '발굴하다',
  commemorate: '기념하다', assimilate: '동화하다',
  venerate: '숭배하다', alleviate: '완화하다', consolidate: '통합하다',
  lurk: '잠복하다', shatter: '산산조각 내다',
  cherish: '소중히 여기다', linger: '머무르다',
  dismantle: '해체하다', topple: '무너뜨리다',
  withstand: '견디다', undermine: '약화시키다',
  revere: '존경하다', enshrine: '안치하다',
  carve: '조각하다', weave: '엮다', etch: '새기다',
  render: '표현하다', sculpt: '조각하다', engrave: '새기다',
  pour: '붓다', mold: '빚다', drape: '드리우다',
  glaze: '유약을 바르다', clash: '충돌하다',
  invade: '침입하다', plunder: '약탈하다',
  conquer: '정복하다', revolt: '반란을 일으키다', overthrow: '전복하다',
  suppress: '탄압하다', liberate: '해방하다',
  forbid: '금지하다', decree: '포고하다',
  sanction: '제재하다', ratify: '비준하다', enact: '제정하다',
  migrate: '이주하다', disperse: '분산하다',
  converge: '수렴하다', diverge: '발산하다',
  dilute: '희석하다', condense: '응축하다',
  evaporate: '증발하다', solidify: '굳히다',
  corrode: '부식하다', mutate: '돌연변이하다',
  germinate: '발아하다', pollinate: '수분하다',
  hibernate: '동면하다', camouflage: '위장하다', regenerate: '재생하다',
  rotate: '회전하다', tilt: '기울이다', align: '정렬하다',
  surrender: '항복하다', retreat: '후퇴하다', prevail: '우세하다',

  // Nouns
  allegory: '우화', paradox: '역설', protagonist: '주인공',
  narrative: '서사', testament: '증거', perspective: '관점',
  ideology: '이데올로기', epoch: '시대', legacy: '유산',
  artifact: '유물', ritual: '의식', doctrine: '교리',
  manifesto: '선언문', mosaic: '모자이크', fresco: '프레스코화',
  silhouette: '실루엣', palette: '팔레트', canvas: '캔버스',
  portrait: '초상화', sculpture: '조각', mural: '벽화',
  composition: '구성', pigment: '안료', ceramic: '도자기',
  textile: '직물', ornament: '장식', motif: '모티프', symmetry: '대칭',
  proportion: '비율', harmony: '조화', contrast: '대조',
  texture: '질감', spectrum: '스펙트럼', prism: '프리즘',
  catalyst: '촉매', molecule: '분자', organism: '유기체',
  ecosystem: '생태계', habitat: '서식지', mutation: '돌연변이',
  enzyme: '효소', erosion: '침식', glacier: '빙하',
  fossil: '화석', mineral: '광물', sediment: '퇴적물',
  peninsula: '반도', plateau: '고원', terrain: '지형',
  pilgrimage: '순례', monastery: '수도원', dynasty: '왕조',
  monarchy: '군주제', republic: '공화국', feudalism: '봉건제도',
  coalition: '연합', tribunal: '법정', propaganda: '선전',
  apprentice: '견습생', guild: '길드', patron: '후원자', artisan: '장인',
  nomad: '유목민', pilgrim: '순례자', turmoil: '혼란', upheaval: '격변',
  resilience: '회복탄력성', perseverance: '인내', solitude: '고독',
  melancholy: '우울', nostalgia: '향수', longing: '갈망',
  defiance: '반항', audacity: '대담함', humility: '겸손',
  fortitude: '불굴의 정신', allegiance: '충성', sovereignty: '주권',
  diaspora: '디아스포라', metaphor: '은유',
  prosperity: '번영', adversity: '역경', calamity: '재앙',
  inscription: '비문', expedition: '탐험', voyage: '항해',
  famine: '기근', drought: '가뭄', plague: '역병',
  truce: '휴전', feat: '위업', phenomenon: '현상',
  anomaly: '이상 현상', equilibrium: '평형', threshold: '문턱',
  remnant: '잔재', debris: '잔해', canopy: '차양',
  locomotive: '기관차', pomegranate: '석류', underworld: '지하 세계',
  manuscript: '필사본', barricade: '바리케이드',
  anecdote: '일화', memoir: '회고록', satire: '풍자',
  dignity: '존엄', virtue: '미덕', mercy: '자비', grace: '은총',
  peasant: '농민', merchant: '상인',
  hemisphere: '반구', equator: '적도', monsoon: '계절풍',
  predator: '포식자', symbiosis: '공생', parasite: '기생충',
  receptor: '수용체', antibody: '항체', pathogen: '병원체',
  horizon: '수평선', panorama: '전경', alcove: '벽감',
  facade: '외관', miniature: '세밀화',
  scaffold: '발판', pedestal: '받침대',
  altar: '제단', shrine: '신사', relic: '유물',
  parchment: '양피지', scroll: '두루마리',
  tapestry: '태피스트리', jade: '비취', amber: '호박',
  bazaar: '시장', oasis: '오아시스', caravan: '대상',
  garment: '의복', banner: '깃발',
  fortress: '요새', moat: '해자',
  summit: '정상', abyss: '심연',
  vessel: '선박', anchor: '닻', helm: '조타',
  grove: '작은 숲', meadow: '초원', ravine: '협곡',
  dusk: '황혼', dawn: '새벽', twilight: '황혼',
  anguish: '고뇌', torment: '고통', bliss: '행복',
  kiln: '가마', anvil: '모루', spire: '첨탑',
  vault: '아치형 천장', nave: '본당',
  embroidery: '자수', incense: '향',
  coronation: '대관식', cavalry: '기병대',
  chronicle: '연대기', epitome: '전형', archetype: '원형',

  // Adjectives
  profound: '심오한', subtle: '미묘한', intricate: '복잡한',
  serene: '평온한', solemn: '엄숙한', vibrant: '활기찬',
  fragile: '연약한', robust: '튼튼한', austere: '엄격한',
  opulent: '호화로운', barren: '불모의', fertile: '비옥한',
  pristine: '원시의', luminous: '빛나는',
  ethereal: '천상의', mundane: '세속적인',
  enigmatic: '수수께끼 같은', idyllic: '목가적인',
  ominous: '불길한', auspicious: '길조의',
  tenacious: '끈질긴', meticulous: '꼼꼼한',
  eloquent: '웅변적인', incessant: '끊임없는',
  formidable: '강력한', ephemeral: '덧없는',
  perpetual: '영구적인', volatile: '변덕스러운',
  inherent: '내재된', ubiquitous: '편재하는',
  indigenous: '토착의', autonomous: '자율적인',
  provocative: '도발적인', poignant: '가슴 아픈',
  civic: '시민의', secular: '세속적인', sacred: '신성한',
  divine: '신성한', mortal: '필멸의', eternal: '영원한',
  tangible: '유형의', abstract: '추상적인',
  radical: '급진적인', pastoral: '목가적인',
  maritime: '해상의', coastal: '해안의',
  sublime: '숭고한', exquisite: '절묘한',
  stark: '극명한', bleak: '황량한', desolate: '황량한',
  tranquil: '평온한', tumultuous: '격동의', turbulent: '격렬한',
  ornate: '화려한', lavish: '호화로운', sparse: '드문',
  nocturnal: '야행성의', aquatic: '수생의', celestial: '천체의',
  hierarchical: '계층적인', diplomatic: '외교적인',
  harmonious: '조화로운', resonant: '울려퍼지는',
  vivid: '생생한', muted: '차분한', somber: '침울한',
  jubilant: '환희에 찬', stoic: '금욕적인',
  empirical: '경험적인', pivotal: '중추적인',
  monolithic: '단일체의', eclectic: '절충적인',
  orthodox: '정통의', feudal: '봉건적인',
  nomadic: '유목의', vernacular: '토착어의',
  ceremonial: '의식의', ancestral: '조상의',
  communal: '공동체의', bureaucratic: '관료적인',
  majestic: '장엄한', grandiose: '웅장한',
  intimate: '친밀한', vast: '광대한',
  obscure: '모호한', renowned: '유명한',
  instinctive: '본능적인', rhythmic: '리듬 있는',
  unbreakable: '부서지지 않는', mountaineer: '등산가',
  kaleidoscope: '만화경', didgeridoo: '디저리두',
  philosophical: '철학적인', breakneck: '위험할 정도로 빠른',
  glorify: '찬양하다', tighten: '조이다',
  rediscover: '재발견하다', underwater: '수중의',
  vegetable: '채소', elementary: '기본적인',
  remembrance: '추모, 기억', uncomfortable: '불편한',
  illustration: '삽화',

  // Additional practical words for educational sentences
  allegiance: '충성',
  abolition: '폐지',
  oppression: '억압',
  emancipation: '해방',
  sovereignty: '주권',
  colonialism: '식민주의',
  imperialism: '제국주의',
  nationalism: '민족주의',
  enlightenment: '계몽',
  reformation: '개혁',
  renaissance: '르네상스',
  industrialization: '산업화',
  urbanization: '도시화',
  globalization: '세계화',

  despair: '절망',
  redemption: '구원',
  salvation: '구원',
  compassion: '연민',
  empathy: '공감',
  gratitude: '감사',
  resentment: '원한',
  indignation: '분개',
  anguish: '고뇌',
  serenity: '평온',

  barricade: '바리케이드',
  locomotive: '기관차',
  observatory: '관측소',
  laboratory: '실험실',
  peninsula: '반도',

  drought: '가뭄',
  famine: '기근',
  epidemic: '전염병',
  pandemic: '팬데믹',

  scaffold: '발판',
  scaffold: '비계',

  // Commonly appearing verbs
  portray: '묘사하다',
  depict: '묘사하다',
  illustrate: '설명하다',
  demonstrate: '증명하다',
  articulate: '명확히 표현하다',
  elaborate: '상세히 설명하다',
  incorporate: '통합하다',
  accommodate: '수용하다',
  facilitate: '촉진하다',
  approximate: '근사하다',
  anticipate: '예상하다',
  speculate: '추측하다',
  contemplate: '숙고하다',
  deliberate: '심사숙고하다',

  penetrate: '침투하다',
  permeate: '스며들다',
  saturate: '포화시키다',
  contaminate: '오염시키다',
  disintegrate: '붕괴하다',
  deteriorate: '악화하다',
  evaporate: '증발하다',
  precipitate: '침전하다',

  negotiate: '협상하다',
  mediate: '중재하다',
  arbitrate: '중재하다',
  legislate: '입법하다',

  inaugurate: '취임시키다',
  consecrate: '봉헌하다',
  confiscate: '몰수하다',

  // Common words in sentences
  tradition: '전통',
  innovation: '혁신',
  revolution: '혁명',
  evolution: '진화',
  civilization: '문명',
  generation: '세대',
  transformation: '변환',
  inspiration: '영감',
  imagination: '상상력',
  determination: '결의',
  celebration: '축하',
  exploration: '탐험',
  restoration: '복원',
  preservation: '보존',
  declaration: '선언',

  battlefield: '전쟁터',
  masterpiece: '걸작',
  breakthrough: '돌파구',
  cornerstone: '초석',
  watershed: '분수령',
  milestone: '이정표',
  landmark: '랜드마크',

  spectacle: '장관',
  splendor: '화려함',
  magnificence: '웅장함',

  wilderness: '광야',
  landscape: '풍경',
  seascape: '바다 풍경',
  cityscape: '도시 풍경',
  countryside: '시골',

  sanctuary: '성역',
  haven: '안식처',
  refuge: '피난처',

  cathedral: '대성당',
  basilica: '바실리카',
  mosque: '모스크',
  synagogue: '회당',
  pagoda: '탑',
  ziggurat: '지구라트',

  coliseum: '콜로세움',
  amphitheater: '원형극장',
  arena: '경기장',
  stadium: '경기장',

  aqueduct: '수도교',
  viaduct: '고가교',

  archipelago: '군도',
  peninsula: '반도',
  isthmus: '지협',
  strait: '해협',
  fjord: '피오르',
  delta: '삼각주',
  estuary: '하구',

  savanna: '사바나',
  steppe: '스텝',
  tundra: '툰드라',
  prairie: '대초원',

  volcano: '화산',
  geyser: '간헐천',
  glacier: '빙하',
  avalanche: '눈사태',
  tsunami: '쓰나미',

  meteorite: '운석',
  asteroid: '소행성',
  constellation: '별자리',
  nebula: '성운',

  chromosome: '염색체',
  mitochondria: '미토콘드리아',
  photosynthesis: '광합성',
  metabolism: '신진대사',

  camouflage: '위장',
  migration: '이주',
  hibernation: '동면',
  pollination: '수분',
  germination: '발아',

  curriculum: '교과과정',
  pedagogy: '교육학',
  apprenticeship: '견습',

  aristocrat: '귀족',
  bourgeoisie: '부르주아',
  proletariat: '프롤레타리아',

  censorship: '검열',
  propaganda: '선전',
  rhetoric: '수사학',

  coup: '쿠데타',
  mutiny: '반란',
  insurgency: '봉기',

  armistice: '정전',
  ceasefire: '휴전',

  embargo: '금수 조치',
  blockade: '봉쇄',

  exodus: '대이동',
  diaspora: '디아스포라',

  epidemic: '전염병',
  quarantine: '격리',

  superstition: '미신',
  mythology: '신화',
  folklore: '민속',

  courtyard: '안뜰',
  terrace: '테라스',
  balcony: '발코니',

  chandelier: '샹들리에',
  candelabra: '촛대',

  manuscript: '필사본',
  codex: '고문서',

  parchment: '양피지',
  papyrus: '파피루스',

  woodcut: '목판화',
  lithograph: '석판화',

  fresco: '프레스코화',
  tempera: '템페라',
  gouache: '과슈',

  patina: '녹청',

  porcelain: '도자기',

  lacquer: '옻칠',

  calligraphy: '서예',

  stencil: '스텐실',

  mosaic: '모자이크',
  inlay: '상감 세공',

  filigree: '세공 장식',

  arabesque: '아라베스크',

  minaret: '첨탑',
  cupola: '작은 돔',

  buttress: '부벽',

  gargoyle: '가고일',

  cloister: '회랑',

  parapet: '난간벽',

  battlement: '흉벽',

  drawbridge: '도개교',

  portcullis: '성문',

  dungeon: '지하 감옥',

  moat: '해자',

  turret: '포탑',

  keep: '주탑',

  // Fallback words for simple classic quotes
  adventure: '모험',
  afterwards: '그 후에',
  angry: '화난',
  autumn: '가을',
  belief: '믿음, 신념',
  childhood: '어린 시절',
  chosen: '선택된',
  cross: '건너다, 십자가',
  dead: '죽은',
  education: '교육',
  entirely: '완전히',
  everyone: '모든 사람',
  everything: '모든 것',
  failed: '실패한',
  fight: '싸우다, 투쟁',
  flies: '날다 (3인칭)',
  frosty: '서리가 내린',
  griots: '그리오 (서아프리카 음유시인)',
  habits: '습관',
  happens: '일어나다',
  highest: '가장 높은',
  lame: '절뚝거리는',
  leaves: '잎, 떠나다',
  living: '살아 있는, 생활',
  loved: '사랑한',
  medicine: '약, 의학',
  movable: '이동할 수 있는',
  nearly: '거의',
  others: '다른 사람들',
  person: '사람',
  places: '장소들',
  political: '정치적인',
  prefer: '선호하다',
  reasons: '이유들',
  saved: '구한',
  screen: '화면, 가리다',
  senses: '감각',
  service: '봉사, 서비스',
  smaller: '더 작은',
  someone: '누군가',
  stars: '별들',
  system: '체계, 시스템',
  things: '것들',
  together: '함께',
  travel: '여행하다',
  understand: '이해하다',
  unreasoning: '비이성적인',
  curiosities: '호기심, 신기한 것들',
  reach: '도달하다',
  sleeping: '잠자는',
  view: '관점, 시각',
  without: '~없이',
  because: '왜냐하면',
  become: '되다',
  better: '더 나은',
  change: '변화',
  children: '아이들',
  listen: '듣다',

  // Missing words from first run
  cautious: '조심스러운',
  consistent: '일관된',
  devastate: '파괴하다, 황폐화하다',
  disappoint: '실망시키다',
  inscribe: '새기다',
  nourish: '영양을 공급하다',
  unexamined: '검토되지 않은',
  unspoken: '말해지지 않은',
  considerate: '배려하는',
  dangerous: '위험한',
  marvelous: '경이로운',
  forever: '영원히',
  neither: '어느 쪽도 아닌',
  unreasoned: '비합리적인',
  absolute: '절대적인',
  consistent: '일관된',
  darkness: '어둠',
  heights: '높이',
  sadden: '슬프게 하다',
  waste: '낭비하다',
  reader: '독자',
  rounded: '둥근',
  greater: '더 큰',
  preferred: '선호되는',
  master: '장인, 거장',
  illustrated: '삽화가 있는',
  continuously: '지속적으로',
  considering: '고려하면',
  marveled: '감탄하다',
  saddest: '가장 슬픈',

  // More words spotted in educational sentences
  impose: '부과하다',
  spiral: '나선형으로 움직이다',
  ambition: '야망',
  chaos: '혼돈',
  fragile: '연약한',
  static: '정적인',
  dynamic: '역동적인',
  civic: '시민의',
  guard: '경비, 지키다',
  tradition: '전통',
  lament: '탄식하다',
  desperate: '절박한',
  elaborate: '정교한',
  vivid: '생생한',
  curious: '호기심 있는',
  peculiar: '기이한',
  extraordinary: '비범한',
  remarkable: '주목할 만한',
  spectacular: '장관의',
  magnificent: '웅장한',
  devastating: '파괴적인',
  overwhelming: '압도적인',
  astonishing: '놀라운',
  captivating: '매혹적인',
  enchanting: '매혹적인',
  mesmerizing: '최면적인',
  haunting: '잊히지 않는',
  breathtaking: '숨막히는',
  awe: '경외감',
  reverence: '경외',
  devotion: '헌신',
  fervor: '열정',
  ardor: '열정',
  zeal: '열의',
  wrath: '분노',
  fury: '격노',
  grief: '슬픔',
  sorrow: '비통',
  remorse: '후회',
  regret: '후회',
  shame: '수치심',
  guilt: '죄책감',
  envy: '시기',
  jealousy: '질투',
  contempt: '경멸',
  scorn: '경멸',
  disdain: '경멸',
  arrogance: '오만',
  vanity: '허영',
  greed: '탐욕',
  avarice: '탐욕',
  gluttony: '폭식',
  sloth: '나태',
  lust: '정욕',
  pride: '자부심',

  conscience: '양심',
  integrity: '진실성',
  sincerity: '진심',
  fidelity: '충실',
  loyalty: '충성',
  obedience: '복종',
  discipline: '규율',

  prosperity: '번영',
  abundance: '풍요',
  scarcity: '희소',
  poverty: '빈곤',
  wealth: '부',
  fortune: '운, 재산',

  chaos: '혼돈',
  order: '질서',
  stability: '안정',
  turmoil: '혼란',

  equality: '평등',
  liberty: '자유',
  justice: '정의',
  tyranny: '폭정',
  oppression: '억압',
  rebellion: '반란',
  resistance: '저항',

  courage: '용기',
  cowardice: '비겁',
  bravery: '용맹',
  heroism: '영웅적 행위',
  sacrifice: '희생',

  wisdom: '지혜',
  folly: '어리석음',
  ignorance: '무지',
  knowledge: '지식',
  truth: '진리',

  fate: '운명',
  destiny: '운명',

  myth: '신화',
  legend: '전설',
  saga: '서사시',
  epic: '서사시',

  cipher: '암호',
  enigma: '수수께끼',
  riddle: '수수께끼',
  puzzle: '퍼즐',

  alchemy: '연금술',
  sorcery: '마법',

  chivalry: '기사도',
  knighthood: '기사 작위',

  pageantry: '화려한 의식',
  pomp: '장엄',

  tribute: '공물',
  tithe: '십일조',

  feud: '불화',
  vendetta: '복수',

  asylum: '망명',
  exile: '추방',

  pilgrimage: '순례',
  odyssey: '긴 여행',

  conquest: '정복',
  crusade: '십자군',

  treaty: '조약',
  pact: '협정',
  covenant: '계약',

  decree: '칙령',
  edict: '포고령',
  ordinance: '조례',
  statute: '법률',

  verdict: '평결',
  sentence: '선고',

  acquittal: '무죄 선고',
  conviction: '유죄 판결',

  testimony: '증언',
  affidavit: '선서 진술서',

  plaintiff: '원고',
  defendant: '피고',

  prosecutor: '검사',
  attorney: '변호사',

  jury: '배심원',
  bailiff: '집행관',
};

// Merge dictionaries
const fullDict = { ...SUPPLEMENT_DICT, ...existingDict };

// ── 8. Process all days ──
const changes = [];
const missingMeanings = [];
let fixedCount = 0;
let alreadyOkCount = 0;
let noCandidate = 0;

for (const entry of data) {
  const { day, sentences, vocab } = entry;
  if (!vocab || !sentences || vocab.length !== 4 || sentences.length !== 4) continue;

  const usedWords = new Set();
  const needsFix = [];

  for (let i = 0; i < 4; i++) {
    if (wordAppearsIn(vocab[i].word, sentences[i].en)) {
      usedWords.add(vocab[i].word.toLowerCase());
      alreadyOkCount++;
    } else {
      needsFix.push(i);
    }
  }

  for (const i of needsFix) {
    const candidates = extractCandidates(sentences[i].en, usedWords);

    if (candidates.length === 0) {
      // Fallback: relax filter - allow shorter words, only exclude function words
      const FUNCTION_WORDS = new Set('a an the this that these those it its he she his her him they them their we our us you your i me my mine myself himself herself itself themselves ourselves yourself yourselves is am are was were be been being have has had do does did will would can could may might shall should must and or but if so then than not no nor of in on at to for with by from into as'.split(' '));
      const tokens = sentences[i].en.replace(/[—–\-,.:;!?'"()\[\]{}\/\\""'']/g, ' ')
        .split(/\s+/).filter(Boolean);
      const fallbackCandidates = [];
      for (const token of tokens) {
        if (isProperNoun(token, sentences[i].en)) continue;
        const clean = token.toLowerCase().replace(/[^a-z]/g, '');
        if (!clean || clean.length < 4) continue;
        if (FUNCTION_WORDS.has(clean)) continue;
        if (usedWords.has(clean)) continue;
        const baseForm = getBestBaseForm(clean, fullDict);
        if (usedWords.has(baseForm)) continue;
        if (!wordAppearsIn(baseForm, sentences[i].en)) continue;
        const meaning = fullDict[baseForm] || fullDict[clean] || null;
        fallbackCandidates.push({ base: baseForm, surface: clean, meaning, score: clean.length + (meaning ? 10 : 0) });
      }
      fallbackCandidates.sort((a, b) => b.score - a.score);
      if (fallbackCandidates.length > 0) {
        const picked = fallbackCandidates[0];
        if (!picked.meaning) {
          missingMeanings.push({ day, index: i, word: picked.base, surface: picked.surface, source: sentences[i].source, sentence: sentences[i].en.substring(0, 120) });
        }
        changes.push({ day, index: i, oldWord: vocab[i].word, oldMeaning: vocab[i].meaning, newWord: picked.base, newMeaning: picked.meaning || `[TODO:${picked.base}]`, source: sentences[i].source, fallback: true });
        vocab[i].word = picked.base;
        vocab[i].meaning = picked.meaning || `[TODO:${picked.base}]`;
        usedWords.add(picked.base);
        fixedCount++;
        continue;
      }
      noCandidate++;
      changes.push({
        day, index: i,
        oldWord: vocab[i].word, oldMeaning: vocab[i].meaning,
        newWord: null, newMeaning: null,
        source: sentences[i].source,
        sentence: sentences[i].en,
        error: 'NO_CANDIDATE'
      });
      continue;
    }

    const picked = candidates[0];
    const meaning = picked.meaning;

    if (!meaning) {
      missingMeanings.push({
        day, index: i,
        word: picked.base,
        surface: picked.surface,
        source: sentences[i].source,
        sentence: sentences[i].en.substring(0, 120)
      });
    }

    changes.push({
      day, index: i,
      oldWord: vocab[i].word, oldMeaning: vocab[i].meaning,
      newWord: picked.base, newMeaning: meaning || `[TODO:${picked.base}]`,
      source: sentences[i].source
    });

    vocab[i].word = picked.base;
    vocab[i].meaning = meaning || `[TODO:${picked.base}]`;
    usedWords.add(picked.base);
    fixedCount++;
  }
}

console.log(`\n=== 수정 결과 ===`);
console.log(`이미 정상: ${alreadyOkCount}개`);
console.log(`수정 완료: ${fixedCount}개`);
console.log(`후보 없음: ${noCandidate}개`);
console.log(`의미 누락 (TODO): ${missingMeanings.length}개\n`);

writeFileSync('scripts/vocab-changes.json', JSON.stringify(changes, null, 2));
console.log('변경 로그: scripts/vocab-changes.json');

if (missingMeanings.length > 0) {
  writeFileSync('scripts/vocab-missing-meanings.json', JSON.stringify(missingMeanings, null, 2));
  console.log('의미 누락 목록: scripts/vocab-missing-meanings.json');
  const uniqueMissing = [...new Set(missingMeanings.map(m => m.word))].sort();
  console.log(`\n누락 단어 (${uniqueMissing.length}개):`);
  console.log(uniqueMissing.join(', '));
}

if (noCandidate > 0) {
  const noCandidates = changes.filter(c => c.error === 'NO_CANDIDATE');
  console.log(`\n후보 없는 항목 (${noCandidates.length}개):`);
  noCandidates.forEach(c => {
    console.log(`  Day ${c.day} [${c.index}] ${c.source}: ${c.sentence?.substring(0, 80)}...`);
  });
}

// Save fixed data
writeFileSync('src/data/english.json', JSON.stringify(data, null, 2));
console.log('\n영어 데이터 저장 완료: src/data/english.json');
