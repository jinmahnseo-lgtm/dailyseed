import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('src/data/english.json', 'utf-8'));

// ── 1. Easy words blacklist (from fix-vocab-words.mjs) ──
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
cannot century centuries
determined development difference
earliest efficiency
finished
generosity greatly
increases increasing incredibly
locations longest
meaningful
nation newspaper nineteenth
obvious occurs operation originally
painful participants patiently perfectly
quality questions
resulted
settling seventeen simultaneously slowly
television
ultimate ultimately
wrapping years yourself
`.trim().split(/\s+/).map(w => w.toLowerCase()));

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
aivazovsky arcimboldo bakhuizen bashkirtseva bonnard bouguereau bryullov
canaletto carpaccio colantonio daumier guillaumin josephin kandinsky
kiprensky leeuwenhoek liotard maeterlinck malevich millet mondrian
pinturicchio sassoferrato sinclair thackeray thoreau valenciennes
kipling
anne boccioni cassatt chardin corot flaubert hayez morisot pellizza
poussin spitzweg vanderlyn werther
`.trim().split(/\s+/).map(w => w.toLowerCase()));

// ── 2. Matching function ──
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

// ── 3. Lemmatizer ──
function getBestBaseForm(surfaceForm, dict) {
  const w = surfaceForm.toLowerCase();
  if (dict[w]) return w;
  const candidates = [];
  if (w.endsWith('ing') && w.length > 5) {
    const base1 = w.slice(0, -3) + 'e';
    const base2 = w.slice(0, -3);
    const baseDouble = w.slice(0, -3);
    if (baseDouble.length >= 2 && baseDouble[baseDouble.length-1] === baseDouble[baseDouble.length-2]) {
      candidates.push(baseDouble.slice(0, -1));
    }
    candidates.push(base1, base2);
  }
  if (w.endsWith('ied') && w.length > 4) {
    candidates.push(w.slice(0, -3) + 'y');
  } else if (w.endsWith('ed') && w.length > 4) {
    candidates.push(w.slice(0, -1));
    candidates.push(w.slice(0, -2));
    const base = w.slice(0, -2);
    if (base.length >= 2 && base[base.length-1] === base[base.length-2]) {
      candidates.push(base.slice(0, -1));
    }
  }
  if (w.endsWith('ies') && w.length > 4) {
    candidates.push(w.slice(0, -3) + 'y');
  } else if (w.endsWith('ches') || w.endsWith('shes') || w.endsWith('sses') || w.endsWith('xes') || w.endsWith('zes')) {
    candidates.push(w.slice(0, -2));
  } else if (w.endsWith('es') && w.length > 3) {
    candidates.push(w.slice(0, -1));
    candidates.push(w.slice(0, -2));
  } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    candidates.push(w.slice(0, -1));
  }
  if (w.endsWith('ly') && w.length > 4) {
    candidates.push(w.slice(0, -2));
  }
  if (w.endsWith('er') && w.length > 4 && !w.endsWith('eer') && !w.endsWith('ier')) {
    candidates.push(w.slice(0, -2));
    candidates.push(w.slice(0, -1));
  }
  if (w.endsWith('est') && w.length > 5) {
    candidates.push(w.slice(0, -3));
    candidates.push(w.slice(0, -2));
  }
  for (const c of candidates) {
    if (c.length >= 3 && dict[c]) return c;
  }
  return w;
}

// ── 4. Proper noun detection ──
function isProperNoun(token, sentence) {
  const lower = token.toLowerCase().replace(/[^a-z]/g, '');
  if (PROPER_NOUNS.has(lower)) return true;
  const idx = sentence.indexOf(token);
  if (idx > 2 && token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
    return true;
  }
  return false;
}

// ── 5. Supplementary dictionary ──
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
  impose: '부과하다', spiral: '나선형으로 움직이다',
  ambition: '야망', chaos: '혼돈',
  static: '정적인', dynamic: '역동적인',
  guard: '경비, 지키다', tradition: '전통',
  desperate: '절박한', elaborate: '정교한',
  curious: '호기심 있는', peculiar: '기이한',
  extraordinary: '비범한', remarkable: '주목할 만한',
  spectacular: '장관의', magnificent: '웅장한',
  devastating: '파괴적인', overwhelming: '압도적인',
  astonishing: '놀라운', captivating: '매혹적인',
  enchanting: '매혹적인', mesmerizing: '최면적인',
  haunting: '잊히지 않는', breathtaking: '숨막히는',
  awe: '경외감', reverence: '경외', devotion: '헌신',
  fervor: '열정', zeal: '열의', wrath: '분노', fury: '격노',
  grief: '슬픔', sorrow: '비통', remorse: '후회', regret: '후회',
  shame: '수치심', guilt: '죄책감', envy: '시기',
  jealousy: '질투', contempt: '경멸', scorn: '경멸', disdain: '경멸',
  arrogance: '오만', vanity: '허영', greed: '탐욕',
  pride: '자부심', conscience: '양심', integrity: '진실성',
  sincerity: '진심', loyalty: '충성', obedience: '복종',
  discipline: '규율', abundance: '풍요', scarcity: '희소',
  poverty: '빈곤', wealth: '부', fortune: '운, 재산',
  order: '질서', stability: '안정',
  equality: '평등', liberty: '자유', justice: '정의',
  tyranny: '폭정', oppression: '억압', rebellion: '반란',
  resistance: '저항', courage: '용기', bravery: '용맹',
  heroism: '영웅적 행위', sacrifice: '희생',
  wisdom: '지혜', ignorance: '무지', knowledge: '지식', truth: '진리',
  fate: '운명', destiny: '운명',
  myth: '신화', legend: '전설', saga: '서사시', epic: '서사시',
  enigma: '수수께끼', alchemy: '연금술',
  chivalry: '기사도', tribute: '공물',
  asylum: '망명', conquest: '정복',
  treaty: '조약', covenant: '계약',
  testimony: '증언', verdict: '평결',

  // Additional common words
  capture: '포착하다', transform: '변형하다', reflect: '반영하다',
  civilization: '문명', community: '공동체', collective: '집단적인',
  reveal: '드러내다', identity: '정체', illusion: '착시, 환상',
  revolution: '혁명', innovation: '혁신', evolution: '진화',
  generation: '세대', transformation: '변환', inspiration: '영감',
  imagination: '상상력', determination: '결의', celebration: '축하',
  exploration: '탐험', restoration: '복원', preservation: '보존',
  declaration: '선언', battlefield: '전쟁터', masterpiece: '걸작',
  breakthrough: '돌파구', cornerstone: '초석', watershed: '분수령',
  milestone: '이정표', landmark: '랜드마크',
  spectacle: '장관', splendor: '화려함', magnificence: '웅장함',
  wilderness: '광야', landscape: '풍경', seascape: '바다 풍경',
  cityscape: '도시 풍경', countryside: '시골',
  sanctuary: '성역', haven: '안식처', refuge: '피난처',
  cathedral: '대성당', mosque: '모스크', pagoda: '탑',
  archipelago: '군도', isthmus: '지협', strait: '해협',
  fjord: '피오르', delta: '삼각주', estuary: '하구',
  savanna: '사바나', steppe: '스텝', tundra: '툰드라', prairie: '대초원',
  volcano: '화산', geyser: '간헐천', avalanche: '눈사태', tsunami: '쓰나미',
  meteorite: '운석', asteroid: '소행성', constellation: '별자리', nebula: '성운',
  chromosome: '염색체', photosynthesis: '광합성', metabolism: '신진대사',
  migration: '이주', hibernation: '동면', pollination: '수분',
  aristocrat: '귀족', censorship: '검열', rhetoric: '수사학',
  mutiny: '반란', insurgency: '봉기', armistice: '정전',
  embargo: '금수 조치', blockade: '봉쇄', exodus: '대이동',
  quarantine: '격리', superstition: '미신', mythology: '신화', folklore: '민속',
  porcelain: '도자기', lacquer: '옻칠', calligraphy: '서예',
  colonialism: '식민주의', imperialism: '제국주의', nationalism: '민족주의',
  enlightenment: '계몽', reformation: '개혁', renaissance: '르네상스',
  industrialization: '산업화', urbanization: '도시화', globalization: '세계화',
  despair: '절망', redemption: '구원', compassion: '연민', empathy: '공감',
  gratitude: '감사', serenity: '평온',
  observatory: '관측소', laboratory: '실험실',
  epidemic: '전염병', pandemic: '팬데믹',

  // Words from missing meanings list
  aboriginal: '원주민의', advertising: '광고', airplanes: '비행기',
  apocalyptic: '종말의', applying: '적용하는', argument: '논쟁',
  arranges: '배열하다', asphalt: '아스팔트', assigns: '할당하다',
  associated: '관련된', atmospheric: '대기의', attempt: '시도',
  attention: '주의', authors: '저자', automatic: '자동의',
  blossom: '꽃이 피다', boiling: '끓는', bookshops: '서점',
  bowing: '절하는', brazilian: '브라질의', calligraphers: '서예가',
  cambodia: '캄보디아', caricature: '풍자화', catalogued: '목록에 넣다',
  caterpillar: '애벌레', cellulose: '셀룰로스', chrysanthemums: '국화',
  citizens: '시민', classes: '계급', classroom: '교실',
  columns: '기둥', communication: '소통', competition: '경쟁',
  competitive: '경쟁적인', complex: '복잡한', computers: '컴퓨터',
  confusion: '혼란', connected: '연결된', connects: '연결하다',
  consists: '구성되다', constantly: '끊임없이', construction: '건설',
  contains: '포함하다', contented: '만족한', convenience: '편의',
  conversation: '대화', conveyor: '컨베이어', correctly: '올바르게',
  couples: '커플, 쌍', craftsmanship: '장인정신', craftsmen: '장인들',
  creative: '창의적인', crime: '범죄', cultivation: '경작',
  cure: '치료하다', dares: '감히 하다', deconstructed: '해체된',
  demanding: '요구하는', dependence: '의존', deprivation: '박탈',
  descending: '내려가는', deserved: '마땅한', destruct: '파괴하다',
  diplomats: '외교관', directions: '방향들', disconnection: '단절',
  disinfectant: '소독제', distinctive: '독특한', distorted: '왜곡된',
  distractions: '방해 요소', divergent: '발산적인', dreamt: '꿈꾸다',
  dreamy: '몽환적인', emissions: '배출', endorphins: '엔도르핀',
  engineering: '공학', enjoyment: '즐거움', entrances: '입구',
  epigenetics: '후성유전학', estonian: '에스토니아의', etiquette: '예절',
  evolutionary: '진화의', execution: '실행', explosive: '폭발적인',
  expression: '표현', familyhood: '가족애', fascinated: '매료된',
  fisherman: '어부', flamenco: '플라멩코', futuristic: '미래적인',
  glitter: '반짝임', guillaumin: '기요맹', hidden: '숨겨진',
  honeybee: '꿀벌', hospitality: '환대', hummingbird: '벌새',
  hurricane: '허리케인', iceland: '아이슬란드', imperfect: '불완전한',
  inevitability: '불가피성', inseparable: '불가분의', interviewers: '면접관',
  investment: '투자', kibbutzim: '키부츠', laborers: '노동자',
  lamplight: '램프 불빛', locomotion: '이동', majestic: '장엄한',
  microphone: '마이크', mozambique: '모잠비크', neuroscience: '신경과학',
  obligated: '의무를 진', oponopono: '호오포노포노', originality: '독창성',
  overflows: '넘쳐흐르다', panoramic: '파노라마의', patrolling: '순찰하는',
  peacemakers: '평화주의자', persecution: '박해', photograph: '사진',
  polynesian: '폴리네시아의', polyphonic: '다성의', prefrontal: '전두엽의',
  premotor: '전운동의', presenting: '제시하는', projecting: '투사하는',
  proposed: '제안된', rational: '합리적인', regeneration: '재생',
  retrospect: '회고', scandinavian: '스칸디나비아의', singapore: '싱가포르',
  smartphones: '스마트폰', spain: '스페인', storytellers: '이야기꾼',
  storytelling: '이야기하기', superorganism: '초유기체', sustenance: '생계',
  sweeter: '더 달콤한', systematic: '체계적인', tattered: '너덜너덜한',
  theatrical: '연극적인', togetherness: '유대감', vyshyvanka: '비시반카',
  wayward: '제멋대로인',

  // Additional words that may be selected as replacements
  language: '언어', mathematics: '수학', invisible: '보이지 않는',
  promise: '약속', beloved: '사랑하는', diamonds: '다이아몬드',
  historians: '역사학자', hometown: '고향', borders: '경계',
  bridge: '다리', engineers: '공학자', sword: '검',
  formulas: '공식', technology: '기술', passionate: '열정적인',
  expression: '표현', physically: '물리적으로', version: '판본',
  distorted: '왜곡된', futuristic: '미래적인', hidden: '숨겨진',
  surrounded: '둘러싸인', deserved: '마땅한', energy: '에너지',
  emotional: '감정적인', golden: '금빛의', information: '정보',
  relationship: '관계', direction: '방향', brain: '뇌',
  body: '몸', earth: '지구', insect: '곤충',
  mountain: '산', social: '사회적인', recognition: '인식',
  reflection: '반영', interaction: '상호작용', mechanical: '기계적인',
  industrial: '산업의', electronic: '전자의', molecular: '분자의',
  multicultural: '다문화의', musical: '음악의', spiritual: '영적인',
  traditional: '전통적인', philosophical: '철학적인', flexibility: '유연성',
  vulnerability: '취약성', consciousness: '의식', adolescence: '사춘기',
  independence: '독립', interference: '간섭', atmosphere: '분위기, 대기',
  temperature: '온도', father: '아버지', exercise: '운동',
  lightning: '번개', earthquake: '지진', investment: '투자',
  limitation: '한계', memorization: '암기', literature: '문학',
  photographer: '사진가', protection: '보호', separation: '분리',
  success: '성공', sunshine: '햇살', thousands: '수천',
  threatening: '위협적인', transparent: '투명한', unforgettable: '잊을 수 없는',
  vocabulary: '어휘', worldwide: '전세계적인', wildflower: '야생화',
  windmill: '풍차', violin: '바이올린', starlight: '별빛',
  television: '텔레비전', stubborn: '완고한', spirited: '활발한',
  smartphone: '스마트폰', solitary: '고독한', painful: '고통스러운',

  // Missing meanings from 4th run
  adults: '성인', answer: '대답', ashes: '재',
  avoid: '피하다', connect: '연결하다', forming: '형성하는',
  free: '자유로운', fruits: '과일', histories: '역사',
  intelligent: '지적인', intimacy: '친밀감', invites: '초대하다',
  learn: '배우다', lenses: '렌즈', literally: '문자 그대로',
  mankind: '인류', mathematical: '수학적인', meanings: '의미',
  mother: '어머니', outside: '바깥', peoples: '민족',
  physical: '물리적인', piece: '조각', preaching: '설교',
  price: '대가', private: '사적인', progressive: '진보적인',
  responsible: '책임감 있는', rightly: '올바르게', search: '탐색',
  separate: '분리된', specific: '특정한', status: '지위',
  suggesting: '암시하는', triumphant: '승리한', unfulfilled: '이루어지지 않은',
  active: '활동적인', bathing: '목욕', bees: '벌',
  burned: '타버린', landing: '착륙', lifetime: '생애',
  marching: '행진하는', oldest: '가장 오래된', printed: '인쇄된',
  sound: '소리', striding: '성큼 걷는', watts: '와트',
  wider: '더 넓은', bigger: '더 큰', glass: '유리',
  follower: '추종자',

  // Missing meanings from staleVocab pass
  according: '~에 따르면', achievements: '업적', approximately: '대략',
  armenians: '아르메니아인', artistic: '예술적인', azerbaijan: '아제르바이잔',
  blocks: '블록', bolivia: '볼리비아', breathed: '숨을 쉬다',
  buried: '묻힌', cabbage: '양배추', capital: '수도',
  chimpanzees: '침팬지', clothing: '의복', colorful: '다채로운',
  confucius: '공자', corresponds: '대응하다', courtyard: '안뜰',
  democratic: '민주적인', denmark: '덴마크', designed: '설계된',
  determining: '결정하는', differently: '다르게', dimensional: '차원의',
  disassemble: '분해하다', distribution: '분배', electrical: '전기의',
  electricity: '전기', eliminating: '제거하는', ensnares: '올가미에 걸다',
  ethiopia: '에티오피아', existence: '존재', fabrics: '직물',
  farther: '더 먼', fluttering: '펄럭이는', glucose: '포도당',
  gold: '금', governance: '통치', guatemala: '과테말라',
  healthcare: '의료', heating: '가열', heavily: '무겁게',
  immense: '거대한', impurity: '불순물', increasingly: '점점 더',
  industry: '산업', infrared: '적외선의', investing: '투자하는',
  killing: '살상', kilograms: '킬로그램', kilometers: '킬로미터',
  kitchen: '부엌', linguistically: '언어학적으로', madagascar: '마다가스카르',
  management: '경영', material: '물질, 재료', mediator: '중재자',
  military: '군사의', mixed: '혼합된', objects: '물체',
  opposite: '반대의', optimism: '낙관주의', perfecting: '완성하는',
  persuasion: '설득', physicists: '물리학자', practice: '실천',
  president: '대통령', previous: '이전의', properly: '제대로',
  receptive: '수용적인', reflexively: '반사적으로', regenerative: '재생의',
  rejection: '거부', relativity: '상대성', replication: '복제',
  respectful: '예의 바른', ridicule: '조롱', scientists: '과학자',
  scratch: '긁다', selection: '선택', singularity: '특이점',
  sleep: '수면', smallest: '가장 작은', suffering: '고통',
  sunflowers: '해바라기', sure: '확신하는', surface: '표면',
  transfusion: '수혈', transpiration: '증산', undeveloped: '미개발의',
  unexploded: '불발의', wealthiest: '가장 부유한', wherever: '어디든',
  worth: '가치',
  cherry: '벚꽃, 체리', cyprus: '키프로스', footprints: '발자국',
  heartbeat: '심장 박동', memory: '기억', migratory: '이주하는',
  opinion: '의견', ruled: '통치된', silver: '은', spider: '거미',

  // Missing meanings from smart-keep run
  affirmation: '긍정', afghanistan: '아프가니스탄', appears: '나타나다',
  assemble: '조립하다', bird: '새', bright: '밝은',
  career: '직업', causing: '유발하는', consumption: '소비',
  countries: '국가', covering: '덮는', cradle: '요람',
  creation: '창조', dates: '날짜', deception: '속임수',
  desert: '사막', determines: '결정하다', enjoying: '즐기는',
  explorers: '탐험가', finches: '핀치새', flights: '비행',
  flood: '홍수', frida: '프리다', highlighting: '강조하는',
  humble: '겸손한', imaginative: '상상력이 풍부한',
  inclination: '성향', indifferent: '무관심한', inefficient: '비효율적인',
  informal: '비공식적인', instructions: '지침', inventions: '발명',
  knuckles: '주먹 관절', largest: '가장 큰', mistaking: '착각하는',
  monument: '기념비', morning: '아침', neighborhoods: '이웃',
  neighbors: '이웃', newton: '뉴턴', ordinary: '평범한',
  ought: '~해야 하다', pain: '고통', percent: '퍼센트',
  philosopher: '철학자', photographic: '사진의', portuguese: '포르투갈의',
  preferences: '선호', programmed: '프로그래밍된', racehorse: '경주마',
  rethink: '다시 생각하다', robert: '로버트', seeking: '추구하는',
  settlers: '정착민', singing: '노래하는', smells: '냄새',
  snowflake: '눈송이', speculated: '추측된', strokes: '획',
  sudden: '갑작스러운', sunset: '일몰', sweetness: '달콤함',
  terrified: '겁에 질린', thrown: '던져진', toasts: '건배',
  tomb: '무덤', tournaments: '토너먼트', turkish: '터키의',
  unyielding: '굽히지 않는', victorious: '승리한',
  cities: '도시', protect: '보호하다', shorter: '더 짧은',

  // Additional educational words from 2nd run
  absurdity: '부조리', actions: '행동', alive: '살아 있는',
  allowing: '허용하는', allows: '허용하다', annual: '연례의',
  arches: '아치', artist: '예술가', attract: '끌어당기다',
  battling: '싸우는', bayanihan: '바야니한 (필리핀 상부상조)',
  beggar: '거지', beneath: '아래에', berber: '베르베르',
  bending: '구부리는', bends: '구부리다', blankets: '담요',
  blending: '혼합하는', blessings: '축복', branded: '낙인찍힌',
  buddhist: '불교의', burning: '타오르는',
  canal: '운하', capoeira: '카포에이라', carefree: '근심 없는',
  center: '중심', chemical: '화학의', cinema: '영화',
  circle: '원', clownfish: '흰동가리', color: '색',
  confident: '자신감 있는', confluence: '합류', constant: '일정한',
  consumed: '소비된', counts: '중요하다', covered: '덮인',
  cruise: '항해', dance: '춤', dancer: '무용수', dancing: '춤추는',
  death: '죽음', decorate: '장식하다', deduction: '추론',
  deep: '깊은', default: '기본 설정', deliver: '전달하다',
  demanded: '요구된', dice: '주사위', direct: '직접적인',
  directly: '직접', displaced: '이주한', distances: '거리',
  downcast: '풀이 죽은', enslaved: '노예가 된',
  essence: '본질', eternity: '영원', experience: '경험',
  experienced: '경험 많은', eyes: '눈', family: '가족',
  farmer: '농부', fashioned: '만들어진', faster: '더 빠른',
  fiction: '소설', figure: '인물', figures: '인물들',
  finally: '마침내', fishing: '어업', floats: '떠다니다',
  forgotten: '잊혀진', forms: '형태', fragrance: '향기',
  frozen: '얼어붙은', game: '게임', gazing: '응시하는',
  girl: '소녀', going: '가는', ground: '땅', growth: '성장',
  guardians: '수호자', happiness: '행복', healthy: '건강한',
  hearing: '청각', heroically: '영웅적으로', highly: '매우',
  horse: '말', houses: '집들', humans: '인간',
  idealists: '이상주의자', ideas: '생각', imagines: '상상하다',
  important: '중요한', individual: '개인', inside: '안에',
  intellect: '지성', invasion: '침략', invented: '발명된',
  japanese: '일본의', landed: '상륙한', laws: '법률',
  letter: '편지', literary: '문학의', manners: '예절',
  marry: '결혼하다', matching: '일치하는', meditating: '명상하는',
  meditative: '명상적인', mice: '생쥐', millions: '수백만',
  mischievous: '장난스러운', moon: '달', muscles: '근육',
  national: '국가의', nobody: '아무도 아닌', oranges: '오렌지',
  paddies: '논', paradise: '낙원', peppers: '고추',
  pirate: '해적', placing: '배치하는', planet: '행성',
  positive: '긍정적인', postures: '자세', prayer: '기도',
  precise: '정확한', preparing: '준비하는', public: '공공의',
  rapidly: '빠르게', recall: '회상하다', records: '기록',
  region: '지역', rejected: '거부된', releases: '방출하다',
  religions: '종교', remixing: '리믹싱', reviewing: '검토하는',
  riches: '부', roundness: '둥글기', rustic: '시골의',
  scale: '규모', scenes: '장면', seawater: '바닷물',
  selfless: '이타적인', sevusevu: '세부세부 (피지 의식)',
  shared: '공유된', sharing: '나누는', sharply: '날카롭게',
  shells: '조개껍데기', sick: '아픈', silence: '침묵',
  silent: '조용한', simplest: '가장 단순한', single: '단일의',
  sixty: '육십', sketched: '스케치한', skills: '기술',
  slumber: '잠', smart: '똑똑한', soldier: '군인',
  south: '남쪽', spirits: '정신', staring: '응시하는',
  station: '역', stillness: '고요', stream: '시냇물',
  stretches: '뻗다', strike: '파업', studies: '연구',
  study: '공부', surgical: '외과의', surprisingly: '놀랍게도',
  surrounding: '둘러싸는', teamwork: '팀워크', tears: '눈물',
  technology: '기술', teenage: '십대의', terra: '땅',
  texts: '텍스트', thickness: '두께', thinner: '더 얇은',
  thread: '실', thunder: '천둥', tolerant: '관용적인',
  tore: '찢다', towers: '탑', trampling: '짓밟는',
  trapped: '갇힌', travelers: '여행자', tree: '나무',
  trial: '시험, 재판', trust: '신뢰', unconscious: '무의식의',
  undisturbed: '방해받지 않는', unknown: '알려지지 않은',
  valuable: '가치 있는', vampire: '뱀파이어', vibrations: '진동',
  village: '마을', visiting: '방문하는', visualizing: '시각화하는',
  waiting: '기다리는', watchmakers: '시계공', weight: '무게',
  willpower: '의지력', wolves: '늑대', wood: '나무, 목재',
  woods: '숲',

  // Common words found in educational sentences
  emotion: '감정', technique: '기법', atmosphere: '분위기',
  domestic: '국내의', spiritual: '영적인', medieval: '중세의',
  dramatic: '극적인', symbolic: '상징적인', romantic: '낭만적인',
  classical: '고전적인', contemporary: '현대의', universal: '보편적인',
  essential: '본질적인', fundamental: '근본적인', significant: '중요한',
  influence: '영향', emphasis: '강조', tension: '긴장',
  concept: '개념', principle: '원칙', element: '요소',
  structure: '구조', function: '기능', process: '과정',
  feature: '특징', aspect: '측면', dimension: '차원',
  origin: '기원', source: '원천', foundation: '기반',
  capacity: '능력', potential: '잠재력', opportunity: '기회',
  challenge: '도전', conflict: '갈등', crisis: '위기',
  transition: '전환', progress: '진보', decline: '쇠퇴',
  expansion: '확장', contraction: '수축', circulation: '순환',
  consequence: '결과', phenomenon: '현상', circumstance: '상황',
  strategy: '전략', method: '방법', procedure: '절차',
  evidence: '증거', hypothesis: '가설', theory: '이론',
  experiment: '실험', observation: '관찰', analysis: '분석',
  substance: '물질', compound: '화합물', reaction: '반응',
  temperature: '온도', pressure: '압력', density: '밀도',
  velocity: '속도', frequency: '주파수', wavelength: '파장',
  gravity: '중력', friction: '마찰', momentum: '운동량',
  particle: '입자', electron: '전자', nucleus: '핵',
  membrane: '막', tissue: '조직', organ: '기관',
  species: '종', population: '개체군', diversity: '다양성',
  survival: '생존', reproduction: '번식', adaptation: '적응',
  protein: '단백질', nutrient: '영양소', oxygen: '산소',
  carbon: '탄소', nitrogen: '질소', hydrogen: '수소',
  moisture: '수분', humidity: '습도', precipitation: '강수',
  current: '해류, 전류', tide: '조수', wave: '파도',
  deposit: '퇴적물', layer: '층', crust: '지각',
  magma: '마그마', lava: '용암', eruption: '분출',
  orbit: '궤도', rotation: '자전', axis: '축',
  satellite: '위성', telescope: '망원경', microscope: '현미경',
  frontier: '국경', territory: '영토', colony: '식민지',
  empire: '제국', province: '주, 도', domain: '영역',
  commerce: '상업', currency: '통화', commodity: '상품',
  tariff: '관세', subsidy: '보조금', monopoly: '독점',
  parliament: '의회', constitution: '헌법', amendment: '수정안',
  ballot: '투표', suffrage: '참정권', legislation: '입법',
  aristocracy: '귀족 정치', democracy: '민주주의', theocracy: '신정 정치',
  diplomacy: '외교', alliance: '동맹', neutrality: '중립',
  siege: '포위', ambush: '매복', reconnaissance: '정찰',
  infantry: '보병', artillery: '포병', garrison: '수비대',
  terrain: '지형', latitude: '위도', longitude: '경도',
  altitude: '고도', elevation: '해발', topography: '지형학',
  arid: '건조한', humid: '습한', temperate: '온대의',
  tropical: '열대의', polar: '극지의', continental: '대륙의',
  erosion: '침식', weathering: '풍화', sedimentation: '퇴적',

  // More verbs common in sentences
  celebrate: '축하하다', establish: '설립하다', demonstrate: '증명하다',
  illustrate: '설명하다', incorporate: '통합하다', facilitate: '촉진하다',
  anticipate: '예상하다', negotiate: '협상하다',
  inaugurate: '취임시키다', confiscate: '몰수하다',
  distinguish: '구별하다', acknowledge: '인정하다',
  emphasize: '강조하다', recognize: '인식하다',
  represent: '대표하다', indicate: '나타내다',
  examine: '검사하다', investigate: '조사하다',
  generate: '생성하다', distribute: '분배하다',
  contribute: '기여하다', participate: '참여하다',
  cooperate: '협력하다', communicate: '소통하다',
  construct: '건설하다', manufacture: '제조하다',
  cultivate: '경작하다', harvest: '수확하다',
  inhabit: '거주하다', occupy: '점령하다',
  abandon: '포기하다', evacuate: '대피하다',
  restore: '복원하다', renovate: '보수하다',
  exhibit: '전시하다', display: '전시하다',
  compose: '작곡하다', perform: '공연하다',
  interpret: '해석하다', translate: '번역하다',
  publish: '출판하다', document: '기록하다',
  sustain: '유지하다', maintain: '유지하다',
  enhance: '향상시키다', improve: '개선하다',
  diminish: '줄이다', reduce: '감소시키다',
  expand: '확장하다', extend: '연장하다',
  restrict: '제한하다', prohibit: '금지하다',
  permit: '허용하다', authorize: '허가하다',
  implement: '시행하다', enforce: '집행하다',
  abolish: '폐지하다', repeal: '폐지하다',
  reform: '개혁하다', revise: '개정하다',
  assess: '평가하다', evaluate: '평가하다',
  classify: '분류하다', categorize: '범주화하다',
  simulate: '모의하다', replicate: '복제하다',
  stimulate: '자극하다', motivate: '동기부여하다',
  inspire: '영감을 주다', encourage: '격려하다',
  nurture: '양육하다', cherish: '소중히 여기다',
  honor: '존경하다', worship: '숭배하다',
  condemn: '비난하다', criticize: '비판하다',
  praise: '칭찬하다', applaud: '찬사를 보내다',
  denounce: '비난하다', accuse: '고발하다',
  acquit: '무죄를 선고하다', pardon: '사면하다',
  exile: '추방하다', deport: '추방하다',
  annex: '합병하다', colonize: '식민지화하다',
  liberate: '해방하다', emancipate: '해방하다',
  oppress: '탄압하다', persecute: '박해하다',
  segregate: '분리하다', integrate: '통합하다',
  unify: '통일하다', fragment: '분열시키다',

  // Words common in art descriptions
  foreground: '전경', background: '배경', scenery: '풍경',
  brushstroke: '붓놀림', chiaroscuro: '명암법',
  realism: '사실주의', impressionism: '인상주의',
  surrealism: '초현실주의', expressionism: '표현주의',
  cubism: '입체주의', baroque: '바로크',
  neoclassical: '신고전주의의', gothic: '고딕의',
  humanist: '인문주의의', naturalist: '자연주의의',
  romanticism: '낭만주의', symbolism: '상징주의',
  allegiance: '충성', tableau: '생생한 장면',
  vignette: '삽화', montage: '몽타주',
  etching: '에칭', woodblock: '목판',
  watercolor: '수채화', pastel: '파스텔',
  gild: '금박을 입히다', emboss: '양각하다',
  patina: '녹청',

  // Additional words likely to appear in educational content
  absorb: '흡수하다', channel: '전달하다',
  mechanism: '메커니즘', apparatus: '장치',
  specimen: '표본', sample: '표본, 샘플',
  inventory: '목록', catalog: '목록',
  archive: '기록 보관소', repository: '저장소',
  heritage: '유산', patrimony: '세습 재산',
  folklore: '민속', mythology: '신화',
  dialect: '방언', jargon: '전문 용어',
  proverb: '속담', parable: '비유',
  fable: '우화', ballad: '발라드',
  sonnet: '소네트', ode: '송시',
  prose: '산문', verse: '운문',
  stanza: '연', couplet: '대구',
  refrain: '후렴', chorus: '합창',
  prelude: '서곡', overture: '서곡',
  symphony: '교향곡', concerto: '협주곡',
  aria: '아리아', libretto: '오페라 대본',
  encore: '앙코르', virtuoso: '명인',
  maestro: '지휘자', ensemble: '앙상블',
  repertoire: '레퍼토리', premiere: '초연',
  intermission: '막간', finale: '피날레',
  critique: '비평', aesthetic: '미학적인',
  connoisseur: '감정가', aficionado: '애호가',
  curator: '큐레이터', conservator: '보존가',

  // Frequently needed in science sentences
  photon: '광자', proton: '양성자', neutron: '중성자',
  isotope: '동위원소', alloy: '합금', polymer: '중합체',
  catalyst: '촉매', reagent: '시약', solvent: '용매',
  electrode: '전극', conductor: '도체', insulator: '절연체',
  semiconductor: '반도체', superconductor: '초전도체',
  turbine: '터빈', generator: '발전기', transformer: '변압기',
  propulsion: '추진', combustion: '연소', ignition: '점화',
  friction: '마찰', inertia: '관성', torque: '토크',
  wavelength: '파장', amplitude: '진폭', resonance: '공명',
  refraction: '굴절', diffraction: '회절', interference: '간섭',
  magnetic: '자기의', electromagnetic: '전자기의',
  thermodynamic: '열역학의', kinetic: '운동의',
  quantum: '양자의', relativistic: '상대론적인',
  chromosome: '염색체', genome: '유전체', allele: '대립유전자',
  mitosis: '유사분열', meiosis: '감수분열',
  photosynthesis: '광합성', respiration: '호흡',
  fermentation: '발효', decomposition: '분해',
  predation: '포식', mutualism: '상리공생',
  commensalism: '편리공생', parasitism: '기생',
  biodiversity: '생물다양성', endemic: '풍토성의',
  ecology: '생태학', ethology: '동물행동학',
  anatomy: '해부학', physiology: '생리학',
  pathology: '병리학', immunology: '면역학',
  genetics: '유전학', epidemiology: '역학',
  geology: '지질학', seismology: '지진학',
  meteorology: '기상학', oceanography: '해양학',
  astronomy: '천문학', cosmology: '우주론',

  // More adjectives
  botanical: '식물의', zoological: '동물학의',
  geological: '지질학적인', archaeological: '고고학적인',
  anthropological: '인류학적인', sociological: '사회학적인',
  psychological: '심리학적인', philosophical: '철학적인',
  theological: '신학적인', mythological: '신화의',
  legendary: '전설적인', mythical: '신화적인',
  fictional: '허구의', factual: '사실의',
  authentic: '진짜의', genuine: '진품의',
  synthetic: '합성의', artificial: '인공의',
  organic: '유기적인', inorganic: '무기의',
  sustainable: '지속 가능한', renewable: '재생 가능한',
  biodegradable: '생분해성의', recyclable: '재활용 가능한',
  toxic: '유독한', hazardous: '위험한',
  benign: '양성의', malignant: '악성의',
  chronic: '만성의', acute: '급성의',
  contagious: '전염성의', infectious: '감염성의',
  immune: '면역의', sterile: '무균의',
  dormant: '휴면의', latent: '잠재적인',
  abundant: '풍부한', scarce: '부족한',
  prevalent: '널리 퍼진', pervasive: '만연한',
  prominent: '저명한', prestigious: '명문의',
  affluent: '부유한', impoverished: '빈곤한',
  prosperous: '번영하는', destitute: '궁핍한',

  // Common sentence words that may need meanings
  hollow: '속이 빈', ancient: '고대의',
  ceremony: '의식', feast: '축제, 잔치',
  warrior: '전사', noble: '고귀한',
  scholar: '학자', sage: '현인',
  disciple: '제자', prophet: '예언자',
  martyr: '순교자', heretic: '이단자',
  rebel: '반역자', tyrant: '폭군',
  sovereign: '군주', regent: '섭정',
  chancellor: '수상', envoy: '사절',
  ambassador: '대사', consul: '영사',
  tribune: '호민관', senator: '원로원 의원',
  gladiator: '검투사', centurion: '백인대장',
  pharaoh: '파라오', sultan: '술탄',
  caliph: '칼리프', shogun: '쇼군',
  samurai: '사무라이', ronin: '낭인',
  geisha: '게이샤', kabuki: '가부키',
  daimyo: '다이묘', feudal: '봉건의',
};

// Build existing vocab dictionary
const existingDict = {};
data.forEach(e => {
  (e.vocab || []).forEach(v => {
    existingDict[v.word.toLowerCase()] = v.meaning;
  });
});

const fullDict = { ...SUPPLEMENT_DICT, ...existingDict };

// ── 6. Extract candidate words from sentence ──
function extractCandidates(sentence, usedWords) {
  const tokens = sentence.replace(/[—–\-,.:;!?'"()\[\]{}\/\\""''«»]/g, ' ').split(/\s+/).filter(Boolean);
  const candidates = [];
  const seen = new Set();

  for (const token of tokens) {
    if (isProperNoun(token, sentence)) continue;
    const clean = token.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean || clean.length < 4) continue;
    if (clean.includes("'")) continue;
    if (EASY_WORDS.has(clean)) continue;
    if (seen.has(clean)) continue;
    seen.add(clean);

    const baseForm = getBestBaseForm(clean, fullDict);
    if (EASY_WORDS.has(baseForm)) continue;
    if (usedWords.has(baseForm)) continue;
    if (!wordAppearsIn(baseForm, sentence)) continue;

    const meaning = fullDict[baseForm] || null;
    const score = clean.length + (meaning ? 10 : 0) + (baseForm.length >= 6 ? 3 : 0);

    candidates.push({ surface: clean, base: baseForm, meaning, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

// ══════════════════════════════════════════════
// ── MAIN: Duplicate removal logic ──
// ══════════════════════════════════════════════

console.log('=== vocab 중복 제거 시작 ===\n');

// Step 1: Build global word map
const wordMap = {}; // word -> [{day, idx}]
for (const entry of data) {
  const { day, vocab } = entry;
  if (!vocab) continue;
  for (let i = 0; i < vocab.length; i++) {
    const w = vocab[i].word.toLowerCase();
    if (!wordMap[w]) wordMap[w] = [];
    wordMap[w].push({ day, idx: i });
  }
}

// Find duplicates
const duplicates = {};
let totalDupEntries = 0;
for (const [word, entries] of Object.entries(wordMap)) {
  if (entries.length > 1) {
    duplicates[word] = entries;
    totalDupEntries += entries.length;
  }
}

const dupCount = Object.keys(duplicates).length;
console.log(`중복 단어 종류: ${dupCount}개`);
console.log(`영향받는 vocab 항목: ${totalDupEntries}개`);
console.log(`교체 대상: ${totalDupEntries - dupCount}개 (첫 번째 유지)\n`);

// Step 2: Determine which to keep (hardest to replace) and which to replace (easiest)
// Strategy: for each duplicate group, score each occurrence by how many alternative
// candidates its sentence has. Keep the one with FEWEST alternatives (hardest to replace).
const usedWords = new Set();
const toReplace = []; // [{day, idx, oldWord, oldMeaning}]

// First pass: add all non-duplicate words
for (const [word, entries] of Object.entries(wordMap)) {
  if (entries.length === 1) {
    usedWords.add(word);
  }
}

// Build a temporary usedWords for scoring (all unique words)
const tempUsed = new Set(usedWords);
for (const word of Object.keys(duplicates)) {
  tempUsed.add(word);
}

// Second pass: for duplicates, keep the hardest-to-replace occurrence
for (const [word, entries] of Object.entries(duplicates)) {
  // Score each occurrence: count available alternative candidates in its sentence
  const scored = entries.map(e => {
    const dayData = data[e.day - 1];
    const sentence = dayData.sentences[e.idx].en;
    // Count candidates (excluding the duplicate word itself)
    const candidates = extractCandidates(sentence, tempUsed);
    return { ...e, candidateCount: candidates.length, sentenceLen: sentence.length };
  });

  // Sort: fewest candidates first (hardest to replace = keep), then shortest sentence
  scored.sort((a, b) => a.candidateCount - b.candidateCount || a.sentenceLen - b.sentenceLen);

  // Keep the first (hardest to replace), mark rest for replacement
  usedWords.add(word);
  for (let i = 1; i < scored.length; i++) {
    const e = scored[i];
    const dayData = data[e.day - 1];
    toReplace.push({
      day: e.day,
      idx: e.idx,
      oldWord: dayData.vocab[e.idx].word,
      oldMeaning: dayData.vocab[e.idx].meaning,
      source: dayData.sentences[e.idx].source,
      sentence: dayData.sentences[e.idx].en
    });
  }
}

// Sort replacements by day for consistent processing
toReplace.sort((a, b) => a.day - b.day || a.idx - b.idx);

console.log(`유지할 단어 수 (usedWords 초기): ${usedWords.size}개`);
console.log(`교체 대상 수: ${toReplace.length}개\n`);

// Step 3: Find replacement words
const changes = [];
const missingMeanings = [];
let fixedCount = 0;
let noCandidate = 0;

for (const item of toReplace) {
  const { day, idx, oldWord, oldMeaning, source, sentence } = item;
  const dayData = data[day - 1];

  const candidates = extractCandidates(sentence, usedWords);

  if (candidates.length === 0) {
    // Fallback: relax filter
    const FUNCTION_WORDS = new Set('a an the this that these those it its he she his her him they them their we our us you your i me my mine is am are was were be been being have has had do does did will would can could may might shall should must and or but if so then than not no nor of in on at to for with by from into as'.split(' '));
    const tokens = sentence.replace(/[—–\-,.:;!?'"()\[\]{}\/\\""'']/g, ' ').split(/\s+/).filter(Boolean);
    const fallbackCandidates = [];
    for (const token of tokens) {
      if (isProperNoun(token, sentence)) continue;
      const clean = token.toLowerCase().replace(/[^a-z]/g, '');
      if (!clean || clean.length < 4) continue;
      if (FUNCTION_WORDS.has(clean)) continue;
      if (EASY_WORDS.has(clean)) continue;
      if (usedWords.has(clean)) continue;
      const baseForm = getBestBaseForm(clean, fullDict);
      if (usedWords.has(baseForm)) continue;
      if (!wordAppearsIn(baseForm, sentence)) continue;
      const meaning = fullDict[baseForm] || fullDict[clean] || null;
      fallbackCandidates.push({ base: baseForm, surface: clean, meaning, score: clean.length + (meaning ? 10 : 0) });
    }
    fallbackCandidates.sort((a, b) => b.score - a.score);

    if (fallbackCandidates.length > 0) {
      const picked = fallbackCandidates[0];
      if (!picked.meaning) {
        missingMeanings.push({ day, index: idx, word: picked.base, surface: picked.surface, source, sentence: sentence.substring(0, 120) });
      }
      changes.push({ day, index: idx, oldWord, oldMeaning, newWord: picked.base, newMeaning: picked.meaning || `[TODO:${picked.base}]`, source, fallback: true });
      dayData.vocab[idx].word = picked.base;
      dayData.vocab[idx].meaning = picked.meaning || `[TODO:${picked.base}]`;
      usedWords.add(picked.base);
      fixedCount++;
      continue;
    }

    noCandidate++;
    changes.push({ day, index: idx, oldWord, oldMeaning, newWord: null, newMeaning: null, source, sentence, error: 'NO_CANDIDATE' });
    continue;
  }

  const picked = candidates[0];
  if (!picked.meaning) {
    missingMeanings.push({ day, index: idx, word: picked.base, surface: picked.surface, source, sentence: sentence.substring(0, 120) });
  }

  changes.push({ day, index: idx, oldWord, oldMeaning, newWord: picked.base, newMeaning: picked.meaning || `[TODO:${picked.base}]`, source });
  dayData.vocab[idx].word = picked.base;
  dayData.vocab[idx].meaning = picked.meaning || `[TODO:${picked.base}]`;
  usedWords.add(picked.base);
  fixedCount++;
}

// Step 4: 중복 제거 결과
console.log(`\n=== 중복 제거 결과 ===`);
console.log(`교체 완료: ${fixedCount}개`);
console.log(`후보 없음: ${noCandidate}개`);
console.log(`의미 누락 (TODO): ${missingMeanings.length}개\n`);

// ══════════════════════════════════════════════
// ── PASS 2: staleVocab 수정 ──
// ══════════════════════════════════════════════

console.log('=== staleVocab 수정 시작 ===\n');

// Rebuild usedWords from current state (after duplicate fix)
const usedWordsAfterDup = new Set();
for (const entry of data) {
  for (const v of (entry.vocab || [])) {
    usedWordsAfterDup.add(v.word.toLowerCase());
  }
}

const staleChanges = [];
const staleMissing = [];
let staleFixed = 0;
let staleNoCandidate = 0;

for (const entry of data) {
  const { day, vocab, sentences } = entry;
  if (!vocab || !sentences || vocab.length !== 4 || sentences.length !== 4) continue;

  for (let i = 0; i < 4; i++) {
    if (wordAppearsIn(vocab[i].word, sentences[i].en)) continue;

    // This vocab word doesn't appear in its sentence — needs replacement
    const oldWord = vocab[i].word;
    const oldMeaning = vocab[i].meaning;
    const sentence = sentences[i].en;
    const source = sentences[i].source;

    // Remove old word from usedWords so it doesn't block itself
    usedWordsAfterDup.delete(oldWord.toLowerCase());

    const candidates = extractCandidates(sentence, usedWordsAfterDup);

    if (candidates.length === 0) {
      // Fallback: relax filter
      const FUNCTION_WORDS = new Set('a an the this that these those it its he she his her him they them their we our us you your i me my mine is am are was were be been being have has had do does did will would can could may might shall should must and or but if so then than not no nor of in on at to for with by from into as'.split(' '));
      const tokens = sentence.replace(/[—–\-,.:;!?'"()\[\]{}\/\\""'']/g, ' ').split(/\s+/).filter(Boolean);
      const fallbackCandidates = [];
      for (const token of tokens) {
        if (isProperNoun(token, sentence)) continue;
        const clean = token.toLowerCase().replace(/[^a-z]/g, '');
        if (!clean || clean.length < 4) continue;
        if (FUNCTION_WORDS.has(clean)) continue;
        if (EASY_WORDS.has(clean)) continue;
        if (usedWordsAfterDup.has(clean)) continue;
        const baseForm = getBestBaseForm(clean, fullDict);
        if (usedWordsAfterDup.has(baseForm)) continue;
        if (!wordAppearsIn(baseForm, sentence)) continue;
        const meaning = fullDict[baseForm] || fullDict[clean] || null;
        fallbackCandidates.push({ base: baseForm, surface: clean, meaning, score: clean.length + (meaning ? 10 : 0) });
      }
      fallbackCandidates.sort((a, b) => b.score - a.score);

      if (fallbackCandidates.length > 0) {
        const picked = fallbackCandidates[0];
        if (!picked.meaning) {
          staleMissing.push({ day, index: i, word: picked.base, surface: picked.surface, source, sentence: sentence.substring(0, 120) });
        }
        staleChanges.push({ day, index: i, oldWord, oldMeaning, newWord: picked.base, newMeaning: picked.meaning || `[TODO:${picked.base}]`, source, fallback: true });
        vocab[i].word = picked.base;
        vocab[i].meaning = picked.meaning || `[TODO:${picked.base}]`;
        usedWordsAfterDup.add(picked.base);
        staleFixed++;
        continue;
      }

      staleNoCandidate++;
      staleChanges.push({ day, index: i, oldWord, oldMeaning, newWord: null, newMeaning: null, source, sentence, error: 'NO_CANDIDATE' });
      // Re-add old word since we couldn't replace it
      usedWordsAfterDup.add(oldWord.toLowerCase());
      continue;
    }

    const picked = candidates[0];
    if (!picked.meaning) {
      staleMissing.push({ day, index: i, word: picked.base, surface: picked.surface, source, sentence: sentence.substring(0, 120) });
    }

    staleChanges.push({ day, index: i, oldWord, oldMeaning, newWord: picked.base, newMeaning: picked.meaning || `[TODO:${picked.base}]`, source });
    vocab[i].word = picked.base;
    vocab[i].meaning = picked.meaning || `[TODO:${picked.base}]`;
    usedWordsAfterDup.add(picked.base);
    staleFixed++;
  }
}

console.log(`=== staleVocab 수정 결과 ===`);
console.log(`교체 완료: ${staleFixed}개`);
console.log(`후보 없음: ${staleNoCandidate}개`);
console.log(`의미 누락 (TODO): ${staleMissing.length}개\n`);

// ══════════════════════════════════════════════
// ── FINAL VALIDATION ──
// ══════════════════════════════════════════════

console.log('=== 최종 검증 ===\n');

// Verify no duplicates remain
const finalWordMap = {};
let remainingDups = 0;
for (const entry of data) {
  for (const v of (entry.vocab || [])) {
    const w = v.word.toLowerCase();
    if (!finalWordMap[w]) finalWordMap[w] = [];
    finalWordMap[w].push(entry.day);
  }
}
for (const [word, days] of Object.entries(finalWordMap)) {
  if (days.length > 1) {
    remainingDups++;
    if (remainingDups <= 10) {
      console.log(`  남은 중복: "${word}" → Day ${days.join(', ')}`);
    }
  }
}
console.log(`남은 중복 단어: ${remainingDups}개`);

// Verify all vocab words appear in sentences
let staleCount = 0;
for (const entry of data) {
  const { vocab, sentences } = entry;
  if (!vocab || !sentences) continue;
  for (let i = 0; i < vocab.length; i++) {
    if (!wordAppearsIn(vocab[i].word, sentences[i].en)) {
      staleCount++;
      if (staleCount <= 10) {
        console.log(`  staleVocab: Day ${entry.day} [${i}] "${vocab[i].word}" not in "${sentences[i].en.substring(0, 60)}..."`);
      }
    }
  }
}
console.log(`staleVocab: ${staleCount}개\n`);

// Save all changes
const allChanges = [...changes.map(c => ({...c, type: 'duplicate'})), ...staleChanges.map(c => ({...c, type: 'stale'}))];
writeFileSync('scripts/vocab-dup-changes.json', JSON.stringify(allChanges, null, 2));
console.log('변경 로그: scripts/vocab-dup-changes.json');

const allMissing = [...missingMeanings, ...staleMissing];
if (allMissing.length > 0) {
  writeFileSync('scripts/vocab-dup-missing.json', JSON.stringify(allMissing, null, 2));
  console.log('의미 누락 목록: scripts/vocab-dup-missing.json');
  const uniqueMissing = [...new Set(allMissing.map(m => m.word))].sort();
  console.log(`\n누락 단어 (${uniqueMissing.length}개):`);
  console.log(uniqueMissing.join(', '));
}

const allNoCandidate = [...changes.filter(c => c.error === 'NO_CANDIDATE').map(c => ({...c, type: 'duplicate'})), ...staleChanges.filter(c => c.error === 'NO_CANDIDATE').map(c => ({...c, type: 'stale'}))];
if (allNoCandidate.length > 0) {
  console.log(`\n후보 없는 항목 (${allNoCandidate.length}개):`);
  allNoCandidate.forEach(c => {
    console.log(`  [${c.type}] Day ${c.day} [${c.index}] ${c.source}: "${c.oldWord}" → ${c.sentence?.substring(0, 80)}...`);
  });
}

// Save fixed english.json
writeFileSync('src/data/english.json', JSON.stringify(data, null, 2));
console.log('\n영어 데이터 저장 완료: src/data/english.json');
