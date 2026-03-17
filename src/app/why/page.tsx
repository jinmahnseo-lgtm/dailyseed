"use client";

import { useState, useEffect } from "react";
import whys from "@/data/whys.json";
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

export default function WhyPage() {
  const [whyIndex, setWhyIndex] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const idx = whys.findIndex((w) => w.date === t);
    setWhyIndex(idx >= 0 ? idx : 0);
  }, []);

  const why = whys[whyIndex] || null;
  if (!why) return null;

  const dayNum = getDayNumber(why.date);
  const theme = themes.find((t) => t.date === why.date);

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "#fff7ed" }}>
      <DayNavigator
        title="왜왜왜 연구소"
        emoji="🔬"
        dayNum={dayNum}
        date={why.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={whyIndex > 0}
        canNext={whyIndex < whys.length - 1}
        onPrev={() => setWhyIndex(whyIndex - 1)}
        onNext={() => setWhyIndex(whyIndex + 1)}
        onToday={() => {
          const idx = whys.findIndex((w) => w.date === today);
          if (idx >= 0) setWhyIndex(idx);
        }}
      />

      {/* 오늘의 질문 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-center mb-3">
            <span className="text-5xl">{why.emoji}</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
            {why.question}
          </h2>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-500 mb-1">💬 짧은 답</p>
            <p className="text-base leading-relaxed font-medium">{why.short_answer}</p>
          </div>
        </div>
      </section>

      {/* 깊이 파보기 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-orange-600">더 깊이 알아보기</span>
          </div>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {why.deep_dive}
          </div>
        </div>
      </section>

      {/* 직접 해보기 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🧪</span>
            <span className="font-semibold text-orange-600">직접 해보기</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-base leading-relaxed">{why.experiment}</p>
          </div>
        </div>
      </section>

      {/* 마인드 블로운 */}
      <section className="mb-6">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤯</span>
            <span className="font-semibold text-orange-600">이건 진짜 놀라워</span>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <p className="text-base leading-relaxed font-medium">{why.mind_blown}</p>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{why.date}</p>
      </footer>
    </div>
  );
}
