"use client";

import { useState, useEffect } from "react";
import news from "@/data/news.json";
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

export default function NewsPage() {
  const [idx, setIdx] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const i = news.findIndex((n) => n.date === t);
    setIdx(i >= 0 ? i : 0);
  }, []);

  const item = news[idx] || null;
  if (!item) return null;

  const dayNum = getDayNumber(item.date);
  const theme = themes.find((t) => t.date === item.date);

  return (
    <div className="theme-news min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "var(--background)" }}>
      <DayNavigator
        title="오늘의 뉴스"
        emoji="📰"
        dayNum={dayNum}
        date={item.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={idx > 0}
        canNext={idx < news.length - 1}
        onPrev={() => setIdx(idx - 1)}
        onNext={() => setIdx(idx + 1)}
        onToday={() => {
          const i = news.findIndex((n) => n.date === today);
          if (i >= 0) setIdx(i);
        }}
      />

      {/* 뉴스 요약 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📰</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 뉴스</span>
          </div>
          <h2 className="text-lg font-bold mb-3">{item.title}</h2>
          <div className="text-[1.05rem] leading-[1.8]">{item.summary}</div>
        </div>
      </section>

      {/* 시사점 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-[var(--accent)]">시사점</span>
          </div>
          <p className="text-base leading-relaxed">{item.insight}</p>
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
