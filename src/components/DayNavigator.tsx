"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import themes from "@/data/themes.json";
import { dispatchDayChange } from "@/contexts/DayContext";

const TOPICS = [
  { key: "news", emoji: "📰", label: "뉴스" },
  { key: "classic", emoji: "📖", label: "고전" },
  { key: "art", emoji: "🎨", label: "예술" },
  { key: "world", emoji: "🌍", label: "세계" },
  { key: "why", emoji: "🔬", label: "과학" },
  { key: "english", emoji: "🔤", label: "영어" },
];

type DayNavigatorProps = {
  title: string;
  emoji: string;
  topicKey?: string;
  dayNumber: number;
};

export default function DayNavigator({ title, emoji, topicKey, dayNumber }: DayNavigatorProps) {
  const router = useRouter();
  const keyword = themes[dayNumber - 1]?.keyword || "";
  const canPrev = dayNumber > 1;
  const canNext = dayNumber < themes.length;

  // DayContext 동기화 (localStorage + 커스텀 이벤트)
  useEffect(() => {
    try {
      dispatchDayChange(dayNumber - 1);
    } catch { /* ignore */ }
  }, [dayNumber]);

  // 토픽 전환 (좌우 스와이프)
  const currentTopicIdx = TOPICS.findIndex((t) => t.key === topicKey);
  const prevTopic = currentTopicIdx >= 0 ? TOPICS[(currentTopicIdx - 1 + TOPICS.length) % TOPICS.length] : null;
  const nextTopic = currentTopicIdx >= 0 ? TOPICS[(currentTopicIdx + 1) % TOPICS.length] : null;

  const touchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!topicKey) return;

    const onTouchStart = (e: TouchEvent) => {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchRef.current) return;
      const dx = e.changedTouches[0].clientX - touchRef.current.x;
      const dy = e.changedTouches[0].clientY - touchRef.current.y;
      touchRef.current = null;

      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0 && nextTopic) {
        router.push(`/${nextTopic.key}/${dayNumber}`);
      } else if (dx > 0 && prevTopic) {
        router.push(`/${prevTopic.key}/${dayNumber}`);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [topicKey, dayNumber, prevTopic, nextTopic, router]);

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
          <Link href={`/${prevTopic.key}/${dayNumber}`} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors mr-2" title={prevTopic.label}>‹</Link>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight">{emoji} {title}</h1>
        {nextTopic ? (
          <Link href={`/${nextTopic.key}/${dayNumber}`} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors ml-2" title={nextTopic.label}>›</Link>
        ) : null}
      </div>

      {/* Day 내비게이션: « ‹ Day 42 — 용기 › » */}
      <div className="mt-3 flex items-center justify-center gap-1">
        {canPrev ? (
          <Link href={`/${topicKey}/${Math.max(1, dayNumber - 7)}`}
            className="text-[var(--accent)] text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
            title="7일 전"
          >«</Link>
        ) : (
          <span className="text-[var(--accent)] opacity-20 text-2xl font-bold w-10 h-10 flex items-center justify-center">«</span>
        )}
        {canPrev ? (
          <Link href={`/${topicKey}/${dayNumber - 1}`}
            className="text-[var(--accent)] text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
          >‹</Link>
        ) : (
          <span className="text-[var(--accent)] opacity-20 text-3xl font-bold w-12 h-12 flex items-center justify-center">‹</span>
        )}
        <div className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold min-w-[140px] text-center">
          {`Day ${dayNumber}${keyword ? ` — ${keyword}` : ""}`}
        </div>
        {canNext ? (
          <Link href={`/${topicKey}/${dayNumber + 1}`}
            className="text-[var(--accent)] text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
          >›</Link>
        ) : (
          <span className="text-[var(--accent)] opacity-20 text-3xl font-bold w-12 h-12 flex items-center justify-center">›</span>
        )}
        {canNext ? (
          <Link href={`/${topicKey}/${Math.min(themes.length, dayNumber + 7)}`}
            className="text-[var(--accent)] text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
            title="7일 후"
          >»</Link>
        ) : (
          <span className="text-[var(--accent)] opacity-20 text-2xl font-bold w-10 h-10 flex items-center justify-center">»</span>
        )}
      </div>
    </header>
  );
}
