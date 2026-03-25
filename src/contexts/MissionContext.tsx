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

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [missions, setMissions] = useState<MissionMap>(new Map());
  const [reports, setReports] = useState<ReportSet>(new Set());
  const [loading, setLoading] = useState(true);
  const fetchedUserId = useRef<string | null>(null);

  // 로그인 시 전체 fetch
  useEffect(() => {
    if (!user?.id || !supabase) {
      setMissions(new Map());
      setReports(new Set());
      setLoading(false);
      fetchedUserId.current = null;
      return;
    }

    // 이미 같은 유저로 fetch 했으면 스킵
    if (fetchedUserId.current === user.id) return;

    let cancelled = false;
    setLoading(true);

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

        setMissions(mMap);
        setReports(rSet);
        fetchedUserId.current = user.id;
      } catch {
        // 네트워크 에러 시 빈 상태
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

    // Optimistic update
    setMissions(prev => {
      const next = new Map(prev);
      next.set(key, answerData || null);
      return next;
    });

    // DB upsert (background)
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
      // 실패 시 롤백하지 않음 (다음 fetch에서 교정)
    }
  }, [user?.id]);

  const markReportSent = useCallback(async (dayIndex: number, parentEmail: string) => {
    if (!user?.id || !supabase) return;

    const dateStr = String(dayIndex);

    // Optimistic update
    setReports(prev => {
      const next = new Set(prev);
      next.add(dateStr);
      return next;
    });

    // DB upsert (background)
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
  }, [user?.id]);

  return (
    <MissionContext.Provider value={{ isMissionDone, getMissionData, isReportSent, completeMission, markReportSent, loading }}>
      {children}
    </MissionContext.Provider>
  );
}
