import { Metadata } from "next";
import englishRaw from "@/data/english.json";
import themes from "@/data/themes.json";

export const metadata: Metadata = {
  title: "전체 단어 목록 — DailySeed 영어",
  robots: { index: false, follow: false },
};

interface Sentence {
  source: string;
  emoji: string;
  en: string;
  ko: string;
  note: string;
}

interface EnglishItem {
  day: number;
  sentences: Sentence[];
  vocab?: { word: string; meaning: string }[];
}

interface VocabEntry {
  word: string;
  meaning: string;
  day: number;
  keyword: string;
  source: string;
  sentence: string;
}

const english = englishRaw as EnglishItem[];

function buildVocabList(): VocabEntry[] {
  const list: VocabEntry[] = [];

  for (let i = 0; i < english.length; i++) {
    const item = english[i];
    const theme = themes[i] as { keyword?: string } | undefined;
    const keyword = theme?.keyword || "";

    if (!item.vocab) continue;

    for (const v of item.vocab) {
      const wordLower = v.word.toLowerCase();
      let matchedSource = "";
      let matchedSentence = "";

      for (const s of item.sentences) {
        if (s.en.toLowerCase().includes(wordLower)) {
          matchedSource = `${s.emoji} ${s.source}`;
          matchedSentence = s.en;
          break;
        }
      }

      if (!matchedSentence && item.sentences.length > 0) {
        matchedSource = `${item.sentences[0].emoji} ${item.sentences[0].source}`;
        matchedSentence = item.sentences[0].en;
      }

      list.push({
        word: v.word,
        meaning: v.meaning,
        day: item.day,
        keyword,
        source: matchedSource,
        sentence: matchedSentence,
      });
    }
  }

  list.sort((a, b) => a.word.localeCompare(b.word, "en", { sensitivity: "base" }));
  return list;
}

const vocabList = buildVocabList();

export default function HiddenVocabPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          전체 단어 목록
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          총 {vocabList.length}개 단어 · ABC순 정렬
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-semibold text-gray-600">
                <th className="whitespace-nowrap px-3 py-3">#</th>
                <th className="whitespace-nowrap px-3 py-3">단어</th>
                <th className="whitespace-nowrap px-3 py-3">뜻</th>
                <th className="whitespace-nowrap px-3 py-3">Day</th>
                <th className="whitespace-nowrap px-3 py-3">키워드</th>
                <th className="px-3 py-3">토픽 &amp; 문장</th>
              </tr>
            </thead>
            <tbody>
              {vocabList.map((v, idx) => (
                <tr
                  key={`${v.word}-${v.day}`}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="whitespace-nowrap px-3 py-2 text-gray-400">
                    {idx + 1}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-blue-700">
                    {v.word}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {v.meaning}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500">
                    {v.day}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                    {v.keyword}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    <span className="font-medium">{v.source}</span>
                    {v.sentence && (
                      <span className="ml-1 text-gray-500">
                        — {v.sentence}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
