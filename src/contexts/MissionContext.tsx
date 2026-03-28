"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface MissionContextValue {
  isMissionDone: (page: string, dayIndex: number) => boolean;
  getMissionData: (page: string, dayIndex: number) => string;
  isReportSent: (dayIndex: number) => boolean;
  completeMission: (page: string, dayIndex: number, answerData?: string) => Promise<void>;
  markReportSent: (dayIndex: number, parentEmail: string) => Promise<void>;
  loading: boolean;
}

const MissionContext = createContext<MissionContextValue>({
  isMissionDone: () => false,
  getMissionData: () => "",
  isReportSent: () => false,
  completeMission: async () => {},
  markReportSent: async () => {},
  loading: true,
});

export function useMissionContext() {
  return useContext(MissionContext);
}

// 키: "news-0", "classic-3" 등
type MissionMap = Map<string, string | null>; // key → answer_data
type ReportSet = Set<string>; // "0", "1", ...

// sessionStorage 캐시 (페이지 이동 시 즉시 복원, 브라우저 닫으면 소멸)
const CACHE_KEY = "dailyseed-mission-cache";

function saveCache(userId: string, missions: MissionMap, reports: ReportSet) {
  try {
    const data = {
      userId,
      missions: Array.from(missions.entries()),
      reports: Array.from(reports),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadCache(userId: string): { missions: MissionMap; reports: ReportSet } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.userId !== userId) return null;
    return {
      missions: new Map(data.missions),
      reports: new Set(data.reports),
    };
  } catch {
    return null;
  }
}

function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [missions, setMissions] = useState<MissionMap>(new Map());
  const [reports, setReports] = useState<ReportSet>(new Set());
  const [loading, setLoading] = useState(true);
  const fetchedUserId = useRef<string | null>(null);

  // 로그인 시: 캐시 즉시 복원 → DB fetch (백그라운드)
  useEffect(() => {
    if (!user?.id || !supabase) {
      setMissions(new Map());
      setReports(new Set());
      setLoading(false);
      fetchedUserId.current = null;
      clearCache();
      return;
    }

    // 이미 같은 유저로 fetch 완료 → 스킵
    if (fetchedUserId.current === user.id) return;

    // 1) sessionStorage 캐시 즉시 복원 (네트워크 기다리지 않음)
    const cached = loadCache(user.id);
    if (cached) {
      setMissions(cached.missions);
      setReports(cached.reports);
      setLoading(false); // 캐시 있으면 loading 바로 해제
    }

    // 2) DB에서 최신 데이터 fetch
    let cancelled = false;

    (async () => {
      try {
        const [mRes, rRes] = await Promise.all([
          supabase!.from("missions").select("page, date, answer_data").eq("user_id", user.id),
          supabase!.from("reports").select("date").eq("user_id", user.id),
        ]);

        if (cancelled) return;

        const mMap = new Map<string, string | null>();
        if (mRes.data) {
          for (const m of mRes.data) {
            mMap.set(`${m.page}-${m.date}`, m.answer_data || null);
          }
        }

        const rSet = new Set<string>();
        if (rRes.data) {
          for (const r of rRes.data) {
            rSet.add(r.date);
          }
        }

        // DB 데이터 + 아직 upsert 안 된 optimistic 항목을 merge
        setMissions(prev => {
          const merged = new Map(mMap);
          // optimistic update로 추가된 항목 중 DB에 아직 없는 것 보존
          for (const [k, v] of prev) {
            if (!merged.has(k)) merged.set(k, v);
          }
          saveCache(user.id, merged, rSet);
          return merged;
        });
        setReports(rSet);
        fetchedUserId.current = user.id;
      } catch {
        // 캐시가 있으면 그걸로 유지, 없으면 빈 상태
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const isMissionDone = useCallback((page: string, dayIndex: number): boolean => {
    return missions.has(`${page}-${dayIndex}`);
  }, [missions]);

  const getMissionData = useCallback((page: string, dayIndex: number): string => {
    return missions.get(`${page}-${dayIndex}`) || "";
  }, [missions]);

  const isReportSent = useCallback((dayIndex: number): boolean => {
    return reports.has(String(dayIndex));
  }, [reports]);

  const completeMission = useCallback(async (page: string, dayIndex: number, answerData?: string) => {
    if (!user?.id || !supabase) return;

    const key = `${page}-${dayIndex}`;

    // Optimistic update (메모리 + 캐시)
    setMissions(prev => {
      const next = new Map(prev);
      next.set(key, answerData || null);
      // 캐시도 즉시 갱신
      saveCache(user.id, next, reports);
      return next;
    });

    // DB upsert
    try {
      await supabase!.from("missions").upsert(
        {
          user_id: user.id,
          page,
          date: String(dayIndex),
          answer_data: answerData || null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,page,date" }
      );
    } catch {
      // 실패 시 다음 fetch에서 교정
    }
  }, [user?.id, reports]);

  const markReportSent = useCallback(async (dayIndex: number, parentEmail: string) => {
    if (!user?.id || !supabase) return;

    const dateStr = String(dayIndex);

    // Optimistic update (메모리 + 캐시)
    setReports(prev => {
      const next = new Set(prev);
      next.add(dateStr);
      saveCache(user.id, missions, next);
      return next;
    });

    // DB upsert
    try {
      await supabase!.from("reports").upsert(
        {
          user_id: user.id,
          date: dateStr,
          parent_email: parentEmail,
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" }
      );
    } catch {
      // 실패 시 다음 fetch에서 교정
    }
  }, [user?.id, missions]);

  return (
    <MissionContext.Provider value={{ isMissionDone, getMissionData, isReportSent, completeMission, markReportSent, loading }}>
      {children}
    </MissionContext.Provider>
  );
}
