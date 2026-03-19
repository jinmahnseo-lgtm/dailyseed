"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import classicsRaw from "@/data/classics.json";
import { useSharedDate, isAdminEmail } from "@/hooks/useSharedDate";
import { useMission } from "@/hooks/useMission";
import { useAuthContext } from "@/contexts/AuthContext";
import DayNavigator from "@/components/DayNavigator";

interface ClassicItem {
  date: string;
  title: string;
  author: string;
  year: number;
  summary: string;
  question: string;
  author_bio?: string;
  historical_context?: string;
}

const classics = classicsRaw as ClassicItem[];

export default function ClassicPage() {
  const { user } = useAuthContext();
  const role = isAdminEmail(user?.email) ? "admin" : user ? "user" : "guest";
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday, setDate, minDate, maxDate } =
    useSharedDate(role);
  const item = classics.find((c) => c.date === date) || null;
  const { done, complete } = useMission("classic", item?.date || "");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [date]);

  if (!item) return null;

  return (
    <div
      className="theme-classic min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator
        title="오늘의 고전"
        emoji="📖"
        date={item.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onSelectDate={setDate}
        topicKey="classic"
        minDate={minDate}
        maxDate={maxDate}
        isGuest={role === "guest"}
      />

      {/* 작품 정보 & 줄거리 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📖</span>
            <span className="font-semibold text-[var(--accent)]">
              오늘의 고전
            </span>
          </div>
          <h2 className="text-xl font-bold">{item.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {item.author} ·{" "}
            {item.year > 0
              ? `${item.year}년`
              : `BC ${Math.abs(item.year)}년경`}
          </p>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {item.summary}
          </div>
        </div>
      </section>

      {/* 작가 소개 */}
      {item.author_bio && (
        <section className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✍️</span>
              <span className="font-semibold text-[var(--accent)]">
                작가 소개
              </span>
            </div>
            <p className="text-base leading-relaxed">{item.author_bio}</p>
          </div>
        </section>
      )}

      {/* 작품 배경 */}
      {item.historical_context && (
        <section className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏛️</span>
              <span className="font-semibold text-[var(--accent)]">
                작품 배경
              </span>
            </div>
            <p className="text-base leading-relaxed">
              {item.historical_context}
            </p>
          </div>
        </section>
      )}

      {/* 오늘의 질문 + 미션 */}
      <section className="mb-6">
        <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💭</span>
            <span className="font-semibold text-[var(--accent)]">
              미션! - 오늘의 질문
            </span>
          </div>
          <p className="text-lg font-medium leading-relaxed mb-4">
            {item.question}
          </p>
          {done ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-semibold mt-1">미션 완료!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답변을 한 줄로 적어봐!"
                className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm focus:border-[var(--accent)] focus:outline-none bg-white"
                maxLength={200}
              />
              <button
                onClick={() => {
                  if (answer.trim()) complete(answer.trim());
                }}
                disabled={!answer.trim()}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  answer.trim()
                    ? "bg-[var(--accent)] text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                미션 완료! 🎉
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center mt-6 space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          🏠 홈으로 돌아가기
        </Link>
        <p className="text-xs text-[var(--text-muted)]">{item.date}</p>
      </footer>
    </div>
  );
}
