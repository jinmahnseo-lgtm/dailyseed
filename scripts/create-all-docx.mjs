import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  Document, Packer, Paragraph, TextRun, PageBreak, ImageRun,
  Header, Footer, PageNumber, AlignmentType,
  HeadingLevel, TableOfContents, BorderStyle,
} from "docx";

const DATA = path.resolve("src/data");
const OUT = path.resolve("out/docx");
const IMG = path.resolve("out/images/arts");

const themes = JSON.parse(fs.readFileSync(path.join(DATA, "themes.json"), "utf8"));
const news = JSON.parse(fs.readFileSync(path.join(DATA, "news.json"), "utf8"));
const classics = JSON.parse(fs.readFileSync(path.join(DATA, "classics.json"), "utf8"));
const arts = JSON.parse(fs.readFileSync(path.join(DATA, "arts.json"), "utf8"));
const worlds = JSON.parse(fs.readFileSync(path.join(DATA, "worlds.json"), "utf8"));
const whys = JSON.parse(fs.readFileSync(path.join(DATA, "whys.json"), "utf8"));
const english = JSON.parse(fs.readFileSync(path.join(DATA, "english.json"), "utf8"));

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// --- Shared helpers ---
const STYLES = {
  default: { document: { run: { font: "맑은 고딕", size: 22 } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 36, bold: true, font: "맑은 고딕", color: "1F4E79" },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: "맑은 고딕", color: "2E75B6" },
      paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: "맑은 고딕", color: "404040" },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
    },
  ],
};

const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 },
};

function makeHeader(title) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 4 } },
        children: [new TextRun({ text: `DailySeed - ${title}`, size: 18, color: "808080", font: "맑은 고딕" })],
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" }),
          new TextRun({ text: " / ", size: 18, color: "808080" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "808080" }),
        ],
      }),
    ],
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, ...opts })],
  });
}
function bold(label, text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun({ text: ` ${text}` }),
    ],
  });
}
function multiline(text) {
  if (!text || typeof text !== "string") return [];
  return text.split("\n").filter(Boolean).map(line => p(line));
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function makeTocSection(title, headerTitle) {
  return {
    properties: { page: PAGE },
    headers: { default: makeHeader(headerTitle) },
    footers: { default: makeFooter() },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: title, bold: true, size: 52, font: "맑은 고딕", color: "1F4E79" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "DailySeed - 매일의 씨앗", size: 28, color: "808080" })],
      }),
      new TableOfContents("목차", { hyperlink: true, headingStyleRange: "1-2" }),
      pageBreak(),
    ],
  };
}

function makeContentSection(children, headerTitle) {
  return {
    properties: { page: PAGE },
    headers: { default: makeHeader(headerTitle) },
    footers: { default: makeFooter() },
    children,
  };
}

async function saveDoc(doc, filename) {
  const buffer = await Packer.toBuffer(doc);
  const fp = path.join(OUT, filename);
  fs.writeFileSync(fp, buffer);
  console.log(`  -> ${fp} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
}

// --- 1. News ---
async function createNews() {
  console.log("1/6 뉴스...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const n = news[i];
    if (!n) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));
    children.push(h2(n.title));
    children.push(...multiline(n.summary));
    children.push(h3("시사점"));
    children.push(...multiline(n.insight));
    if (n.glossary?.length) {
      children.push(h3("시사용어"));
      for (const g of n.glossary) {
        children.push(bold(`${g.term}:`, g.def));
      }
    }
    if (n.debate) {
      children.push(h3("찬반토론"));
      children.push(bold("주제:", n.debate.topic));
      children.push(bold("찬성:", n.debate.pro));
      children.push(bold("반대:", n.debate.con));
    }
    if (n.question) {
      children.push(h3("생각해보기"));
      children.push(p(n.question));
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 뉴스", "뉴스"), makeContentSection(children, "뉴스")],
  });
  await saveDoc(doc, "뉴스.docx");
}

// --- 2. Classics ---
async function createClassics() {
  console.log("2/6 고전...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const c = classics[i];
    if (!c) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));
    children.push(h2(`${c.title} (${c.author}, ${c.year})`));
    children.push(...multiline(c.summary));
    if (c.author_bio) {
      children.push(h3("작가 소개"));
      children.push(...multiline(c.author_bio));
    }
    if (c.historical_context) {
      children.push(h3("작품 배경"));
      children.push(...multiline(c.historical_context));
    }
    if (c.question) {
      children.push(h3("생각해보기"));
      children.push(p(c.question));
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 고전", "고전"), makeContentSection(children, "고전")],
  });
  await saveDoc(doc, "고전.docx");
}

// --- 3. Arts (with images) ---
async function createArts() {
  console.log("3/6 예술 (이미지 변환 포함)...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const a = arts[i];
    if (!a) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));
    children.push(h2(`${a.title} - ${a.artist} (${a.year}, ${a.country})`));

    // Image
    const imgPath = path.join(IMG, `day-${i + 1}.webp`);
    if (fs.existsSync(imgPath)) {
      try {
        const pngBuf = await sharp(imgPath).resize({ width: 500, withoutEnlargement: true }).png().toBuffer();
        const meta = await sharp(pngBuf).metadata();
        const w = meta.width || 500;
        const h = meta.height || 400;
        const scale = Math.min(400 / w, 500 / h);
        const dw = Math.round(w * scale);
        const dh = Math.round(h * scale);
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 200 },
            children: [
              new ImageRun({
                type: "png",
                data: pngBuf,
                transformation: { width: dw, height: dh },
                altText: { title: a.title, description: `${a.title} by ${a.artist}`, name: `day-${i + 1}` },
              }),
            ],
          })
        );
      } catch (e) {
        console.log(`    이미지 변환 실패 day-${i + 1}: ${e.message}`);
      }
    }

    if (a.source_label) {
      children.push(p(`출처: ${a.source_label}`, { size: 18, color: "808080", italics: true }));
    }

    children.push(h3("작품 이야기"));
    children.push(...multiline(a.story));
    children.push(h3("감상 포인트"));
    children.push(...multiline(a.look_for));
    children.push(h3("알고 보면 더 재미있는"));
    children.push(...multiline(a.fun_fact));
    if (a.question) {
      children.push(h3("생각해보기"));
      children.push(p(a.question));
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 예술", "예술"), makeContentSection(children, "예술")],
  });
  await saveDoc(doc, "예술.docx");
}

// --- 4. World ---
async function createWorld() {
  console.log("4/6 세계...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const w = worlds[i];
    if (!w) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));
    children.push(h2(`${w.flag} ${w.country} - ${w.title}`));
    children.push(p(`지역: ${w.region}`, { italics: true, color: "808080" }));
    children.push(...multiline(w.story));
    if (w.culture_point) {
      children.push(h3("문화 포인트"));
      children.push(...multiline(w.culture_point));
    }
    if (w.food) {
      children.push(h3("음식"));
      children.push(...multiline(w.food));
    }
    if (w.fun_fact) {
      children.push(h3("놀라운 사실"));
      children.push(...multiline(w.fun_fact));
    }
    if (w.quiz) {
      children.push(h3("퀴즈"));
      children.push(bold("Q:", w.quiz.question));
      w.quiz.options.forEach((opt, idx) => {
        const marker = idx === w.quiz.answer ? "(정답) " : "";
        children.push(p(`  ${idx + 1}. ${marker}${opt}`));
      });
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 세계", "세계"), makeContentSection(children, "세계")],
  });
  await saveDoc(doc, "세계.docx");
}

// --- 5. Why ---
async function createWhy() {
  console.log("5/6 과학...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const w = whys[i];
    if (!w) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));
    children.push(h2(`${w.emoji || ""} ${w.question}`));
    children.push(bold("한 줄 답:", w.short_answer));
    if (w.deep_dive) {
      children.push(h3("깊이 알아보기"));
      children.push(...multiline(w.deep_dive));
    }
    if (w.experiment) {
      children.push(h3("직접 해보기"));
      children.push(...multiline(w.experiment));
    }
    if (w.mind_blown) {
      children.push(h3("놀라운 사실"));
      children.push(...multiline(w.mind_blown));
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 과학", "과학"), makeContentSection(children, "과학")],
  });
  await saveDoc(doc, "과학.docx");
}

// --- 6. English ---
function getSourceLabel(source, dayIndex) {
  const map = {
    "고전": { data: classics, field: "title" },
    "명화": { data: arts, field: "title" },
    "예술": { data: arts, field: "title" },
    "세계문화": { data: worlds, field: "country" },
    "세계": { data: worlds, field: "country" },
    "왜왜왜": { data: whys, field: "question" },
    "과학": { data: whys, field: "question" },
  };
  const m = map[source];
  if (m && m.data[dayIndex]) {
    const sub = m.data[dayIndex][m.field];
    if (sub) return `${source} - ${sub}`;
  }
  return source;
}

async function createEnglish() {
  console.log("6/6 영어...");
  const children = [];
  for (let i = 0; i < 365; i++) {
    const t = themes[i];
    const e = english[i];
    if (!e) continue;
    if (i > 0) children.push(pageBreak());
    children.push(h1(`Day ${i + 1} - ${t.keyword}`));

    if (e.sentences?.length) {
      children.push(h2("핵심 문장"));
      for (const s of e.sentences) {
        const label = getSourceLabel(s.source, i);
        children.push(h3(`${s.emoji || ""} ${label}`));
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: s.en, bold: true, size: 23 })],
          })
        );
        children.push(p(s.ko, { color: "555555" }));
        if (s.note) {
          children.push(p(`문법: ${s.note}`, { italics: true, size: 20, color: "808080" }));
        }
      }
    }

    if (e.vocab?.length) {
      children.push(h2("단어"));
      for (const v of e.vocab) {
        children.push(bold(`${v.word}:`, v.meaning));
      }
    }
  }
  const doc = new Document({
    styles: STYLES,
    sections: [makeTocSection("오늘의 영어", "영어"), makeContentSection(children, "영어")],
  });
  await saveDoc(doc, "영어.docx");
}

// --- Run all ---
async function main() {
  console.log("Word 문서 생성 시작...\n");
  await createNews();
  await createClassics();
  await createArts();
  await createWorld();
  await createWhy();
  await createEnglish();
  console.log("\n모든 문서 생성 완료! -> out/docx/");
}

main().catch(e => { console.error(e); process.exit(1); });
