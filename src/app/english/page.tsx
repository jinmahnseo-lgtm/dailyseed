"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import english from "@/data/english.json";
import classicsData from "@/data/classics.json";
import artsData from "@/data/arts.json";
import worldsData from "@/data/worlds.json";
import whysData from "@/data/whys.json";
import { useSharedDate } from "@/hooks/useSharedDate";
import { useMission } from "@/hooks/useMission";
import DayNavigator from "@/components/DayNavigator";

interface VocabItem {
  word: string;
  meaning: string;
}

interface EnglishItem {
  date: string;
  sentences: { source: string; emoji: string; en: string; ko: string; note: string }[];
  vocab?: VocabItem[];
}

function getSourceTitle(source: string, date: string): string {
  if (source === "고전") {
    const c = (classicsData as { date: string; title: string }[]).find((x) => x.date === date);
    return c ? `고전 — '${c.title}'` : "고전";
  }
  if (source === "명화") {
    const a = (artsData as { date: string; title: string }[]).find((x) => x.date === date);
    return a ? `예술 — '${a.title}'` : "예술";
  }
  if (source === "세계문화") {
    const w = (worldsData as { date: string; country: string }[]).find((x) => x.date === date);
    return w ? `세계 — '${w.country}'` : "세계";
  }
  if (source === "왜왜왜") {
    const wh = (whysData as { date: string; question: string }[]).find((x) => x.date === date);
    return wh ? `과학 — '${wh.question}'` : "과학";
  }
  return source;
}

export default function EnglishPage() {
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday, setDate } =
    useSharedDate();
  const item = (english as EnglishItem[]).find((e) => e.date === date) || (english as EnglishItem[])[0];
  const { done, complete } = useMission("english", item?.date || "");

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    setAnswers({});
    setShowAnswers(false);
  }, [date]);

  if (!item) return null;

  const vocab = item.vocab || [];
  const allFilled = vocab.length > 0 && vocab.every((_, i) => (answers[i] || "").trim());

  const handleSubmit = () => {
    if (allFilled) {
      const answerSummary = vocab.map((v, i) => `${v.word}: ${(answers[i] || "").trim()}`).join(" / ");
      complete(answerSummary);
      setShowAnswers(true);
    }
  };

  return (
    <div
      className="theme-english min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator
        title="오늘의 영어"
        emoji="📝"
        date={item.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onSelectDate={setDate}
      />

      {item.sentences.map((s, i) => (
        <section key={i} className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{s.emoji}</span>
              <span className="font-semibold text-[var(--accent)] text-sm">
                {getSourceTitle(s.source, item.date)}
              </span>
            </div>
            <p className="text-lg font-medium italic text-gray-800 mb-2">
              &ldquo;{s.en}&rdquo;
            </p>
            <p className="text-base text-gray-700 mb-3">{s.ko}</p>
            <div className="bg-[var(--accent-light)] rounded-lg p-3">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-[var(--accent)]">
                  📌{" "}
                </span>
                {s.note}
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* 미션! 오늘의 단어 */}
      {vocab.length > 0 && (
        <section className="mb-6">
          <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📝</span>
              <span className="font-semibold text-[var(--accent)]">
                미션! - 오늘의 단어
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              오늘 배운 핵심 단어의 뜻을 적어봐!
            </p>
            {done && !showAnswers ? (
              <div className="bg-green-50 rounded-xl p-4 text-center mb-3">
                <span className="text-2xl">✅</span>
                <p className="text-green-700 font-semibold mt-1">미션 완료!</p>
              </div>
            ) : null}
            <div className="space-y-3">
              {vocab.map((v, i) => (
                <div key={i} className="bg-white rounded-xl p-3">
                  <p className="font-bold text-[var(--accent)] text-sm mb-1.5">
                    {i + 1}. {v.word}
                  </p>
                  <input
                    type="text"
                    value={answers[i] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                    }
                    placeholder="뜻을 적어봐!"
                    className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-[var(--accent)] focus:outline-none"
                    maxLength={100}
                    disabled={done}
                  />
                  {showAnswers && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">
                      정답: {v.meaning}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {!done && (
              <button
                onClick={handleSubmit}
                disabled={!allFilled}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mt-4 ${
                  allFilled
                    ? "bg-[var(--accent)] text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                제출하기 🎉
              </button>
            )}
            {(done || showAnswers) && !showAnswers && (
              <button
                onClick={() => setShowAnswers(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-white border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all mt-3"
              >
                답 확인하기 👀
              </button>
            )}
            {showAnswers && !done && null}
          </div>
        </section>
      )}

      <footer className="text-center mt-6 space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          🏠 홈으로 돌아가기
        </Link>
        <p className="text-xs text-[var(--text-muted)]">{item.date}</p>
      </footer>
    </div>
  );
}
