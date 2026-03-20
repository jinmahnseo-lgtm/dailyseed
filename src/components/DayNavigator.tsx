"use client";

import { useDayContext } from "@/contexts/DayContext";

const TOPICS = [
  { key: "news", emoji: "📰", label: "뉴스", href: "/news" },
  { key: "classic", emoji: "📖", label: "고전", href: "/classic" },
  { key: "art", emoji: "🎨", label: "예술", href: "/art" },
  { key: "world", emoji: "🌍", label: "세계", href: "/world" },
  { key: "why", emoji: "🔬", label: "과학", href: "/why" },
  { key: "english", emoji: "🔤", label: "영어", href: "/english" },
];

type DayNavigatorProps = {
  title: string;
  emoji: string;
  topicKey?: string;
};

export default function DayNavigator({ title, emoji, topicKey }: DayNavigatorProps) {
  const {
    dayNumber, keyword, canPrev, canNext,
    goPrev, goNext, goPrev7, goNext7, accessToast,
  } = useDayContext();

  const currentTopicIdx = TOPICS.findIndex((t) => t.key === topicKey);
  const prevTopic = currentTopicIdx > 0 ? TOPICS[currentTopicIdx - 1] : null;
  const nextTopic = currentTopicIdx >= 0 && currentTopicIdx < TOPICS.length - 1 ? TOPICS[currentTopicIdx + 1] : null;

  return (
    <header className="text-center mb-6 relative">
      <div className="flex items-center justify-center gap-2">
        {topicKey && (
          <a
            href="/"
            className="absolute left-0 top-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="홈으로"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </a>
        )}
        {prevTopic ? (
          <a href={prevTopic.href} className="text-gray-300 hover:text-gray-500 text-2xl font-bold transition-colors" title={prevTopic.label}>‹</a>
        ) : topicKey ? <span className="w-4" /> : null}
        <h1 className="text-3xl font-bold tracking-tight">{emoji} {title}</h1>
        {nextTopic ? (
          <a href={nextTopic.href} className="text-gray-300 hover:text-gray-500 text-2xl font-bold transition-colors" title={nextTopic.label}>›</a>
        ) : topicKey ? <span className="w-4" /> : null}
      </div>

      {/* Day 내비게이션: « ‹ Day 42 — 용기 › » */}
      <div className="mt-3 flex items-center justify-center gap-1">
        <button onClick={goPrev7} disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-20 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
          title="7일 전"
        >«</button>
        <button onClick={goPrev} disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-20 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >‹</button>
        <div className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold min-w-[140px] text-center"
          suppressHydrationWarning>
          {`Day ${dayNumber}${keyword ? ` — ${keyword}` : ""}`}
        </div>
        <button onClick={goNext} disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-20 text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >›</button>
        <button onClick={goNext7} disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-20 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
          title="7일 후"
        >»</button>
      </div>

      {/* Access restriction toast */}
      {accessToast && (
        <div className="mt-2 mx-auto max-w-xs animate-in fade-in">
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-medium">
            🔒 {accessToast}
            {accessToast.includes("365") && (
              <> (<a href="/notice/2" className="underline font-bold hover:text-amber-800">공지 보기</a>)</>
            )}
          </p>
        </div>
      )}
    </header>
  );
}
