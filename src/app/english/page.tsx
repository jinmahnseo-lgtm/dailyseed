"use client";

import english from "@/data/english.json";
import { useSharedDate } from "@/hooks/useSharedDate";
import DayNavigator from "@/components/DayNavigator";

export default function EnglishPage() {
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday } =
    useSharedDate();
  const item = english.find((e) => e.date === date) || english[0];

  if (!item) return null;

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
      />

      {item.sentences.map((s, i) => (
        <section key={i} className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{s.emoji}</span>
              <span className="font-semibold text-[var(--accent)]">
                {s.source}
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

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{item.date}</p>
      </footer>
    </div>
  );
}
