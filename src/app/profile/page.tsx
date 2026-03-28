"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMissionContext } from "@/contexts/MissionContext";
import { supabase } from "@/lib/supabase";
import themes from "@/data/themes.json";
import classics from "@/data/classics.json";
import arts from "@/data/arts.json";

const SECTIONS = [
  { key: "news", emoji: "📰", href: "/news" },
  { key: "classic", emoji: "📖", href: "/classic" },
  { key: "art", emoji: "🎨", href: "/art" },
  { key: "world", emoji: "🌍", href: "/world" },
  { key: "why", emoji: "🔬", href: "/why" },
  { key: "english", emoji: "📝", href: "/english" },
];


export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuthContext();
  const { isMissionDone } = useMissionContext();
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"keyword" | "classic" | "art">("keyword");
  const [missionCache, setMissionCache] = useState<Record<string, boolean>>({});
  const [linkedTeacher, setLinkedTeacher] = useState<{ name: string; email: string } | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace("/login");
    }
  }, [loading, user]);

  // Fetch linked teacher info (localStorage 캐시 우선 → DB 백그라운드 갱신)
  useEffect(() => {
    if (loading || !user || !supabase) {
      setTeacherLoading(false);
      return;
    }

    // 1) 캐시된 선생님 정보 즉시 표시
    const cacheKey = `dailyseed-linked-teacher-${user.id}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setLinkedTeacher(JSON.parse(cached));
        setTeacherLoading(false);
      }
    } catch { /* ignore */ }

    // 2) DB에서 최신 정보 fetch (백그라운드)
    async function fetchTeacher() {
      try {
        const { data: links } = await supabase!
          .from("parent_student_links")
          .select("parent_id")
          .eq("student_id", user!.id);

        if (!links || links.length === 0) {
          setLinkedTeacher(null);
          localStorage.removeItem(cacheKey);
          setTeacherLoading(false);
          return;
        }

        const parentId = links[0].parent_id;
        const { data: parentProfile } = await supabase!
          .from("profiles")
          .select("display_name, email")
          .eq("id", parentId)
          .single();

        if (parentProfile) {
          const teacher = {
            name: parentProfile.display_name || "선생님",
            email: parentProfile.email || "",
          };
          setLinkedTeacher(teacher);
          localStorage.setItem(cacheKey, JSON.stringify(teacher));
        }
      } catch {
        // DB 실패 시 캐시된 정보 유지
      } finally {
        setTeacherLoading(false);
      }
    }
    fetchTeacher();
  }, [loading, user]);

  // Build mission cache from Context
  useEffect(() => {
    const cache: Record<string, boolean> = {};
    for (let i = 0; i < themes.length; i++) {
      for (const s of SECTIONS) {
        cache[`${s.key}-${i}`] = isMissionDone(s.key, i);
      }
    }
    setMissionCache(cache);
  }, [isMissionDone]);

  // Compute stats
  const stats = useMemo(() => {
    let totalDone = 0;
    let perfectDays = 0;
    let activeDays = 0;
    const sectionCounts: Record<string, number> = {};
    SECTIONS.forEach(s => { sectionCounts[s.key] = 0; });

    for (let i = 0; i < themes.length; i++) {
      let dayDone = 0;
      for (const s of SECTIONS) {
        if (missionCache[`${s.key}-${i}`]) {
          dayDone++;
          sectionCounts[s.key]++;
          totalDone++;
        }
      }
      if (dayDone === 6) perfectDays++;
      if (dayDone > 0) activeDays++;
    }
    return { totalDone, perfectDays, activeDays, sectionCounts };
  }, [missionCache]);

  // Filter themes by search
  const filteredThemes = useMemo(() => {
    const list: { dayIndex: number; keyword: string; desc: string; matchInfo?: string }[] = [];
    for (let i = 0; i < themes.length; i++) {
      list.push({ dayIndex: i, keyword: themes[i].keyword, desc: themes[i].desc });
    }
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();

    if (searchMode === "classic") {
      const matched = new Map<number, string>();
      classics.forEach(c => {
        if (c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q)) {
          matched.set(c.day - 1, `${c.title} — ${c.author}`);
        }
      });
      return list
        .filter(t => matched.has(t.dayIndex))
        .map(t => ({ ...t, matchInfo: matched.get(t.dayIndex) }));
    }
    if (searchMode === "art") {
      const matched = new Map<number, string>();
      arts.forEach(a => {
        if (a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)) {
          matched.set(a.day - 1, `${a.title} — ${a.artist}`);
        }
      });
      return list
        .filter(t => matched.has(t.dayIndex))
        .map(t => ({ ...t, matchInfo: matched.get(t.dayIndex) }));
    }
    // default: keyword
    return list.filter(t => t.keyword.includes(q));
  }, [search, searchMode]);

  // if (loading || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full" />
  //     </div>
  //   );
  // }

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ignore */ }
    window.location.href = "/";
  };

  const handleSectionClick = (dayIndex: number, sectionKey: string) => {
    const section = SECTIONS.find(s => s.key === sectionKey);
    if (section) {
      window.location.href = `${section.href}/${dayIndex + 1}`;
    }
  };

  const provider = user?.app_metadata?.provider || "email";
  const email = user?.email || "";
  const userName = profile?.display_name || user?.user_metadata?.name || user?.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 pb-24">
      {/* Header */}
      <header className="pt-8 pb-6">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 block"
        >
          ← 돌아가기
        </button>
        <h1 className="text-xl font-bold text-gray-800">내 프로필</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">
            {userName ? userName[0] : "U"}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {userName || "사용자"}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              {provider === "kakao" ? "카카오" : provider === "google" ? "Google" : provider} 로그인
              <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">365일 이용권</span>
            </p>
            {email && (
              <p className="text-xs text-gray-400">{email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Linked Teacher */}
      {!teacherLoading && linkedTeacher && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">👩‍🏫</span>
            <h2 className="text-sm font-bold text-gray-800">연결된 선생님</h2>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              {linkedTeacher.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{linkedTeacher.name}</p>
              {linkedTeacher.email && (
                <p className="text-[11px] text-gray-400 truncate">{linkedTeacher.email}</p>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            선생님이 학습 진도를 확인할 수 있으며, 리포트가 자동 전달됩니다.
            연결 해제를 원하시면{" "}
            <a href="mailto:dailyseed.net@gmail.com" className="text-indigo-500 font-semibold hover:underline">
              dailyseed.net@gmail.com
            </a>
            으로 요청해주세요.
          </p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all mb-4"
      >
        로그아웃
      </button>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xl font-black text-amber-500">{stats.activeDays}</p>
          <p className="text-[11px] text-gray-400 font-medium">학습한 날</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xl font-black text-orange-500">{stats.perfectDays}</p>
          <p className="text-[11px] text-gray-400 font-medium">완벽한 날</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xl font-black text-rose-500">{stats.totalDone}</p>
          <p className="text-[11px] text-gray-400 font-medium">총 완료</p>
        </div>
      </div>

      {/* Learning History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-gray-800">학습 기록</h2>
          <span className="text-[11px] text-gray-400">{filteredThemes.length}개</span>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">학습 기록은 로그인한 회원에게만 정확하게 적용됩니다.</p>

        {/* Search Mode Chips */}
        <div className="flex gap-1.5 mb-2">
          {([
            { mode: "keyword" as const, label: "키워드" },
            { mode: "classic" as const, label: "고전" },
            { mode: "art" as const, label: "예술" },
          ]).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => { setSearchMode(mode); setSearch(""); }}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                searchMode === mode
                  ? "bg-amber-100 text-amber-700 border-amber-200 font-bold"
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              searchMode === "classic" ? "고전 제목 또는 작가 검색..."
                : searchMode === "art" ? "예술 작품 또는 작가 검색..."
                : "키워드 검색..."
            }
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-0.5 px-0.5 mb-1.5">
          <span className="w-[38px] text-[10px] text-gray-300 font-medium shrink-0">Day</span>
          <span className="w-[40px] text-[10px] text-gray-300 font-medium shrink-0 text-center">키워드</span>
          <div className="flex-1 flex items-center justify-end gap-[3px]">
            {SECTIONS.map(s => (
              <span key={s.key} className="w-[24px] text-center text-[10px]">{s.emoji}</span>
            ))}
            <span className="w-[24px] text-[10px] text-gray-300 font-medium text-center">합계</span>
          </div>
        </div>

        {/* Day Rows */}
        <div className="max-h-[400px] overflow-y-auto space-y-0.5">
          {filteredThemes.length === 0 && (
            <p className="text-center text-xs text-gray-300 py-6">검색 결과가 없습니다</p>
          )}
          {filteredThemes.map(({ dayIndex, keyword, matchInfo }) => {
            const doneCount = SECTIONS.filter(s => missionCache[`${s.key}-${dayIndex}`]).length;
            const isPerfect = doneCount === 6;

            return (
              <div
                key={dayIndex}
                className={`px-0.5 py-1 rounded-lg transition-colors ${
                  isPerfect ? "bg-amber-50/60" : "hover:bg-gray-50"
                }`}
              >
                {matchInfo && (
                  <p className="text-[9px] text-amber-600 truncate mb-0.5 pl-[38px]">{matchInfo}</p>
                )}
                <div className="flex items-center gap-0.5">
                {/* Day number */}
                <span className="w-[38px] text-[11px] font-mono font-bold text-gray-400 shrink-0 tabular-nums">
                  {dayIndex + 1}
                </span>

                {/* Keyword */}
                <span className="w-[40px] text-[11px] font-bold text-gray-700 shrink-0 text-center truncate">
                  {keyword}
                </span>

                {/* Section icons */}
                <div className="flex-1 flex items-center justify-end gap-[3px]">
                  {SECTIONS.map(s => {
                    const done = missionCache[`${s.key}-${dayIndex}`];
                    return (
                      <button
                        key={s.key}
                        onClick={() => handleSectionClick(dayIndex, s.key)}
                        className="w-[24px] h-[24px] flex items-center justify-center shrink-0"
                        title={`Day ${dayIndex + 1} ${s.key}`}
                      >
                        {done ? (
                          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200 hover:border-amber-300 transition-colors" />
                        )}
                      </button>
                    );
                  })}

                  {/* Count */}
                  <span className={`w-[24px] text-[10px] font-mono font-bold text-center tabular-nums ${
                    isPerfect ? "text-amber-500" : doneCount > 0 ? "text-gray-500" : "text-gray-200"
                  }`}>
                    {doneCount}/6
                  </span>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
