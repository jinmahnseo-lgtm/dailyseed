"use client";

import { useState, useEffect } from "react";
import puzzles from "@/data/puzzles.json";
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

export default function PuzzlePage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [today, setToday] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const idx = puzzles.findIndex((p) => p.date === t);
    setPuzzleIndex(idx >= 0 ? idx : 0);
  }, []);

  useEffect(() => {
    setShowHint(false);
    setShowSolution(false);
    setUserAnswer("");
    setSubmitted(false);
  }, [puzzleIndex]);

  const puzzle = puzzles[puzzleIndex] || null;
  if (!puzzle) return null;

  const dayNum = getDayNumber(puzzle.date);

  const difficultyStars = "⭐".repeat(puzzle.difficulty) + "☆".repeat(5 - puzzle.difficulty);

  return (
    <div className="theme-puzzle min-h-screen px-4 py-8 max-w-lg mx-auto" style={{ background: "var(--background)" }}>
      <DayNavigator
        title="오늘의 퍼즐"
        emoji="🧩"
        dayNum={dayNum}
        date={puzzle.date}
        today={today}
        canPrev={puzzleIndex > 0}
        canNext={puzzleIndex < puzzles.length - 1}
        onPrev={() => setPuzzleIndex(puzzleIndex - 1)}
        onNext={() => setPuzzleIndex(puzzleIndex + 1)}
        onToday={() => {
          const idx = puzzles.findIndex((p) => p.date === today);
          if (idx >= 0) setPuzzleIndex(idx);
        }}
      />

      {/* 문제 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{puzzle.emoji}</span>
              <span className="font-semibold text-[var(--accent)]">{puzzle.category} 퍼즐</span>
            </div>
            <span className="text-xs">{difficultyStars}</span>
          </div>
          <h2 className="text-xl font-bold mb-3">{puzzle.title}</h2>
          <p className="text-[1.05rem] leading-[1.8]">{puzzle.problem}</p>
        </div>
      </section>

      {/* 내 풀이 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✍️</span>
            <span className="font-semibold text-[var(--accent)]">내 풀이</span>
          </div>
          {!submitted ? (
            <div className="space-y-3">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="여기에 풀이를 적어봐..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                rows={3}
              />
              <button
                onClick={() => {
                  if (userAnswer.trim()) setSubmitted(true);
                }}
                disabled={!userAnswer.trim()}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  userAnswer.trim()
                    ? "bg-[var(--accent)] text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                풀이 제출!
              </button>
            </div>
          ) : (
            <div className="bg-[var(--accent-light)] rounded-xl p-3">
              <p className="text-sm font-semibold text-[var(--accent)] mb-1">내 풀이:</p>
              <p className="text-sm leading-relaxed">{userAnswer}</p>
            </div>
          )}
        </div>
      </section>

      {/* 힌트 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="font-semibold text-[var(--accent)]">힌트 보기</span>
            </div>
            <span className="text-[var(--accent)] text-lg">{showHint ? "▲" : "▼"}</span>
          </button>
          {showHint && (
            <div className="px-5 pb-5">
              <p className="text-base leading-relaxed bg-[var(--accent-light)] rounded-xl p-4">
                {puzzle.hint}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 정답 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-semibold text-[var(--accent)]">정답 & 풀이</span>
            </div>
            <span className="text-[var(--accent)] text-lg">{showSolution ? "▲" : "▼"}</span>
          </button>
          {showSolution && (
            <div className="px-5 pb-5 space-y-3">
              <div className="bg-[var(--accent-light)] rounded-xl p-4">
                <p className="text-base leading-relaxed font-medium">{puzzle.solution}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-[var(--accent)] mb-1">📚 배움 포인트</p>
                <p className="text-sm leading-relaxed">{puzzle.lesson}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{puzzle.date}</p>
      </footer>
    </div>
  );
}
