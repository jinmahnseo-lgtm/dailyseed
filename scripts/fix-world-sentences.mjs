import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'src', 'data', 'english.json');
const english = JSON.parse(readFileSync(filePath, 'utf-8'));

const fixes = {
  15: { // 그리스 / 소통
    en: "In ancient Athens, citizens gathered at the agora to debate laws face to face, believing that open dialogue was the foundation of democracy.",
    ko: "고대 아테네에서 시민들은 아고라에 모여 법을 직접 토론했으며, 열린 대화가 민주주의의 기초라고 믿었다.",
    note: "'face to face'는 '직접 대면하여'라는 뜻이야. 'believing that ~'은 분사구문으로 '~라고 믿으며'를 나타내."
  },
  21: { // 콜롬비아 / 희망
    en: "After decades of conflict, Colombia signed a historic peace agreement in 2016, proving that even the deepest wounds can give way to hope.",
    ko: "수십 년의 갈등 끝에 콜롬비아는 2016년 역사적인 평화 협정에 서명했으며, 가장 깊은 상처도 희망에 자리를 내줄 수 있음을 증명했다.",
    note: "'give way to ~'는 '~에 자리를 내주다/양보하다'라는 뜻이야. 'even the deepest wounds'에서 even은 '~조차도'라는 강조 부사야."
  },
  28: { // 아르헨티나 / 열정
    en: "Argentine tango was born in the working-class neighborhoods of Buenos Aires, where immigrants poured their loneliness and passion into every step.",
    ko: "아르헨티나 탱고는 부에노스아이레스의 노동자 동네에서 탄생했으며, 이민자들이 외로움과 열정을 모든 발걸음에 쏟아부었다.",
    note: "'was born in ~'은 '~에서 탄생했다'라는 수동태야. 'poured A into B'는 'A를 B에 쏟아부었다'라는 비유 표현이야."
  },
  30: { // 이스라엘 / 혁신
    en: "Israel, a country smaller than New Jersey, produces more start-ups per capita than any other nation, earning the nickname 'Start-Up Nation.'",
    ko: "뉴저지보다 작은 나라 이스라엘은 1인당 스타트업 수가 세계에서 가장 많아 '스타트업 네이션'이라는 별명을 얻었다.",
    note: "'per capita'는 '1인당'이라는 뜻의 라틴어 표현이야. 'earning the nickname'에서 earning은 결과를 나타내는 분사구문이야."
  },
  31: { // 태국 / 배려
    en: "In Thailand, the traditional greeting called 'wai' — pressing your palms together and bowing — shows respect, and the higher you raise your hands, the deeper the courtesy.",
    ko: "태국에서 '와이'라는 전통 인사는 두 손바닥을 모아 고개를 숙이는 것으로, 손을 높이 올릴수록 더 깊은 배려를 나타낸다.",
    note: "'the higher ~, the deeper ~'는 'the 비교급, the 비교급' 구문으로 '~하면 할수록 더 ~하다'라는 뜻이야."
  },
  32: { // 미얀마 / 감사
    en: "In Myanmar, people practice 'dana' — the tradition of giving food to monks each morning — as a daily expression of gratitude for the blessings in their lives.",
    ko: "미얀마에서 사람들은 매일 아침 승려에게 음식을 바치는 '다나' 전통을 통해 삶의 축복에 대한 감사를 일상적으로 표현한다.",
    note: "'as a daily expression of ~'는 '~의 일상적 표현으로서'라는 뜻이야. as는 '~로서'라는 역할을 나타내는 전치사야."
  },
  34: { // 네팔 / 겸손
    en: "Sherpa climbers in Nepal carry the heaviest loads to the summit of Everest, yet they rarely take credit, always letting the mountaineers celebrate first.",
    ko: "네팔의 셰르파 등반가들은 에베레스트 정상까지 가장 무거운 짐을 나르지만, 공을 내세우는 일이 드물고 항상 산악인이 먼저 축하하도록 한다.",
    note: "'take credit'은 '공을 인정받다/내세우다'라는 뜻이야. 'letting + 목적어 + 동사원형'은 사역동사 let의 5형식 구문이야."
  },
  47: { // 스페인 / 감정
    en: "In flamenco, Spanish dancers stamp their feet and clap their hands with such raw emotion that the audience can feel the performer's joy and sorrow without a single word.",
    ko: "플라멩코에서 스페인 무용수들은 날것 그대로의 감정으로 발을 구르고 손뼉을 쳐서, 관객이 한마디 말 없이도 공연자의 기쁨과 슬픔을 느낄 수 있다.",
    note: "'with such raw emotion that ~'은 'so ~ that' 구문과 같은 결과 표현이야. such + 명사 + that은 '너무 ~해서 …하다'라는 뜻이야."
  },
  48: { // 한국 / 예의
    en: "In Korea, bowing to elders, using both hands to receive a gift, and pouring drinks for others before yourself are daily rituals of respect woven into everyday life.",
    ko: "한국에서 어른에게 절하기, 두 손으로 선물 받기, 자기보다 상대 잔에 먼저 따르기는 일상에 녹아든 예의의 의식이다.",
    note: "'woven into ~'는 'weave(짜다)'의 과거분사로, '~에 짜여 들어간/녹아든'이라는 비유 표현이야."
  },
  51: { // 조지아 / 전통
    en: "Georgian winemakers still bury clay vessels called qvevri underground, using the same 8,000-year-old method that UNESCO now recognizes as a cultural treasure.",
    ko: "조지아 양조가들은 여전히 크베브리라는 점토 항아리를 땅에 묻어 와인을 만들며, 유네스코가 문화재로 인정한 8,000년 된 방식을 그대로 사용한다.",
    note: "'the same ~ method that ~'에서 that은 관계대명사로 method를 수식해. 'recognize A as B'는 'A를 B로 인정하다'라는 뜻이야."
  },
  52: { // 에스토니아 / 기술
    en: "Estonia became the world's first digital republic, where citizens can vote, pay taxes, and even start a business entirely online.",
    ko: "에스토니아는 세계 최초의 디지털 공화국이 되어, 시민들이 투표, 세금 납부, 심지어 사업 시작까지 모두 온라인으로 할 수 있다.",
    note: "'entirely online'은 '완전히 온라인으로'라는 뜻이야. 'even'은 '심지어 ~까지도'로 예상 밖의 것을 강조하는 부사야."
  },
  57: { // 스웨덴 / 논리
    en: "Swedish culture embraces 'lagom' — the idea that the right amount is neither too much nor too little — applying this logical balance to everything from work hours to coffee breaks.",
    ko: "스웨덴 문화는 '라곰' — 적당한 양은 너무 많지도 너무 적지도 않다는 개념 — 을 받아들이며, 이 논리적 균형을 근무 시간부터 커피 휴식까지 모든 것에 적용한다.",
    note: "'neither too much nor too little'는 'neither A nor B'로 'A도 B도 아닌'이라는 부정 표현이야."
  },
  62: { // 부르키나파소 / 절제
    en: "Burkina Faso, whose name means 'Land of Honest People,' is a country where simplicity and moderation are considered the highest virtues.",
    ko: "부르키나파소는 '정직한 사람들의 땅'이라는 뜻의 나라로, 검소함과 절제가 가장 높은 미덕으로 여겨진다.",
    note: "'whose name means ~'는 소유격 관계대명사 whose를 사용한 구문이야. 'are considered'는 '~로 여겨지다'라는 수동태야."
  },
  65: { // 오만 / 관용
    en: "Oman has maintained peace among diverse religious communities for centuries, earning its reputation as the most tolerant nation in the Arabian Peninsula.",
    ko: "오만은 수 세기 동안 다양한 종교 공동체 사이의 평화를 유지해 왔으며, 아라비아반도에서 가장 관용적인 나라라는 명성을 얻었다.",
    note: "'has maintained'는 현재완료로 과거부터 현재까지 계속된 행위를 나타내. 'earning its reputation as ~'는 '~라는 명성을 얻으며'라는 분사구문이야."
  },
  70: { // 쿠바 / 매력
    en: "In Havana, vintage American cars from the 1950s still cruise along the Malecón, creating a living museum where time seems to have stopped decades ago.",
    ko: "아바나에서 1950년대 미국산 빈티지 자동차들이 여전히 말레콘을 달리며, 시간이 수십 년 전에 멈춘 듯한 살아있는 박물관을 만들어낸다.",
    note: "'where time seems to have stopped'는 관계부사 where + seem to have p.p. 구문이야. 'seems to have stopped'는 '멈춘 것처럼 보인다'는 뜻이야."
  },
  72: { // 탄자니아 / 소망
    en: "Every year, over two million wildebeest cross the Serengeti in Tanzania, driven by the instinctive hope of finding fresh grasslands on the other side.",
    ko: "매년 200만 마리 이상의 누가 탄자니아 세렝게티를 횡단하며, 반대편에서 신선한 초원을 찾으려는 본능적 소망에 이끌린다.",
    note: "'driven by ~'는 '~에 의해 이끌린'이라는 과거분사 표현이야. 'the instinctive hope of ~ing'는 '~하려는 본능적 소망'이라는 명사 구문이야."
  },
  78: { // 모리셔스 / 미감
    en: "Mauritius is called the 'Rainbow of the Indian Ocean' because African, Indian, Chinese, and European cultures blend together on this tiny island, creating a feast for the senses.",
    ko: "모리셔스는 아프리카, 인도, 중국, 유럽 문화가 이 작은 섬에서 어우러져 '인도양의 무지개'라 불리며, 감각의 향연을 만들어낸다.",
    note: "'blend together'는 '어우러지다/섞이다'라는 뜻이야. 'a feast for the senses'는 '감각의 향연'이라는 비유 표현이야."
  },
  81: { // 대만 / 근면
    en: "Taiwan produces over 60 percent of the world's advanced semiconductors, a feat achieved through decades of relentless hard work and precision engineering.",
    ko: "대만은 세계 첨단 반도체의 60% 이상을 생산하며, 이는 수십 년간의 끊임없는 근면과 정밀 공학으로 이룬 업적이다.",
    note: "'a feat achieved through ~'는 '~을 통해 이룬 업적'이라는 과거분사 구문이야. relentless는 '끊임없는/가차 없는'이라는 형용사야."
  },
  85: { // 세르비아 / 영웅
    en: "Nikola Tesla, born in Serbia, invented the alternating current system that powers the modern world, yet he died alone and penniless in a New York hotel room.",
    ko: "세르비아 태생의 니콜라 테슬라는 현대 세계를 움직이는 교류 전기 시스템을 발명했지만, 뉴욕 호텔방에서 홀로 빈털터리로 죽었다.",
    note: "'born in Serbia'는 과거분사가 형용사처럼 쓰인 삽입구야. 'yet'은 '그러나/그럼에도'라는 뜻의 접속사로, 대조를 나타내."
  },
  87: { // 아르메니아 / 희생
    en: "Armenia was the first nation to adopt Christianity in 301 AD, and its people have preserved their identity through centuries of persecution and sacrifice.",
    ko: "아르메니아는 서기 301년에 기독교를 채택한 최초의 국가이며, 수 세기의 박해와 희생을 겪으면서도 정체성을 지켜왔다.",
    note: "'have preserved'는 현재완료로 과거부터 현재까지 지속된 행위를 나타내. 'through centuries of ~'는 '수 세기의 ~을 거치며'라는 뜻이야."
  },
  99: { // 스페인 / 광기
    en: "Gaudí spent 43 years building the Sagrada Família in Barcelona, a cathedral so wildly imaginative that some called it the work of a madman and others called it genius.",
    ko: "가우디는 43년간 바르셀로나에 사그라다 파밀리아를 건축했으며, 어떤 이는 광인의 작품이라, 어떤 이는 천재의 작품이라 불렀다.",
    note: "'so ~ that'은 '너무 ~해서 …하다'라는 결과 구문이야. 'some ~ and others ~'는 '어떤 이는 ~하고 다른 이는 ~하다'라는 대조 표현이야."
  },
  108: { // 프랑스 / 겸손 → 주제는 패션
    en: "Coco Chanel freed women from corsets and introduced simple elegance, proving that true French style lies not in excess but in knowing what to leave out.",
    ko: "코코 샤넬은 여성을 코르셋에서 해방시키고 단순한 우아함을 도입하여, 진정한 프랑스 스타일은 과함이 아닌 무엇을 뺄지 아는 데 있음을 증명했다.",
    note: "'not in A but in B'는 'A가 아니라 B에 있다'라는 대조 구문이야. 'knowing what to leave out'은 '무엇을 빼야 할지 아는 것'이라는 의문사 + to부정사 구문이야."
  },
  112: { // 브라질 / 도시
    en: "São Paulo, Brazil's largest city, was built by waves of immigrants from Italy, Japan, and Lebanon, making it one of the most culturally diverse cities on Earth.",
    ko: "브라질 최대 도시 상파울루는 이탈리아, 일본, 레바논에서 온 이민자들의 물결에 의해 건설되어 지구상에서 가장 문화적으로 다양한 도시 중 하나가 되었다.",
    note: "'waves of immigrants'에서 wave는 '물결/파도'로, 이민자들이 물결처럼 밀려왔다는 비유야. 'making it ~'은 결과를 나타내는 분사구문이야."
  },
  113: { // 부탄 / 본질
    en: "Bhutan measures success not by GDP but by Gross National Happiness, reminding the world that the essence of progress is the well-being of its people.",
    ko: "부탄은 성공을 GDP가 아닌 국민총행복으로 측정하며, 진보의 본질은 국민의 안녕에 있다는 것을 세계에 일깨워준다.",
    note: "'not by A but by B'는 'A가 아니라 B로'라는 대조 구문이야. 'reminding the world that ~'은 '세계에 ~을 일깨우며'라는 분사구문이야."
  },
  122: { // 독일 / 속도
    en: "On Germany's Autobahn, some stretches have no speed limit at all, trusting drivers to judge their own safe speed — a freedom built on discipline and engineering.",
    ko: "독일 아우토반의 일부 구간에는 속도 제한이 전혀 없어 운전자가 스스로 안전한 속도를 판단하도록 신뢰하며, 이는 규율과 공학 위에 세워진 자유다.",
    note: "'trusting drivers to ~'에서 trust A to B는 'A가 B할 것으로 신뢰하다'야. 'built on ~'은 '~ 위에 세워진'이라는 과거분사 표현이야."
  },
  130: { // 터키 / 설득
    en: "In Istanbul's Grand Bazaar, merchants have perfected the art of persuasion over 500 years, knowing that a warm cup of tea and genuine conversation can seal any deal.",
    ko: "이스탄불 그랜드 바자르에서 상인들은 500년에 걸쳐 설득의 기술을 완성했으며, 따뜻한 차 한잔과 진심 어린 대화가 어떤 거래도 성사시킬 수 있음을 안다.",
    note: "'have perfected'는 현재완료로 '완성해 왔다'라는 뜻이야. 'seal a deal'은 '거래를 성사시키다'라는 관용 표현이야."
  },
  136: { // 네덜란드 / 관찰
    en: "Leeuwenhoek, a Dutch cloth merchant, ground his own lenses and became the first person to observe bacteria, proving that careful observation can reveal an invisible world.",
    ko: "네덜란드 직물 상인 레이우엔훅은 직접 렌즈를 갈아 세균을 최초로 관찰한 사람이 되었으며, 세심한 관찰이 보이지 않는 세계를 드러낼 수 있음을 증명했다.",
    note: "'ground his own lenses'에서 ground는 grind(갈다)의 과거형이야. 'the first person to ~'는 '~한 최초의 사람'이라는 to부정사의 형용사적 용법이야."
  },
  143: { // 콩고민주공화국 / 재료
    en: "The Democratic Republic of the Congo holds 70 percent of the world's coltan reserves — a mineral essential for making the smartphones and laptops we use every day.",
    ko: "콩고민주공화국은 세계 콜탄 매장량의 70%를 보유하고 있으며, 이는 우리가 매일 사용하는 스마트폰과 노트북을 만드는 데 필수적인 광물이다.",
    note: "'essential for ~ing'는 '~하는 데 필수적인'이라는 형용사 표현이야. 'we use every day'는 관계대명사 that이 생략된 목적격 관계절이야."
  },
  149: { // 한국 / 경쟁
    en: "South Korea's rapid rise from war-torn poverty to a global cultural powerhouse shows how fierce competition and relentless drive can transform a nation in just one generation.",
    ko: "한국이 전쟁으로 폐허가 된 빈곤에서 세계적 문화 강국으로 급부상한 것은 치열한 경쟁과 끊임없는 추진력이 단 한 세대 만에 나라를 변모시킬 수 있음을 보여준다.",
    note: "'war-torn'은 '전쟁으로 찢어진'이라는 복합 형용사야. 'in just one generation'은 '단 한 세대 만에'라는 시간 표현이야."
  },
  155: { // 방글라데시 / 변화
    en: "Bangladesh, once called a 'basket case,' has transformed itself through garment manufacturing and microfinance, proving that change can come from the most unexpected places.",
    ko: "한때 '절망적인 나라'로 불렸던 방글라데시는 의류 제조와 소액 금융을 통해 스스로를 변모시켰으며, 변화는 가장 예상치 못한 곳에서 올 수 있음을 증명했다.",
    note: "'once called ~'은 '한때 ~로 불렸던'이라는 과거분사 구문이야. 'has transformed itself'는 재귀대명사로 '스스로를 변모시켰다'라는 뜻이야."
  },
  163: { // 스위스 / 참여
    en: "Swiss citizens vote in national referendums up to four times a year, making Switzerland the world's most active direct democracy.",
    ko: "스위스 시민들은 연간 최대 4회 국민투표에 참여하며, 이는 스위스를 세계에서 가장 활발한 직접 민주주의 국가로 만든다.",
    note: "'up to four times a year'는 '연간 최대 4회'라는 뜻이야. 'making Switzerland ~'는 결과를 나타내는 분사구문이야."
  },
  167: { // 이탈리아 / 범죄
    en: "In Sicily, judges Giovanni Falcone and Paolo Borsellino gave their lives fighting the Mafia, becoming symbols of courage against organized crime in Italy.",
    ko: "시칠리아에서 판사 조반니 팔코네와 파올로 보르셀리노는 마피아에 맞서 싸우다 목숨을 바쳤으며, 이탈리아 조직범죄에 맞선 용기의 상징이 되었다.",
    note: "'gave their lives ~ing'는 '~하다 목숨을 바치다'라는 뜻이야. 'becoming symbols of ~'는 결과를 나타내는 분사구문이야."
  },
  177: { // 아랍에미리트 / 투자
    en: "Dubai transformed from a small fishing village into a futuristic metropolis in just 50 years, using oil wealth as an investment in a post-oil future.",
    ko: "두바이는 불과 50년 만에 작은 어촌에서 미래형 대도시로 변모했으며, 석유 부를 탈석유 미래에 대한 투자로 활용했다.",
    note: "'transformed from A into B'는 'A에서 B로 변모하다'라는 표현이야. 'using ~ as ~'는 '~을 ~으로 활용하며'라는 분사구문이야."
  },
  182: { // 싱가포르 / 효율
    en: "Singapore's Changi Airport has been voted the world's best airport for years, where every detail — from butterfly gardens to free cinemas — is designed for maximum efficiency and comfort.",
    ko: "싱가포르 창이공항은 수년간 세계 최고 공항으로 선정되었으며, 나비 정원부터 무료 영화관까지 모든 세부 사항이 최대 효율과 편안함을 위해 설계되었다.",
    note: "'has been voted'는 현재완료 수동태로 '선정되어 왔다'라는 뜻이야. 'is designed for ~'는 '~을 위해 설계되다'라는 수동태 표현이야."
  },
  184: { // 콜롬비아 / 재활
    en: "Medellín, once the world's most dangerous city due to drug cartels, reinvented itself through public libraries, cable cars, and urban gardens — a stunning model of urban rehabilitation.",
    ko: "메데진은 한때 마약 카르텔로 세계에서 가장 위험한 도시였으나, 공공 도서관, 케이블카, 도시 정원으로 스스로를 재창조하여 놀라운 도시 재활의 모델이 되었다.",
    note: "'reinvented itself through ~'는 '~을 통해 스스로를 재창조하다'라는 재귀 표현이야. 'once'는 '한때'라는 뜻의 부사야."
  },
  191: { // 중국 / 긴장
    en: "China's '996' work culture — working from 9 AM to 9 PM, six days a week — fuels the nation's economic growth but raises serious questions about the tension between productivity and well-being.",
    ko: "중국의 '996' 근무 문화 — 오전 9시부터 오후 9시까지 주 6일 근무 — 는 국가 경제 성장을 촉진하지만, 생산성과 안녕 사이의 긴장에 대한 심각한 질문을 제기한다.",
    note: "'raises questions about ~'는 '~에 대한 질문을 제기하다'라는 뜻이야. 'the tension between A and B'는 'A와 B 사이의 긴장'이라는 표현이야."
  },
  193: { // 아이슬란드 / 불안
    en: "In Iceland, where winter darkness lasts nearly 20 hours a day, people cope with seasonal anxiety by gathering in warm pools and reading more books per person than almost any other nation.",
    ko: "겨울 어둠이 하루 20시간 가까이 이어지는 아이슬란드에서 사람들은 따뜻한 온천에 모이고 1인당 거의 세계에서 가장 많은 책을 읽으며 계절적 불안에 대처한다.",
    note: "'cope with ~'는 '~에 대처하다'라는 뜻이야. 'more books per person than ~'는 '1인당 ~보다 더 많은 책'이라는 비교 표현이야."
  },
  201: { // 미국 / 동기
    en: "Silicon Valley thrives on the belief that failure is not the opposite of success but a necessary step toward it, motivating entrepreneurs to try again after every setback.",
    ko: "실리콘밸리는 실패가 성공의 반대가 아니라 성공을 향한 필수 단계라는 믿음 위에서 번성하며, 기업가들이 매 좌절 후 다시 도전하도록 동기를 부여한다.",
    note: "'not the opposite of ~ but ~'는 'not A but B' 대조 구문이야. 'motivating ~ to ~'는 '~에게 ~하도록 동기를 부여하며'라는 분사구문이야."
  },
  205: { // 우루과이 / 독창
    en: "Uruguay, one of the smallest countries in South America, was the first to legalize same-sex marriage and cannabis on the continent, showing that originality often comes from unexpected places.",
    ko: "남미에서 가장 작은 나라 중 하나인 우루과이는 대륙 최초로 동성 결혼과 대마초를 합법화하여, 독창성은 종종 예상치 못한 곳에서 온다는 것을 보여주었다.",
    note: "'the first to ~'는 '~한 최초의'라는 to부정사의 형용사적 용법이야. 'showing that ~'는 '~을 보여주며'라는 분사구문이야."
  },
  217: { // 아일랜드 / 귀향
    en: "Ireland's Great Famine forced millions to emigrate, but their descendants have returned generation after generation, drawn by an unbreakable bond to their homeland.",
    ko: "아일랜드 대기근은 수백만 명을 이주하게 했지만, 그 후손들은 세대를 거듭하여 돌아왔으며, 고향에 대한 끊을 수 없는 유대에 이끌렸다.",
    note: "'forced ~ to ~'는 사역의 의미로 '~에게 ~하도록 강요하다'라는 뜻이야. 'drawn by ~'는 '~에 이끌린'이라는 과거분사 표현이야."
  },
  218: { // 트리니다드토바고 / 놀이
    en: "In Trinidad, the steel pan was invented by beating discarded oil drums into musical instruments, turning industrial waste into the joyful sound of carnival.",
    ko: "트리니다드에서 버려진 기름통을 두들겨 악기로 만든 스틸팬이 발명되었으며, 산업 폐기물이 카니발의 즐거운 소리로 바뀌었다.",
    note: "'by beating ~ into ~'는 '~을 두들겨서 ~으로 만들어'라는 수단 표현이야. 'turning A into B'는 'A를 B로 바꾸며'라는 분사구문이야."
  },
  219: { // 타지키스탄 / 의례
    en: "In Tajikistan, the ancient festival of Navruz marks the spring equinox with rituals of cleaning, feasting, and visiting elders — ceremonies unchanged for over 3,000 years.",
    ko: "타지키스탄에서 고대 축제 나브루즈는 청소, 잔치, 어른 방문의 의례로 춘분을 기념하며, 이 의식은 3,000년 이상 변하지 않았다.",
    note: "'marks ~ with ~'는 '~으로 ~을 기념하다'라는 뜻이야. 'unchanged for over 3,000 years'는 '3,000년 이상 변하지 않은'이라는 형용사구야."
  },
  226: { // 아이티 / 회복력
    en: "After the devastating 2010 earthquake, Haitians rebuilt schools and homes from the rubble with their own hands, showing a resilience born from centuries of overcoming hardship.",
    ko: "2010년 파괴적인 지진 이후, 아이티인들은 맨손으로 잔해에서 학교와 집을 다시 지었으며, 수 세기의 역경 극복에서 태어난 회복력을 보여주었다.",
    note: "'born from ~'는 '~에서 태어난/비롯된'이라는 과거분사 표현이야. 'with their own hands'는 '자신의 손으로/맨손으로'라는 수단 표현이야."
  },
  229: { // 벨라루스 / 안전
    en: "The Białowieża Forest on the Belarus-Poland border is Europe's last primeval woodland, where ancient trees have stood undisturbed for thousands of years, safe from the axes of civilization.",
    ko: "벨라루스-폴란드 국경의 비아워비에자 숲은 유럽 마지막 원시림으로, 고대 나무들이 수천 년간 문명의 도끼로부터 안전하게 방해받지 않고 서 있다.",
    note: "'have stood undisturbed'는 현재완료 + 보어로 '방해받지 않고 서 있어 왔다'라는 뜻이야. 'safe from ~'은 '~로부터 안전한'이라는 형용사 표현이야."
  },
  231: { // 모로코 / 예절
    en: "In Morocco, serving mint tea follows a precise ritual: the host pours from high above the glass to create a froth, and refusing a cup is considered deeply impolite.",
    ko: "모로코에서 민트차를 내는 것은 정확한 의례를 따른다: 주인이 잔 위 높은 곳에서 따라 거품을 만들며, 한 잔을 거절하는 것은 매우 무례한 것으로 여겨진다.",
    note: "'from high above ~'는 '~ 위 높은 곳에서'라는 장소 표현이야. 'refusing ~ is considered ~'는 동명사 주어 + 수동태로 '~을 거절하는 것은 ~으로 여겨진다'야."
  },
  233: { // 불가리아 / 장수
    en: "Bulgarians attribute their remarkable longevity to daily consumption of yogurt, a fermented food containing bacteria that scientists have linked to a longer, healthier life.",
    ko: "불가리아인들은 놀라운 장수를 요구르트의 일상적 섭취 덕분으로 돌리며, 이 발효 식품에는 과학자들이 더 길고 건강한 삶과 연관시킨 세균이 들어있다.",
    note: "'attribute A to B'는 'A를 B의 덕분으로 돌리다'라는 뜻이야. 'have linked A to B'는 'A를 B와 연관시키다'라는 현재완료 표현이야."
  },
  234: { // 우크라이나 / 청춘
    en: "In Ukraine, young women embroider 'vyshyvanka' shirts with colorful patterns that tell stories of their village, their family, and their own youth.",
    ko: "우크라이나에서 젊은 여성들은 마을, 가족, 자신의 청춘에 대한 이야기를 담은 다채로운 무늬로 '비시반카' 셔츠를 수놓는다.",
    note: "'that tell stories of ~'는 관계대명사 that이 이끄는 형용사절로 '~의 이야기를 들려주는'이라는 뜻이야."
  },
  238: { // 투르크메니스탄 / 작문
    en: "In Turkmenistan, master weavers encode messages into carpet patterns, each knot representing a letter in a textile tradition of writing that predates paper by millennia.",
    ko: "투르크메니스탄에서 장인 직조공들은 양탄자 무늬에 메시지를 암호화하며, 각 매듭은 종이보다 수천 년 앞선 직물 작문 전통의 글자를 나타낸다.",
    note: "'encode A into B'는 'A를 B에 암호화하다'야. 'that predates paper by millennia'는 '종이보다 수천 년 앞선'이라는 관계절이야."
  },
  241: { // 헝가리 / 연극
    en: "Budapest's ornate theaters have staged world-class opera and drama for over two centuries, earning Hungary a reputation as one of Europe's hidden cultural powerhouses.",
    ko: "부다페스트의 화려한 극장들은 2세기 이상 세계 수준의 오페라와 연극을 무대에 올려왔으며, 헝가리에 유럽의 숨겨진 문화 강국이라는 명성을 안겨주었다.",
    note: "'have staged'는 현재완료로 '무대에 올려왔다'라는 뜻이야. 'earning ~ a reputation as ~'는 '~에게 ~라는 명성을 안겨주며'라는 분사구문이야."
  },
  243: { // 보츠와나 / 사진
    en: "In Botswana's Okavango Delta, wildlife photographers wait for hours in absolute stillness, because the perfect shot demands patience as much as skill.",
    ko: "보츠와나 오카방고 삼각주에서 야생동물 사진가들은 절대적 고요 속에 몇 시간이고 기다리는데, 완벽한 사진은 기술만큼이나 인내를 요구하기 때문이다.",
    note: "'in absolute stillness'는 '절대적 고요 속에서'라는 뜻이야. 'as much as ~'는 '~만큼이나'라는 동등 비교 표현이야."
  },
  245: { // 쿠웨이트 / 로봇
    en: "Kuwait is investing heavily in robotics and artificial intelligence to build a high-tech economy beyond oil, deploying robots in hospitals and government offices.",
    ko: "쿠웨이트는 석유를 넘어선 첨단 경제를 구축하기 위해 로봇공학과 인공지능에 대규모 투자를 하며, 병원과 관공서에 로봇을 배치하고 있다.",
    note: "'investing heavily in ~'는 '~에 대규모로 투자하다'라는 뜻이야. 'beyond oil'은 '석유를 넘어서'라는 전치사구야."
  },
  247: { // 에스와티니 / 정보
    en: "In Eswatini, the annual Reed Dance brings together thousands of young women who carry tall reeds to the queen mother, keeping alive a centuries-old network of cultural information and tradition.",
    ko: "에스와티니에서 매년 열리는 갈대 춤에는 수천 명의 젊은 여성이 모여 태후에게 긴 갈대를 전달하며, 수 세기 된 문화 정보와 전통의 네트워크를 살려간다.",
    note: "'keeping alive ~'는 '~을 살려가며'라는 분사구문이야. keep alive는 '살아있게 유지하다'라는 뜻의 구동사야."
  },
  249: { // 알제리 / 편지
    en: "During Algeria's war for independence, women hid secret letters inside their traditional haik garments, turning simple fabric into a powerful tool of resistance.",
    ko: "알제리 독립 전쟁 중 여성들은 전통 의상 하이크 안에 비밀 편지를 숨겼으며, 단순한 천을 강력한 저항의 도구로 바꾸었다.",
    note: "'turning A into B'는 'A를 B로 바꾸며'라는 분사구문이야. 'a powerful tool of resistance'는 '강력한 저항의 도구'라는 명사구야."
  },
  257: { // 말라위 / 감동
    en: "Malawi, known as 'The Warm Heart of Africa,' is a country where strangers greet you with genuine smiles and share their meals even when they have very little.",
    ko: "말라위는 '아프리카의 따뜻한 심장'으로 알려진 나라로, 낯선 사람에게 진심 어린 미소로 인사하고 가진 것이 거의 없어도 식사를 나눈다.",
    note: "'known as ~'는 '~로 알려진'이라는 과거분사 표현이야. 'even when ~'는 '~할 때조차도'라는 양보의 부사절이야."
  },
  260: { // 앙골라 / 목표
    en: "Angola's kuduro music was born in the slums of Luanda during the civil war, giving young people a rhythmic goal to dance toward when all other paths seemed blocked.",
    ko: "앙골라의 쿠도로 음악은 내전 중 루안다 빈민가에서 탄생하여, 다른 모든 길이 막힌 것처럼 보일 때 젊은이들에게 춤으로 향할 리듬의 목표를 주었다.",
    note: "'was born in ~'은 '~에서 탄생하다'라는 수동태야. 'when all other paths seemed blocked'는 '다른 모든 길이 막힌 것처럼 보일 때'라는 시간 부사절이야."
  },
  261: { // 룩셈부르크 / 연습
    en: "In Luxembourg, children start learning three languages from elementary school — Luxembourgish, German, and French — so that by graduation, daily practice has made them fluent in all three.",
    ko: "룩셈부르크에서 아이들은 초등학교부터 룩셈부르크어, 독일어, 프랑스어 세 언어를 배우기 시작하여, 졸업할 때쯤이면 매일의 연습이 세 언어 모두에 유창하게 만든다.",
    note: "'so that ~ by graduation'는 '졸업할 때쯤이면 ~하도록'이라는 목적/결과 구문이야. 'has made them fluent'는 사역동사 make의 현재완료 5형식이야."
  },
  264: { // 코트디부아르 / 마무리
    en: "Côte d'Ivoire, once devastated by civil war, rebuilt its economy to become West Africa's largest, proving that a strong finish can follow the darkest chapter.",
    ko: "코트디부아르는 한때 내전으로 황폐해졌으나 경제를 재건하여 서아프리카 최대 경제국이 되었으며, 가장 어두운 장 뒤에 강한 마무리가 올 수 있음을 증명했다.",
    note: "'once devastated by ~'는 '한때 ~에 의해 황폐해진'이라는 과거분사 구문이야. 'can follow'는 '뒤따를 수 있다'라는 가능성의 표현이야."
  },
  270: { // 마다가스카르 / 추모
    en: "In Madagascar, the Famadihana ceremony honors the dead by unwrapping their remains, dancing with them, and rewrapping them in fresh cloth — a joyful celebration of remembrance.",
    ko: "마다가스카르의 파마디하나 의식은 고인의 유해를 풀어 함께 춤추고 새 천으로 다시 감싸 추모하는 — 기쁨의 기억 축제이다.",
    note: "'by ~ing, ~ing, and ~ing'은 세 가지 행위를 병렬로 나열한 전치사 + 동명사 구문이야. 'a joyful celebration of ~'는 '~의 기쁨의 축제'라는 동격 표현이야."
  },
  272: { // 세네갈 / 회한
    en: "On Senegal's Gorée Island, the 'Door of No Return' still stands as a haunting reminder of the millions of Africans who passed through it into slavery, never to see their homeland again.",
    ko: "세네갈 고레 섬의 '돌아올 수 없는 문'은 노예로 끌려가 다시는 고향을 보지 못한 수백만 아프리카인의 잊을 수 없는 기억으로 여전히 서 있다.",
    note: "'never to see ~ again'은 결과를 나타내는 to부정사로 '다시는 ~을 보지 못한 채'라는 뜻이야. 'stands as ~'는 '~로서 서 있다'야."
  },
  278: { // 에스토니아 / 배움
    en: "Estonia offers free online courses to anyone in the world through its e-Residency program, believing that learning should have no borders.",
    ko: "에스토니아는 전자 시민권 프로그램을 통해 전 세계 누구에게나 무료 온라인 강좌를 제공하며, 배움에는 국경이 없어야 한다고 믿는다.",
    note: "'offers ~ to anyone'은 '누구에게나 ~을 제공하다'라는 4형식 구문이야. 'believing that ~'은 '~라고 믿으며'라는 분사구문이야."
  },
  280: { // 탄자니아 / 봉사
    en: "In Tanzania, the philosophy of 'ujamaa' — meaning familyhood — encourages communities to work together and serve one another as if every neighbor were a relative.",
    ko: "탄자니아에서 '우자마' — 가족 의식이라는 뜻 — 의 철학은 모든 이웃이 친척인 것처럼 함께 일하고 서로 봉사하도록 공동체를 격려한다.",
    note: "'as if ~ were ~'는 가정법 과거로 '마치 ~인 것처럼'이라는 뜻이야. were는 가정법에서 주어에 관계없이 사용돼."
  },
  282: { // 바누아투 / 충성
    en: "In Vanuatu, young men prove their loyalty and courage by jumping from tall towers with vines tied to their ankles — a ritual called 'naghol' that inspired modern bungee jumping.",
    ko: "바누아투에서 젊은 남성들은 발목에 덩굴을 묶고 높은 탑에서 뛰어내리는 '나골'이라는 의식으로 충성과 용기를 증명하며, 이것이 현대 번지점프에 영감을 주었다.",
    note: "'with vines tied to their ankles'는 'with + 목적어 + 과거분사' 구문으로 '발목에 덩굴이 묶인 채'라는 부대상황을 나타내."
  },
  288: { // 캄보디아 / 추억
    en: "Cambodia's Angkor Wat, hidden by jungle for centuries, was rediscovered in the 1860s — a magnificent stone memory of the Khmer Empire that time could not erase.",
    ko: "수 세기 동안 정글에 숨겨져 있던 캄보디아의 앙코르 와트는 1860년대에 재발견되었으며, 시간도 지울 수 없는 크메르 제국의 장엄한 돌의 기억이다.",
    note: "'hidden by jungle for centuries'는 과거분사의 수동 표현으로 '수 세기 동안 정글에 숨겨진'이라는 뜻이야. 'that time could not erase'는 관계대명사절이야."
  },
  290: { // 라트비아 / 혁신
    en: "Latvia's 'dainas' are ancient folk songs that have been passed down orally for generations, yet modern Latvian musicians are now remixing them into electronic music — breaking the old to create the new.",
    ko: "라트비아의 '다이나'는 세대를 거쳐 구전된 고대 민요이지만, 현대 라트비아 음악가들은 이를 전자 음악으로 리믹스하고 있다 — 옛것을 깨뜨려 새것을 만드는 것이다.",
    note: "'have been passed down'은 현재완료 수동태로 '전해져 내려왔다'야. 'breaking the old to create the new'는 '옛것을 깨뜨려 새것을 만들다'라는 목적의 to부정사야."
  },
  293: { // 미얀마 / 의지
    en: "Myanmar's golden Shwedagon Pagoda has stood for over 2,600 years, rebuilt again and again by the unbreakable will of its people after every earthquake and invasion.",
    ko: "미얀마의 황금 쉐다곤 파고다는 2,600년 이상 서 있었으며, 모든 지진과 침략 후에 국민의 꺾이지 않는 의지로 거듭 재건되었다.",
    note: "'has stood for ~'는 현재완료로 '~ 동안 서 있어 왔다'야. 'rebuilt again and again by ~'는 '~에 의해 거듭 재건된'이라는 수동태 표현이야."
  },
  297: { // 브라질 / 단련
    en: "Capoeira, a Brazilian martial art disguised as dance, was created by enslaved Africans who trained their bodies and minds in secret, turning discipline into a weapon of freedom.",
    ko: "브라질의 무술이자 춤으로 위장된 카포에이라는 몸과 마음을 비밀리에 단련한 노예 출신 아프리카인들이 만들었으며, 규율을 자유의 무기로 바꾸었다.",
    note: "'disguised as ~'는 '~으로 위장된'이라는 과거분사 표현이야. 'turning A into B'는 'A를 B로 바꾸며'라는 분사구문이야."
  },
  299: { // 모로코 / 오감
    en: "In the souks of Marrakech, every sense is overwhelmed — the scent of spices, the sound of copper hammering, the sight of colorful textiles, and the taste of fresh mint tea.",
    ko: "마라케시 시장에서는 모든 감각이 압도당한다 — 향신료 냄새, 구리 두드리는 소리, 다채로운 직물의 광경, 그리고 신선한 민트차의 맛.",
    note: "'every sense is overwhelmed'는 수동태로 '모든 감각이 압도당하다'라는 뜻이야. 뒤에 이어지는 명사구들이 병렬로 오감을 나열해."
  },
  301: { // 남아프리카공화국 / 향기
    en: "South Africa's journey from apartheid to democracy was not smooth, yet Nelson Mandela chose reconciliation over revenge, leaving behind a legacy as enduring as the fragrance of the fynbos wildflowers.",
    ko: "남아프리카공화국의 아파르트헤이트에서 민주주의로의 여정은 순탄하지 않았지만, 만델라는 복수 대신 화해를 택해 핀보스 야생화의 향기처럼 오래가는 유산을 남겼다.",
    note: "'chose A over B'는 'B 대신 A를 택하다'라는 뜻이야. 'as enduring as ~'는 '~만큼 오래가는'이라는 동등 비교 표현이야."
  },
  307: { // 카타르 / 기부
    en: "Qatar donates a higher percentage of its national income to foreign aid than almost any other country, channeling oil wealth into charitable projects across the developing world.",
    ko: "카타르는 거의 모든 나라보다 높은 비율의 국민소득을 해외 원조에 기부하며, 석유 부를 개발도상국 전역의 자선 사업에 투입한다.",
    note: "'a higher percentage ~ than ~'은 비교급 표현이야. 'channeling ~ into ~'는 '~을 ~에 투입하며'라는 분사구문이야."
  },
  309: { // 아일랜드 / 치유
    en: "In Ireland, traditional music sessions in pubs are not performances but communal gatherings where strangers join in, and the shared melody becomes a form of emotional healing.",
    ko: "아일랜드에서 펍의 전통 음악 세션은 공연이 아니라 낯선 이들이 함께하는 공동체 모임이며, 함께 나누는 선율이 감정적 치유의 형태가 된다.",
    note: "'not A but B'는 'A가 아니라 B'라는 대조 표현이야. 'where strangers join in'은 관계부사 where로 장소를 수식하는 절이야."
  },
  311: { // 탄자니아 / 공존
    en: "In Tanzania, over 120 ethnic groups speaking different languages coexist peacefully, united by Swahili as a common tongue and the shared belief in 'ujamaa' — togetherness.",
    ko: "탄자니아에서는 서로 다른 언어를 사용하는 120개 이상의 민족이 평화롭게 공존하며, 공용어 스와힐리어와 '우자마' — 함께함이라는 공유된 믿음으로 하나가 된다.",
    note: "'united by ~'는 '~에 의해 하나로 묶인'이라는 과거분사 표현이야. 'over 120'은 '120 이상의'라는 뜻으로 수량을 나타내."
  },
  313: { // 쿠르디스탄 / 소통
    en: "In Kurdish culture, sharing tea and conversation is a sacred ritual — hosts pour endless cups while guests speak freely, believing that honest dialogue builds stronger bonds than any treaty.",
    ko: "쿠르드 문화에서 차와 대화를 나누는 것은 신성한 의례이다 — 주인은 끝없이 차를 따르고 손님은 자유롭게 말하며, 솔직한 대화가 어떤 조약보다 강한 유대를 만든다고 믿는다.",
    note: "'stronger ~ than any ~'는 '어떤 ~보다 더 강한'이라는 비교급 표현이야. 'believing that ~'은 '~라고 믿으며'라는 분사구문이야."
  },
  319: { // 튀니지 / 법
    en: "Tunisia sparked the Arab Spring in 2010 when a street vendor's protest ignited a revolution, and it remains the only country in the region to have built a lasting democratic constitution.",
    ko: "튀니지는 2010년 한 노점상의 항의가 혁명에 불을 붙여 아랍의 봄을 촉발했으며, 이 지역에서 지속적인 민주주의 헌법을 구축한 유일한 나라로 남아있다.",
    note: "'to have built'는 완료 부정사로 '구축한'이라는 완료된 행위를 나타내. 'the only country to ~'는 '~한 유일한 나라'라는 표현이야."
  },
  326: { // 룩셈부르크 / 축소
    en: "Luxembourg is smaller than Rhode Island, yet its GDP per capita is the highest in the world — proof that a nation's size has little to do with its economic power.",
    ko: "룩셈부르크는 로드아일랜드보다 작지만 1인당 GDP는 세계 최고이며, 이는 나라의 크기가 경제력과 거의 관계가 없다는 증거이다.",
    note: "'has little to do with ~'는 '~와 거의 관계가 없다'라는 관용 표현이야. 'proof that ~'은 '~라는 증거'라는 동격 that절이야."
  },
  327: { // 니제르 / 집합
    en: "In Niger, the Cure Salée festival gathers thousands of Tuareg and Wodaabe nomads at the edge of the Sahara, where scattered tribes come together to trade, marry, and celebrate their survival.",
    ko: "니제르의 쿠레 살레 축제는 사하라 가장자리에 수천 명의 투아레그와 워다베 유목민을 모으며, 흩어진 부족들이 모여 거래하고, 혼인하고, 생존을 축하한다.",
    note: "'come together to ~'는 '~하기 위해 모이다'라는 목적의 to부정사야. 'scattered tribes'에서 scattered는 '흩어진'이라는 과거분사 형용사야."
  },
  331: { // 르완다 / 재건
    en: "Rwanda, devastated by the 1994 genocide, has rebuilt itself into one of Africa's safest and fastest-growing nations, proving that hope can rise from the deepest despair.",
    ko: "1994년 대학살로 황폐해진 르완다는 아프리카에서 가장 안전하고 빠르게 성장하는 나라 중 하나로 스스로를 재건했으며, 가장 깊은 절망에서도 희망이 솟아날 수 있음을 증명했다.",
    note: "'devastated by ~'는 '~에 의해 황폐해진'이라는 과거분사 표현이야. 'hope can rise from ~'는 '희망이 ~에서 솟아날 수 있다'라는 비유야."
  },
  337: { // 바누아투 / 신비
    en: "Vanuatu's blue holes are underwater caves so deep and clear that divers describe entering them as passing through a portal into another world.",
    ko: "바누아투의 블루홀은 너무 깊고 맑아서 다이버들은 그곳에 들어가는 것을 다른 세계로 통하는 포털을 지나는 것처럼 묘사한다.",
    note: "'so deep and clear that ~'는 'so ~ that' 결과 구문이야. 'describe A as B'는 'A를 B로 묘사하다'라는 5형식 표현이야."
  },
  340: { // 모로코 / 교차
    en: "Fez, Morocco's ancient capital, sits at the crossroads of Africa and Europe, its winding medina streets preserving a thousand years of cultural exchange between two continents.",
    ko: "모로코의 고대 수도 페스는 아프리카와 유럽의 교차점에 있으며, 구불구불한 메디나 거리가 두 대륙 간 천 년의 문화 교류를 보존하고 있다.",
    note: "'sits at the crossroads of ~'는 '~의 교차점에 위치하다'라는 뜻이야. 'its ~ streets preserving ~'은 독립분사구문이야."
  },
  341: { // 수리남 / 분기
    en: "Suriname, a former Dutch colony in South America, is home to Javanese, Indian, African, and Indigenous communities — a living example of how divergent cultures can coexist in harmony.",
    ko: "남미의 옛 네덜란드 식민지 수리남에는 자바인, 인도인, 아프리카인, 원주민 공동체가 살고 있으며, 분기된 문화가 조화롭게 공존할 수 있음을 보여주는 살아있는 사례이다.",
    note: "'a living example of how ~'는 '~하는 방법의 살아있는 사례'라는 동격 표현이야. 'divergent'는 '분기된/갈라진'이라는 형용사야."
  },
  343: { // 조지아 / 순서
    en: "In Georgia, the traditional feast called 'supra' follows a strict sequence: a tamada leads each toast in order — to God, to homeland, to family — never skipping a step.",
    ko: "조지아의 전통 연회 '수프라'는 엄격한 순서를 따른다: 타마다가 각 건배를 차례로 이끌며 — 신에게, 조국에, 가족에게 — 절대 단계를 건너뛰지 않는다.",
    note: "'follows a strict sequence'는 '엄격한 순서를 따르다'라는 뜻이야. 'never skipping a step'은 '절대 단계를 건너뛰지 않으며'라는 분사구문이야."
  },
  350: { // 우즈베키스탄 / 도자기
    en: "In Samarkand, Uzbekistan, artisans have crafted blue ceramic tiles for centuries, their intricate patterns adorning mosques and madrasas along the ancient Silk Road.",
    ko: "우즈베키스탄 사마르칸트에서 장인들은 수 세기 동안 푸른 도자기 타일을 만들어왔으며, 그 정교한 무늬가 고대 실크로드의 모스크와 마드라사를 장식한다.",
    note: "'have crafted ~ for centuries'는 현재완료로 '수 세기 동안 만들어왔다'야. 'their patterns adorning ~'은 독립분사구문으로 부가 설명이야."
  },
  352: { // 체코 / 인쇄
    en: "Prague's bookshops and libraries have thrived since the age of Gutenberg, making the Czech capital one of Europe's great literary cities where the printed word is treasured above all.",
    ko: "프라하의 서점과 도서관은 구텐베르크 시대부터 번성해왔으며, 체코 수도를 인쇄물이 무엇보다 소중히 여겨지는 유럽의 위대한 문학 도시 중 하나로 만들었다.",
    note: "'have thrived since ~'는 현재완료로 '~ 이래로 번성해왔다'야. 'where the printed word is treasured'는 관계부사 where의 형용사절이야."
  },
  353: { // 몽골 / 활자
    en: "The Mongol Empire adopted the Uyghur script and spread it across Asia, creating a written communication system that connected cultures from Korea to Persia.",
    ko: "몽골 제국은 위구르 문자를 채택하여 아시아 전역에 퍼뜨렸고, 한국에서 페르시아까지 문화를 연결하는 문자 소통 체계를 만들어냈다.",
    note: "'adopted ~ and spread ~'는 두 동사가 and로 병렬 연결된 구문이야. 'that connected A to B'는 'A와 B를 연결한'이라는 관계대명사절이야."
  },
  354: { // 모로코 / 서예
    en: "In Morocco, master calligraphers transform Arabic script into breathtaking visual art, where every curve and dot carries both meaning and beauty.",
    ko: "모로코에서 서예 장인들은 아랍 문자를 숨 막히는 시각 예술로 변모시키며, 모든 곡선과 점이 의미와 아름다움을 동시에 담고 있다.",
    note: "'transform A into B'는 'A를 B로 변모시키다'라는 뜻이야. 'where every ~'는 관계부사절로 앞 내용을 부연 설명해."
  },
  356: { // 아일랜드 / 명상
    en: "Ancient Irish monks built stone beehive huts on the remote island of Skellig Michael, seeking silence and deep contemplation far from the distractions of the world.",
    ko: "고대 아일랜드 수도승들은 외딴 스켈리그 마이클 섬에 돌 벌집 오두막을 지었으며, 세상의 방해로부터 멀리 떨어져 침묵과 깊은 명상을 추구했다.",
    note: "'seeking ~'는 '~을 추구하며'라는 분사구문이야. 'far from the distractions of ~'는 '~의 방해로부터 멀리'라는 장소/거리 표현이야."
  },
  359: { // 스페인 / 열매
    en: "Spain produces nearly half of the world's olive oil, and for Spaniards, the olive tree is not just a crop but a sacred symbol of the Mediterranean's most enduring fruit.",
    ko: "스페인은 세계 올리브유의 거의 절반을 생산하며, 스페인인들에게 올리브 나무는 단순한 작물이 아니라 지중해의 가장 오래된 열매의 신성한 상징이다.",
    note: "'not just A but B'는 '단순한 A가 아니라 B'라는 대조 구문이야. 'most enduring'은 '가장 오래 지속되는'이라는 최상급 표현이야."
  },
  362: { // 콜롬비아 / 꽃
    en: "Colombia is the second-largest flower exporter in the world, and every February, the Medellín Flower Festival fills the streets with enormous floral displays carried on the backs of silleteros.",
    ko: "콜롬비아는 세계 2위의 꽃 수출국이며, 매년 2월 메데진 꽃 축제에서는 실레테로들의 등에 실린 거대한 꽃 장식이 거리를 가득 채운다.",
    note: "'the second-largest ~'는 '두 번째로 큰 ~'이라는 서수 + 최상급 표현이야. 'carried on the backs of ~'는 '~의 등에 실린'이라는 과거분사야."
  },
  363: { // 캐나다 / 낙엽
    en: "Every autumn, Canada's maple forests erupt in fiery reds and golden yellows, and the falling leaves are collected to produce the world's finest maple syrup.",
    ko: "매년 가을, 캐나다의 단풍 숲은 불타는 빨강과 황금빛 노랑으로 물들며, 떨어지는 낙엽은 세계 최고의 메이플 시럽을 만드는 데 수집된다.",
    note: "'erupt in ~'은 '~으로 물들다/폭발하다'라는 비유 표현이야. 'fiery reds and golden yellows'는 색상을 형용사 + 명사로 표현한 것이야."
  },
  364: { // 르완다 / 새싹
    en: "Rwanda plants millions of trees each year in a national campaign called 'Umuganda,' where communities work together every month to nurture new growth from scarred land.",
    ko: "르완다는 '우무간다'라는 국가 캠페인으로 매년 수백만 그루의 나무를 심으며, 공동체가 매달 함께 일하여 상처 입은 땅에서 새싹을 키워낸다.",
    note: "'called ~'는 '~라고 불리는'이라는 과거분사 수식이야. 'to nurture new growth from ~'는 '~에서 새싹을 키우기 위해'라는 목적의 to부정사야."
  },
  365: { // 미얀마 / 수확
    en: "In Myanmar's golden rice paddies, entire villages come together at harvest time to cut, thresh, and share the grain, celebrating the fruits of a year's collective labor.",
    ko: "미얀마의 황금 논에서는 수확 시기에 마을 전체가 모여 벼를 베고, 타작하고, 곡식을 나누며, 일 년간의 공동 노동의 결실을 축하한다.",
    note: "'come together at ~'는 '~에 모이다'라는 뜻이야. 'to cut, thresh, and share'는 세 동사가 병렬 연결된 목적의 to부정사야."
  }
};

let fixCount = 0;
for (const [day, fix] of Object.entries(fixes)) {
  const idx = Number(day) - 1;
  const sent = english[idx]?.sentences?.find(s => s.source === '세계문화');
  if (sent) {
    sent.en = fix.en;
    sent.ko = fix.ko;
    sent.note = fix.note;
    fixCount++;
  } else {
    console.log(`Day ${day}: 세계문화 문장 없음!`);
  }
}

writeFileSync(filePath, JSON.stringify(english, null, 2), 'utf-8');
console.log(`세계문화 ${fixCount}건 수정 완료, english.json 저장 완료`);
