"use client";

import { useState, useEffect, useCallback } from "react";

import { useDayContext } from "@/contexts/DayContext";
import { isMissionDone, setCurrentUserId } from "@/hooks/useMission";
import { useAuthContext } from "@/contexts/AuthContext";
import { pullMissionsFromSupabase, migrateLocalStorageToSupabase, flushSyncQueue } from "@/lib/sync";
import MissionComplete from "@/components/MissionComplete";
import LoginModal from "@/components/LoginModal";
import { notices } from "@/data/notices";

const MENUS = [
  {
    href: "/news",
    icon: "📰",
    title: "오늘의 뉴스",
    desc: "뉴스 · 시사 용어 · 찬반 토론",
    key: "news",
    gradient: "from-blue-500 to-sky-400",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-100",
    accent: "text-blue-700",
    descColor: "text-blue-500/70",
    checkBg: "bg-blue-500",
    checkShadow: "shadow-blue-200",
  },
  {
    href: "/classic",
    icon: "📖",
    title: "오늘의 고전",
    desc: "고전 · 작가 소개 · 작품 배경",
    key: "classic",
    gradient: "from-amber-500 to-yellow-400",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-100",
    iconBg: "bg-amber-100",
    accent: "text-amber-800",
    descColor: "text-amber-600/70",
    checkBg: "bg-amber-500",
    checkShadow: "shadow-amber-200",
  },
  {
    href: "/art",
    icon: "🎨",
    title: "오늘의 예술",
    desc: "예술 작품 · 감상 포인트 · 작품평",
    key: "art",
    gradient: "from-violet-500 to-purple-400",
    bgLight: "bg-violet-50",
    borderColor: "border-violet-100",
    iconBg: "bg-violet-100",
    accent: "text-violet-700",
    descColor: "text-violet-500/70",
    checkBg: "bg-violet-500",
    checkShadow: "shadow-violet-200",
  },
  {
    href: "/world",
    icon: "🌍",
    title: "오늘의 세계",
    desc: "문화 · 음식 · 놀라운 사실",
    key: "world",
    gradient: "from-emerald-500 to-green-400",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-100",
    iconBg: "bg-emerald-100",
    accent: "text-emerald-700",
    descColor: "text-emerald-500/70",
    checkBg: "bg-emerald-500",
    checkShadow: "shadow-emerald-200",
  },
  {
    href: "/why",
    icon: "🔬",
    title: "오늘의 과학",
    desc: "과학 · 놀라운 사실 · 실험",
    key: "why",
    gradient: "from-orange-500 to-red-400",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-100",
    iconBg: "bg-orange-100",
    accent: "text-orange-700",
    descColor: "text-orange-500/70",
    checkBg: "bg-orange-500",
    checkShadow: "shadow-orange-200",
  },
  {
    href: "/english",
    icon: "📝",
    title: "오늘의 영어",
    desc: "핵심 문장 · 문법 · 단어 퀴즈",
    key: "english",
    gradient: "from-cyan-500 to-teal-400",
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-100",
    iconBg: "bg-cyan-100",
    accent: "text-cyan-700",
    descColor: "text-cyan-500/70",
    checkBg: "bg-cyan-500",
    checkShadow: "shadow-cyan-200",
  },
];

export default function Home() {
  const { user, profile, loading: authLoading } = useAuthContext();
  const {
    dayIndex, theme, dayNumber, canPrev, canNext,
    goPrev, goNext, goPrev7, goNext7, goToday, accessToast,
  } = useDayContext();
  const [missions, setMissions] = useState<Record<string, boolean>>({});
  const [showLogin, setShowLogin] = useState(false);
  const isLoggedIn = !!user;

  // NEW badge for notice banner
  const latestNoticeDate = notices.reduce((max, n) => n.date > max ? n.date : max, "");
  const [hasNewNotice, setHasNewNotice] = useState(false);
  useEffect(() => {
    const lastSeen = localStorage.getItem("notice-last-seen") || "";
    setHasNewNotice(latestNoticeDate > lastSeen);
  }, [latestNoticeDate]);

  // Keep useMission's global userId in sync
  useEffect(() => {
    setCurrentUserId(user?.id || null);
  }, [user]);

  // On login: migrate localStorage → Supabase, pull remote data
  useEffect(() => {
    if (user?.id) {
      migrateLocalStorageToSupabase(user.id).catch(() => {});
      pullMissionsFromSupabase(user.id).catch(() => {});
      flushSyncQueue(user.id).catch(() => {});
    }
  }, [user?.id]);

  const refreshMissions = useCallback(() => {
    setMissions({
      news: isMissionDone("news", dayIndex),
      classic: isMissionDone("classic", dayIndex),
      art: isMissionDone("art", dayIndex),
      world: isMissionDone("world", dayIndex),
      why: isMissionDone("why", dayIndex),
      english: isMissionDone("english", dayIndex),
    });
  }, [dayIndex]);

  useEffect(() => {
    refreshMissions();
  }, [refreshMissions]);

  useEffect(() => {
    window.addEventListener("focus", refreshMissions);
    document.addEventListener("visibilitychange", refreshMissions);
    return () => {
      window.removeEventListener("focus", refreshMissions);
      document.removeEventListener("visibilitychange", refreshMissions);
    };
  }, [refreshMissions]);

  const doneCount = Object.values(missions).filter(Boolean).length;
  const allDone =
    Object.keys(missions).length === 6 &&
    Object.values(missions).every(Boolean);
  const progressPercent = (doneCount / 6) * 100;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 pb-4">
      {/* Hero Header */}
      <header className="pt-8 pb-2 text-center relative">
        {/* Login/Profile icon */}
        <div className="absolute right-0 top-8">
          {user ? (
            <a href="/profile">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-sm text-white font-bold hover:scale-105 transition-transform">
                {profile?.display_name?.[0] || user?.user_metadata?.name?.[0] || user?.user_metadata?.full_name?.[0] || "U"}
              </div>
            </a>
          ) : (
            <button onClick={() => setShowLogin(true)}>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
            </button>
          )}
        </div>
        <div
          className="inline-flex items-center gap-2 group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">
            🌱
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            DailySeed
          </h1>
        </div>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5 font-medium">
          데일리시드, 청소년의 교양을 위한 매일의 씨앗
        </p>
      </header>

      {/* Notice Banner */}
      <a href="/notice" className="block mt-3" onClick={() => localStorage.setItem("notice-last-seen", latestNoticeDate)}>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 hover:shadow-sm active:scale-[0.98] transition-all">
          <span className="text-lg">📢</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800 truncate flex items-center gap-1.5">
              공지사항
              {hasNewNotice && (
                <span className="inline-flex items-center bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </p>
            <p className="text-[11px] font-semibold text-amber-700/80 truncate">이벤트, 제휴 문의 등 새로운 소식을 확인하세요</p>
          </div>
          <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>

      {/* D-number Navigator */}
      <div className="flex items-center justify-center gap-1 mt-4 mb-5">
        <button onClick={goPrev7} disabled={!canPrev}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] disabled:opacity-20 hover:bg-gray-100 active:scale-90 transition-all text-2xl font-bold"
          title="7일 전"
        >«</button>
        <button onClick={goPrev} disabled={!canPrev}
          className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-muted)] disabled:opacity-20 hover:bg-gray-100 active:scale-90 transition-all text-3xl font-bold"
        >‹</button>
        <div className="flex items-center gap-2 bg-white px-5 py-2 rounded-full border border-[var(--border-light)] min-w-[140px] justify-center"
          suppressHydrationWarning>
          <span className="text-sm font-bold text-[var(--foreground)]" suppressHydrationWarning>
            {`Day ${dayNumber}`}
          </span>
        </div>
        <button onClick={goNext} disabled={!canNext}
          className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-muted)] disabled:opacity-20 hover:bg-gray-100 active:scale-90 transition-all text-3xl font-bold"
        >›</button>
        <button onClick={goNext7} disabled={!canNext}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] disabled:opacity-20 hover:bg-gray-100 active:scale-90 transition-all text-2xl font-bold"
          title="7일 후"
        >»</button>
      </div>

      {/* Access restriction toast */}
      {accessToast && (
        <div className="mb-4 mx-auto max-w-xs animate-in fade-in text-center">
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-medium">
            🔒 {accessToast}
            {accessToast.includes("365") && (
              <> (<a href="/notice/3" className="underline font-bold hover:text-amber-800">공지 보기</a>)</>
            )}
          </p>
          {accessToast.includes("로그인하면") && (
            <button
              onClick={() => setShowLogin(true)}
              className="mt-1.5 text-[11px] text-amber-700 font-bold underline hover:text-amber-900 transition-colors"
            >
              (로그인으로 이동하기)
            </button>
          )}
        </div>
      )}

      {/* Keyword Card */}
      <section className="mb-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-7 text-white animated-gradient">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase mb-2">
              오늘의 키워드
            </p>
            <h2 className="text-4xl font-black tracking-tight mb-2 drop-shadow-sm">
              {theme?.keyword || "–"}
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              {theme?.desc || ""}
            </p>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      {doneCount > 0 && !allDone && (
        <section className="mb-5 fade-up">
          <div className="bg-white rounded-2xl px-5 py-4 border border-[var(--border-light)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-[var(--foreground)]">
                오늘의 진행률
              </span>
              <span className="text-xs font-bold text-amber-500">
                {doneCount}/6 완료
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full progress-animate transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Mission Complete */}
      {allDone && (
        <MissionComplete dayIndex={dayIndex} keyword={theme?.keyword || ""} onGoNext={canNext ? goNext : undefined} />
      )}

      {/* Menu Cards - 2x3 Grid */}
      <section className="grid grid-cols-2 gap-3">
        {MENUS.map((menu, i) => {
          const mKey = menu.key as string;
          const isDone = missions[mKey];

          const handleClick = (e: React.MouseEvent) => {
            // Allow access to today's content without login
            // Only require login for other dates
          };

          return (
            <a key={menu.href} href={menu.href} onClick={handleClick}>
              <div
                className={`fade-up fade-up-delay-${i + 1} group relative bg-white rounded-2xl p-4 border border-[var(--border-light)] hover:shadow-md transition-all duration-200 active:scale-[0.97] h-full`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Icon + Check */}
                <div className="flex items-start justify-between mb-2.5">
                  <div
                    className={`w-11 h-11 ${menu.iconBg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform`}
                  >
                    {menu.icon}
                  </div>
                  {isDone ? (
                    <div
                      className={`w-6 h-6 ${menu.checkBg} rounded-full flex items-center justify-center shadow-sm ${menu.checkShadow}`}
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  )}
                </div>

                {/* Title & Desc */}
                <h2 className={`text-sm font-bold ${menu.accent} leading-snug`}>
                  {menu.title}
                </h2>
                <p className={`text-[11px] font-semibold ${menu.descColor} mt-0.5 leading-relaxed`}>
                  {menu.desc}
                </p>

                {/* Bottom accent line when done */}
                {isDone && (
                  <div className={`absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r ${menu.gradient} rounded-full opacity-40`} />
                )}
              </div>
            </a>
          );
        })}
      </section>

      {/* Login prompt for non-logged-in users */}
      {!isLoggedIn && !authLoading && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs text-amber-600 font-semibold hover:underline"
          >
            비회원은 Day 1-5 체험 가능. 로그인하면 Day 1-50까지! →
          </button>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      {/* Footer */}
      <footer className="text-center mt-8 mb-2">
        <p className="text-xs text-[var(--text-subtle)] font-medium">
          하나의 키워드, 여섯 가지 시선으로 세상을 넓혀요
        </p>
        <p className="text-[10px] text-[var(--text-subtle)]/50 mt-1">
          by 준·수 아빠
        </p>
      </footer>
    </div>
  );
}
