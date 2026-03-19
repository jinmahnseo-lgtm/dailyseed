"use client";

import whys from "@/data/whys.json";
import { useMission } from "@/hooks/useMission";
import { useDayContext } from "@/contexts/DayContext";

import DayNavigator from "@/components/DayNavigator";

export default function WhyPage() {
  const { dayIndex } = useDayContext();
  const item = whys[dayIndex] || null;
  const { done, complete } = useMission("why", dayIndex);

  return (
    <div
      className="theme-why min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator title="오늘의 과학" emoji="🔬" topicKey="why" />

      {!item ? (
        <section className="mb-6">
          <div className="w-full bg-white rounded-2xl p-8 shadow-sm text-center">
            <span className="text-5xl block mb-4">🔬</span>
            <h2 className="text-lg font-bold text-gray-700 mb-2">아직 과학 콘텐츠가 준비되지 않았어요</h2>
            <p className="text-sm text-gray-500 leading-relaxed">다른 날짜를 확인하거나, 나중에 다시 방문해 주세요!</p>
          </div>
        </section>
      ) : (
      <>
      {/* 오늘의 질문 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-center mb-3">
            <span className="text-5xl">{item.emoji}</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
            {item.question}
          </h2>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-500 mb-1">
              💬 짧은 답
            </p>
            <p className="text-base leading-relaxed font-medium">
              {item.short_answer}
            </p>
          </div>
        </div>
      </section>

      {/* 깊이 파보기 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-orange-600">
              더 깊이 알아보기
            </span>
          </div>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {item.deep_dive}
          </div>
        </div>
      </section>

      {/* 이건 진짜 놀라워 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤯</span>
            <span className="font-semibold text-orange-600">
              이건 진짜 놀라워
            </span>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <p className="text-base leading-relaxed font-medium">
              {item.mind_blown}
            </p>
          </div>
        </div>
      </section>

      {/* 직접 해보기 (미션) */}
      <section className="mb-6">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🧪</span>
            <span className="font-semibold text-orange-600">미션! - 오늘의 실험</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 mb-4">
            <p className="text-base leading-relaxed">{item.experiment}</p>
          </div>
          {done ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-semibold mt-1">미션 완료!</p>
            </div>
          ) : (
            <button
              onClick={() => complete("실험 완료")}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:shadow-md transition-all active:scale-[0.98]"
            >
              직접 해봤어! 🎉
            </button>
          )}
        </div>
      </section>

      <footer className="text-center mt-6 space-y-2">
        <a href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          🏠 홈으로 돌아가기
        </a>
      </footer>
      </>
      )}
    </div>
  );
}
