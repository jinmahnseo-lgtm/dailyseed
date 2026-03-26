"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import themes from "@/data/themes.json";

const SECTIONS = [
  { key: "news", emoji: "📰", label: "뉴스" },
  { key: "classic", emoji: "📖", label: "고전" },
  { key: "art", emoji: "🎨", label: "예술" },
  { key: "world", emoji: "🌍", label: "세계" },
  { key: "why", emoji: "🔬", label: "과학" },
  { key: "english", emoji: "📝", label: "영어" },
];

interface StudentProfile {
  id: string;
  display_name: string | null;
  created_at: string;
}

interface Mission {
  user_id: string;
  page: string;
  date: string;
  completed_at: string;
}

interface StudentData {
  profile: StudentProfile;
  missions: Mission[];
  stats: {
    totalDone: number;
    activeDays: number;
    perfectDays: number;
    recentDays: { dayIndex: number; done: string[] }[];
    sectionCounts: Record<string, number>;
  };
}

// Normalize mission date to day index: "0" → 0, "day0" → 0, "day123" → 123
// YYYY-MM-DD is ignored (cannot reliably map to day index)
function dateToDayIndex(date: string): number | null {
  // Pure number string: "0", "1", "42"
  if (/^\d+$/.test(date)) return parseInt(date, 10);
  // "day0", "day1", "day42"
  const m = date.match(/^day(\d+)$/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function computeStats(missions: Mission[]): StudentData["stats"] {
  // Group missions by dayIndex
  const byDay: Record<number, string[]> = {};
  for (const m of missions) {
    const idx = dateToDayIndex(m.date);
    if (idx === null) continue;
    if (!byDay[idx]) byDay[idx] = [];
    byDay[idx].push(m.page);
  }

  let totalDone = 0;
  let activeDays = 0;
  let perfectDays = 0;
  const sectionCounts: Record<string, number> = {};
  SECTIONS.forEach((s) => { sectionCounts[s.key] = 0; });

  const recentDays: { dayIndex: number; done: string[] }[] = [];

  for (let i = 0; i < themes.length; i++) {
    const done = byDay[i] || [];
    if (done.length > 0) {
      activeDays++;
      totalDone += done.length;
      if (done.length >= 6) perfectDays++;
      for (const page of done) {
        if (sectionCounts[page] !== undefined) sectionCounts[page]++;
      }
    }
    if (i < 30) {
      recentDays.push({ dayIndex: i, done });
    }
  }

  return { totalDone, activeDays, perfectDays, recentDays, sectionCounts };
}

const CACHE_KEY = "dailyseed-admin-cache";

function loadCache(): StudentData[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveCache(data: StudentData[]) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* */ }
}

function buildStudentData(
  profiles: StudentProfile[],
  missions: Mission[]
): StudentData[] {
  const missionsByStudent: Record<string, Mission[]> = {};
  for (const m of missions) {
    if (!missionsByStudent[m.user_id]) missionsByStudent[m.user_id] = [];
    missionsByStudent[m.user_id].push(m);
  }
  const result: StudentData[] = profiles.map((p) => ({
    profile: p,
    missions: missionsByStudent[p.id] || [],
    stats: computeStats(missionsByStudent[p.id] || []),
  }));
  result.sort((a, b) =>
    (a.profile.display_name || "").localeCompare(b.profile.display_name || "")
  );
  return result;
}

export default function AdminPage() {
  const { user, profile, loading } = useAuthContext();
  const [students, setStudents] = useState<StudentData[]>(() => loadCache() || []);
  const [fetching, setFetching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [initialized, setInitialized] = useState(() => loadCache() !== null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.replace("/login");
    }
  }, [loading, user]);

  // Quick role check from cached profile (show UI instantly)
  useEffect(() => {
    if (!loading && user && profile && profile.role !== "parent") {
      setAccessDenied(true);
      setInitialized(true);
    }
  }, [loading, user, profile]);

  // Fetch students — role check + links in parallel
  useEffect(() => {
    if (loading || !user || !supabase) return;

    async function fetchData() {
      setFetching(true);
      setError("");

      try {
        // Step 1: role check + links in parallel
        const [profileRes, linksRes] = await Promise.all([
          supabase!.from("profiles").select("*").eq("id", user!.id).single(),
          supabase!.from("parent_student_links").select("student_id").eq("parent_id", user!.id),
        ]);

        const freshProfile = profileRes.data;
        if (freshProfile?.role !== "parent") {
          setAccessDenied(true);
          setFetching(false);
          setInitialized(true);
          return;
        }

        try {
          localStorage.setItem("dailyseed-profile", JSON.stringify(freshProfile));
        } catch { /* */ }

        if (linksRes.error) throw linksRes.error;
        if (!linksRes.data || linksRes.data.length === 0) {
          setStudents([]);
          saveCache([]);
          setFetching(false);
          setInitialized(true);
          return;
        }

        const studentIds = linksRes.data.map((l: { student_id: string }) => l.student_id);

        // Step 2: student profiles + missions in parallel
        const [profilesRes, missionsRes] = await Promise.all([
          supabase!.from("profiles").select("id, display_name, created_at").in("id", studentIds),
          supabase!.from("missions").select("user_id, page, date, completed_at").in("user_id", studentIds),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (missionsRes.error) throw missionsRes.error;

        const result = buildStudentData(profilesRes.data || [], missionsRes.data || []);
        setStudents(result);
        saveCache(result);
      } catch (err) {
        console.error("Admin fetch error:", err);
        setError("학생 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setFetching(false);
        setInitialized(true);
      }
    }

    fetchData();
  }, [loading, user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) => (s.profile.display_name || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const detail = useMemo(() => {
    if (!selectedStudent) return null;
    return students.find((s) => s.profile.id === selectedStudent) || null;
  }, [students, selectedStudent]);

  const summary = useMemo(() => {
    const total = students.length;
    const activeToday = students.filter((s) =>
      s.stats.recentDays[0]?.done.length > 0
    ).length;
    const avgCompletion =
      total > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.stats.totalDone, 0) / total
          )
        : 0;
    return { total, activeToday, avgCompletion };
  }, [students]);

  if ((loading || !initialized) && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {loading ? "로그인 확인 중..." : "학생 데이터를 불러오는 중..."}
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-4xl block mb-3">🔒</span>
          <p className="text-gray-600 font-semibold mb-2">접근 권한이 없습니다</p>
          <p className="text-xs text-gray-400 mb-4">관리자 계정으로 로그인해주세요.</p>
          <a href="/" className="text-sm text-indigo-500 font-semibold hover:underline">홈으로 돌아가기</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hide BottomNav */}
      <style>{`nav.fixed.bottom-0 { display: none !important; }`}</style>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm">
              📋
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-800">DailySeed 관리자</h1>
              <p className="text-[10px] sm:text-[11px] text-gray-400">
                {profile?.display_name || "관리자"}님 · 학생 {summary.total}명
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            홈으로
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-indigo-500">{summary.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">전체 학생</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-green-500">{summary.activeToday}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">Day 1 학습</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-black text-amber-500">{summary.avgCompletion}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">1인당 평균 완료</p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-gray-500 font-semibold text-lg mb-2">
              연결된 학생이 없습니다
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              학생 명단을 dailyseed.net@gmail.com으로 보내주시면
              <br />
              계정 연결을 도와드리겠습니다.
            </p>
          </div>
        ) : (
          /* Layout: side-by-side on desktop, stacked on mobile */
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left: Student List — hidden on mobile when detail is open */}
            <div className={`${detail ? "hidden lg:block lg:w-80 lg:shrink-0" : "w-full lg:max-w-2xl"} transition-all`}>
              {/* Search */}
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="학생 이름 검색..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                />
              </div>

              {/* Student Cards */}
              <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
                {filtered.map((s) => {
                  const isSelected = selectedStudent === s.profile.id;
                  return (
                    <button
                      key={s.profile.id}
                      onClick={() => setSelectedStudent(s.profile.id)}
                      className={`w-full bg-white rounded-xl border p-3 sm:p-4 text-left hover:shadow-md transition-all ${
                        isSelected
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-gray-100 hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                            {(s.profile.display_name || "?")[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {s.profile.display_name || "이름 없음"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              학습 {s.stats.activeDays}일 · 완벽 {s.stats.perfectDays}일 · 총 {s.stats.totalDone}개
                            </p>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Mini progress bar */}
                      <div className="flex gap-1">
                        {s.stats.recentDays.slice(0, 7).map((d) => {
                          const ratio = d.done.length / 6;
                          return (
                            <div key={d.dayIndex} className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ratio >= 1 ? "bg-amber-400" : ratio > 0 ? "bg-amber-200" : ""
                                }`}
                                style={{ width: `${ratio * 100}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-gray-300 mt-1">최근 7일</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Student Detail */}
            {detail && (
              <div className="flex-1 min-w-0">
                {/* Mobile back button */}
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-indigo-500 font-semibold mb-3 active:opacity-70"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  학생 목록
                </button>
                <StudentDetail data={detail} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Student Detail Component ── */

function StudentDetail({ data }: { data: StudentData }) {
  const [viewAll, setViewAll] = useState(false);
  const { profile, stats } = data;

  // Build lookup: "page-dayIndex" → true
  const missionSet = useMemo(() => {
    const set = new Set<string>();
    for (const m of data.missions) {
      const idx = dateToDayIndex(m.date);
      if (idx !== null) set.add(`${m.page}-${idx}`);
    }
    return set;
  }, [data.missions]);

  const displayDays = viewAll
    ? Array.from({ length: themes.length }, (_, i) => i)
    : stats.recentDays.map((d) => d.dayIndex);

  return (
    <div>
      {/* Student header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-3 sm:mb-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-xl sm:text-2xl text-white font-bold">
            {(profile.display_name || "?")[0]}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-base sm:text-lg">
              {profile.display_name || "이름 없음"}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-400">
              가입일: {new Date(profile.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-indigo-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-black text-indigo-500">{stats.activeDays}</p>
            <p className="text-[10px] text-gray-500">학습한 날</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-black text-amber-500">{stats.perfectDays}</p>
            <p className="text-[10px] text-gray-500">완벽한 날</p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-black text-green-500">{stats.totalDone}</p>
            <p className="text-[10px] text-gray-500">총 완료</p>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-3">과목별 완료 현황</h3>
        <div className="space-y-2">
          {SECTIONS.map((s) => {
            const count = stats.sectionCounts[s.key] || 0;
            const max = themes.length;
            const pct = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-sm w-6 text-center">{s.emoji}</span>
                <span className="text-xs text-gray-600 w-10">{s.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 font-mono w-12 text-right">
                  {count}/{max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-by-day progress grid */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">
            {viewAll ? "전체 학습 기록" : "최근 30일 학습 기록"}
          </h3>
          <button
            onClick={() => setViewAll(!viewAll)}
            className="text-[11px] text-indigo-500 font-semibold hover:underline"
          >
            {viewAll ? "최근 30일만" : "전체 보기"}
          </button>
        </div>

        <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
          <div className="min-w-[380px]">
            {/* Column Headers */}
            <div className="flex items-center gap-1 px-1 mb-1.5">
              <span className="w-[36px] sm:w-[42px] text-[10px] text-gray-300 font-medium shrink-0">Day</span>
              <span className="w-[40px] sm:w-[48px] text-[10px] text-gray-300 font-medium shrink-0 text-center">키워드</span>
              <div className="flex-1 flex items-center justify-end gap-0.5 sm:gap-1">
                {SECTIONS.map((s) => (
                  <span key={s.key} className="w-[24px] sm:w-[28px] text-center text-[10px]">{s.emoji}</span>
                ))}
                <span className="w-[28px] text-[10px] text-gray-300 font-medium text-center">합계</span>
              </div>
            </div>

            {/* Day Rows */}
            <div className="max-h-[500px] overflow-y-auto space-y-0.5">
              {displayDays.map((dayIndex) => {
                const theme = themes[dayIndex];
                if (!theme) return null;
                const doneCount = SECTIONS.filter((s) =>
                  missionSet.has(`${s.key}-${dayIndex}`)
                ).length;
                const isPerfect = doneCount === 6;

                return (
                  <div
                    key={dayIndex}
                    className={`flex items-center gap-1 px-1 py-1 rounded-lg ${
                      isPerfect ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <span className="w-[36px] sm:w-[42px] text-[11px] font-mono font-bold text-gray-400 shrink-0 tabular-nums">
                      {dayIndex + 1}
                    </span>
                    <span className="w-[40px] sm:w-[48px] text-[10px] sm:text-[11px] font-bold text-gray-700 shrink-0 text-center truncate">
                      {theme.keyword}
                    </span>
                    <div className="flex-1 flex items-center justify-end gap-0.5 sm:gap-1">
                      {SECTIONS.map((s) => {
                        const done = missionSet.has(`${s.key}-${dayIndex}`);
                        return (
                          <span key={s.key} className="w-[24px] sm:w-[28px] h-[24px] flex items-center justify-center shrink-0">
                            {done ? (
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-gray-200" />
                            )}
                          </span>
                        );
                      })}
                      <span
                        className={`w-[28px] text-[10px] font-mono font-bold text-center tabular-nums ${
                          isPerfect ? "text-amber-500" : doneCount > 0 ? "text-gray-500" : "text-gray-200"
                        }`}
                      >
                        {doneCount}/6
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
