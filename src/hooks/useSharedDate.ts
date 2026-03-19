"use client";

import { useState, useEffect, useCallback } from "react";
import themes from "@/data/themes.json";

const STORAGE_KEY = "dailyseed-selected-date";

export function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatDateCompact(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

const ADMIN_EMAILS = ["mahn823@empal.com"];

export function isAdminEmail(email: string | undefined | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

/**
 * 날짜 접근 범위 계산
 * - 비로그인: 오늘만 (min=오늘, max=오늘)
 * - 일반 로그인: 과거 전체 ~ 오늘+7일
 * - 관리자: 전체
 */
export function getDateRange(role: "guest" | "user" | "admin") {
  const todayStr = getToday();
  if (role === "admin") return { minDate: "2000-01-01", maxDate: "2099-12-31" };
  if (role === "guest") return { minDate: todayStr, maxDate: todayStr };
  // user: 과거 전체 ~ 오늘+7일
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const maxDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { minDate: "2000-01-01", maxDate };
}

/** 하위 호환용 */
export function getMaxDate(role: "guest" | "user" | "admin") {
  return getDateRange(role).maxDate;
}

/**
 * 날짜 관리 훅
 *
 * 접근 규칙:
 * - 비로그인(guest): 오늘 하루만. 화살표/달력 비활성.
 * - 일반 로그인(user): 과거 전체 + 오늘 + 미래 7일.
 * - 관리자(admin): 전체 1년.
 */
export function useSharedDate(role: "guest" | "user" | "admin" = "guest") {
  const [date, setDateRaw] = useState("");
  const [today, setTodayVal] = useState("");

  useEffect(() => {
    const t = getToday();
    setTodayVal(t);
    const fallback = themes.find((th) => th.date === t) ? t : themes[0]?.date || t;
    setDateRaw(fallback);
  }, []);

  const { minDate, maxDate } = getDateRange(role);
  const dateIndex = themes.findIndex((t) => t.date === date);
  const theme = dateIndex >= 0 ? themes[dateIndex] : undefined;

  const canPrev = dateIndex > 0 && themes[dateIndex - 1].date >= minDate;
  const canNext = dateIndex >= 0 && dateIndex < themes.length - 1
    && themes[dateIndex + 1].date <= maxDate;

  const setDate = useCallback((d: string) => {
    setDateRaw(d);
    localStorage.setItem(STORAGE_KEY, d);
  }, []);

  const goPrev = useCallback(() => {
    if (dateIndex > 0) {
      const nd = themes[dateIndex - 1].date;
      setDateRaw(nd);
      localStorage.setItem(STORAGE_KEY, nd);
    }
  }, [dateIndex]);

  const goNext = useCallback(() => {
    if (dateIndex >= 0 && dateIndex < themes.length - 1) {
      const nd = themes[dateIndex + 1].date;
      setDateRaw(nd);
      localStorage.setItem(STORAGE_KEY, nd);
    }
  }, [dateIndex]);

  const goToday = useCallback(() => {
    const t = getToday();
    const fallback = themes.find((th) => th.date === t) ? t : themes[0]?.date || t;
    setDateRaw(fallback);
    localStorage.setItem(STORAGE_KEY, fallback);
  }, []);

  return { date, today, theme, canPrev, canNext, goPrev, goNext, goToday, setDate, minDate, maxDate };
}
