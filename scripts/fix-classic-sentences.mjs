import fs from 'fs';

const english = JSON.parse(fs.readFileSync('./src/data/english.json', 'utf8'));

const replacements = [
  {
    day: 21,
    en: "To love another person is to see the face of God.",
    ko: "다른 사람을 사랑한다는 것은 신의 얼굴을 보는 것이다.",
    note: "'to love'와 'to see'가 부정사(to+동사원형)로 대구를 이루고 있어. 'To + 동사'는 '~하는 것은'이라는 뜻으로 주어 역할을 해."
  },
  {
    day: 26,
    en: "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    ko: "고통과 괴로움은 위대한 지성과 깊은 마음을 가진 자에게 언제나 피할 수 없는 것이다.",
    note: "'inevitable'은 '피할 수 없는'이라는 뜻이야. 'for + 명사'는 '~에게'라는 대상을 나타내. a large intelligence는 '큰 지성(을 가진 사람)'이라는 환유 표현이야."
  },
  {
    day: 39,
    en: "I am no bird; and no net ensnares me: I am a free human being with an independent will.",
    ko: "나는 새가 아니에요; 어떤 그물도 나를 얽매지 못해��: 나는 독립적인 의지를 가진 자유로운 인간이에요.",
    note: "'no + 명사'는 '어떤 ~도 없다'는 강한 부정이야. ensnare는 '덫으로 잡다, 얽매다'라는 ��이야. 세미콜론(;)과 콜론(:)으로 세 문장을 이어 감정을 고조시켜."
  },
  {
    day: 41,
    en: "Let every man in mankind's frailty consider his last day; and let none presume on his good fortune until he find life, at its close, free from pain.",
    ko: "인간의 나약함 속에서 각자 자신의 마지막 날을 생각하라; 삶의 끝에서 고통 없이 자유로울 때까지 행운을 장담하지 말라.",
    note: "'Let + 목적어 + 동사원형'은 '~하게 하라'는 명령이야. 'presume on'은 '~을 당연시하다'라는 뜻이고, 'until he find'는 가정법으로 불확실성을 나타내."
  },
  {
    day: 42,
    en: "How it glittered, the wonderful forbidden fruit of knowledge — yet how much nobler to suffer than to go to ruin through it.",
    ko: "지식이라는 금지된 열매가 얼마나 반짝이던지 — 그러나 그것 때문에 망하느니 고통받는 편이 ���마나 더 고귀한가.",
    note: "'How + 형용사'는 감탄문이야. 'nobler to A than to B'는 'B보다 A가 더 고귀하다'는 비교 구문이야. 'go to ruin'은 '파멸에 이르다'라는 관용 표현이야."
  },
  {
    day: 49,
    en: "For all at last return to the sea — the beginning and the end.",
    ko: "결국 모든 것은 바다로 돌아간다 — 시작이자 끝인 그곳으로.",
    note: "'for'는 여기서 '왜냐하면/결국'이라는 접속사야. 'at last'는 '결국'이라는 부사구. the beginning and the end는 바다를 동격으로 설명하는 표현이야."
  },
  {
    day: 59,
    en: "We can never know what to want, because, living only one life, we can neither compare it with our previous lives nor perfect it in our lives to come.",
    ko: "우리는 무엇을 원해야 하는지 결코 알 수 없다. 왜냐하면 단 한 번의 삶을 살기에, 이전 삶과 비교할 수도, 다음 삶에서 완성할 수도 없기 때문이다.",
    note: "'what to want'는 '무엇을 원해야 하는지'라는 의문사+to부정사. 'neither A nor B'는 'A도 B도 아니다'라는 상관접속사야. 'lives to come'은 '앞으로 올 삶들'이라는 뜻이야."
  },
  {
    day: 62,
    en: "Once I dreamt I was a butterfly, fluttering happily. I did not know I was Zhuangzi. Suddenly I awoke, and there I was, Zhuangzi again. But I do not know whether I was Zhuangzi dreaming I was a butterfly, or a butterfly dreaming I was Zhuangzi.",
    ko: "옛날에 나는 꿈에서 나비가 되어 훨훨 날아다녔다. 내가 장주인 줄 몰랐다. 갑자기 깨어나니 장주였다. 그런데 내가 나비 꿈을 꾼 장주인지, 장주 꿈을 꾸는 나비인지 알 수 없다.",
    note: "'whether A or B'는 'A인지 B인지'라는 선택 의문이야. 'fluttering happily'는 현재분사로 동시 동작을 나타내. 이 유명한 '호접지몽'은 현실과 꿈의 경계를 묻는 철학적 질문이야."
  },
  {
    day: 66,
    en: "There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one.",
    ko: "이러한 생명관에는 장엄함이 있다 — 여러 힘이 본래 소수의 형태 또는 하나의 형태에 불어넣어졌다는 이 관점에.",
    note: "'grandeur'는 '장엄함'이라는 뜻의 고급 어휘야. 'having been breathed'는 완료 수동 분사구문으로 '불어넣어진 바 있는'이라는 뜻이야. 《종의 기원》의 마지막 문장이야."
  },
  {
    day: 67,
    en: "I am told there is nothing to equal it — that it is the very place to find buried treasure.",
    ko: "거기에 비할 데가 없다고들 한다 — 묻힌 보물을 찾기에 딱 좋은 곳이라고.",
    note: "'I am told'는 수동태로 '~라고 전해 듣다'라는 뜻이야. 'nothing to equal it'에서 to equal은 형용사적 용법의 부정사로 '그것에 비할 만한 것'을 뜻해."
  },
  {
    day: 69,
    en: "Death exists, not as the opposite but as a part of life.",
    ko: "죽음은 삶의 반대가 아니라, 삶의 일부로 존재한다.",
    note: "'not as A but as B'는 'A가 아니라 B로서'라는 대조 구문이야. 짧지만 삶과 죽음의 관계를 역설적으로 정의하는 강렬한 문장이야."
  },
  {
    day: 72,
    en: "Don't believe what your eyes are telling you. All they show is limitation. Look with your understanding.",
    ko: "네 눈이 말하는 것을 믿지 마. 눈이 보여주는 건 한계���이야. 이해의 눈으로 보아라.",
    note: "'what your eyes are telling you'는 명사절(관계대명사 what)로 '눈이 너에게 말하는 것'이야. 'All they show'에서 all은 주어, they show는 관계절이야."
  },
  {
    day: 78,
    en: "I tell you I must paint. I can't help myself. When I see beauty, I am compelled to try to capture it.",
    ko: "그림을 그려야 해. 어쩔 수가 없어. 아름다움을 보면, 그것을 포착하려 하지 않을 수 없어.",
    note: "'can't help myself'는 '자제할 수 없다'는 관용 표현이야. 'be compelled to'는 '~하지 않을 수 없다'는 수동태 표현으로 강한 내적 충동을 나타내."
  },
  {
    day: 79,
    en: "Capital is dead labor, which, vampire-like, lives only by sucking living labor.",
    ko: "자본은 죽은 노동이다. 흡혈귀처럼 살아 있는 노동을 빨아먹어야만 살 수 있다.",
    note: "'vampire-like'는 복합 형용사로 '흡혈귀 같은'이라는 비유야. 'which lives only by ~ing'에서 by는 수단/방법을 나타내. 마르크스 특유의 은유적 비판이야."
  },
  {
    day: 89,
    en: "The only way to get rid of a temptation is to yield to it. Resist it, and your soul grows sick with longing.",
    ko: "유혹을 없애는 유일한 방법은 그것에 굴복하는 거야. 저항하면, 영혼이 갈망으로 병들어.",
    note: "'get rid of'는 '~을 없애다'라는 구동사야. 'yield to'는 '~에 굴복하다'. 명령문 'Resist it'과 결과절을 쉼표로 이어 인과관계를 나타내."
  },
  {
    day: 96,
    en: "Everything that comes from nature will be true, as long as nothing from man is mixed with it.",
    ko: "자연에서 오는 모든 것은 진실할 것이다 — 인간의 것이 섞이지 않는 한.",
    note: "'Everything that comes from ~'는 관계대명사절이야. 'as long as'는 '~하는 한'이라는 조건절이야. 'nothing from man'은 '인간에게서 나온 것은 아무것도'라는 뜻이야. 루소의 자연 교육론 핵심이야."
  },
  {
    day: 102,
    en: "These are the times that try men's souls. The summer soldier and the sunshine patriot will shrink from the service of their country.",
    ko: "지금이야말로 인간의 영혼을 시험하는 시대다. 여름의 군인과 햇살의 애국자는 나라를 위한 봉사에서 움츠러들 것이다.",
    note: "'These are the times that ~'에서 that은 관계대명사로 times를 수식해. 'shrink from'은 '~에서 움츠러들다/회피하다'라는 뜻이야. 'summer soldier'는 좋을 때만 싸우는 사람을 비유해."
  },
  {
    day: 107,
    en: "The place I like best in this world is the kitchen. No matter where it is, no matter what kind, if it's a kitchen, it's fine with me.",
    ko: "이 세상에서 내가 가장 좋아하는 장소는 부엌이다. 어디에 있든, 어떤 종류든, 부엌이기만 하면 나는 좋다.",
    note: "'No matter where/what'은 '어디에 ~하든/어떤 ~이든'이라는 양보절이야. 'it's fine with me'는 '나는 괜찮다'라는 구어 표현이야. 《키친》의 유명한 첫 문장이야."
  },
  {
    day: 143,
    en: "I am the impurity that makes the zinc react, I am the grain of salt or mustard. Impurity, yes, but also the vital spark.",
    ko: "나는 아연을 반응시키는 불순물이다. 소금 한 톨, 겨자씨 한 알. 불순물, 그래, 하지만 또한 생명의 불꽃이다.",
    note: "'that makes the zinc react'는 관계대명사절로 불순물을 설명해. 'Impurity, yes, but also ~'는 양보와 역접을 결합한 수사적 표현이야. 레비는 화학 속 불순물에서 인생의 의미를 찾아."
  },
  {
    day: 150,
    en: "Action, the only activity that goes on directly between men, corresponds to the human condition of plurality.",
    ko: "행위는 인간들 사이에서 직접적으로 이루어지는 유일한 활동이며, 인간 조건인 다수성에 대응한다.",
    note: "'that goes on directly between men'은 관계대명사절이야. 'correspond to'는 '~에 대응하다'라는 뜻이야. 아렌트는 '행위(action)'를 인간의 가장 고유한 활동으로 봤어."
  },
  {
    day: 156,
    en: "All that is gold does not glitter; not all those who wander are lost.",
    ko: "반짝인다고 모두 금은 아니다; 방랑하는 모든 이가 길을 잃은 것은 아니다.",
    note: "'All that ~ does not'은 부분 부정으로 '~한 모두가 ~인 것은 아니다'야. 'those who ~'는 '~하는 사람들'. 톨킨이 쓴 시의 한 구절로, 아라곤의 정체를 암시해."
  },
  {
    day: 159,
    en: "The unexamined life is not worth living.",
    ko: "검토되지 않은 삶은 살 가치가 없다.",
    note: "'unexamined'은 'un+examine+ed'로 '검토되지 않은'이라는 과거분사 형용사야. 'be worth ~ing'는 '~할 가치가 있다'라는 표현이야. 소크라테스의 가장 유명한 말이야."
  },
  {
    day: 165,
    en: "When the legislative and executive powers are united in the same person, there can be no liberty.",
    ko: "입법권과 행정권이 같은 사람에게 합쳐지면, 자유란 존재할 수 없다.",
    note: "'When A are united in B'는 조건/시간절이야. 'there can be no ~'는 '~가 존재할 수 없다'는 강한 부정이야. 몽테스키외 삼권분립의 핵심 논거야."
  },
  {
    day: 166,
    en: "It's not easy to stand alone against the ridicule of others. So he gambled for support and I had to back him up.",
    ko: "다른 사람들의 조롱에 맞서 혼자 서는 건 쉬운 일이 아니야. 그래서 그는 지지를 얻으려 도박을 했고, 나는 그를 도와야 했어.",
    note: "'stand alone against'은 '~에 맞서 홀로 서다'야. 'gamble for'는 '~을 얻기 위해 모험하다'. 'back someone up'은 '~을 지지하다/돕다'라는 구동사야."
  },
  {
    day: 184,
    en: "There was a time I used to think very highly of the quality of loyalty. I don't mean that I no longer value loyalty, but I do think things are not quite so simple.",
    ko: "한때 나는 충성이라는 자질을 매우 높이 평가했다. 더 이상 충성을 소중히 여기지 않는다는 게 아니라, 일이 그렇게 단순하지만은 않다는 뜻이다.",
    note: "'There was a time I used to ~'는 '한때 ~하곤 했다'는 과거 습관 표현이야. 'I don't mean that ~'는 오해를 바로잡는 표현이야. 'not quite so simple'은 완곡한 부정이야."
  },
  {
    day: 191,
    en: "The best moments in our lives are not the passive, receptive, relaxing times. The best moments usually occur when a person's body or mind is stretched to its limits in a voluntary effort to accomplish something difficult and worthwhile.",
    ko: "인생 최고의 순간은 수동적이고 편안한 시간이 아니다. 최고의 순간은 대개 어렵고 가치 있는 일을 자발적으로 이루려 할 때, 몸과 마음이 한계까지 뻗어나갈 때 찾아온다.",
    note: "'stretched to its limits'는 '한계까지 뻗어나간'이라는 은유야. 'voluntary effort'는 '자발적 노력'. 칙센트미하이의 '몰입(flow)' 개념의 핵심 정의야."
  },
  {
    day: 202,
    en: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.",
    ko: "인간에게서 모든 것을 빼앗을 수 있지만 한 가지는 빼앗을 수 없다: 인간의 마지막 자유 — 어떤 상황에서든 자신의 태도를 선택하는 것.",
    note: "'Everything ~ but one thing'은 '한 가지를 제외한 모든 것'이라는 구문이야. 대시(—) 뒤에 동격으로 'the last freedom'을 설명해. 프랭클의 핵심 메시지야."
  },
  {
    day: 212,
    en: "We are sun and moon, dear friend; we are sea and land. Our goal is not to become each other; it is to recognize each other, to learn to see the other and honor him for what he is.",
    ko: "우리는 해와 달이야, 친구여. 우리는 바다와 땅이야. 우리의 목표는 서로가 되는 것이 아니라, 서로를 알아보고 상대를 있는 그대로 보고 존중하는 것이야.",
    note: "'not to A; it is to B'는 'A가 아니라 B이다'라는 대조 구문이야. 'honor him for what he is'에서 'for what he is'는 '있는 그대로의 모습 때문에'라는 뜻이야."
  },
  {
    day: 213,
    en: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
    ko: "인간은 자유롭도록 선고받았다; 왜냐하면 일단 세계에 던져지면, 자신이 하는 모든 것에 책임져야 하기 때문이다.",
    note: "'be condemned to'는 원래 '~하도록 선고받다'인데, 자유가 형벌처럼 주어진다는 역설이야. 'once thrown'은 분사구문으로 '일단 던져지면'이라는 뜻이야."
  },
  {
    day: 222,
    en: "Not only does God play dice, but He sometimes throws them where they cannot be seen.",
    ko: "신은 주사위 놀이를 할 뿐만 아니라, 때때로 보이지 않는 곳에 던지기도 한다.",
    note: "'Not only does ~'는 부정어 도치 구문으로 강조야. 아인슈타인의 '신은 주사위를 던지지 않는다'에 대한 호킹의 유명한 반박이야. 'where they cannot be seen'은 관계부사절이야."
  },
  {
    day: 223,
    en: "The Earth is more than just a planet; it is a self-regulating system made up of the totality of organisms and their environment.",
    ko: "지구는 단순한 행성 이상이다; 생물 전체와 그 환경으로 이루어진 자기 조절 시스템이다.",
    note: "'more than just ~'는 '단순한 ~ 이상'이라는 뜻이야. 'made up of'는 '~으로 구성된'이라는 과거분사구. 'the totality of'는 '~의 전체'라는 뜻이야. 가이아 가설의 핵심이야."
  },
  {
    day: 224,
    en: "We abuse land because we regard it as a commodity belonging to us. When we see land as a community to which we belong, we may begin to use it with love and respect.",
    ko: "우리는 땅을 우리에게 속한 상품으로 여기기에 남용한다. 땅을 우리가 속한 공동체로 볼 때, 비로소 사랑과 존경으로 쓰기 시작할 수 있다.",
    note: "'belonging to us' vs 'to which we belong'의 대비가 핵심이야 — 땅이 우리에게 속하는 게 아니라, 우리가 땅에 속한다는 역전. 레오폴드의 '대지 윤리'의 핵심 문장이야."
  },
  {
    day: 236,
    en: "What I'm not sure about is whether our lives have been so different from the lives of the people we do save.",
    ko: "내가 확신하지 못하는 것은, 우리의 삶이 우리가 구해주는 사람들의 삶과 과연 그렇게 달랐느냐 하는 것이다.",
    note: "'What I'm not sure about'은 관계대명사 what이 이끄는 명사절이 주어야. 'so different from'은 '~와 그렇��� 다른'이라는 비교 표현이야. 복제인간의 존재 의문을 담은 문장이야."
  },
  {
    day: 247,
    en: "Computers are not about computing anymore. They are about living.",
    ko: "컴퓨터는 더 이상 계산에 관한 것이 아니다. 삶에 관한 것이다.",
    note: "'be about ~'는 '~에 관한 것이다'라는 뜻이야. 'not anymore'는 '더 이상 ~이 아니다'. 니콜라스 네그로폰테의 말을 인용한 것으로, 기술과 삶의 관계를 함축적으로 표현해."
  },
  {
    day: 256,
    en: "What counts in a man's life is not that he was defeated, but that he fought greatly.",
    ko: "인간의 삶에서 중요한 것은 패배했다는 사실이 아니라, 위대하게 싸웠다는 사실이다.",
    note: "'What counts'는 '중요한 것'이라는 관계대명사절이야. 'not that A, but that B'는 'A가 아니라 B이다'라는 대조 구문이야. 롤랑이 베토벤의 삶을 요약한 문장이야."
  },
  {
    day: 259,
    en: "I think, therefore I am.",
    ko: "나는 생각한다, 고로 존재한다.",
    note: "'therefore'는 '그러므로'라는 접속부사야. 'I am'은 존재 동사로 '나는 존재한다'는 뜻이야. 데카르트 철학의 출발점이자 서양 근대 철학의 가장 유명한 명제야."
  },
  {
    day: 261,
    en: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good.",
    ko: "연습은 잘해진 다음에 하는 것이 아니야. 연습이 바로 너를 잘하게 만드는 거야.",
    note: "'the thing you do once you're good' vs 'the thing you do that makes you good'의 대비가 핵심이야. 'once'는 '일단 ~하면', 'that makes you good'은 관계절이야. 글래드웰의 1만 시간 법칙을 함축해."
  },
  {
    day: 274,
    en: "One is not born, but rather becomes, a woman.",
    ko: "여자는 태어나는 것이 아니라, 만들어지는 것이다.",
    note: "'not A, but rather B'는 'A가 아니라 오히려 B이다'라는 대조 구문이야. 수동적 의미 없이 'becomes'(~이 된다)를 사용해 사회적 구성을 강조해. 《제2의 성》의 가장 유명한 문장이야."
  },
  {
    day: 278,
    en: "Do not be daunted by the enormity of the world's grief. Do justly now, love mercy now, walk humbly now. You are not obligated to complete the work, but neither are you free to abandon it.",
    ko: "세상의 슬픔의 거대함에 주눅 들지 마라. 지금 정의롭게 행하고, 지금 자비를 사랑하고, 지금 겸손히 걸어라. 너는 그 일을 완수할 의무는 없지만, 포기할 자유도 없다.",
    note: "'be daunted by'는 '~에 주눅 들다'야. 'neither are you free to ~'는 부정 도치로 '~할 자유도 없다'는 뜻이야. 탈무드의 핵심 가르침을 담은 문장이야."
  },
  {
    day: 285,
    en: "A man's liberty is worth more than all the gold in the world.",
    ko: "한 사람의 자유는 세상의 모든 황금보다 가치가 있다.",
    note: "'be worth more than'은 '~보다 더 가치가 있다'는 비교 표현이야. 'all the gold in the world'는 최상급 표현으로 자유의 절대적 가치를 강조해."
  },
  {
    day: 287,
    en: "The past is hidden somewhere outside the realm of our intellect, in some material object which we do not suspect.",
    ko: "과거는 우리 지성의 영역 밖 어딘가에, 우리가 예상치 못한 어떤 물질적 대상 속에 숨어 있다.",
    note: "'outside the realm of'는 '~의 영역 밖에'라는 뜻이야. 'which we do not suspect'는 관계대명사절로 '우리가 예상하지 못하는'이야. 프루스트의 무의지적 기억 이론의 핵심이야."
  },
  {
    day: 288,
    en: "He who ruled scent ruled the hearts of men. Odors have a power of persuasion stronger than that of words.",
    ko: "향기를 지배하는 자가 사람들의 마음을 지배했다. 냄새에는 말보다 강한 설득력이 있다.",
    note: "'He who ~'는 '~하는 자'라는 관계대명사 구문이야. 'a power of persuasion stronger than that of words'에서 that은 대명사로 power를 대체해. 《향수》의 ��심 주제야."
  },
  {
    day: 291,
    en: "The insect does not aim at gathering riches; it aims at storing up for the hour of need.",
    ko: "곤충은 부를 모으는 것을 목표로 하지 않는다; 필요한 때를 위해 저장하는 것을 목표로 한다.",
    note: "'aim at ~ing'는 '~하는 것을 목표로 하다'라는 뜻이야. 'the hour of need'는 '필요한 때'라는 관용 표현이야. 세미콜론(;)이 대비를 나타내."
  },
  {
    day: 292,
    en: "Over himself, over his own body and mind, the individual is sovereign.",
    ko: "자기 자신, 자기 자신의 몸과 정신에 대해서 개인은 주권자다.",
    note: "'Over himself'가 문두에 놓여 강조된 도치 구문이야. 'sovereign'은 '주권자, 절대 권력자'라는 뜻이야. 밀의 자유론 핵심 원칙인 '위해 원칙'의 근거야."
  },
  {
    day: 295,
    en: "He was going to live forever, or die in the attempt.",
    ko: "그는 영원히 살 거였다, 아니면 그 시도 중에 죽을 거였다.",
    note: "'or die in the attempt'는 '아니면 시도하다 죽거나'라는 뜻이야. 영원히 살겠다는 모순적 결심이 캐치-22의 부조리한 유머를 잘 보여줘."
  },
  {
    day: 296,
    en: "When the clear light of reality dawns, recognize it without fear — it is your own true nature.",
    ko: "실재의 맑은 빛이 밝아올 때, 두려움 없이 그것을 알아차려라 — 그것이 바로 너의 참된 본성이다.",
    note: "'When ~ dawns'는 시간절로 'dawn'은 '밝아오다'라는 뜻이야. 'recognize it without fear'는 명령문이야. 대시 뒤의 'it is ~'는 깨달음의 내용을 설명해."
  },
  {
    day: 301,
    en: "The sense of smell, more than any other sense, has the power to recall the past with an emotional force that is almost painful.",
    ko: "후각은 다른 어떤 감각보다, 거의 고통스러울 정도의 감정적 힘으로 ��거를 불러일으키는 능력을 가지고 있다.",
    note: "'more than any other sense'는 최상급 의미의 비교 표현이야. 'with an emotional force that ~'에서 that은 force를 수식하는 관계대명사야."
  },
  {
    day: 302,
    en: "Tell me what you eat, and I will tell you what you are.",
    ko: "당신이 무엇을 먹는지 말해 보라, 그러면 당신이 어떤 사람인지 말해 주겠다.",
    note: "'Tell me what you eat'는 명령문 + 간접의문문이야. 'what you are'는 '당신이 어떤 사람인지'라는 뜻이야. 브리야사바랭의 가장 유명한 격언이야."
  },
  {
    day: 314,
    en: "Any intelligent fool can make things bigger, more complex. It takes a touch of genius — and a lot of courage — to move in the opposite direction.",
    ko: "똑똑한 바보라면 누구나 더 크고 복잡하게 만들 수 있다. 반대 방향으로 가려면 약간의 천재성과 — 많은 용기가 — 필요하다.",
    note: "'Any intelligent fool'은 모순어법(oxymoron)으로 '똑똑하지만 어리석은 자'야. 'It takes ~'는 '~가 필요하다'라는 구문이야. 대시(—)가 삽입절을 만들어 'courage'를 강조해."
  },
  {
    day: 322,
    en: "People's ability to understand the factors that affect their behavior is surprisingly poor.",
    ko: "자신의 행동에 영향을 미치는 요인을 이해하는 사람들의 능력은 놀라울 정도로 형편없다.",
    note: "'the factors that affect their behavior'는 관계대명사절이야. 'surprisingly poor'에서 부사 surprisingly가 형용사 poor를 수식해 '놀라울 정도로 나쁜'이라는 뜻이야."
  },
  {
    day: 327,
    en: "To be self-contented is to be vile and ignorant, and no one ought to be satisfied with what he is.",
    ko: "자기만족은 비열하고 무지한 것이며, 자신이 무엇인지에 만족해서는 안 된다.",
    note: "'To be self-contented'는 부정사가 주어인 구문이야. 'no one ought to'는 '아무도 ~해서는 안 된다'는 의무의 부정이야. 2차원 존재가 3차원을 깨닫는 순간의 교훈이야."
  },
  {
    day: 334,
    en: "All right, then, I'll go to hell — and tore it up.",
    ko: "좋아, 그렇다면 나는 지옥에 가겠어 — 하고는 그 편지를 찢어버렸다.",
    note: "'All right, then'은 결심을 나타내는 구어 표현이야. 'tore it up'은 과거형으로 '찢어버렸다'. 허크가 짐을 신고하는 편지를 찢는 장면으로, 양심과 사회 도덕의 충돌을 보여줘."
  },
  {
    day: 335,
    en: "Borders? I have never seen one. But I have heard they exist in the minds of some people.",
    ko: "국경? 나는 한 번도 본 적이 없다. 하지만 어떤 사람들의 마음속에 존재한다고 들었다.",
    note: "'I have never seen one'는 현재완료 경험 용법이야. 'I have heard they exist'에서 heard 뒤에 접속사 that이 생략됐어. 헤위에르달의 탐험 정신을 담은 문장이야."
  },
  {
    day: 356,
    en: "I felt myself destined for reverie rather than for action, and solitude, which had always been my natural inclination, became necessary to me.",
    ko: "나는 행동보다는 몽상을 위해 태어난 존재라 느꼈고, 항상 나의 타고난 성향이었던 고독이 내게 필수가 되었다.",
    note: "'destined for A rather than for B'는 'B가 아니라 A를 위해 태어난'이라는 대비 구문이야. 'which had always been ~'은 계속적 관계대명사절로 solitude를 부연 설명해."
  }
];

let changed = 0;
replacements.forEach(r => {
  const idx = r.day - 1;
  const sent = english[idx].sentences.find(s => s.source === '고전');
  if (sent) {
    sent.en = r.en;
    sent.ko = r.ko;
    sent.note = r.note;
    changed++;
  }
});

fs.writeFileSync('./src/data/english.json', JSON.stringify(english, null, 2), 'utf8');
console.log(`교체 완료: ${changed}건`);
