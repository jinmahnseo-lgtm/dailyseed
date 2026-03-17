"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import worlds from "@/data/worlds.json";
import { useSharedDate } from "@/hooks/useSharedDate";
import { useMission } from "@/hooks/useMission";
import DayNavigator from "@/components/DayNavigator";

export default function WorldPage() {
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday } =
    useSharedDate();
  const world = worlds.find((w) => w.date === date) || worlds[0];
  const { done, complete } = useMission("world", world?.date || "");

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  }, [date]);

  if (!world) return null;

  const isCorrect = selectedAnswer === world.quiz.answer;

  const handleQuizSubmit = () => {
    if (selectedAnswer !== null) {
      setQuizSubmitted(true);
      const correct = selectedAnswer === world.quiz.answer;
      const letter = String.fromCharCode(65 + selectedAnswer);
      const chosen = `${letter}. ${world.quiz.options[selectedAnswer]}`;
      complete(correct ? `정답 ${chosen}` : `오답 ${chosen}`);
    }
  };

  return (
    <div
      className="theme-world min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator
        title="오늘의 세계"
        emoji="🌍"
        date={world.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      {/* 나라 소개 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{world.flag}</span>
            <div>
              <h2 className="text-xl font-bold">{world.country}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                {world.region}
              </p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[var(--accent)] mb-3">
            {world.title}
          </h3>
          <p className="text-[1.05rem] leading-[1.8]">{world.story}</p>
        </div>
      </section>

      {/* 문화 포인트 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎭</span>
            <span className="font-semibold text-[var(--accent)]">
              문화 포인트
            </span>
          </div>
          <p className="text-base leading-relaxed">{world.culture_point}</p>
        </div>
      </section>

      {/* 음식 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🍽️</span>
            <span className="font-semibold text-[var(--accent)]">
              이 나라 음식
            </span>
          </div>
          <p className="text-base leading-relaxed">{world.food}</p>
        </div>
      </section>

      {/* 재미있는 사실 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤯</span>
            <span className="font-semibold text-[var(--accent)]">
              놀라운 사실
            </span>
          </div>
          <p className="text-base leading-relaxed">{world.fun_fact}</p>
        </div>
      </section>

      {/* 퀴즈 (미션) */}
      <section className="mb-6">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">❓</span>
            <span className="font-semibold text-[var(--accent)]">
              미션! - 오늘의 퀴즈
            </span>
          </div>
          <p className="text-base font-medium mb-4">{world.quiz.question}</p>
          <div className="space-y-2 mb-4">
            {world.quiz.options.map((option, i) => {
              let btnClass = "bg-gray-50 border-gray-200 text-gray-800";
              if (quizSubmitted) {
                if (i === world.quiz.answer) {
                  btnClass = "bg-green-50 border-green-400 text-green-800";
                } else if (i === selectedAnswer && !isCorrect) {
                  btnClass = "bg-red-50 border-red-400 text-red-800";
                }
              } else if (i === selectedAnswer) {
                btnClass =
                  "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]";
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!quizSubmitted) setSelectedAnswer(i);
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${btnClass}`}
                >
                  <span className="mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                  {quizSubmitted && i === world.quiz.answer && " ✅"}
                  {quizSubmitted &&
                    i === selectedAnswer &&
                    !isCorrect &&
                    i !== world.quiz.answer &&
                    " ❌"}
                </button>
              );
            })}
          </div>
          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={selectedAnswer === null}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedAnswer !== null
                  ? "bg-[var(--accent)] text-white hover:shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              정답 확인!
            </button>
          ) : (
            <div
              className={`text-center py-3 rounded-xl text-sm font-semibold ${
                isCorrect
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-50 text-orange-600"
              }`}
            >
              {isCorrect
                ? "🎉 정답! 미션 완료!"
                : "😅 아쉽지만 미션 완료! 다음엔 맞춰봐!"}
            </div>
          )}
        </div>
      </section>

      <footer className="text-center mt-6 space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          🏠 홈으로 돌아가기
        </Link>
        <p className="text-xs text-[var(--text-muted)]">{world.date}</p>
      </footer>
    </div>
  );
}
