import fs from "fs";
import path from "path";

const ARTS_PATH = path.resolve("src/data/arts.json");
const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));

const fixes = {
  // Day 63 (양심) — 렘브란트 → 조르주 드 라 투르
  62: {
    title: "참회하는 막달라 마리아",
    artist: "조르주 드 라 투르",
    year: 1640,
    country: "프랑스",
    image_url: "",
    source_url: "https://en.wikipedia.org/wiki/The_Penitent_Magdalene_(La_Tour)",
    source_label: "Wikipedia",
    story: "어둠 속에서 촛불 하나만 켜진 방. 막달라 마리아가 해골을 무릎에 올려놓고 깊이 생각에 잠겨 있어. 해골은 죽음을, 촛불은 덧없는 시간을 상징해. 과거의 잘못을 돌아보며 양심과 마주하는 순간이야. 라 투르는 화려한 색 대신 촛불 하나의 빛으로 인간 내면의 고요한 성찰을 그렸어.",
    look_for: "촛불이 거울에 비쳐 두 개의 빛이 돼. 마리아의 얼굴 절반은 빛, 절반은 어둠 — 양심의 두 면을 상징해. 해골 위에 놓인 그녀의 손이 놀랍도록 부드러워.",
    fun_fact: "라 투르는 생전에 루이 13세의 총애를 받았지만 사후 완전히 잊혀졌어. 20세기에 재발견되기까지 250년이 걸렸대! 같은 주제를 최소 4번 그렸는데, 각각 다른 미술관에 있어.",
    question: "혼자 조용히 자신을 돌아보는 시간이 있어? 양심의 소리는 언제 가장 크게 들려?"
  },
  // Day 202 (의지) — 브뤼헐 → 귀스타브 도레
  201: {
    title: "돈키호테와 풍차",
    artist: "귀스타브 도레",
    year: 1863,
    country: "프랑스",
    image_url: "",
    source_url: "https://en.wikipedia.org/wiki/Gustave_Doré",
    source_label: "Wikipedia",
    story: "돈키호테가 풍차를 거인으로 착각하고 돌진하는 유명한 장면이야. 세상은 그를 미친 사람이라 하지만, 돈키호테에게는 자신만의 의지와 신념이 있어. 도레는 이 장면을 영웅적으로도, 우스꽝스럽게도 그리지 않았어 — 의지를 꺾지 않는 인간의 처절한 아름다움을 담았어.",
    look_for: "말에서 떨어지며 공중에 뜬 돈키호테의 자세를 봐 — 패배하면서도 어딘가 당당해. 멀리서 산초 판사가 당나귀 위에서 지켜보고 있어. 풍차의 거대함과 인간의 작음이 극적으로 대비돼.",
    fun_fact: "도레는 19세기 가장 유명한 삽화가로 성경, 신곡, 돈키호테 등 수많은 고전의 삽화를 그렸어. 5세에 그림을 시작해 15세에 파리에서 전문 삽화가로 데뷔했대! 평생 10만 점 이상의 판화를 제작했어.",
    question: "남들이 미쳤다고 해도 자기 의지를 관철한 적이 있어? 의지와 고집의 차이는 뭘까?"
  },
  // Day 208 (거부) — 다비드 → 안토니오 카노바
  207: {
    title: "에로스와 프시케",
    artist: "안토니오 카노바",
    year: 1793,
    country: "이탈리아",
    image_url: "",
    source_url: "https://en.wikipedia.org/wiki/Psyche_Revived_by_Cupid%27s_Kiss",
    source_label: "Wikipedia",
    story: "프시케는 비너스의 명령으로 절대 열지 말라는 상자를 열었다가 죽음의 잠에 빠져. 에로스가 내려와 입맞춤으로 그녀를 깨우는 순간이야. 프시케는 금지된 것을 거부하지 못했지만, 에로스는 어머니 비너스의 명령을 거부하고 사랑을 택했어. 진정한 거부는 무엇을 위해 거부하느냐에 달려 있어.",
    look_for: "두 인물의 팔이 만드는 X자 구도를 봐 — 위에서 보면 나비 날개 모양이야. 프시케의 축 늘어진 몸과 에로스의 당당한 날개가 대비돼. 대리석인데도 살결의 부드러움이 느껴져!",
    fun_fact: "카노바는 나폴레옹이 가장 좋아한 조각가야. 나폴레옹의 누이를 비너스로 조각해달라는 주문도 받았어. 이 조각은 360도 어디서 봐도 아름다운데, 카노바가 대리석에 얇은 밀랍을 발라 피부 같은 질감을 냈대!",
    question: "누군가를 위해 규칙이나 명령을 거부해야 했던 적이 있어? 거부에도 용기가 필요할까?"
  },
  // Day 264 (마무리) — 반 고흐 → 존 에버렛 밀레이
  263: {
    title: "가을 낙엽",
    artist: "존 에버렛 밀레이",
    year: 1856,
    country: "영국",
    image_url: "",
    source_url: "https://en.wikipedia.org/wiki/Autumn_Leaves_(painting)",
    source_label: "Wikipedia",
    story: "네 소녀가 가을 낙엽을 모아 태우고 있어. 연기가 저녁 하늘로 피어오르고, 멀리 석양이 지고 있어. 밀레이는 '순수한 아름다움으로 가장 깊은 감정을 일으키는 그림'을 그리고 싶었대. 낙엽은 한 계절의 마무리이자, 새로운 순환의 시작이야. 시간은 흘러가지만, 아름다움은 그 속에 있어.",
    look_for: "소녀들의 표정이 각각 달라 — 두 명은 관객을 보고, 두 명은 낙엽에 집중해. 뒤의 석양빛이 나뭇잎 색과 어울려. 연기의 방향이 하늘로 곧게 올라가는 걸 봐 — 바람 없는 고요한 저녁이야.",
    fun_fact: "비평가 존 러스킨은 이 그림을 보고 '세상에서 가장 시적인 그림'이라고 했어. 밀레이는 모델인 아내의 여동생들과 동네 아이들을 모델로 썼대. 라파엘 전파 중에서도 가장 감성적인 작품으로 꼽혀.",
    question: "한 해를 마무리할 때 어떤 기분이 들어? 끝남 속에서 아름다움을 찾을 수 있을까?"
  }
};

for (const [idx, rep] of Object.entries(fixes)) {
  const i = Number(idx);
  const oldDate = arts[i].date;
  arts[i] = { date: oldDate, ...rep };
}

fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");

console.log("4개 초과 작가 수정 완료:\n");
for (const [idx] of Object.entries(fixes)) {
  const i = Number(idx);
  console.log(`Day ${i+1}: ${arts[i].title} — ${arts[i].artist} (${arts[i].year})`);
}

// Final check
const counts = {};
arts.forEach(a => { counts[a.artist] = (counts[a.artist] || 0) + 1; });
const over4 = Object.entries(counts).filter(([, v]) => v > 4);
if (over4.length) {
  console.log("\n⚠️ 아직 4개 초과:", over4);
} else {
  console.log("\n✅ 작가 4개 제한 모두 통과");
}
