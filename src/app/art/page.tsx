"use client";

import { useState, useEffect } from "react";
import arts from "@/data/arts.json";
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

export default function ArtPage() {
  const [artIndex, setArtIndex] = useState(0);
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const idx = arts.findIndex((a) => a.date === t);
    setArtIndex(idx >= 0 ? idx : 0);
  }, []);

  const art = arts[artIndex] || null;
  if (!art) return null;

  const dayNum = getDayNumber(art.date);
  const theme = themes.find((t) => t.date === art.date);

  return (
    <div className="theme-art min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "var(--background)" }}>
      <DayNavigator
        title="오늘의 명화"
        emoji="🎨"
        dayNum={dayNum}
        date={art.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={artIndex > 0}
        canNext={artIndex < arts.length - 1}
        onPrev={() => setArtIndex(artIndex - 1)}
        onNext={() => setArtIndex(artIndex + 1)}
        onToday={() => {
          const idx = arts.findIndex((a) => a.date === today);
          if (idx >= 0) setArtIndex(idx);
        }}
      />

      {/* 작품 정보 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🖼️</span>
            <span className="font-semibold text-[var(--accent)]">작품 소개</span>
          </div>
          <h2 className="text-xl font-bold">{art.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {art.artist} · {art.year}년 · {art.country}
          </p>
          {art.image_url && (
            <div className="mb-3">
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={art.image_url}
                  alt={`${art.title} — ${art.artist}`}
                  className="w-full h-auto object-contain max-h-[400px]"
                  loading="lazy"
                />
              </div>
              {art.source_url && (
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  출처:{" "}
                  <a href={art.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">
                    {art.source_label || "Wikipedia"}
                  </a>
                </p>
              )}
            </div>
          )}
          <div className="text-[1.05rem] leading-[1.8]">{art.story}</div>
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-[var(--accent)]">이것만은 봐!</span>
          </div>
          <p className="text-base leading-relaxed">{art.look_for}</p>
        </div>
      </section>

      {/* 재미있는 사실 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-[var(--accent)]">알고 보면 더 재밌는</span>
          </div>
          <p className="text-base leading-relaxed">{art.fun_fact}</p>
        </div>
      </section>

      {/* 오늘의 질문 */}
      <section className="mb-6">
        <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💭</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 질문</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">{art.question}</p>
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{art.date}</p>
      </footer>
    </div>
  );
}
