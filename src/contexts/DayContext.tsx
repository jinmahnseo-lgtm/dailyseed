"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import themes from "@/data/themes.json";

/* ── 설정 ─────────────────────────────────────── */
const STORAGE_KEY = "dailyseed-selected-day";

/* ── Context 타입 ─────────────────────────────── */
interface DayContextValue {
  dayIndex: number;
  dayNumber: number;
  theme: (typeof themes)[number] | undefined;
  keyword: string;
  hydrated: boolean;

  canPrev: boolean;
  canNext: boolean;
  goPrev: () => void;
  goNext: () => void;
  goPrev7: () => void;
  goNext7: () => void;
  goToday: () => void;
}

const DayContext = createContext<DayContextValue | null>(null);

/* ── Provider (홈페이지 전용 Day 네비게이션) ──── */
export function DayProvider({ children }: { children: React.ReactNode }) {
  // SSR 빌드와 동일한 초기값(0)으로 시작 → hydration 불일치 방지
  const [dayIndex, setDayIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트에서 localStorage 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const idx = saved ? parseInt(saved, 10) : 0;
      if (idx >= 0 && idx < themes.length) {
        setDayIndex(idx);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  /* 파생값 */
  const dayNumber = dayIndex + 1;
  const theme = themes[dayIndex];
  const keyword = theme?.keyword || "";

  const canPrev = dayIndex > 0;
  const canNext = dayIndex < themes.length - 1;

  /* 내비게이션 함수 (홈페이지용) */
  const saveDayIndex = useCallback((idx: number) => {
    setDayIndex(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
  }, []);

  const goPrev = useCallback(() => {
    if (dayIndex > 0) saveDayIndex(dayIndex - 1);
  }, [dayIndex, saveDayIndex]);

  const goNext = useCallback(() => {
    if (dayIndex < themes.length - 1) saveDayIndex(dayIndex + 1);
  }, [dayIndex, saveDayIndex]);

  const goPrev7 = useCallback(() => {
    saveDayIndex(Math.max(0, dayIndex - 7));
  }, [dayIndex, saveDayIndex]);

  const goNext7 = useCallback(() => {
    saveDayIndex(Math.min(themes.length - 1, dayIndex + 7));
  }, [dayIndex, saveDayIndex]);

  const goToday = useCallback(() => {
    saveDayIndex(0);
  }, [saveDayIndex]);

  return (
    <DayContext.Provider value={{
      dayIndex, dayNumber, theme, keyword, hydrated,
      canPrev, canNext,
      goPrev, goNext, goPrev7, goNext7, goToday,
    }}>
      {children}
    </DayContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────── */
export function useDayContext() {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useDayContext must be used within DayProvider");
  return ctx;
}
