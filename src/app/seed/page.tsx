"use client";

import { useState, useEffect } from "react";
import seeds from "@/data/seeds.json";
import DayNavigator from "@/components/DayNavigator";

type UserStreaks = {
  [name: string]: { last: string; streak: number; checkedToday: boolean };
};

const USERS = ["이준", "이수"];
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbw62PVzyPfArE44XRS3mZqbC082OuL5-JgsL9l-HSrxp9ONOkkydca-o9Wz7ZtLnSySRQ/exec";

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
    initial[name] = { last: "", streak: 0, checkedToday: false };
  });
  return initial;
}

function saveStreaks(streaks: UserStreaks) {
  localStorage.setItem("dailyseed-streaks", JSON.stringify(streaks));
}

function sendToSheet(date: string, name: string, question: string, answer: string) {
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ date, name, question, answer }),
  }).catch(() => {});
}

export default function SeedPage() {
  const [seedIndex, setSeedIndex] = useState(0);
  const [streaks, setStreaks] = useState<UserStreaks>({});
  const [today, setToday] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = getToday();
    setToday(t);
    const idx = seeds.findIndex((s) => s.date === t);
    setSeedIndex(idx >= 0 ? idx : 0);

    const saved = loadStreaks();
    USERS.forEach((name) => {
      if (saved[name]) {
        saved[name].checkedToday = saved[name].last === t;
      } else {
        saved[name] = { last: "", streak: 0, checkedToday: false };
      }
    });
    setStreaks(saved);
  }, []);

  const seed = seeds[seedIndex] || null;
  const isToday = seed?.date === today;

  const goPrev = () => {
    if (seedIndex > 0) setSeedIndex(seedIndex - 1);
  };
  const goNext = () => {
    if (seedIndex < seeds.length - 1) setSeedIndex(seedIndex + 1);
  };
  const goToday = () => {
    const idx = seeds.findIndex((s) => s.date === today);
    if (idx >= 0) setSeedIndex(idx);
  };

  const selectUser = (name: string) => {
    if (streaks[name]?.checkedToday) return;
    setSelectedUser(name);
    setAnswer("");
    setSubmitted(false);
  };

  const submitAnswer = () => {
    if (!selectedUser || !answer.trim() || !seed) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const prev = streaks[selectedUser] || { last: "", streak: 0, checkedToday: false };
    const newStreak = prev.last === yesterdayStr ? prev.streak + 1 : 1;

    const updated = {
      ...streaks,
      [selectedUser]: { last: today, streak: newStreak, checkedToday: true },
    };
    setStreaks(updated);
    saveStreaks(updated);

    sendToSheet(today, selectedUser, seed.classic.question, answer.trim());

    setSubmitted(true);
    setTimeout(() => {
      setSelectedUser(null);
      setSubmitted(false);
    }, 2000);
  };

  if (!seed) return null;

  const dayNum = getDayNumber(seed.date);

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <DayNavigator
        title="오늘의 씨앗"
        emoji="🌱"
        dayNum={dayNum}
        date={seed.date}
        today={today}
        canPrev={seedIndex > 0}
        canNext={seedIndex < seeds.length - 1}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      {/* 1. 오늘의 뉴스 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📰</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 뉴스</span>
          </div>
          <p className="text-lg font-medium mb-2">{seed.news.title}</p>
          <p className="text-base leading-relaxed mb-3">{seed.news.summary}</p>
          <div className="bg-[var(--accent-light)] rounded-lg p-3">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-[var(--accent)]">💡 시사점</span>{" "}
              {seed.news.insight}
            </p>
          </div>
        </div>
      </section>

      {/* 2. 오늘의 고전 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📖</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 고전</span>
          </div>
          <p className="text-xl font-bold">{seed.classic.title}</p>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {seed.classic.author} ·{" "}
            {seed.classic.year > 0
              ? `${seed.classic.year}년`
              : `BC ${Math.abs(seed.classic.year)}년경`}
          </p>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {seed.classic.summary}
          </div>
        </div>
      </section>

      {/* 3. 오늘의 문장 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📝</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 문장</span>
          </div>
          <p className="text-lg font-medium italic text-gray-800">
            &ldquo;{seed.sentence.english}&rdquo;
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <p className="font-medium">{seed.sentence.translation}</p>
            <div className="bg-[var(--accent-light)] rounded-lg p-3">
              <p className="font-semibold text-[var(--accent)] mb-1">
                📌 {seed.sentence.grammar_point}
              </p>
              <p className="leading-relaxed">{seed.sentence.grammar_explanation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 오늘의 질문 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💭</span>
            <span className="font-semibold text-[var(--accent)]">오늘의 질문</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">{seed.classic.question}</p>
        </div>
      </section>

      {/* 5. 출석 체크 */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {!isToday ? (
            <p className="text-center text-sm text-[var(--text-muted)] py-3">
              출석은 오늘 콘텐츠에서만 가능해요.{" "}
              <button onClick={goToday} className="text-[var(--accent)] underline">
                오늘로 이동
              </button>
            </p>
          ) : (
            <div>
              <p className="text-center text-sm font-semibold text-[var(--accent)] mb-3">
                질문에 답하고 출석하기
              </p>
              <div className="flex justify-center gap-4 mb-4">
                {USERS.map((name) => {
                  const info = streaks[name];
                  const checked = info?.checkedToday;
                  const isSelected = selectedUser === name;
                  return (
                    <button
                      key={name}
                      onClick={() => selectUser(name)}
                      className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl transition-all ${
                        checked
                          ? "bg-[var(--accent)] text-white shadow-md"
                          : isSelected
                            ? "bg-[var(--accent)] text-white shadow-md ring-2 ring-offset-2 ring-[var(--accent)]"
                            : "bg-[var(--accent-light)] text-[var(--foreground)] hover:shadow-md"
                      }`}
                    >
                      <span className="text-2xl">{checked ? "✅" : isSelected ? "✍️" : "👋"}</span>
                      <span className="font-semibold text-sm">{name}</span>
                      <span className="text-xs opacity-80">
                        {checked
                          ? `🔥 ${info.streak}일 연속`
                          : isSelected
                            ? "답변 작성 중"
                            : "탭해서 시작!"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedUser && !submitted && (
                <div className="space-y-3">
                  <p className="text-sm text-center text-[var(--text-muted)]">
                    <strong>{selectedUser}</strong>의 생각을 적어봐!
                  </p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="여기에 적어봐..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim()}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      answer.trim()
                        ? "bg-[var(--accent)] text-white hover:shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    제출하고 출석! 🎉
                  </button>
                </div>
              )}

              {submitted && (
                <p className="text-center text-sm font-semibold text-green-600 py-3">
                  🎉 {selectedUser} 출석 완료!
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{seed.date}</p>
      </footer>
    </div>
  );
}
