import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';

const arts = JSON.parse(readFileSync('src/data/arts.json', 'utf-8'));

const fixes = [
  // ── DUPLICATES (new artwork) ──
  {
    day: 177, reason: 'duplicate(141)',
    replace: {
      title: '환전상과 그의 아내',
      artist: '퀸틴 마시스',
      year: 1514,
      desc: '마시스는 돈을 세는 환전상 옆에서 기도서를 넘기다 멈춘 아내를 그렸어. 저울 위 동전과 펼쳐진 성경이 물질과 신앙 사이의 균형을 상징해. 작은 볼록 거울에 비친 창밖 풍경은 세상의 진짜 가치를 돌아보게 만드는 장치야.',
      source_url: 'https://en.wikipedia.org/wiki/The_Moneylender_and_His_Wife_(Matsys)',
      source_label: 'Wikipedia'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Massysm_Quentin_%E2%80%94_The_Moneylender_and_his_Wife_%E2%80%94_1514.jpg/960px-Massysm_Quentin_%E2%80%94_The_Moneylender_and_his_Wife_%E2%80%94_1514.jpg',
  },
  {
    day: 305, reason: 'duplicate(13 아테네학당)',
    replace: {
      title: '이상적 도시',
      artist: '피에로 델라 프란체스카 (추정)',
      year: 1480,
      desc: '완벽한 원근법으로 그려진 이 이상적 도시는 르네상스 건축의 조화를 보여줘. 중앙의 원형 건물을 중심으로 좌우 대칭 배치된 건물들이 수학적 비례와 질서의 아름다움을 표현해. 누가 그렸는지 확실하지 않지만, 르네상스 이상을 가장 잘 담은 작품이야.',
      source_url: 'https://en.wikipedia.org/wiki/The_Ideal_City_(painting)',
      source_label: 'Wikipedia'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Formerly_Piero_della_Francesca_-_Ideal_City_-_Galleria_Nazionale_delle_Marche_Urbino.jpg/960px-Formerly_Piero_della_Francesca_-_Ideal_City_-_Galleria_Nazionale_delle_Marche_Urbino.jpg',
  },
  {
    day: 306, reason: 'duplicate(6 메두사의뗏목)',
    replace: {
      title: '이반 뇌제와 그의 아들',
      artist: '일리야 레핀',
      year: 1885,
      desc: '레핀은 분노에 휩싸여 아들을 죽인 직후의 이반 뇌제를 그렸어. 피 흘리는 아들을 끌어안은 아버지의 공포에 질린 눈은 돌이킬 수 없는 충돌의 결과를 보여줘. 격정이 낳은 비극이 화면 전체를 뒤덮는 걸작이야.',
      source_url: 'https://en.wikipedia.org/wiki/Ivan_the_Terrible_and_His_Son_Ivan',
      source_label: 'Wikipedia'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/REPIN_Ivan_Terrible%26Ivan.jpg',
  },
  {
    day: 362, reason: 'duplicate(17 오필리아)',
    replace: {
      title: '카네이션, 백합, 백합, 장미',
      artist: '존 싱어 사전트',
      year: 1886,
      desc: '사전트는 해질 무렵 정원에서 일본식 등불 사이로 꽃을 다루는 두 소녀를 그렸어. 백합과 장미 꽃잎이 가득한 화면은 자연광이 사라지는 순간의 찬란함을 포착하고 있어. 매일 같은 시간에만 작업해 완성하는 데 2년이 걸렸대.',
      source_url: 'https://en.wikipedia.org/wiki/Carnation,_Lily,_Lily,_Rose',
      source_label: 'Wikipedia'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/John_Singer_Sargent_-_Carnation%2C_Lily%2C_Lily%2C_Rose_-_Google_Art_Project.jpg/960px-John_Singer_Sargent_-_Carnation%2C_Lily%2C_Lily%2C_Rose_-_Google_Art_Project.jpg',
  },
  {
    day: 364, reason: 'duplicate(83 프리마베라)',
    replace: {
      title: '베리 공작의 매우 호화로운 기도서 — 4월',
      artist: '랭부르 형제',
      year: 1416,
      desc: '랭부르 형제의 기도서 4월 페이지는 봄날 귀족들의 약혼 장면과 새싹이 돋는 초록 정원을 담았어. 세밀한 식물 묘사와 새파란 하늘은 중세 사람들이 봄의 재생을 얼마나 경이롭게 여겼는지 보여줘.',
      source_url: 'https://en.wikipedia.org/wiki/Tr%C3%A8s_Riches_Heures_du_Duc_de_Berry',
      source_label: 'Wikipedia'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_avril.jpg/960px-Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_avril.jpg',
  },
  {
    day: 358, reason: 'bad image + replace (no good PD image)',
    replace: {
      title: '사과 수확',
      artist: '카미유 피사로',
      year: 1888,
      desc: '피사로는 에라니 과수원에서 사과를 따는 농부들을 밝은 인상주의 색채로 그렸어. 씨앗에서 시작된 나무가 열매를 맺는 수확의 순간을 따뜻한 오후 빛 속에서 포착했지. 농촌의 일상이 곧 자연의 순환임을 보여주는 작품이야.',
      source_url: 'https://commons.wikimedia.org/wiki/File:Apple_Harvest_by_Camille_Pissarro.jpg',
      source_label: 'Wikimedia Commons'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Apple_Harvest_by_Camille_Pissarro.jpg/960px-Apple_Harvest_by_Camille_Pissarro.jpg',
  },

  // ── IMAGE FIXES (same artwork, better source) ──
  {
    day: 299, reason: 'bad image (photo collage)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/The_Lady_and_the_unicorn_Hearing.jpg',
    updateSource: { source_url: 'https://en.wikipedia.org/wiki/The_Lady_and_the_Unicorn', source_label: 'Wikipedia' }
  },
  {
    day: 332, reason: 'bad image (text fragment)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Jan_Mostaert_-_Landscape_with_a_Scene_of_the_Conquest_of_America.jpg/960px-Jan_Mostaert_-_Landscape_with_a_Scene_of_the_Conquest_of_America.jpg',
    updateSource: { source_url: 'https://commons.wikimedia.org/wiki/File:Jan_Mostaert_-_Landscape_with_a_Scene_of_the_Conquest_of_America.jpg', source_label: 'Wikimedia Commons' }
  },
  {
    day: 343, reason: 'bad image (close-up only)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Detail-Procession_of_the_Youngest_King_by_Benozzo_Gozzoli-Cappella_dei_Magi-Palazzo_Medici_Riccardi-Florence.jpg/960px-Detail-Procession_of_the_Youngest_King_by_Benozzo_Gozzoli-Cappella_dei_Magi-Palazzo_Medici_Riccardi-Florence.jpg',
    updateSource: { source_url: 'https://en.wikipedia.org/wiki/Journey_of_the_Magi_(Gozzoli)', source_label: 'Wikipedia' }
  },
  {
    day: 352, reason: 'bad image (book page with ruler)',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Buchdrucker-1568.png',
    updateSource: { source_url: 'https://commons.wikimedia.org/wiki/File:Buchdrucker-1568.png', source_label: 'Wikimedia Commons' }
  },
];

async function downloadAndConvert(url, outputPath) {
  console.log(`  다운로드 중...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DailySeed/1.0 (Educational project)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`  원본: ${(buffer.length / 1024).toFixed(0)}KB`);

  await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outputPath);

  const size = readFileSync(outputPath).length;
  console.log(`  → ${(size / 1024).toFixed(0)}KB webp`);
  return size;
}

async function main() {
  let success = 0, fail = 0;

  for (const fix of fixes) {
    const idx = fix.day - 1;
    const imgPath = `public/images/arts/day-${fix.day}.webp`;
    console.log(`\nDay ${fix.day} (${fix.reason})`);

    try {
      await downloadAndConvert(fix.imageUrl, imgPath);

      if (fix.replace) {
        // Full replacement
        arts[idx] = { ...arts[idx], ...fix.replace, image: `/images/arts/day-${fix.day}.webp` };
        console.log(`  ✅ 교체: ${fix.replace.title} — ${fix.replace.artist}`);
      } else if (fix.updateSource) {
        // Image fix + source update
        arts[idx] = { ...arts[idx], ...fix.updateSource };
        console.log(`  ✅ 이미지 수정: ${arts[idx].title}`);
      }
      success++;
    } catch (err) {
      console.error(`  ❌ 실패: ${err.message}`);
      fail++;
    }
  }

  writeFileSync('src/data/arts.json', JSON.stringify(arts, null, 2));
  console.log(`\n=== 완료: ${success}건 성공, ${fail}건 실패 ===`);
}

main();
