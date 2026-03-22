import fs from "fs";

const english = JSON.parse(fs.readFileSync("src/data/english.json", "utf-8"));

const updates = {
  // Day 61 (비전) — 엘스하이머
  60: {
    en: "Elsheimer painted the first realistic night sky in Western art, showing the Milky Way as a band of individual stars rather than a bright smear.",
    ko: "엘스하이머는 서양 미술 최초로 은하수를 밝은 얼룩이 아닌 개별 별들의 띠로 그려 사실적인 밤하늘을 표현했다.",
    note: "'rather than ~'은 '~가 아니라, ~보다는'이라는 뜻이야. 두 가지를 대조할 때 쓰는 표현으로, instead of와 비슷해."
  },
  // Day 63 (양심) — 조르주 드 라 투르
  62: {
    en: "La Tour painted the Penitent Magdalene by candlelight, using a single flame to reveal the quiet struggle of a woman confronting her own conscience.",
    ko: "라 투르는 촛불 하나로 참회하는 막달라 마리아를 그리며, 양심과 마주하는 여인의 고요한 내면적 갈등을 드러냈다.",
    note: "'confronting her own conscience'에서 confront는 '~와 마주하다, 직면하다'라는 뜻이야. face와 비슷하지만 더 적극적인 뉘앙스가 있어."
  },
  // Day 69 (위로) — 뭉크
  68: {
    en: "Munch painted The Sick Child six times throughout his life, returning again and again to the memory of his dying sister as a way of processing grief.",
    ko: "뭉크는 평생 동안 <아픈 아이>를 여섯 번이나 그렸으며, 죽어가는 누나의 기억으로 반복해서 돌아가 슬픔을 다루었다.",
    note: "'as a way of processing grief'에서 'as a way of ~'는 '~하는 방법으로서'야. process는 여기서 감정을 '처리하다, 소화하다'라는 뜻이야."
  },
  // Day 72 (소망) — 와츠
  71: {
    en: "In Watts's painting Hope, a blindfolded woman sits on a globe, playing a lyre with only one string left, yet still making music.",
    ko: "와츠의 그림 <희망>에서 눈이 가려진 여인이 지구 위에 앉아 줄 하나만 남은 리라로 여전히 음악을 만들어낸다.",
    note: "'yet still making music'에서 yet은 '그럼에도 불구하고'야. 'still'과 함께 쓰여 역경 속에서도 계속하는 모습을 강조해."
  },
  // Day 106 (건축) — 이상적인 도시
  105: {
    en: "The Renaissance painting of an Ideal City uses perfect perspective to create a vision of architectural harmony, with every building precisely aligned.",
    ko: "르네상스 시대의 <이상적인 도시>는 완벽한 원근법으로 모든 건물이 정확히 정렬된 건축적 조화의 비전을 만들어낸다.",
    note: "'with every building precisely aligned'는 'with + 목적어 + 과거분사' 구문이야. '모든 건물이 정확히 정렬된 채로'라는 부대상황을 나타내."
  },
  // Day 173 (전쟁) — 루벤스
  172: {
    en: "Rubens portrayed Mars breaking free from Venus's embrace and trampling books, instruments, and buildings beneath his feet, showing how war destroys civilization.",
    ko: "루벤스는 마르스가 비너스의 포옹을 뿌리치고 발아래 책, 악기, 건물을 짓밟는 모습을 그려 전쟁이 문명을 파괴하는 방식을 보여주었다.",
    note: "'breaking free from ~'은 '~에서 벗어나다, 탈출하다'라는 뜻이야. break free는 물리적·심리적 속박에서 벗어날 때 모두 쓸 수 있어."
  },
  // Day 185 (건강) — 도미에
  184: {
    en: "Daumier depicted ordinary workers bathing in the Seine River, reminding us that in the 19th century, access to basic hygiene was itself a matter of health.",
    ko: "도미에는 세느강에서 목욕하는 평범한 노동자들을 그리며, 19세기에는 기본적인 위생에 접근하는 것 자체가 건강의 문제였음을 상기시켜준다.",
    note: "'access to ~'는 '~에 대한 접근'이라는 뜻이야. access는 명사로 쓰일 때 항상 to와 함께 쓰여. 'a matter of ~'는 '~의 문제'야."
  },
  // Day 191 (긴장) — 고야
  190: {
    en: "In Goya's painting The Colossus, a giant figure rises above the clouds while terrified crowds scatter below, capturing the invisible tension of approaching war.",
    ko: "고야의 <거인>에서 거대한 인물이 구름 위로 솟아오르고 공포에 질린 군중이 아래에서 흩어지며, 다가오는 전쟁의 보이지 않는 긴장을 포착했다.",
    note: "'while terrified crowds scatter below'에서 while은 동시 동작을 나타내. 'terrified'는 '공포에 질린'으로, terrifying(공포를 주는)과 구분해서 써야 해."
  },
  // Day 202 (의지) — 도레
  201: {
    en: "Doré illustrated Don Quixote charging at windmills he believed were giants, portraying a man whose willpower could not be broken by defeat.",
    ko: "도레는 풍차를 거인이라 믿고 돌진하는 돈키호테를 묘사하며, 패배에도 꺾이지 않는 의지의 인간을 표현했다.",
    note: "'whose willpower could not be broken'에서 whose는 소유격 관계대명사야. 'could not be broken'은 수동태로 '꺾일 수 없었다'라는 뜻이야."
  },
  // Day 208 (거부) — 카노바
  207: {
    en: "Canova sculpted Cupid lifting Psyche with a kiss, showing a god who refused to obey his mother's command in order to save the one he loved.",
    ko: "카노바는 큐피드가 입맞춤으로 프시케를 일으키는 조각을 만들며, 사랑하는 사람을 구하기 위해 어머니의 명령을 거부한 신을 보여주었다.",
    note: "'in order to ~'는 '~하기 위해'라는 목적 표현이야. to부정사만 써도 되지만, in order to는 목적을 더 명확히 강조할 때 써."
  },
  // Day 209 (타협) — 샤르댕
  208: {
    en: "Chardin chose to paint humble still lifes in an era that valued grand history paintings, yet he earned the Academy's respect by mastering his own style.",
    ko: "샤르댕은 웅장한 역사화가 존중받던 시대에 소박한 정물화를 택했지만, 자신만의 스타일을 완성해 아카데미의 존경을 얻었다.",
    note: "'in an era that valued ~'에서 that은 관계대명사로 era를 수식해. 'earn respect'은 '존경을 얻다'라는 뜻으로 자주 쓰이는 콜로케이션이야."
  },
  // Day 211 (후회) — 무리요
  210: {
    en: "Murillo painted the Prodigal Son returning home in rags, only to be embraced by his father without a single word of blame.",
    ko: "무리요는 넝마를 걸치고 돌아온 탕자가 아버지에게 한마디 질책도 없이 포옹받는 모습을 그렸다.",
    note: "'only to be embraced'에서 'only to ~'는 '결국 ~하게 되다'라는 뜻이야. 예상 밖의 결과를 나타내. 'without a single word of ~'는 '~한 단 한마디도 없이'야."
  },
  // Day 213 (타인) — 신윤복
  212: {
    en: "Shin Yun-bok painted people from different social classes sharing the same space in a tavern, quietly challenging the rigid boundaries of Joseon society.",
    ko: "신윤복은 주막에서 다른 신분의 사람들이 같은 공간을 공유하는 모습을 그리며, 조선 사회의 엄격한 경계를 조용히 도전했다.",
    note: "'quietly challenging ~'는 현재분사구문으로 부가 설명을 해. quietly는 '조용히, 은연중에'라는 뜻으로, 직접적이 아닌 은근한 도전을 나타내."
  },
  // Day 264 (마무리) — 밀레이
  263: {
    en: "Millais painted four girls gathering autumn leaves at dusk, creating what critic John Ruskin called the most poetic painting in existence.",
    ko: "밀레이는 황혼에 가을 낙엽을 모으는 네 소녀를 그려, 비평가 존 러스킨이 세상에서 가장 시적인 그림이라 부른 작품을 만들었다.",
    note: "'what critic John Ruskin called ~'에서 what은 '~라고 부른 것'이라는 관계대명사야. 'in existence'는 '존재하는, 세상에 있는'이라는 뜻이야."
  },
  // Day 273 (분리) — 폴록
  272: {
    en: "Pollock separated painting from tradition by dripping paint onto a canvas laid on the floor, never letting the brush touch the surface.",
    ko: "폴록은 바닥에 놓인 캔버스 위에 물감을 흘리며 붓이 표면에 닿지 않게 해, 전통으로부터 회화를 분리시켰다.",
    note: "'never letting the brush touch the surface'에서 'let + 목적어 + 동사원형'은 '~가 ~하게 하다(허용하다)'야. never와 함께 '결코 ~하지 않게 했다'는 뜻이 돼."
  },
  // Day 274 (결합) — 클림트
  273: {
    en: "Klimt wrapped the two lovers in The Kiss within a single golden cloak, making it impossible to tell where one person ends and the other begins.",
    ko: "클림트는 <키스>에서 두 연인을 하나의 황금빛 망토로 감싸, 한 사람이 어디에서 끝나고 다른 사람이 어디서 시작하는지 구분할 수 없게 했다.",
    note: "'making it impossible to tell where ~'에서 make it + 형용사 + to부정사는 '~하는 것을 ~하게 만들다'야. tell은 여기서 '구분하다, 알아보다'라는 뜻이야."
  },
  // Day 275 (조율) — 드가
  274: {
    en: "Degas captured the orchestra pit from an unusual angle, showing musicians focused on their instruments while ballerinas danced on the stage above.",
    ko: "드가는 독특한 각도에서 오케스트라석을 포착하며, 음악가들이 악기에 집중하는 동안 위 무대에서 발레리나들이 춤추는 모습을 보여주었다.",
    note: "'from an unusual angle'에서 angle은 '각도, 시각'이야. 'while ballerinas danced'에서 while은 '~하는 동안'으로 동시 동작을 나타내."
  },
  // Day 328 (해체) — 블레이크
  327: {
    en: "Blake deconstructed traditional religious imagery by creating his own mythology, painting the Great Red Dragon as both terrifying and sublime.",
    ko: "블레이크는 자신만의 신화를 창조해 전통 종교 이미지를 해체했으며, 거대한 붉은 용을 공포스러우면서도 숭고하게 그렸다.",
    note: "'both terrifying and sublime'은 'both A and B' 패턴으로 '공포스러우면서도 숭고한'이라는 뜻이야. 대조적인 두 성질을 동시에 나타낼 때 써."
  }
};

let count = 0;
for (const [idx, update] of Object.entries(updates)) {
  const i = Number(idx);
  const artIdx = english[i].sentences.findIndex(s => s.source === "명화");
  if (artIdx !== -1) {
    english[i].sentences[artIdx].en = update.en;
    english[i].sentences[artIdx].ko = update.ko;
    english[i].sentences[artIdx].note = update.note;
    console.log(`Day ${i + 1} ✅ updated`);
    count++;
  } else {
    console.log(`Day ${i + 1} ⚠️ no 명화 sentence found`);
  }
}

fs.writeFileSync("src/data/english.json", JSON.stringify(english, null, 2) + "\n");
console.log(`\nDone! ${count}개 명화 영어 문장 업데이트 완료`);
