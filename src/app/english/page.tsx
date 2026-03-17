"use client";

import { useState, useEffect } from "react";
import english from "@/data/english.json";
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

export default function EnglishPage() {
  const [idx, setIdx] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const i = english.findIndex((e) => e.date === t);
    setIdx(i >= 0 ? i : 0);
  }, []);

  const item = english[idx] || null;
  if (!item) return null;

  const dayNum = getDayNumber(item.date);
  const theme = themes.find((t) => t.date === item.date);

  return (
    <div className="theme-english min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "var(--background)" }}>
      <DayNavigator
        title="오늘의 영어"
        emoji="📝"
        dayNum={dayNum}
        date={item.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={idx > 0}
        canNext={idx < english.length - 1}
        onPrev={() => setIdx(idx - 1)}
        onNext={() => setIdx(idx + 1)}
        onToday={() => {
          const i = english.findIndex((e) => e.date === today);
          if (i >= 0) setIdx(i);
        }}
      />

      {item.sentences.map((s, i) => (
        <section key={i} className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{s.emoji}</span>
              <span className="font-semibold text-[var(--accent)]">{s.source}</span>
            </div>
            <p className="text-lg font-medium italic text-gray-800 mb-2">
              &ldquo;{s.en}&rdquo;
            </p>
            <p className="text-base text-gray-700 mb-3">{s.ko}</p>
            <div className="bg-[var(--accent-light)] rounded-lg p-3">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-[var(--accent)]">📌 </span>
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
