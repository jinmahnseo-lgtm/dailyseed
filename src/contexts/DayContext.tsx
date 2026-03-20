"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import themes from "@/data/themes.json";

/* ── 설정 ─────────────────────────────────────── */
const STORAGE_KEY = "dailyseed-selected-day";
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "mahn823@empal.com").split(",");

function isAdmin(email: string | undefined | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

function getMaxDay(role: "guest" | "user" | "admin"): number {
  if (role === "admin") return 365;
  if (role === "user") return 50;
  return 5;
}

function getAccessMessage(role: "guest" | "user" | "admin"): string {
  if (role === "guest") return "로그인하면 50일간 콘텐츠를 이용할 수 있어요";
  if (role === "user") return "SNS에 DailySeed를 공유하고 dailyseed.net@gmail.com으로 보내주시면 365일 사용권을 드려요!";
  return "";
}

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

  accessToast: string;
}

const DayContext = createContext<DayContextValue | null>(null);

/* ── Provider ─────────────────────────────────── */
export function DayProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const role = isAdmin(user?.email) ? "admin" : user ? "user" : "guest";
  const maxDay = getMaxDay(role);

  // SSR 빌드와 동일한 초기값(0)으로 시작 → hydration 불일치 방지
  const [dayIndex, setDayIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [accessToast, setAccessToast] = useState("");

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

  /* 내비게이션 함수 */
  const showToast = useCallback((msg: string) => {
    setAccessToast(msg);
    setTimeout(() => setAccessToast(""), 7000);
  }, []);

  const saveDayIndex = useCallback((idx: number) => {
    setDayIndex(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
  }, []);

  const goPrev = useCallback(() => {
    if (dayIndex > 0) saveDayIndex(dayIndex - 1);
  }, [dayIndex, saveDayIndex]);

  const goNext = useCallback(() => {
    if (dayIndex < themes.length - 1) {
      if (dayIndex + 1 >= maxDay) {
        showToast(getAccessMessage(role));
        return;
      }
      saveDayIndex(dayIndex + 1);
    }
  }, [dayIndex, maxDay, role, showToast, saveDayIndex]);

  const goPrev7 = useCallback(() => {
    saveDayIndex(Math.max(0, dayIndex - 7));
  }, [dayIndex, saveDayIndex]);

  const goNext7 = useCallback(() => {
    const targetIdx = Math.min(themes.length - 1, dayIndex + 7);
    if (targetIdx >= maxDay) {
      showToast(getAccessMessage(role));
      return;
    }
    saveDayIndex(targetIdx);
  }, [dayIndex, maxDay, role, showToast, saveDayIndex]);

  const goToday = useCallback(() => {
    saveDayIndex(0);
  }, [saveDayIndex]);

  return (
    <DayContext.Provider value={{
      dayIndex, dayNumber, theme, keyword, hydrated,
      canPrev, canNext,
      goPrev, goNext, goPrev7, goNext7, goToday,
      accessToast,
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
