"use client";

import { useState, useEffect } from "react";
import classics from "@/data/classics.json";
import themes from "@/data/themes.json";
import DayNavigator from "@/components/DayNavigator";

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

export default function ClassicPage() {
  const [idx, setIdx] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const i = classics.findIndex((c) => c.date === t);
    setIdx(i >= 0 ? i : 0);
  }, []);

  const item = classics[idx] || null;
  if (!item) return null;

  const dayNum = getDayNumber(item.date);
  const theme = themes.find((t) => t.date === item.date);

  return (
    <div className="theme-classic min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "var(--background)" }}>
      <DayNavigator
        title="오늘의 고전"
        emoji="📖"
        dayNum={dayNum}
        date={item.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={idx > 0}
        canNext={idx < classics.length - 1}
        onPrev={() => setIdx(idx - 1)}
        onNext={() => setIdx(idx + 1)}
        onToday={() => {
          const i = classics.findIndex((c) => c.date === today);
          if (i >= 0) setIdx(i);
        }}
      />

      {/* 작품 정보 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📖</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 고전</span>
          </div>
          <h2 className="text-xl font-bold">{item.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {item.author} ·{" "}
            {item.year > 0 ? `${item.year}년` : `BC ${Math.abs(item.year)}년경`}
          </p>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {item.summary}
          </div>
        </div>
      </section>

      {/* 오늘의 질문 */}
      <section className="mb-6">
        <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💭</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 질문</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">{item.question}</p>
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{item.date}</p>
      </footer>
    </div>
  );
}
