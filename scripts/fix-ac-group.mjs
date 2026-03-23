import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const ARTS_PATH = path.resolve("src/data/arts.json");
const ENG_PATH = path.resolve("src/data/english.json");

// === Wikimedia image download ===
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "DailySeedBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadWikimediaImage(fileName, destPath) {
  // Get image info from Wikimedia API
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
  const apiData = JSON.parse((await fetchUrl(apiUrl)).toString());
  const pages = apiData.query.pages;
  const page = Object.values(pages)[0];
  if (!page.imageinfo) throw new Error("Image not found: " + fileName);
  const imgUrl = page.imageinfo[0].url;

  // Download image
  const imgBuffer = await fetchUrl(imgUrl);

  // Convert to webp using sharp
  const sharp = (await import("sharp")).default;
  await sharp(imgBuffer)
    .resize(1280, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destPath);

  console.log(`  Downloaded & converted: ${path.basename(destPath)} (${(imgBuffer.length/1024).toFixed(0)}KB → webp)`);
  return `https://commons.wikimedia.org/wiki/File:${fileName}`;
}

async function main() {
  const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
  const eng = JSON.parse(fs.readFileSync(ENG_PATH, "utf-8"));

  const replacements = [
    {
      day: 186,
      wikiFile: "Luke_Fildes_-_The_Doctor_-_Tate_Britain.jpg",
      arts: {
        title: "의사",
        title_original: "The Doctor",
        artist: "루크 필데스",
        artist_original: "Luke Fildes",
        year: 1891,
        country: "영국",
        medium: "유화",
        period: "빅토리아 시대",
        story: "어두운 방 안에서 한 의사가 아픈 아이의 침대 곁에 앉아 걱정스럽게 지켜보고 있어. 필데스는 자신의 아들이 어린 나이에 죽었을 때 곁을 지켜준 의사의 모습에서 영감을 받아 이 그림을 그렸어. 뒤편에서 부모가 불안하게 바라보고, 의사는 밤새 아이 곁을 떠나지 않아. 의학이란 단순한 기술이 아니라 환자를 향한 헌신이라는 걸 보여주는 작품이야.",
        look_for: "의사의 시선이 오직 아이에게만 향해 있어. 탁자 위의 약과 물컵, 희미한 램프 빛이 밤새 간호한 시간을 보여줘. 뒤편 그림자 속 부모의 불안한 모습도 봐. 전체적으로 어둡지만 아이에게 비치는 빛이 희망을 상징해.",
        fun_fact: "이 그림은 영국에서 가장 사랑받는 그림 중 하나야. 2차 세계대전 때 영국 정부는 이 그림을 국민건강서비스(NHS) 홍보에 사용했어. 필데스의 아들 필립이 크리스마스에 세상을 떠난 후, 의사 머레이 박사가 보여준 헌신에 감동받아 그린 작품이야.",
        question: "의사는 밤새 아이 곁을 지켜. 누군가를 위해 끝까지 곁을 지켜준 경험이 있어?",
        source_label: "Wikimedia Commons",
      },
      english: {
        sentence: {
          en: "In Luke Fildes' painting The Doctor, a physician sits beside a sick child through the night, showing that true medicine is not just science but compassion.",
          ko: "루크 필데스의 그림 '의사'에서, 한 의사가 밤새 아픈 아이 곁에 앉아 있으며, 진정한 의학은 과학만이 아니라 연민임을 보여준다.",
          note: "'sit beside ~'은 '~곁에 앉다'야. 'not just A but B'는 'A만이 아니라 B이기도 하다'라는 상관접속사 구문이야."
        },
        vocab_replace: { old: "dissection", new_word: "compassion", new_meaning: "연민, 동정심" }
      }
    },
    {
      day: 255,
      wikiFile: "Munkacsy_-_Christ_before_Pilate.jpg",
      arts: {
        title: "필라도 앞의 그리스도",
        title_original: "Christ before Pilate",
        artist: "미하이 문카치",
        artist_original: "Mihály Munkácsy",
        year: 1881,
        country: "헝가리",
        medium: "유화",
        period: "사실주의",
        story: "예수가 총독 필라도 앞에 서서 심판을 받는 장면이야. 문카치는 이 장면을 역사화가 아니라 인간 드라마로 그렸어. 예수는 조용히 서 있고, 필라도는 갈등하며, 군중은 소란스러워. 이것은 역사상 가장 유명한 '면접'이야 — 한 사람의 진실성이 심판대 위에 올라간 순간. 네가 누구인지를 증명해야 하는 순간, 말보다 태도가 더 많은 것을 말해줘.",
        look_for: "예수의 고요한 자세와 주변 군중의 소란이 극명한 대비를 이뤄. 필라도의 표정에서 갈등이 보여 — 무죄라는 걸 알면서도 결정을 내려야 하는 고뇌야. 문카치 특유의 어두운 색조와 극적인 빛이 장면의 긴장감을 높여.",
        fun_fact: "문카치는 헝가리 최고의 화가로, 이 그림은 높이 4미터가 넘는 대작이야. 완성 후 유럽과 미국을 순회 전시했는데, 뉴욕에서만 하루 6천 명이 관람했대. 현재 캐나다 해밀턴 미술관에 소장돼 있어.",
        question: "예수는 심판 앞에서 당당하게 자신의 진실을 지켰어. 네가 누군가에게 나를 증명해야 했던 순간이 있었어?",
        source_label: "Wikimedia Commons",
      },
      english: {
        sentence: {
          en: "In Munkácsy's painting, Christ stands calmly before Pilate while an angry crowd demands his punishment — the ultimate test of character under pressure.",
          ko: "문카치의 그림에서, 그리스도는 분노한 군중이 처벌을 요구하는 가운데 필라도 앞에 차분하게 서 있다 — 압박 속 인격의 궁극적 시험이다.",
          note: "'stand calmly'에서 부사 calmly가 동사 stand를 수식해. 'under pressure'는 '압박 속에서'라는 전치사구야."
        },
        vocab_replace: null
      }
    },
    {
      day: 298,
      wikiFile: "Hovhannes_Aivazovsky_-_The_Ninth_Wave_-_Google_Art_Project.jpg",
      arts: {
        title: "제9의 파도",
        title_original: "The Ninth Wave",
        artist: "이반 아이바조프스키",
        artist_original: "Ivan Aivazovsky",
        year: 1850,
        country: "러시아 (아르메니아계)",
        medium: "유화",
        period: "낭만주의",
        story: "폭풍이 지나간 바다 위에서 몇 명의 생존자가 부서진 돛대에 매달려 있어. 거대한 파도가 밀려오지만, 하늘에는 금빛 아침 햇살이 비치기 시작해. 아이바조프스키는 바다 그림의 대가로, 6,000점 이상의 작품을 남겼어. 이 그림은 자연의 압도적인 힘 앞에서 느끼는 경외감과 동시에, 폭풍 후에도 빛이 온다는 희망을 담고 있어.",
        look_for: "파도의 투명한 초록빛이 놀라워 — 아이바조프스키는 파도를 통과하는 빛을 표현하는 데 천재적이야. 하늘의 금빛 노을과 바다의 초록빛이 대비되면서 장엄한 분위기를 만들어. 작은 인물들이 파도 속에서 서로를 잡고 있어 — 절망 속 연대의 모습이야.",
        fun_fact: "아이바조프스키는 아르메니아계 러시아 화가로, 바다 그림만 6,000점 이상 그렸어. 그는 기억만으로 바다를 그렸는데, 작업실에서 바다를 보지 않고 그린다고 해서 동료 화가들을 놀라게 했어. 러시아 해군은 그를 명예 제독으로 임명했대!",
        question: "폭풍 뒤에 빛이 비치는 이 장면처럼, 힘든 시간 뒤에 찾아온 좋은 순간이 있었어?",
        source_label: "Wikimedia Commons",
      },
      english: {
        sentence: {
          en: "Aivazovsky's The Ninth Wave captures survivors clinging to wreckage as a towering wave approaches — yet golden sunlight breaks through the clouds, filling the scene with awe and hope.",
          ko: "아이바조프스키의 '제9의 파도'는 거대한 파도가 다가오는 가운데 잔해에 매달린 생존자들을 담고 있다 — 하지만 금빛 햇살이 구름을 뚫고 내려와 경외감과 희망으로 장면을 채운다.",
          note: "'cling to ~'는 '~에 매달리다'야. 'break through ~'는 '~을 뚫고 나오다'라는 구동사야. 자연의 장엄함을 묘사할 때 자주 쓰여."
        },
        vocab_replace: null
      }
    },
    {
      day: 320,
      wikiFile: "Las_Meninas,_by_Diego_Velázquez,_from_Prado_in_Google_Earth.jpg",
      arts: {
        title: "시녀들 (라스 메니나스)",
        title_original: "Las Meninas",
        artist: "디에고 벨라스케스",
        artist_original: "Diego Velázquez",
        year: 1656,
        country: "스페인",
        medium: "유화",
        period: "바로크",
        story: "서양 미술사에서 가장 많이 분석된 그림이야. 중앙에 어린 공주 마르가리타가 서 있고, 시녀들이 둘러싸고 있어. 왼쪽에는 벨라스케스 자신이 캔버스 앞에 서 있어 — 그가 그리고 있는 건 뭘까? 뒤쪽 거울에 비친 건 국왕 부부야. 화가는 관객을 보고, 공주도 관객을 보고, 거울 속 왕도 관객을 봐 — 도대체 누가 누구를 보고 있는 거야? 이 그림은 '해석'이라는 행위 자체에 대한 그림이야.",
        look_for: "뒤쪽 벽의 거울에 비친 국왕 부부의 모습을 찾아봐. 벨라스케스 자신이 화면 왼쪽에 서서 관객을 바라보고 있어. 문 앞에 서 있는 남자는 왕실 관리인데, 그 역시 안을 들여다보고 있어. 빛은 오른쪽 창에서 들어와 공주를 비춰.",
        fun_fact: "피카소는 이 그림에 매료되어 58점의 변형 작품을 그렸어. 푸코는 《말과 사물》에서 이 그림을 서양 인식론의 핵심으로 분석했어. 벨라스케스는 가슴에 산티아고 기사단의 십자가를 그렸는데, 이 작위는 그림 완성 3년 후에 받은 거라 나중에 추가한 거야!",
        question: "이 그림은 보는 사람마다 다르게 해석해. 같은 것을 보고 친구와 다른 생각을 한 적이 있어?",
        source_label: "Wikimedia Commons",
      },
      english: {
        sentence: {
          en: "Velázquez's Las Meninas has puzzled art historians for centuries — is the painter depicting the princess, or the king and queen reflected in the mirror behind her?",
          ko: "벨라스케스의 '시녀들'은 수 세기 동안 미술사가들을 당혹케 했다 — 화가가 그리고 있는 건 공주인가, 아니면 뒤쪽 거울에 비친 국왕 부부인가?",
          note: "'has puzzled'는 현재완료로 '계속 당혹케 해왔다'야. 'is the painter depicting A, or B?'는 선택 의문문이야. depict는 '묘사하다'라는 뜻."
        },
        vocab_replace: { old: "hieroglyph", new_word: "depict", new_meaning: "묘사하다, 그리다" }
      }
    },
    {
      day: 334,
      wikiFile: "Honoré_Daumier_035.jpg",
      arts: {
        title: "돈키호테와 산초 판사",
        title_original: "Don Quixote and Sancho Panza",
        artist: "오노레 도미에",
        artist_original: "Honoré Daumier",
        year: 1868,
        country: "프랑스",
        medium: "유화",
        period: "사실주의",
        story: "마른 말을 탄 돈키호테와 당나귀를 탄 산초 판사가 황량한 풍경을 가로지르고 있어. 도미에는 세르반테스의 소설 속 이 방랑자를 여러 번 그렸어. 돈키호테는 세상에서 가장 유명한 유랑자야 — 풍차를 거인으로 착각하고, 여관을 성으로 착각하지만, 그의 여정은 계속돼. 목적지가 아니라 길 위에 있는 것 자체가 의미인 삶이야.",
        look_for: "돈키호테의 길쭉한 실루엣과 산초의 둥근 실루엣이 대비돼 — 이상과 현실의 대조야. 도미에 특유의 과감한 붓 터치와 어두운 색조가 유랑의 고독함을 강조해. 배경의 황량한 풍경이 끝없는 여정을 암시해.",
        fun_fact: "도미에는 원래 정치 풍자 만화로 유명했어 — 루이 필리프 국왕을 조롱한 그림 때문에 6개월 감옥에 갔어! 그는 말년에 거의 실명했고, 친구인 코로가 집을 마련해줬어. 돈키호테 연작은 도미에의 회화 중 가장 사랑받는 작품이야.",
        question: "돈키호테는 목적지 없이 떠돌지만 매 순간 최선을 다해. 결과보다 과정이 중요했던 경험이 있어?",
        source_label: "Wikimedia Commons",
      },
      english: {
        sentence: {
          en: "Daumier painted Don Quixote as a lonely wanderer on a thin horse, drifting across an empty landscape in search of adventures that exist only in his imagination.",
          ko: "도미에는 돈키호테를 마른 말을 탄 외로운 방랑자로 그렸으며, 오직 상상 속에만 존재하는 모험을 찾아 텅 빈 풍경을 떠돈다.",
          note: "'drift across ~'는 '~을 떠돌다, 표류하다'라는 뜻이야. 'in search of ~'는 '~을 찾아서'라는 목적의 전치사구야."
        },
        vocab_replace: null
      }
    }
  ];

  for (const r of replacements) {
    console.log(`\n=== Day ${r.day}: ${r.arts.title} / ${r.arts.artist} ===`);
    const idx = r.day - 1;
    const destPath = path.resolve(`public/images/arts/day-${r.day}.webp`);

    // Download image
    try {
      const sourceUrl = await downloadWikimediaImage(r.wikiFile, destPath);
      r.arts.source_url = sourceUrl;
    } catch (e) {
      console.error(`  FAILED to download: ${e.message}`);
      continue;
    }

    // Update arts.json
    const existing = arts[idx];
    Object.assign(arts[idx], r.arts);
    arts[idx].image_url = `/images/arts/day-${r.day}.webp`;
    console.log(`  arts.json updated`);

    // Update english.json - 명화 sentence
    if (r.english) {
      const engEntry = eng[idx];
      const artSentence = engEntry.sentences.find(s => s.source === "명화");
      if (artSentence && r.english.sentence) {
        artSentence.en = r.english.sentence.en;
        artSentence.ko = r.english.sentence.ko;
        artSentence.note = r.english.sentence.note;
        console.log(`  english.json 명화 sentence updated`);
      }
      // Update vocab if needed
      if (r.english.vocab_replace) {
        const vr = r.english.vocab_replace;
        const vocabIdx = engEntry.vocab.findIndex(v => v.word === vr.old);
        if (vocabIdx >= 0) {
          engEntry.vocab[vocabIdx] = { word: vr.new_word, meaning: vr.new_meaning };
          console.log(`  english.json vocab replaced: ${vr.old} → ${vr.new_word}`);
        }
      }
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 1500));
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  fs.writeFileSync(ENG_PATH, JSON.stringify(eng, null, 2) + "\n");
  console.log("\n=== 저장 완료: 5건 교체 ===");

  // Verify artist counts
  const artistCount = {};
  arts.forEach((a) => {
    if (!artistCount[a.artist]) artistCount[a.artist] = 0;
    artistCount[a.artist]++;
  });
  const over4 = Object.entries(artistCount).filter(([k,v]) => v > 4);
  if (over4.length) {
    console.log("\n⚠️ 4개 초과 작가:", over4.map(([k,v]) => `${k}(${v})`).join(", "));
  } else {
    console.log("\n✅ 모든 작가 4개 이하");
  }

  // Check duplicates
  const titleSet = new Map();
  arts.forEach((a, i) => {
    const key = a.title;
    if (titleSet.has(key) && key !== titleSet.get(key).title) {
      // skip
    }
    if (titleSet.has(key)) {
      console.log(`⚠️ 중복: Day ${titleSet.get(key)} & Day ${i+1}: ${key}`);
    }
    titleSet.set(key, i + 1);
  });
}

main().catch(console.error);
