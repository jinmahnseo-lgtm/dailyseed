"use client";

import { useState, useEffect } from "react";
import seeds from "@/data/seeds.json";

type Seed = (typeof seeds)[number];

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

export default function Home() {
  const [seed, setSeed] = useState<Seed | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const today = getToday();
    const todaySeed = seeds.find((s) => s.date === today);
    setSeed(todaySeed || seeds[0]);

    // 간단한 연속 출석 (로컬스토리지)
    const lastVisit = localStorage.getItem("dailyseed-last");
    const currentStreak = parseInt(localStorage.getItem("dailyseed-streak") || "0");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (lastVisit === today) {
      setStreak(currentStreak);
    } else if (lastVisit === yesterdayStr) {
      const newStreak = currentStreak + 1;
      setStreak(newStreak);
      localStorage.setItem("dailyseed-streak", String(newStreak));
      localStorage.setItem("dailyseed-last", today);
    } else {
      setStreak(1);
      localStorage.setItem("dailyseed-streak", "1");
      localStorage.setItem("dailyseed-last", today);
    }
  }, []);

  if (!seed) return null;

  const dayNum = getDayNumber(seed.date);

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          🌱 DailySeed
        </h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          매일 하나씩, 생각의 씨앗을 심어요
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="bg-[var(--accent-light)] text-[var(--accent)] px-3 py-1 rounded-full text-sm font-semibold">
            Day {dayNum}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            🔥 {streak}일 연속
          </span>
        </div>
      </header>

      {/* 오늘의 질문 */}
      <section className="mb-4">
        <button
          onClick={() => toggle("question")}
          className="w-full bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💭</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 질문</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">
            {seed.question.text}
          </p>
          {openSection === "question" && (
            <p className="mt-3 text-sm text-[var(--text-muted)] bg-[var(--accent-light)] rounded-lg p-3">
              💡 힌트: {seed.question.hint}
            </p>
          )}
        </button>
      </section>

      {/* 오늘의 고전 */}
      <section className="mb-4">
        <button
          onClick={() => toggle("classic")}
          className="w-full bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📖</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 고전</span>
          </div>
          <p className="text-lg font-medium">{seed.classic.title}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {seed.classic.author} · {seed.classic.year > 0 ? `${seed.classic.year}년` : `BC ${Math.abs(seed.classic.year)}년경`}
          </p>
          {openSection === "classic" && (
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed">{seed.classic.summary}</p>
              <p className="text-sm bg-[var(--accent-light)] rounded-lg p-3 font-medium">
                🤔 {seed.classic.think_about}
              </p>
            </div>
          )}
        </button>
      </section>

      {/* 오늘의 영상 */}
      <section className="mb-4">
        <button
          onClick={() => toggle("video")}
          className="w-full bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎬</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 영상</span>
          </div>
          <p className="text-lg font-medium">{seed.video.title}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {seed.video.channel} · {seed.video.duration}
          </p>
          {openSection === "video" && (
            <p className="mt-3 text-sm leading-relaxed">
              {seed.video.description}
            </p>
          )}
        </button>
      </section>

      {/* 오늘의 단어 */}
      <section className="mb-8">
        <button
          onClick={() => toggle("word")}
          className="w-full bg-white rounded-2xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✏️</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 단어</span>
          </div>
          <p className="text-lg font-medium">{seed.word.korean}</p>
          {openSection === "word" && (
            <div className="mt-3 space-y-2 text-sm">
              <p>{seed.word.meaning}</p>
              <p className="text-[var(--text-muted)]">English: {seed.word.english}</p>
              <p className="bg-[var(--accent-light)] rounded-lg p-3">
                &ldquo;{seed.word.example}&rdquo;
              </p>
            </div>
          )}
        </button>
      </section>

      {/* 푸터 */}
      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{seed.date}</p>
      </footer>
    </div>
  );
}
