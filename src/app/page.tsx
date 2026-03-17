"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const USERS = ["이준", "이수"];

type UserStreaks = {
  [name: string]: { last: string; streak: number };
};

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

function loadStreaks(): UserStreaks {
  try {
    const saved = localStorage.getItem("dailyseed-streaks");
    if (saved) return JSON.parse(saved);
  } catch {}
  const initial: UserStreaks = {};
  USERS.forEach((name) => {
    initial[name] = { last: "", streak: 0 };
  });
  return initial;
}

const MENUS = [
  {
    href: "/seed",
    icon: "🌱",
    title: "오늘의 씨앗",
    desc: "뉴스 · 고전 · 문장 · 질문",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    accent: "text-amber-600",
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
    href: "/puzzle",
    icon: "🧩",
    title: "오늘의 퍼즐",
    desc: "수학 · 논리 · 사고력",
    color: "from-cyan-50 to-teal-50",
    border: "border-cyan-200",
    accent: "text-cyan-600",
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
];

export default function Home() {
  const [today, setToday] = useState("");
  const [streaks, setStreaks] = useState<UserStreaks>({});

  useEffect(() => {
    setToday(getToday());
    setStreaks(loadStreaks());
  }, []);

  const dayNum = getDayNumber(today);

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">🌱 DailySeed</h1>
        <p className="text-[var(--text-muted)] mt-1 text-lg font-medium">
          이준 · 이수를 위한 매일의 씨앗
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold">
            Day {dayNum > 0 ? dayNum : "–"}
          </span>
          <span className="text-sm text-[var(--text-muted)]">{today}</span>
        </div>
      </header>

      {/* 연속 출석 */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-center gap-6">
            {USERS.map((name) => {
              const info = streaks[name];
              return (
                <div key={name} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">
                    {info?.last === today ? "✅" : "👋"}
                  </span>
                  <span className="font-semibold text-sm">{name}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {info?.streak ? `🔥 ${info.streak}일 연속` : "오늘도 파이팅!"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 메뉴 카드 */}
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

      {/* 푸터 */}
      <footer className="text-center text-xs text-[var(--text-muted)] mt-8">
        <p>매일 새로운 콘텐츠가 업데이트돼요</p>
      </footer>
    </div>
  );
}
