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
      if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function download(fileName, destPath) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const apiData = JSON.parse((await fetchUrl(apiUrl)).toString());
  const page = Object.values(apiData.query.pages)[0];
  if (!page.imageinfo) throw new Error("Not found: " + fileName);
  const imgUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
  const imgBuffer = await fetchUrl(imgUrl);
  const sharp = (await import("sharp")).default;
  await sharp(imgBuffer).resize(1280, null, { withoutEnlargement: true }).webp({ quality: 82 }).toFile(destPath);
  console.log(`  ✅ ${path.basename(destPath)}`);
  return `https://commons.wikimedia.org/wiki/File:${fileName}`;
}

async function main() {
  const arts = JSON.parse(fs.readFileSync(ARTS_PATH, "utf-8"));
  const eng = JSON.parse(fs.readFileSync(ENG_PATH, "utf-8"));

  const updates = [
    // === Day 74 (위험): 제목만 수정 ===
    {
      day: 74,
      download: null,
      arts: { title: "파도", title_original: "The Wave" },
      eng_art: {
        en: "Courbet's painting of a massive wave crashing onto the shore captures the raw power and danger of the sea through thick, textured brushstrokes.",
        ko: "쿠르베의 해안에 부딪히는 거대한 파도 그림은 두껍고 질감 있는 붓 터치로 바다의 거친 힘과 위험을 담아낸다.",
        note: "'crash onto ~'는 '~에 부딪히다'야. 'raw power'는 '날것의 힘, 거친 힘'이라는 뜻이야."
      },
    },

    // === Day 195 (슬픔): 들라크루아 → 워터하우스 '샬롯의 여인' ===
    {
      day: 195,
      download: { file: "John William Waterhouse - I am half-sick of shadows, said the lady of shalott.JPG", dest: "day-195.webp" },
      arts: {
        title: "샬롯의 여인",
        title_original: "The Lady of Shalott",
        artist: "존 윌리엄 워터하우스",
        artist_original: "John William Waterhouse",
        year: 1888,
        country: "영국",
        medium: "유화",
        period: "라파엘 전파 계승",
        story: "테니슨의 시에서 영감을 받은 작품이야. 샬롯의 여인은 저주에 걸려 바깥 세상을 직접 볼 수 없고 거울에 비친 모습만 봐야 해. 하지만 랜슬롯 기사를 보는 순간 저주를 무릅쓰고 창밖을 바라보지. 이 그림은 보트에 타고 카멜롯으로 떠내려가는 그녀의 마지막 여정을 담고 있어. 사랑과 슬픔이 뒤섞인, 아름답지만 비극적인 순간이야.",
        look_for: "보트 위에 놓인 촛불 세 개 중 두 개가 꺼져 있어 — 다가오는 죽음을 상징해. 수련과 풀이 물 위에 떠 있고, 그녀의 드레스가 물에 펼쳐져 있어. 표정에서 체념과 결연함이 동시에 느껴져.",
        fun_fact: "워터하우스는 이 주제를 세 번이나 그렸어. 가장 유명한 1888년 버전은 런던 테이트 브리튼에 소장돼 있어. 테니슨의 시 자체가 아서 왕 전설에서 나온 이야기야. 워터하우스는 고대 신화와 문학의 여성 인물을 즐겨 그렸어.",
        question: "샬롯의 여인은 저주를 알면서도 진실을 보기로 선택했어. 결과를 알면서도 용기 내어 선택한 적이 있어?",
      },
      eng_art: {
        en: "Waterhouse painted the Lady of Shalott drifting down a river toward her fate, her face filled with sorrow and quiet resolve.",
        ko: "워터하우스는 운명을 향해 강을 떠내려가는 샬롯의 여인을 그렸으며, 그녀의 얼굴에는 슬픔과 조용한 결의가 가득하다.",
        note: "'drift down ~'은 '~을 따라 떠내려가다'야. 'filled with ~'는 '~으로 가득한'이라는 과거분사 형용사구야."
      },
    },

    // === Day 245 (로봇): mRNA 다이어그램 → 켐펠렌의 체스 자동인형 ===
    {
      day: 245,
      download: { file: "Chess Automaton Willis 1821 09.png", dest: "day-245.webp" },
      arts: {
        title: "체스 두는 터크",
        title_original: "The Turk (Chess Automaton)",
        artist: "로버트 윌리스 (삽화)",
        artist_original: "Robert Willis (illustration)",
        year: 1821,
        country: "영국",
        medium: "동판화",
        period: "산업혁명기",
        story: "1770년 헝가리의 볼프강 폰 켐펠렌이 만든 체스 자동인형 '터크'의 내부 구조를 보여주는 삽화야. 터번을 쓴 인형이 체스를 두는 기계로, 나폴레옹과 벤저민 프랭클린도 이 기계와 대국했어. 사실은 기계 안에 사람이 숨어 있었지만, 80년간 사람들은 '기계가 생각할 수 있다'고 믿었어. 최초의 '인공지능 사기'이자, 기계와 인간의 관계에 대한 최초의 질문이야.",
        look_for: "기계 내부의 톱니바퀴와 레버가 정교하게 그려져 있어. 터번을 쓴 인형의 한 손은 체스판 위에 놓여 있어. 18-19세기 기술 삽화 특유의 정밀한 선이 돋보여.",
        fun_fact: "터크는 1770년부터 1854년까지 84년간 유럽과 미국을 순회했어. 에드거 앨런 포는 이 기계가 사기라고 주장하는 에세이를 썼어. 아마존의 크라우드소싱 서비스 'Mechanical Turk'는 이 자동인형에서 이름을 따온 거야!",
        question: "터크는 기계인 척했지만 사실 사람이었어. 인공지능 시대에 '진짜 생각'이란 뭘까?",
      },
      eng_art: {
        en: "The Turk, an eighteenth-century chess automaton, fooled audiences into believing a machine could think — it was actually operated by a hidden human player inside.",
        ko: "18세기 체스 자동인형 '터크'는 기계가 생각할 수 있다고 관객을 속였다 — 실제로는 내부에 숨은 사람이 조작한 것이었다.",
        note: "'fool ~ into -ing'는 '~을 속여서 …하게 만들다'야. 'operated by ~'는 수동태로 '~에 의해 조작된'이라는 뜻."
      },
    },

    // === Day 276 (극복): 사진 → 아르테미시아 '유디트' ===
    {
      day: 276,
      download: { file: "Artemisia Gentileschi - Judith Beheading Holofernes - WGA8563.jpg", dest: "day-276.webp" },
      arts: {
        title: "홀로페르네스를 베는 유디트",
        title_original: "Judith Beheading Holofernes",
        artist: "아르테미시아 젠틸레스키",
        artist_original: "Artemisia Gentileschi",
        year: 1620,
        country: "이탈리아",
        medium: "유화",
        period: "바로크",
        story: "유디트가 하녀와 함께 적장 홀로페르네스의 목을 베는 장면이야. 아르테미시아는 17세기에 여성으로서 극심한 차별을 극복하고 최고의 화가가 된 인물이야. 18살에 성폭행을 당하고 재판 과정에서 고문까지 받았지만, 그 고통을 예술로 승화시켰어. 이 그림의 유디트는 망설이지 않아 — 압도적인 적 앞에서도 결연하게 행동하는 극복의 상징이야.",
        look_for: "유디트의 표정은 냉정하고 결연해. 피가 사실적으로 분출하는데, 이전 남성 화가들의 우아한 유디트와 달리 진짜 힘을 쓰는 모습이야. 카라바조의 영향을 받은 극적인 빛과 어둠의 대비가 장면을 더욱 긴장감 있게 만들어.",
        fun_fact: "아르테미시아는 카라바조 이후 가장 위대한 바로크 화가 중 한 명이야. 그녀의 아버지 오라치오도 유명한 화가였어. 21세기에 재평가가 이뤄지며 지금은 미술사에서 가장 중요한 여성 화가로 인정받고 있어. 2020년 런던 내셔널 갤러리에서 대규모 회고전이 열렸어.",
        question: "아르테미시아는 끔찍한 경험을 예술로 극복했어. 힘든 경험을 다른 형태의 힘으로 바꾼 적이 있어?",
      },
      eng_art: {
        en: "Artemisia Gentileschi overcame personal trauma to become one of the greatest Baroque painters, channeling her pain into powerful images of strong women from mythology.",
        ko: "아르테미시아 젠틸레스키는 개인적 트라우마를 극복하고 가장 위대한 바로크 화가 중 한 명이 되었으며, 고통을 신화 속 강인한 여성들의 강렬한 이미지로 승화시켰다.",
        note: "'channel A into B'는 'A를 B로 돌리다/전환하다'라는 뜻이야. 'overcome'의 과거형은 overcame야."
      },
    },

    // === Day 285 (탈출): 건물 사진 → 콜비츠 '죄수들' ===
    {
      day: 285,
      download: { file: "'Die Gefangenen' (The Prisoners) by Käthe Kollwitz, Honolulu Museum of Art.JPG", dest: "day-285.webp" },
      arts: {
        title: "죄수들",
        title_original: "Die Gefangenen (The Prisoners)",
        artist: "케테 콜비츠",
        artist_original: "Käthe Kollwitz",
        year: 1908,
        country: "독일",
        medium: "에칭",
        story: "줄에 묶인 죄수들이 고개를 숙이고 서 있어. 콜비츠는 가난하고 억눌린 사람들의 고통을 평생 그린 화가야. 이 작품은 '농민전쟁' 연작 중 하나로, 자유를 빼앗긴 사람들의 절망을 보여줘. 하지만 콜비츠가 그린 것은 절망만이 아니야 — 억압에서 벗어나려는 의지, 탈출을 향한 간절한 바람도 담겨 있어.",
        look_for: "인물들의 고개가 떨구어져 있지만, 일부는 고개를 들고 있어 — 포기와 저항이 공존해. 콜비츠 특유의 강렬한 흑백 대비가 감정을 극대화해. 줄에 묶인 손의 표현이 사실적이야.",
        fun_fact: "콜비츠는 독일 최초로 프로이센 예술원 회원이 된 여성이야. 나치는 그녀의 작품을 '퇴폐 예술'로 압수했어. 아들을 1차 세계대전에서, 손자를 2차 세계대전에서 잃었어. 그녀의 작품은 전쟁과 빈곤에 대한 가장 강렬한 시각적 증언이야.",
        question: "콜비츠는 억눌린 사람들의 이야기를 그렸어. 네 주변에서 목소리를 내지 못하는 사람이 있다면, 어떻게 도울 수 있을까?",
      },
      eng_art: {
        en: "Kollwitz's etching The Prisoners shows bound captives with bowed heads, capturing the desperation of those who dream of escape but see no way out.",
        ko: "콜비츠의 에칭 '죄수들'은 고개를 숙인 채 묶여 있는 포로들을 보여주며, 탈출을 꿈꾸지만 탈출구를 보지 못하는 이들의 절망을 담는다.",
        note: "'bound'는 bind의 과거분사로 '묶인'이라는 뜻이야. 'see no way out'은 '탈출구를 찾지 못하다'라는 관용 표현이야."
      },
    },

    // === Day 312 (고집): 칼로 사진 → 앵그르 '잔 다르크' ===
    {
      day: 312,
      download: { file: "Ingres coronation charles vii.jpg", dest: "day-312.webp" },
      arts: {
        title: "샤를 7세 대관식의 잔 다르크",
        title_original: "Joan of Arc at the Coronation of Charles VII",
        artist: "장도미니크 앵그르",
        artist_original: "Jean-Auguste-Dominique Ingres",
        year: 1854,
        country: "프랑스",
        medium: "유화",
        period: "신고전주의",
        story: "잔 다르크가 랭스 대성당에서 샤를 7세의 대관식을 지켜보고 있어. 갑옷을 입고 깃발을 든 그녀는 프랑스를 구한 영웅이야. 17살 소녀가 '신의 목소리를 들었다'고 주장하며 군대를 이끌었는데, 누구도 믿지 않았지만 끝까지 밀어붙여 승리했어. 앵그르는 그녀의 고집스러운 신념을 경건하고 장엄하게 표현했어. 모두가 반대해도 자신의 믿음을 포기하지 않는 것 — 그것이 고집의 가장 숭고한 모습이야.",
        look_for: "잔 다르크의 시선이 하늘을 향해 있어 — 신에 대한 확신이야. 갑옷의 금속 질감이 사실적으로 표현돼 있고, 뒤쪽 대성당의 웅장한 건축이 장면에 권위를 더해. 앵그르 특유의 매끄러운 붓 터치와 이상적인 형태가 돋보여.",
        fun_fact: "앵그르는 이 그림을 75살에 그렸어. 잔 다르크는 19살에 영국에 의해 마녀로 몰려 화형당했지만, 500년 후 가톨릭 성인으로 시성됐어. 앵그르는 다비드의 제자로, 신고전주의의 마지막 거장이야. 나폴레옹의 초상화도 그렸어.",
        question: "잔 다르크는 모두가 반대해도 자신의 믿음을 지켰어. 네가 주변의 반대에도 끝까지 고집한 것이 있어?",
      },
      eng_art: {
        en: "Ingres painted Joan of Arc standing firm in her armor at the coronation, capturing the stubborn faith of a teenage girl who refused to give up despite everyone's doubt.",
        ko: "앵그르는 대관식에서 갑옷을 입고 굳건히 서 있는 잔 다르크를 그렸으며, 모두의 의심에도 포기하지 않은 소녀의 고집스러운 믿음을 담았다.",
        note: "'stand firm'은 '굳건히 서다'라는 뜻이야. 'refuse to give up'은 '포기하기를 거부하다'라는 결연한 의지를 표현하는 구문이야."
      },
    },

    // === Day 330 (파괴): 눈 사진 → 브률로프 '폼페이 최후의 날' ===
    {
      day: 330,
      download: { file: "Karl Brullov - The Last Day of Pompeii - Google Art Project.jpg", dest: "day-330.webp" },
      arts: {
        title: "폼페이 최후의 날",
        title_original: "The Last Day of Pompeii",
        artist: "카를 브률로프",
        artist_original: "Karl Bryullov",
        year: 1833,
        country: "러시아",
        medium: "유화",
        period: "낭만주의",
        story: "서기 79년 베수비오 화산이 폭발하면서 로마 도시 폼페이가 화산재에 묻히는 순간이야. 브률로프는 실제 폼페이 유적을 방문한 후 이 대작을 6년에 걸쳐 그렸어. 하늘에서 불덩이가 떨어지고, 건물이 무너지고, 사람들이 공포에 질려 도망치는 장면이 생생해. 파괴의 순간에도 사람들은 서로를 보호하려 해 — 엄마가 아이를 감싸고, 아들이 아버지를 업고 달려.",
        look_for: "하늘이 붉은 불길과 검은 연기로 뒤덮여 있어. 왼쪽에서 번개가 치고, 건물이 무너지고 있어. 중앙에 쓰러진 여인과 그녀의 아이를 봐 — 가장 유명한 부분이야. 브률로프는 자기 자신도 화면 속에 그려넣었어 — 머리에 상자를 이고 있는 인물이야.",
        fun_fact: "이 그림은 로마에서 전시됐을 때 대센세이션을 일으켰어. 월터 스콧은 '그림이 아니라 서사시'라고 극찬했어. 브률로프는 실제 폼페이 유적에서 발견된 유골의 자세를 참고해서 인물들의 포즈를 그렸대. 높이 4.5미터, 폭 6.5미터의 대작이야.",
        question: "폼페이 사람들은 파괴의 순간에도 서로를 지키려 했어. 위기의 순간에 네가 가장 먼저 지키고 싶은 것은?",
      },
      eng_art: {
        en: "Bryullov spent six years painting The Last Day of Pompeii, capturing the terrifying destruction of an entire city under volcanic ash and fire.",
        ko: "브률로프는 6년에 걸쳐 '폼페이 최후의 날'을 그렸으며, 화산재와 불 아래 도시 전체가 파괴되는 공포스러운 장면을 담았다.",
        note: "'spend + 시간 + -ing'는 '~하는 데 시간을 보내다'야. 'under volcanic ash and fire'에서 under는 '~아래에'라는 물리적 위치를 나타내."
      },
    },

    // === Day 340 (교차): 핵 사진 → 리오타르 '터키 복장의 여인' ===
    {
      day: 340,
      download: { file: "Jean-Etienne Liotard - A Lady in Turkish Dress and Her Servant - Google Art Project.jpg", dest: "day-340.webp" },
      arts: {
        title: "터키 복장의 여인과 하녀",
        title_original: "A Lady in Turkish Dress and Her Servant",
        artist: "장에티엔 리오타르",
        artist_original: "Jean-Étienne Liotard",
        year: 1750,
        country: "스위스",
        medium: "유화",
        period: "로코코",
        story: "유럽 여인이 터키 전통 복장을 입고 앉아 있고, 터키인 하녀가 커피를 가져오는 장면이야. 리오타르는 콘스탄티노플에서 5년간 살면서 동서양 문화가 '교차'하는 모습을 직접 목격했어. 그 자신도 긴 수염에 터키 복장을 즐겨 입어 '터키인 화가'로 불렸지. 서로 다른 문화가 만나 섞이는 교차점에서 새로운 아름다움이 탄생해.",
        look_for: "여인의 터키 복장이 매우 사실적으로 묘사돼 있어 — 직물의 질감과 문양이 정교해. 하녀가 들고 있는 커피잔은 터키 커피 문화를 보여줘. 리오타르 특유의 섬세한 파스텔 같은 색감이 돋보여.",
        fun_fact: "리오타르는 유럽 각국 왕실에서 초상화를 그린 국제적 화가야. 콘스탄티노플에서 돌아온 후에도 계속 터키 복장을 입어 '이상한 화가'로 유명했어. 그의 대표작 '초콜릿 소녀'는 세계에서 가장 유명한 파스텔화 중 하나야.",
        question: "리오타르는 터키 문화에 매료되어 자신의 정체성까지 바꿨어. 다른 문화에서 영감을 받은 경험이 있어?",
      },
      eng_art: {
        en: "Liotard lived in Constantinople for five years and painted scenes where European and Ottoman cultures crossed, showing how different traditions can create something new.",
        ko: "리오타르는 콘스탄티노플에서 5년간 살며 유럽과 오스만 문화가 교차하는 장면을 그렸으며, 서로 다른 전통이 어떻게 새로운 것을 만드는지 보여준다.",
        note: "'where ~ crossed'에서 where는 관계부사로 장소를 수식해. 'create something new'는 '새로운 것을 만들다'라는 뜻이야."
      },
    },

    // === Day 343 (순서): 승려 사진 → 프라 안젤리코 '수태고지' ===
    {
      day: 343,
      download: { file: "La Anunciación, by Fra Angelico, from Prado in Google Earth.jpg", dest: "day-343.webp" },
      arts: {
        title: "수태고지",
        title_original: "The Annunciation",
        artist: "프라 안젤리코",
        artist_original: "Fra Angelico",
        year: 1426,
        country: "이탈리아",
        medium: "템페라, 금박",
        period: "초기 르네상스",
        story: "천사 가브리엘이 마리아에게 예수의 탄생을 알리는 장면이야. 프라 안젤리코는 도미니크 수도회의 수도승으로, 기도하듯이 그림을 그렸어. 이 작품에서 모든 요소가 정확한 순서를 따라 배치돼 있어 — 왼쪽에서 오른쪽으로 천사의 인사, 마리아의 수용, 배경의 정원이 이야기의 흐름을 만들어. 순서란 혼란 속에서 의미를 찾는 구조야.",
        look_for: "천사의 날개가 무지갯빛으로 그려져 있어 — 금박과 함께 찬란한 빛을 만들어. 마리아는 겸손하게 고개를 숙이고 있고, 아치형 건축물이 화면에 깊이를 줘. 왼쪽의 아담과 이브가 에덴동산에서 쫓겨나는 장면도 포함돼 있어 — 구원의 순서를 보여줘.",
        fun_fact: "프라 안젤리코는 '천사 같은 수도사'라는 뜻이야. 그는 그림을 그리기 전에 항상 기도했다고 해. 바티칸의 교황 니콜라오 5세 예배당 벽화도 그렸어. 1982년 교황 요한 바오로 2세에 의해 '복자'로 시복됐어 — 화가 중 매우 드문 경우야.",
        question: "프라 안젤리코는 모든 것에 정해진 순서가 있다고 믿었어. 네 하루에서 꼭 지키는 순서나 루틴이 있어?",
      },
      eng_art: {
        en: "Fra Angelico arranged every element of The Annunciation in careful sequence — from the angel's greeting to Mary's acceptance — creating a visual narrative that unfolds in perfect order.",
        ko: "프라 안젤리코는 '수태고지'의 모든 요소를 천사의 인사에서 마리아의 수용까지 신중한 순서로 배치하여, 완벽한 순서로 펼쳐지는 시각적 서사를 만들었다.",
        note: "'arrange ~ in sequence'는 '~을 순서대로 배치하다'야. 'unfold'는 '펼쳐지다, 전개되다'라는 뜻이야."
      },
    },

    // === Day 350 (도자): 말 사진 → 당 삼채마 ===
    {
      day: 350,
      download: { file: "Tang Sancai Porcelain Horse 05.jpg", dest: "day-350.webp" },
      arts: {
        title: "당삼채마",
        title_original: "Tang Sancai Horse",
        artist: "당나라 도공",
        artist_original: "Tang Dynasty Artisan",
        year: "8세기",
        country: "중국",
        medium: "삼채 도자기",
        period: "당나라",
        story: "당나라의 삼채(三彩) 기법으로 만든 말 도자상이야. 초록, 갈색, 황색 유약이 자연스럽게 흘러내리며 독특한 무늬를 만들어. 당나라는 실크로드를 통해 서역과 활발히 교류했고, 말은 군사력과 부의 상징이었어. 이 도자기 말은 주로 무덤에 부장품으로 넣었는데, 사후 세계에서도 말을 타고 다니기를 바란 거야. 도자기란 흙에 불을 더해 영원한 예술을 만드는 기술이야.",
        look_for: "세 가지 색의 유약이 자연스럽게 섞이며 흘러내린 패턴을 봐 — 도공이 의도한 것이지만 불 속에서 우연히 만들어진 부분도 있어. 말의 자세가 당당하고, 안장과 마구의 장식이 세밀해. 당나라 도자기 특유의 둥근 형태와 생동감이 느껴져.",
        fun_fact: "당삼채는 세 가지 색이라는 뜻이지만 실제로는 더 많은 색이 쓰이기도 해. 유약이 가마 속에서 녹으면서 자연스럽게 흘러내리는 효과가 핵심이야. 당나라 귀족들의 무덤에서 대량 발견됐는데, 말뿐 아니라 낙타, 악사, 무용수 등 다양한 형태가 있어.",
        question: "삼채 도자기는 흙과 불의 만남으로 탄생했어. 서로 다른 것이 만나 새로운 것이 탄생한 경험이 있어?",
      },
      eng_art: {
        en: "Tang dynasty potters created Sancai horses using three-colored glazes that melted and flowed in the kiln, producing unique patterns no two pieces share.",
        ko: "당나라 도공들은 가마 속에서 녹아 흐르는 삼채 유약으로 말 도자기를 만들었으며, 두 작품이 같은 무늬를 가지는 경우는 없다.",
        note: "'no two pieces share'는 '어떤 두 작품도 공유하지 않는다'는 부정 구문이야. 'produce'는 '만들어내다'라는 뜻이야."
      },
    },
  ];

  for (const u of updates) {
    const idx = u.day - 1;
    console.log(`\n=== Day ${u.day} ===`);

    // Download if needed
    if (u.download) {
      try {
        const src = await download(u.download.file, `public/images/arts/${u.download.dest}`);
        u.arts.source_url = src;
        u.arts.source_label = "Wikimedia Commons";
      } catch (e) {
        console.error(`  ❌ Download failed: ${e.message}`);
        continue;
      }
      await new Promise(r => setTimeout(r, 2000));
    }

    // Update arts.json
    Object.assign(arts[idx], u.arts);
    arts[idx].image_url = `/images/arts/day-${u.day}.webp`;
    console.log(`  arts.json updated`);

    // Update english.json art sentence
    if (u.eng_art) {
      const artSentence = eng[idx].sentences.find(s => s.source === "명화");
      if (artSentence) {
        artSentence.en = u.eng_art.en;
        artSentence.ko = u.eng_art.ko;
        artSentence.note = u.eng_art.note;
        console.log(`  english.json updated`);
      }
    }
  }

  fs.writeFileSync(ARTS_PATH, JSON.stringify(arts, null, 2) + "\n");
  fs.writeFileSync(ENG_PATH, JSON.stringify(eng, null, 2) + "\n");

  // Final validation
  console.log("\n=== 최종 검증 ===");
  const titleMap = new Map();
  let dupes = 0;
  arts.forEach((a, i) => {
    if (titleMap.has(a.title)) { console.log(`⚠️ 중복: Day ${titleMap.get(a.title)} & ${i+1}: ${a.title}`); dupes++; }
    titleMap.set(a.title, i+1);
  });
  if (!dupes) console.log("✅ 중복 제목 없음");
  const ac = {};
  arts.forEach(a => { ac[a.artist] = (ac[a.artist]||0)+1; });
  const over = Object.entries(ac).filter(([k,v])=>v>4);
  if (over.length) console.log("⚠️ 4개 초과: " + over.map(([k,v])=>`${k}(${v})`).join(", "));
  else console.log("✅ 모든 작가 4개 이하");
}

main().catch(console.error);
