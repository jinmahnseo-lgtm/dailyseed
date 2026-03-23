import fs from "fs";
import https from "https";
import http from "http";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "DailySeedBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetchUrl(res.headers.location).then(resolve, reject);
      if (res.statusCode >= 400) return reject(new Error("HTTP " + res.statusCode));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function dl(fileName, destPath) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const apiData = JSON.parse((await fetchUrl(apiUrl)).toString());
  const page = Object.values(apiData.query.pages)[0];
  if (!page.imageinfo) throw new Error("Not found");
  const imgUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
  const imgBuffer = await fetchUrl(imgUrl);
  const sharp = (await import("sharp")).default;
  await sharp(imgBuffer).resize(1280, null, { withoutEnlargement: true }).webp({ quality: 82 }).toFile(destPath);
  console.log("  Downloaded: " + destPath);
  return "https://commons.wikimedia.org/wiki/File:" + fileName;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const arts = JSON.parse(fs.readFileSync("src/data/arts.json", "utf-8"));
  const eng = JSON.parse(fs.readFileSync("src/data/english.json", "utf-8"));

  const items = [
    {
      day: 312,
      file: "Ingres coronation charles vii.jpg",
      arts: {
        title: "샤를 7세 대관식의 잔 다르크",
        title_original: "Joan of Arc at the Coronation of Charles VII",
        artist: "장도미니크 앵그르",
        artist_original: "Jean-Auguste-Dominique Ingres",
        year: 1854, country: "프랑스", medium: "유화", period: "신고전주의",
        source_label: "Wikimedia Commons",
        story: "잔 다르크가 랭스 대성당에서 샤를 7세의 대관식을 지켜보고 있어. 갑옷을 입고 깃발을 든 그녀는 프랑스를 구한 영웅이야. 17살 소녀가 신의 목소리를 들었다고 주장하며 군대를 이끌었는데, 누구도 믿지 않았지만 끝까지 밀어붙여 승리했어.",
        look_for: "잔 다르크의 시선이 하늘을 향해 있어. 갑옷의 금속 질감이 사실적이고, 뒤쪽 대성당이 웅장해. 앵그르 특유의 매끄러운 붓 터치가 돋보여.",
        fun_fact: "앵그르는 이 그림을 75살에 그렸어. 잔 다르크는 19살에 화형당했지만, 500년 후 가톨릭 성인으로 시성됐어.",
        question: "잔 다르크는 모두가 반대해도 자신의 믿음을 지켰어. 네가 끝까지 고집한 것이 있어?",
      },
      quiz: { question: "잔 다르크가 이끈 전쟁의 결과는?", options: ["프랑스의 패배", "샤를 7세의 대관식", "영국과의 동맹"], answer: 1 },
      eng_art: {
        en: "Ingres painted Joan of Arc standing firm in her armor, capturing the stubborn faith of a teenage girl who refused to give up.",
        ko: "앵그르는 갑옷을 입고 굳건히 서 있는 잔 다르크를 그렸으며, 포기하지 않은 소녀의 고집스러운 믿음을 담았다.",
        note: "'stand firm'은 '굳건히 서다'야. 'refuse to give up'은 '포기를 거부하다'라는 결연한 의지의 표현이야."
      },
    },
    {
      day: 330,
      file: "John Martin - The Great Day of His Wrath - Google Art Project.jpg",
      arts: {
        title: "분노의 위대한 날",
        title_original: "The Great Day of His Wrath",
        artist: "존 마틴",
        artist_original: "John Martin",
        year: 1853, country: "영국", medium: "유화", period: "낭만주의",
        source_label: "Wikimedia Commons",
        story: "요한계시록의 최후의 심판 장면이야. 산이 무너지고, 바위가 하늘로 솟구치고, 도시가 부서지는 종말적 파괴를 그렸어. 존 마틴은 자연재해와 성경적 파괴를 거대한 스케일로 그리는 것으로 유명했어.",
        look_for: "화면 전체가 붉은 빛과 검은 그림자로 뒤덮여 있어. 산들이 마치 종이처럼 찢어지며 무너지고, 번개가 하늘을 가르고 있어.",
        fun_fact: "마틴은 빅토리아 시대에 엄청난 인기를 누렸어. 이 그림은 심판 3부작의 마지막 작품이야. 그의 형 조나단은 실제로 요크 대성당에 방화한 방화범이야!",
        question: "파괴 후에는 항상 새로운 시작이 있어. 네 인생에서 무언가가 끝나고 새로운 것이 시작된 경험이 있어?",
      },
      quiz: { question: "존 마틴의 이 작품은 어떤 텍스트에서 영감을 받았나?", options: ["그리스 신화", "요한계시록", "실낙원"], answer: 1 },
      eng_art: {
        en: "John Martin's painting shows mountains crumbling and cities destroyed — a vision of annihilation inspired by the Book of Revelation.",
        ko: "존 마틴의 그림은 산이 무너지고 도시가 파괴되는 모습을 보여준다 — 요한계시록에서 영감을 받은 파멸의 비전이다.",
        note: "'crumble'은 '부서지다, 무너지다'야. 'inspired by ~'는 '~에서 영감을 받은'이라는 과거분사 형용사구야."
      },
    },
    {
      day: 343,
      file: "Fra Angelico - The Annunciation - WGA0455.jpg",
      arts: {
        title: "수태고지",
        title_original: "The Annunciation",
        artist: "프라 안젤리코",
        artist_original: "Fra Angelico",
        year: 1426, country: "이탈리아", medium: "템페라, 금박", period: "초기 르네상스",
        source_label: "Wikimedia Commons",
        story: "천사 가브리엘이 마리아에게 예수의 탄생을 알리는 장면이야. 프라 안젤리코는 수도승으로, 기도하듯이 그림을 그렸어. 모든 요소가 정확한 순서를 따라 배치돼 있어 — 천사의 인사, 마리아의 수용이 이야기의 흐름을 만들어.",
        look_for: "천사의 날개가 무지갯빛이야. 마리아는 겸손하게 고개를 숙이고, 아치형 건축물이 깊이를 줘.",
        fun_fact: "프라 안젤리코는 천사 같은 수도사라는 뜻이야. 1982년 교황에 의해 복자로 시복됐어.",
        question: "프라 안젤리코는 모든 것에 정해진 순서가 있다고 믿었어. 네 하루에서 꼭 지키는 루틴이 있어?",
      },
      quiz: { question: "프라 안젤리코의 직업은 화가 외에 무엇이었나?", options: ["건축가", "수도승", "음악가"], answer: 1 },
      eng_art: {
        en: "Fra Angelico arranged every element of The Annunciation in careful sequence, creating a visual narrative in perfect order.",
        ko: "프라 안젤리코는 수태고지의 모든 요소를 신중한 순서로 배치하여, 완벽한 순서의 시각적 서사를 만들었다.",
        note: "'arrange ~ in sequence'는 '~을 순서대로 배치하다'야. 'narrative'는 '서사, 이야기'라는 뜻이야."
      },
    },
    {
      day: 350,
      file: "Tang Sancai Porcelain Horse 05.jpg",
      arts: {
        title: "당삼채마",
        title_original: "Tang Sancai Horse",
        artist: "당나라 도공",
        artist_original: "Tang Dynasty Artisan",
        year: "8세기", country: "중국", medium: "삼채 도자기", period: "당나라",
        source_label: "Wikimedia Commons",
        story: "당나라의 삼채 기법으로 만든 말 도자상이야. 초록, 갈색, 황색 유약이 자연스럽게 흘러내리며 독특한 무늬를 만들어. 도자기란 흙에 불을 더해 영원한 예술을 만드는 기술이야.",
        look_for: "세 가지 색의 유약이 섞이며 흘러내린 패턴을 봐. 말의 자세가 당당하고, 안장과 마구의 장식이 세밀해.",
        fun_fact: "당삼채는 세 가지 색이라는 뜻이지만 실제로는 더 많은 색이 쓰여. 유약이 가마 속에서 녹으면서 자연스럽게 흘러내리는 효과가 핵심이야.",
        question: "삼채 도자기는 흙과 불의 만남으로 탄생했어. 서로 다른 것이 만나 새로운 것이 탄생한 경험이 있어?",
      },
      quiz: { question: "당삼채의 삼채가 의미하는 것은?", options: ["세 가지 형태", "세 가지 색", "세 가지 재료"], answer: 1 },
      eng_art: {
        en: "Tang dynasty potters created Sancai horses using three-colored glazes that melted in the kiln, producing unique patterns no two pieces share.",
        ko: "당나라 도공들은 가마 속에서 녹는 삼채 유약으로 말 도자기를 만들었으며, 같은 무늬의 작품은 없다.",
        note: "'no two pieces share'는 '어떤 두 작품도 공유하지 않는다'는 부정 구문이야."
      },
    },
  ];

  for (const item of items) {
    const idx = item.day - 1;
    console.log(`\n=== Day ${item.day} ===`);
    try {
      const src = await dl(item.file, `public/images/arts/day-${item.day}.webp`);
      item.arts.source_url = src;
      Object.assign(arts[idx], item.arts);
      arts[idx].image_url = `/images/arts/day-${item.day}.webp`;
      if (item.quiz) arts[idx].quiz = item.quiz;

      const artSent = eng[idx].sentences.find((s) => s.source === "명화");
      if (artSent && item.eng_art) {
        artSent.en = item.eng_art.en;
        artSent.ko = item.eng_art.ko;
        artSent.note = item.eng_art.note;
      }
      console.log("  OK");
    } catch (e) {
      console.error("  FAIL:", e.message);
    }
    await delay(5000);
  }

  fs.writeFileSync("src/data/arts.json", JSON.stringify(arts, null, 2) + "\n");
  fs.writeFileSync("src/data/english.json", JSON.stringify(eng, null, 2) + "\n");

  // Validation
  console.log("\n=== 최종 검증 ===");
  const tm = new Map();
  let d = 0;
  arts.forEach((a, i) => {
    if (tm.has(a.title)) { console.log("DUPE: Day " + tm.get(a.title) + " & " + (i + 1) + ": " + a.title); d++; }
    tm.set(a.title, i + 1);
  });
  if (!d) console.log("OK: no duplicates");
  const ac = {};
  arts.forEach((a) => { ac[a.artist] = (ac[a.artist] || 0) + 1; });
  const ov = Object.entries(ac).filter(([k, v]) => v > 4);
  if (ov.length) console.log("OVER 4: " + ov.map(([k, v]) => `${k}(${v})`).join(", "));
  else console.log("OK: all artists <= 4");
}

main().catch(console.error);
