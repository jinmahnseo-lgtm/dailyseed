import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'src', 'data', 'english.json');
const english = JSON.parse(readFileSync(filePath, 'utf-8'));

// === 고전 9건 수정 ===
const classicFixes = {
  54: { // 시녀 이야기 (애트우드) / 테마: 평등
    en: "In The Handmaid's Tale, the regime strips women of their names and assigns them labels like 'Offred' — meaning they belong to a man named Fred.",
    ko: "'시녀 이야기'에서 정권은 여성의 이름을 빼앗고 '오프레드'처럼 — '프레드의 것'이라는 뜻의 라벨을 부여한다.",
    note: "'strips A of B'는 'A에게서 B를 빼앗다'라는 뜻이야. 'belonging to ~'는 '~에게 속한'이라는 의미로, 소유를 나타내는 표현이야."
  },
  101: { // 카라마조프 가의 형제들 (도스토옙스키) / 테마: 가족
    en: "In The Brothers Karamazov, Dostoevsky asks whether a family torn apart by greed and jealousy can ever find redemption through love.",
    ko: "'카라마조프 가의 형제들'에서 도스토옙스키는 탐욕과 질투로 찢어진 가족이 사랑을 통해 구원받을 수 있는지 묻는다.",
    note: "'torn apart by ~'는 '~에 의해 찢어진'이라는 과거분사 표현이야. 'whether ~ can ever'는 '과연 ~할 수 있는지'라는 의문을 나타내."
  },
  112: { // 보이지 않는 도시들 (칼비노) / 테마: 도시
    en: "In Invisible Cities, Marco Polo describes imaginary cities to Kublai Khan, each one reflecting a hidden aspect of human desire.",
    ko: "'보이지 않는 도시들'에서 마르코 폴로는 쿠빌라이 칸에게 상상의 도시들을 묘사하며, 각 도시는 인간 욕망의 숨겨진 면을 반영한다.",
    note: "'each one reflecting'에서 each one은 앞의 cities를 받는 대명사이고, reflecting은 분사구문으로 부가 설명을 하고 있어."
  },
  114: { // 해저 2만 리 (쥘 베른) / 테마: 바다
    en: "Captain Nemo chose the ocean over the land, declaring that the sea belongs to no nation and offers true freedom to those who dare to explore it.",
    ko: "네모 선장은 육지 대신 바다를 택하며, 바다는 어떤 나라의 것도 아니고 탐험할 용기가 있는 자에게 진정한 자유를 준다고 선언했다.",
    note: "'chose A over B'는 'B 대신 A를 택하다'라는 뜻이야. 'those who dare to ~'는 '감히 ~할 용기가 있는 사람들'이라는 관계대명사 표현이야."
  },
  116: { // 야간 비행 (생텍쥐페리) / 테마: 하늘
    en: "In Night Flight, the pilot Fabien flies through a violent storm, knowing that the mail must arrive even if it costs him his life.",
    ko: "'야간 비행'에서 조종사 파비앵은 격렬한 폭풍을 뚫고 비행하며, 목숨을 잃더라도 우편은 반드시 도착해야 한다는 것을 알고 있다.",
    note: "'knowing that ~'은 분사구문으로 '~을 알면서'라는 뜻이야. 'even if it costs him his life'는 '목숨을 잃더라도'라는 양보 표현이야."
  },
  122: { // 온 더 로드 (잭 케루악) / 테마: 속도
    en: "In On the Road, Dean drives across America at breakneck speed, as if slowing down would mean losing the very essence of being alive.",
    ko: "'온 더 로드'에서 딘은 미국 대륙을 무모한 속도로 달리며, 마치 속도를 줄이면 살아 있다는 본질 자체를 잃는 것처럼 행동한다.",
    note: "'at breakneck speed'는 '목이 부러질 듯한 속도로'라는 관용표현이야. 'as if ~ing would mean ~ing'은 '마치 ~하면 ~하는 것처럼'이라는 가정법이야."
  },
  134: { // 종교 체험의 다양성 (윌리엄 제임스) / 테마: 확신
    en: "William James argued that religious conviction should be judged not by its logic but by the real difference it makes in a person's life.",
    ko: "윌리엄 제임스는 종교적 확신이 논리가 아니라 한 사람의 삶에 실제로 만드는 차이로 판단되어야 한다고 주장했다.",
    note: "'should be judged not by A but by B'는 'A가 아니라 B로 판단되어야 한다'는 수동태 구문이야. not A but B는 대조를 강조하는 중요한 패턴이야."
  },
  234: { // 젊은 베르테르의 슬픔 (괴테) / 테마: 청춘
    en: "Werther loved so deeply that he could not separate his passion from his pain, and in the end, his youth burned itself out like a flame too bright to last.",
    ko: "베르테르는 너무 깊이 사랑해서 열정과 고통을 분리할 수 없었고, 결국 그의 청춘은 너무 밝아 오래가지 못하는 불꽃처럼 스스로 타버렸다.",
    note: "'so ~ that …'은 '너무 ~해서 …하다'라는 결과 구문이야. 'too bright to last'는 'too + 형용사 + to 부정사'로 '너무 ~해서 …할 수 없는'이라는 뜻이야."
  },
  265: { // 타오 물리학 (프리초프 카프라) / 테마: 순환
    en: "In The Tao of Physics, Capra reveals that the atoms in our bodies are recycled stardust, connecting the cycles of the cosmos to the cycles within us.",
    ko: "'타오 물리학'에서 카프라는 우리 몸의 원자가 재활용된 별먼지라는 것을 밝히며, 우주의 순환과 우리 안의 순환을 연결한다.",
    note: "'recycled stardust'는 '재활용된 별먼지'라는 뜻이야. 'connecting A to B'는 'A와 B를 연결하며'라는 분사구문으로, 앞 내용의 결과를 나타내."
  }
};

for (const [day, fix] of Object.entries(classicFixes)) {
  const idx = Number(day) - 1;
  const sent = english[idx].sentences.find(s => s.source === '고전');
  if (sent) {
    sent.en = fix.en;
    sent.ko = fix.ko;
    sent.note = fix.note;
    console.log(`Day ${day} 고전 수정 완료`);
  } else {
    console.log(`Day ${day} 고전 문장 없음!`);
  }
}

// === 명화 1건 수정 (Day 249) ===
// 피에르 보나르의 '편지'
const art249sent = english[248].sentences.find(s => s.source === '명화');
if (art249sent) {
  art249sent.en = "Bonnard painted a woman absorbed in reading a letter, her quiet concentration and the warm tones of the room creating an intimate moment frozen in time.";
  art249sent.ko = "보나르는 편지를 읽는 데 몰두한 여인을 그렸으며, 그녀의 조용한 집중과 방의 따뜻한 색조가 시간이 멈춘 친밀한 순간을 만들어낸다.";
  art249sent.note = "'absorbed in ~ing'는 '~에 몰두한'이라는 뜻의 형용사 표현이야. 'frozen in time'은 '시간 속에 얼어붙은', 즉 '시간이 멈춘'이라는 비유야.";
  console.log('Day 249 명화 수정 완료');
}

writeFileSync(filePath, JSON.stringify(english, null, 2), 'utf-8');
console.log('\nenglish.json 저장 완료');
