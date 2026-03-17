"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import themes from "@/data/themes.json";

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

const MENUS = [
  {
    href: "/news",
    icon: "📰",
    title: "오늘의 뉴스",
    desc: "시사 뉴스 · 시사점 · 질문",
    color: "from-blue-50 to-sky-50",
    border: "border-blue-200",
    accent: "text-blue-600",
  },
  {
    href: "/classic",
    icon: "📖",
    title: "오늘의 고전",
    desc: "동서양 고전 · 명작 요약 · 질문",
    color: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    accent: "text-amber-700",
  },
  {
    href: "/art",
    icon: "🎨",
    title: "오늘의 명화",
    desc: "명화 · 작가 · 감상 포인트",
    color: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    accent: "text-violet-600",
  },
  {
    href: "/world",
    icon: "🌍",
    title: "오늘의 세계문화",
    desc: "문화 · 음식 · 전통 · 퀴즈",
    color: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    accent: "text-emerald-600",
  },
  {
    href: "/why",
    icon: "🔬",
    title: "왜왜왜 연구소",
    desc: "과학 · 호기심 · 실험 · 놀라운 사실",
    color: "from-orange-50 to-red-50",
    border: "border-orange-200",
    accent: "text-orange-600",
  },
  {
    href: "/english",
    icon: "📝",
    title: "오늘의 영어",
    desc: "핵심 문장 · 번역 · 문법 포인트",
    color: "from-cyan-50 to-teal-50",
    border: "border-cyan-200",
    accent: "text-cyan-700",
  },
];

export default function Home() {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(getToday());
  }, []);

  const dayNum = getDayNumber(today);
  const theme = themes.find((t) => t.date === today) || themes[0];

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">🌱 DailySeed</h1>
        <p className="text-[var(--text-muted)] mt-1 text-base">
          청소년을 위한 매일의 씨앗
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          by 이준 이수 아빠
        </p>
        <div className="mt-3">
          <span className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold">
            Day {dayNum > 0 ? dayNum : "–"}
          </span>
        </div>
      </header>

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

      <section className="space-y-3">
        {MENUS.map((menu) => (
          <Link key={menu.href} href={menu.href}>
            <div
              className={`bg-gradient-to-r ${menu.color} rounded-2xl p-5 border ${menu.border} shadow-sm hover:shadow-md transition-all active:scale-[0.98] mb-3`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{menu.icon}</span>
                <div>
                  <h2 className={`text-lg font-bold ${menu.accent}`}>
                    {menu.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {menu.desc}
                  </p>
                </div>
                <span className="ml-auto text-gray-300 text-xl">›</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)] mt-8">
        <p>매일 하나의 단어로, 세상을 깊이 보는 눈을 키워요</p>
      </footer>
    </div>
  );
}
