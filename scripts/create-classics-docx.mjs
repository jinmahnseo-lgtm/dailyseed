import { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, PageBreak, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const classics = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'classics.json'), 'utf-8'));
const themes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'themes.json'), 'utf-8'));
const themeByDay = themes.map(t => t.keyword);

// 텍스트를 \n 기준으로 여러 Paragraph로 변환
function textToParagraphs(text, options = {}) {
  const { fontSize = 22, spacing = { after: 120 }, indent, color } = options;
  return text.split('\n').filter(line => line.trim()).map(line =>
    new Paragraph({
      spacing,
      indent,
      children: [new TextRun({ text: line.trim(), size: fontSize, font: 'Malgun Gothic', color })],
    })
  );
}

// 섹션 제목 (볼드 라벨)
function sectionLabel(label) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: label, size: 22, bold: true, font: 'Malgun Gothic', color: '2E75B6' })],
  });
}

// 구분선
function divider() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
    children: [],
  });
}

const children = [];

// 표지
children.push(
  new Paragraph({ spacing: { before: 3000 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'DailySeed — 매일의 씨앗', size: 48, bold: true, font: 'Malgun Gothic', color: '2E75B6' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: '고전 읽기 365', size: 36, font: 'Malgun Gothic', color: '555555' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: '하루 한 권, 세상을 바꾼 책 이야기', size: 24, font: 'Malgun Gothic', color: '888888' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1000 },
    children: [new TextRun({ text: `Day 1 ~ Day ${classics.length}`, size: 22, font: 'Malgun Gothic', color: '888888' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'dailyseed.net', size: 22, font: 'Malgun Gothic', color: '2E75B6' })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// 목차 페이지
children.push(
  new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({ text: '목차', size: 32, bold: true, font: 'Malgun Gothic', color: '2E75B6' })],
  }),
);

classics.forEach((entry, i) => {
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: `${String(i + 1).padStart(3, ' ')}. `, size: 20, font: 'Malgun Gothic', color: '888888' }),
        new TextRun({ text: `${entry.title}`, size: 20, bold: true, font: 'Malgun Gothic' }),
        new TextRun({ text: ` — ${entry.author} (${entry.year})`, size: 20, font: 'Malgun Gothic', color: '666666' }),
        ...(themeByDay[i] ? [new TextRun({ text: `  #${themeByDay[i]}`, size: 18, font: 'Malgun Gothic', color: '2E75B6' })] : []),
      ],
    })
  );
});

children.push(new Paragraph({ children: [new PageBreak()] }));

// 각 고전 콘텐츠
classics.forEach((entry, i) => {
  // Day 번호 + 날짜
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `Day ${i + 1}`, size: 20, font: 'Malgun Gothic', color: '2E75B6' }),
        ...(themeByDay[i] ? [new TextRun({ text: `  |  #${themeByDay[i]}`, size: 20, bold: true, font: 'Malgun Gothic', color: '2E75B6' })] : []),
      ],
    }),
  );

  // 제목
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: entry.title, size: 30, bold: true, font: 'Malgun Gothic' }),
      ],
    }),
  );

  // 저자, 연도
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: `${entry.author} · ${entry.year}년`, size: 22, font: 'Malgun Gothic', color: '666666' }),
      ],
    }),
  );

  // 줄거리
  children.push(sectionLabel('줄거리'));
  children.push(...textToParagraphs(entry.summary, { fontSize: 22, spacing: { after: 100 } }));

  // 생각해볼 질문
  children.push(sectionLabel('생각해볼 질문'));
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      indent: { left: 240 },
      border: { left: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 8 } },
      children: [new TextRun({ text: entry.question, size: 22, font: 'Malgun Gothic', italics: true, color: '333333' })],
    }),
  );

  // 저자 소개
  children.push(sectionLabel('저자 소개'));
  children.push(...textToParagraphs(entry.author_bio, { fontSize: 20, spacing: { after: 80 }, color: '444444' }));

  // 역사적 배경
  children.push(sectionLabel('시대적 배경'));
  children.push(...textToParagraphs(entry.historical_context, { fontSize: 20, spacing: { after: 80 }, color: '444444' }));

  // 구분선 또는 페이지 브레이크
  if (i < classics.length - 1) {
    children.push(divider());
    // 3개마다 페이지 브레이크
    if ((i + 1) % 3 === 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }
});

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Malgun Gothic', size: 22 },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'DailySeed — 고전 읽기 365', size: 16, font: 'Malgun Gothic', color: 'AAAAAA' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: '— ', size: 16, font: 'Malgun Gothic', color: 'AAAAAA' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Malgun Gothic', color: 'AAAAAA' }),
            new TextRun({ text: ' —', size: 16, font: 'Malgun Gothic', color: 'AAAAAA' })],
        })],
      }),
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
const outPath = path.join(__dirname, '..', 'DailySeed_고전읽기365.docx');
fs.writeFileSync(outPath, buffer);
console.log(`생성 완료: ${outPath}`);
console.log(`파일 크기: ${(buffer.length / 1024).toFixed(0)} KB`);
