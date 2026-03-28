"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDayContext } from "@/contexts/DayContext";
import { useAuthContext } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

// ★ SPA 내비게이션 플래그 — 문제 시 false로 전환하면 즉시 <a> 풀리로드로 복원
const USE_SPA_NAV = true;

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
  const { user } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const router = USE_SPA_NAV ? useRouter() : null;

  const currentTopicIdx = TOPICS.findIndex((t) => t.key === topicKey);
  const prevTopic = currentTopicIdx >= 0 ? TOPICS[(currentTopicIdx - 1 + TOPICS.length) % TOPICS.length] : null;
  const nextTopic = currentTopicIdx >= 0 ? TOPICS[(currentTopicIdx + 1) % TOPICS.length] : null;

  const navigate = (href: string) => {
    if (USE_SPA_NAV && router) {
      router.push(href);
    } else {
      window.location.href = href;
    }
  };

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
        navigate(nextTopic.href);
      } else if (dx > 0 && prevTopic) {
        navigate(prevTopic.href);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [topicKey, prevTopic, nextTopic]);

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
          USE_SPA_NAV ? (
            <Link href={prevTopic.href} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors mr-2" title={prevTopic.label}>‹</Link>
          ) : (
            <a href={prevTopic.href} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors mr-2" title={prevTopic.label}>‹</a>
          )
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight">{emoji} {title}</h1>
        {nextTopic ? (
          USE_SPA_NAV ? (
            <Link href={nextTopic.href} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors ml-2" title={nextTopic.label}>›</Link>
          ) : (
            <a href={nextTopic.href} className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors ml-2" title={nextTopic.label}>›</a>
          )
        ) : null}
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
        <div className="mt-2 mx-auto max-w-xs animate-in fade-in text-center">
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-medium">
            🔒 {accessToast}
            {accessToast.includes("365") && (
              <> (<a href="/notice/3" className="underline font-bold hover:text-amber-800">공지 보기</a>)</>
            )}
          </p>
          {accessToast.includes("로그인하면") && !user && (
            <button
              onClick={() => setShowLogin(true)}
              className="mt-1.5 text-[11px] text-amber-700 font-bold underline hover:text-amber-900 transition-colors"
            >
              (로그인으로 이동하기)
            </button>
          )}
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}
