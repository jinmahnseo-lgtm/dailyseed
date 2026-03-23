import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const ARTS_PATH = path.resolve("src/data/arts.json");
const ENG_PATH = path.resolve("src/data/english.json");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "DailySeedBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadWikimediaImage(fileName, destPath) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const apiData = JSON.parse((await fetchUrl(apiUrl)).toString());
  const pages = apiData.query.pages;
  const page = Object.values(pages)[0];
  if (!page.imageinfo) throw new Error("Image not found: " + fileName);

  // Use thumbnail URL (1280px) if available, otherwise full URL
  const imgUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
  console.log(`  Downloading from: ${imgUrl.substring(0, 80)}...`);

  const imgBuffer = await fetchUrl(imgUrl);
  const sharp = (await import("sharp")).default;
  await sharp(imgBuffer)
    .resize(1280, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destPath);

  console.log(`  Saved: ${path.basename(destPath)} (${(imgBuffer.length/1024).toFixed(0)}KB → webp)`);
  return `https://commons.wikimedia.org/wiki/File:${fileName}`;
}

async function main() {
  const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
  const eng = JSON.parse(fs.readFileSync(ENG_PATH, "utf-8"));

  // === 1. Day 186: 의사 / 루크 필데스 ===
  console.log("\n=== Day 186: 의사 / 루크 필데스 ===");
  try {
    const src = await downloadWikimediaImage("Luke Fildes (1891) The Doctor.png", "public/images/arts/day-186.webp");
    Object.assign(arts[185], {
      title: "의사",
      title_original: "The Doctor",
      artist: "루크 필데스",
      artist_original: "Luke Fildes",
      year: 1891,
      country: "영국",
      medium: "유화",
      period: "빅토리아 시대",
      source_url: src,
      source_label: "Wikimedia Commons",
      story: "어두운 방 안에서 한 의사가 아픈 아이의 침대 곁에 앉아 걱정스럽게 지켜보고 있어. 필데스는 자신의 아들이 어린 나이에 죽었을 때 곁을 지켜준 의사의 모습에서 영감을 받아 이 그림을 그렸어. 뒤편에서 부모가 불안하게 바라보고, 의사는 밤새 아이 곁을 떠나지 않아. 의학이란 단순한 기술이 아니라 환자를 향한 헌신이라는 걸 보여주는 작품이야.",
      look_for: "의사의 시선이 오직 아이에게만 향해 있어. 탁자 위의 약과 물컵, 희미한 램프 빛이 밤새 간호한 시간을 보여줘. 뒤편 그림자 속 부모의 불안한 모습도 봐. 전체적으로 어둡지만 아이에게 비치는 빛이 희망을 상징해.",
      fun_fact: "이 그림은 영국에서 가장 사랑받는 그림 중 하나야. 2차 세계대전 때 영국 정부는 이 그림을 국민건강서비스(NHS) 홍보에 사용했어. 필데스의 아들 필립이 크리스마스에 세상을 떠난 후, 의사 머레이 박사가 보여준 헌신에 감동받아 그린 작품이야.",
      question: "의사는 밤새 아이 곁을 지켜. 누군가를 위해 끝까지 곁을 지켜준 경험이 있어?",
    });
    // Update english
    const engArt186 = eng[185].sentences.find(s => s.source === "명화");
    if (engArt186) {
      engArt186.en = "In Luke Fildes' painting The Doctor, a physician sits beside a sick child through the night, showing that true medicine is not just science but compassion.";
      engArt186.ko = "루크 필데스의 그림 '의사'에서, 한 의사가 밤새 아픈 아이 곁에 앉아 있으며, 진정한 의학은 과학만이 아니라 연민임을 보여준다.";
      engArt186.note = "'sit beside ~'은 '~곁에 앉다'야. 'not just A but B'는 'A만이 아니라 B이기도 하다'라는 상관접속사 구문이야.";
    }
    const dissIdx = eng[185].vocab.findIndex(v => v.word === "dissection");
    if (dissIdx >= 0) eng[185].vocab[dissIdx] = { word: "compassion", meaning: "연민, 동정심" };
    console.log("  ✅ Done");
  } catch (e) { console.error("  ❌", e.message); }

  await new Promise(r => setTimeout(r, 2000));

  // === 2. Day 255: 필라도 앞의 그리스도 / 미하이 문카치 ===
  console.log("\n=== Day 255: 필라도 앞의 그리스도 / 미하이 문카치 ===");
  try {
    const src = await downloadWikimediaImage("Munkacsy - Christ in front of Pilate.jpg", "public/images/arts/day-255.webp");
    Object.assign(arts[254], {
      title: "필라도 앞의 그리스도",
      title_original: "Christ before Pilate",
      artist: "미하이 문카치",
      artist_original: "Mihály Munkácsy",
      year: 1881,
      country: "헝가리",
      medium: "유화",
      period: "사실주의",
      source_url: src,
      source_label: "Wikimedia Commons",
      story: "예수가 총독 필라도 앞에 서서 심판을 받는 장면이야. 문카치는 이 장면을 역사화가 아니라 인간 드라마로 그렸어. 예수는 조용히 서 있고, 필라도는 갈등하며, 군중은 소란스러워. 이것은 역사상 가장 유명한 '면접'이야 — 한 사람의 진실성이 심판대 위에 올라간 순간. 네가 누구인지를 증명해야 하는 순간, 말보다 태도가 더 많은 것을 말해줘.",
      look_for: "예수의 고요한 자세와 주변 군중의 소란이 극명한 대비를 이뤄. 필라도의 표정에서 갈등이 보여 — 무죄라는 걸 알면서도 결정을 내려야 하는 고뇌야. 문카치 특유의 어두운 색조와 극적인 빛이 장면의 긴장감을 높여.",
      fun_fact: "문카치는 헝가리 최고의 화가로, 이 그림은 높이 4미터가 넘는 대작이야. 완성 후 유럽과 미국을 순회 전시했는데, 뉴욕에서만 하루 6천 명이 관람했대. 현재 캐나다 해밀턴 미술관에 소장돼 있어.",
      question: "예수는 심판 앞에서 당당하게 자신의 진실을 지켰어. 네가 누군가에게 나를 증명해야 했던 순간이 있었어?",
    });
    const engArt255 = eng[254].sentences.find(s => s.source === "명화");
    if (engArt255) {
      engArt255.en = "In Munkácsy's painting, Christ stands calmly before Pilate while an angry crowd demands his punishment — the ultimate test of character under pressure.";
      engArt255.ko = "문카치의 그림에서, 그리스도는 분노한 군중이 처벌을 요구하는 가운데 필라도 앞에 차분하게 서 있다 — 압박 속 인격의 궁극적 시험이다.";
      engArt255.note = "'stand calmly'에서 부사 calmly가 동사 stand를 수식해. 'under pressure'는 '압박 속에서'라는 전치사구야.";
    }
    console.log("  ✅ Done");
  } catch (e) { console.error("  ❌", e.message); }

  await new Promise(r => setTimeout(r, 2000));

  // === 3. Day 295: 제목만 수정 (전쟁의 참화 → 전쟁의 참상) ===
  console.log("\n=== Day 295: 제목 수정 (중복 해소) ===");
  arts[294].title = "전쟁의 참상";
  console.log("  ✅ '전쟁의 참화' → '전쟁의 참상'");

  // === 4. Day 318: 절규(중복) → 키르히너의 '베를린 거리' ===
  console.log("\n=== Day 318: 베를린 거리 / 에른스트 키르히너 ===");
  try {
    const src = await downloadWikimediaImage("Ernst Ludwig Kirchner - Street, Berlin - Google Art Project.jpg", "public/images/arts/day-318.webp");
    Object.assign(arts[317], {
      title: "베를린 거리",
      title_original: "Street, Berlin (Straße, Berlin)",
      artist: "에른스트 루트비히 키르히너",
      artist_original: "Ernst Ludwig Kirchner",
      year: 1913,
      country: "독일",
      medium: "유화",
      period: "독일 표현주의",
      source_url: src,
      source_label: "Wikimedia Commons",
      story: "뾰족한 구두를 신은 여성들과 검은 옷의 남성들이 베를린 거리를 걷고 있어. 키르히너는 인물들을 날카롭게 왜곡하고, 불안정한 색채를 사용해 대도시의 긴장감을 표현했어. 사실적으로 그리면 보이지 않는 감정 — 불안, 소외, 흥분 — 을 왜곡과 색채로 '표현'하는 것이 표현주의야. 보이는 대로가 아니라 느끼는 대로 그리는 거지.",
      look_for: "인물들의 얼굴이 마스크처럼 날카롭게 처리돼 있어 — 개인이 아니라 군중이야. 길쭉하게 늘어난 형태와 강렬한 초록, 분홍, 검정의 대비를 봐. 원근법이 불안정해서 거리가 기울어진 것 같아 — 도시의 현기증을 느끼게 해.",
      fun_fact: "키르히너는 '다리파(Die Brücke)'의 창립 멤버로 독일 표현주의를 이끌었어. 1차 세계대전에 참전했다가 정신적 충격으로 스위스로 옮겼어. 나치는 그의 작품 639점을 '퇴폐 미술'로 압수했고, 이에 충격받은 키르히너는 1938년 스스로 생을 마감했어.",
      question: "키르히너는 보이는 대로가 아니라 느끼는 대로 그렸어. 네가 강한 감정을 느꼈을 때, 그것을 어떻게 표현해?",
    });
    // Update quiz
    arts[317].quiz = {
      question: "키르히너가 속한 독일 표현주의 그룹의 이름은?",
      options: ["청기사파", "다리파 (Die Brücke)", "바우하우스"],
      answer: 1
    };
    // Update english
    const engArt318 = eng[317].sentences.find(s => s.source === "명화");
    if (engArt318) {
      engArt318.en = "Kirchner's Street, Berlin uses sharp angles and clashing colors to express the anxiety of modern city life — showing not what the street looks like, but what it feels like.";
      engArt318.ko = "키르히너의 '베를린 거리'는 날카로운 각도와 충돌하는 색채로 현대 도시 생활의 불안을 표현한다 — 거리가 어떻게 보이는지가 아니라 어떻게 느껴지는지를 보여준다.";
      engArt318.note = "'not what ~ looks like, but what ~ feels like'는 대조 구문이야. look like은 '~처럼 보이다', feel like은 '~처럼 느껴지다'라는 감각 표현이야.";
    }
    console.log("  ✅ Done");
  } catch (e) { console.error("  ❌", e.message); }

  await new Promise(r => setTimeout(r, 2000));

  // === 5. Day 320: 시녀들 / 벨라스케스 (썸네일로 재시도) ===
  console.log("\n=== Day 320: 시녀들 / 벨라스케스 ===");
  try {
    const src = await downloadWikimediaImage("Las Meninas 01.jpg", "public/images/arts/day-320.webp");
    Object.assign(arts[319], {
      title: "시녀들 (라스 메니나스)",
      title_original: "Las Meninas",
      artist: "디에고 벨라스케스",
      artist_original: "Diego Velázquez",
      year: 1656,
      country: "스페인",
      medium: "유화",
      period: "바로크",
      source_url: src,
      source_label: "Wikimedia Commons",
      story: "서양 미술사에서 가장 많이 분석된 그림이야. 중앙에 어린 공주 마르가리타가 서 있고, 시녀들이 둘러싸고 있어. 왼쪽에는 벨라스케스 자신이 캔버스 앞에 서 있어 — 그가 그리고 있는 건 뭘까? 뒤쪽 거울에 비친 건 국왕 부부야. 화가는 관객을 보고, 공주도 관객을 보고, 거울 속 왕도 관객을 봐 — 도대체 누가 누구를 보고 있는 거야? 이 그림은 '해석'이라는 행위 자체에 대한 그림이야.",
      look_for: "뒤쪽 벽의 거울에 비친 국왕 부부의 모습을 찾아봐. 벨라스케스 자신이 화면 왼쪽에 서서 관객을 바라보고 있어. 문 앞에 서 있는 남자는 왕실 관리인데, 그 역시 안을 들여다보고 있어. 빛은 오른쪽 창에서 들어와 공주를 비춰.",
      fun_fact: "피카소는 이 그림에 매료되어 58점의 변형 작품을 그렸어. 푸코는 《말과 사물》에서 이 그림을 서양 인식론의 핵심으로 분석했어. 벨라스케스는 가슴에 산티아고 기사단의 십자가를 그렸는데, 이 작위는 그림 완성 3년 후에 받은 거라 나중에 추가한 거야!",
      question: "이 그림은 보는 사람마다 다르게 해석해. 같은 것을 보고 친구와 다른 생각을 한 적이 있어?",
    });
    arts[319].quiz = {
      question: "이 그림에서 벨라스케스가 뒤쪽 거울에 반영시킨 인물은?",
      options: ["공주 마르가리타", "국왕 부부", "교황"],
      answer: 1
    };
    const engArt320 = eng[319].sentences.find(s => s.source === "명화");
    if (engArt320) {
      engArt320.en = "Velázquez's Las Meninas has puzzled art historians for centuries — is the painter depicting the princess, or the king and queen reflected in the mirror behind her?";
      engArt320.ko = "벨라스케스의 '시녀들'은 수 세기 동안 미술사가들을 당혹케 했다 — 화가가 그리고 있는 건 공주인가, 아니면 뒤쪽 거울에 비친 국왕 부부인가?";
      engArt320.note = "'has puzzled'는 현재완료로 '계속 당혹케 해왔다'야. 'is the painter depicting A, or B?'는 선택 의문문이야. depict는 '묘사하다'라는 뜻.";
    }
    const hierIdx = eng[319].vocab.findIndex(v => v.word === "hieroglyph");
    if (hierIdx >= 0) eng[319].vocab[hierIdx] = { word: "depict", meaning: "묘사하다, 그리다" };
    console.log("  ✅ Done");
  } catch (e) { console.error("  ❌", e.message); }

  // Save
  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  fs.writeFileSync(ENG_PATH, JSON.stringify(eng, null, 2) + "\n");
  console.log("\n=== 저장 완료 ===");

  // Final validation
  const artistCount = {};
  arts.forEach(a => { artistCount[a.artist] = (artistCount[a.artist]||0)+1; });
  const over4 = Object.entries(artistCount).filter(([k,v]) => v > 4);
  if (over4.length) console.log("⚠️ 4개 초과:", over4.map(([k,v]) => `${k}(${v})`).join(", "));
  else console.log("✅ 모든 작가 4개 이하");

  // Check remaining duplicates
  const titleMap = new Map();
  let dupeCount = 0;
  arts.forEach((a, i) => {
    if (titleMap.has(a.title)) {
      console.log(`⚠️ 중복 제목: Day ${titleMap.get(a.title)} & Day ${i+1}: ${a.title}`);
      dupeCount++;
    }
    titleMap.set(a.title, i+1);
  });
  if (!dupeCount) console.log("✅ 중복 제목 없음");
}

main().catch(console.error);
