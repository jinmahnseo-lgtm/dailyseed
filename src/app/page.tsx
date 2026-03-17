"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSharedDate, formatDateShort, formatDateCompact } from "@/hooks/useSharedDate";
import { isMissionDone } from "@/hooks/useMission";
import MissionComplete from "@/components/MissionComplete";

const MENUS = [
  {
    href: "/news",
    icon: "📰",
    title: "오늘의 뉴스",
    desc: "시사 뉴스 · 시사용어 · 찬반 토론",
    key: "news",
    color: "from-blue-50 to-sky-50",
    border: "border-blue-200",
    accent: "text-blue-600",
  },
  {
    href: "/classic",
    icon: "📖",
    title: "오늘의 고전",
    desc: "동서양 고전 · 작가 소개 · 질문",
    key: "classic",
    color: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    accent: "text-amber-700",
  },
  {
    href: "/art",
    icon: "🎨",
    title: "오늘의 예술 감상",
    desc: "명화 · 감상 포인트 · 작품평",
    key: "art",
    color: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    accent: "text-violet-600",
  },
  {
    href: "/world",
    icon: "🌍",
    title: "오늘의 세계문화",
    desc: "문화 · 음식 · 전통 · 퀴즈",
    key: "world",
    color: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    accent: "text-emerald-600",
  },
  {
    href: "/why",
    icon: "🔬",
    title: "오늘의 왜왜왜?",
    desc: "과학 · 실험 · 놀라운 사실",
    key: "why",
    color: "from-orange-50 to-red-50",
    border: "border-orange-200",
    accent: "text-orange-600",
  },
  {
    href: "/english",
    icon: "📝",
    title: "오늘의 영어",
    desc: "핵심 문장 · 번역 · 문법 포인트",
    key: "english",
    color: "from-cyan-50 to-teal-50",
    border: "border-cyan-200",
    accent: "text-cyan-700",
  },
];

export default function Home() {
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday } =
    useSharedDate();
  const [missions, setMissions] = useState<Record<string, boolean>>({});

  const refreshMissions = useCallback(() => {
    if (date) {
      setMissions({
        news: isMissionDone("news", date),
        classic: isMissionDone("classic", date),
        art: isMissionDone("art", date),
        world: isMissionDone("world", date),
        why: isMissionDone("why", date),
        english: isMissionDone("english", date),
      });
    }
  }, [date]);

  useEffect(() => {
    refreshMissions();
  }, [refreshMissions]);

  useEffect(() => {
    window.addEventListener("focus", refreshMissions);
    document.addEventListener("visibilitychange", refreshMissions);
    return () => {
      window.removeEventListener("focus", refreshMissions);
      document.removeEventListener("visibilitychange", refreshMissions);
    };
  }, [refreshMissions]);

  const isToday = date === today;
  const dateLabel = date ? formatDateShort(date) : "–";
  const allDone = date && Object.keys(missions).length === 6 && Object.values(missions).every(Boolean);

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">🌱 DailySeed</h1>
        <p className="text-[var(--text-muted)] mt-1 text-base">
          청소년을 위한 매일의 씨앗
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          by 이준·이수 아빠
        </p>
      </header>

      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-30 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ‹
        </button>
        <span className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold">
          {dateLabel}
        </span>
        <button
          onClick={goNext}
          disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-30 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ›
        </button>
      </div>
      {!isToday && date && (
        <div className="text-center mb-4">
          <button
            onClick={goToday}
            className="text-xs text-[var(--accent)] underline"
          >
            오늘({formatDateCompact(today)})로 돌아가기
          </button>
        </div>
      )}

      {/* 오늘의 단어 */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-xs font-semibold text-[var(--accent)] tracking-widest mb-2">
            오늘의 단어
          </p>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {theme?.keyword || "–"}
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            {theme?.desc || ""}
          </p>
          <div className="mt-3 w-12 h-0.5 bg-[var(--accent)] mx-auto rounded-full" />
        </div>
      </section>

      {/* 미션 완수 */}
      {allDone && (
        <MissionComplete date={date} keyword={theme?.keyword || ""} />
      )}

      {/* Menu cards */}
      <section className="space-y-3">
        {MENUS.map((menu) => {
          const mKey = menu.key as string;
          const isDone = missions[mKey];
          return (
            <Link key={menu.href} href={menu.href}>
              <div
                className={`bg-gradient-to-r ${menu.color} rounded-2xl p-5 border ${menu.border} shadow-sm hover:shadow-md transition-all active:scale-[0.98] mb-3`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{menu.icon}</span>
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold ${menu.accent}`}>
                      {menu.title}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      {menu.desc}
                    </p>
                  </div>
                  <span
                    className={`text-2xl ${isDone ? "text-green-500" : "text-gray-300"}`}
                  >
                    {isDone ? "✅" : "○"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)] mt-8">
        <p>매일 하나의 단어로, 세상을 깊이 보는 눈을 키워요</p>
      </footer>
    </div>
  );
}
