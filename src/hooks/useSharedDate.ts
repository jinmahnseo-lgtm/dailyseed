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

export function getMaxDay(role: "guest" | "user" | "admin"): number {
  if (role === "admin") return 365;
  if (role === "user") return 30;
  return 5; // guest
}

export function getAccessMessage(role: "guest" | "user" | "admin"): string {
  if (role === "guest") return "로그인을 하시면 첫 30일의 콘텐츠를 보실 수 있습니다";
  if (role === "user") return "콘텐츠 준비중입니다";
  return "";
}

/** 하위 호환용 - 기존 코드에서 minDate/maxDate 참조하는 곳 */
export function getDateRange(role: "guest" | "user" | "admin") {
  const maxDay = getMaxDay(role);
  const maxIdx = Math.min(maxDay - 1, themes.length - 1);
  const maxDate = themes[maxIdx]?.date || "2099-12-31";
  return { minDate: themes[0]?.date || "2026-03-16", maxDate };
}

export function getMaxDate(role: "guest" | "user" | "admin") {
  return getDateRange(role).maxDate;
}

export function useSharedDate(role: "guest" | "user" | "admin" = "guest") {
  const [date, setDateRaw] = useState("");
  const [today, setTodayVal] = useState("");
  const [accessToast, setAccessToast] = useState("");

  useEffect(() => {
    const t = getToday();
    setTodayVal(t);
    const fallback = themes.find((th) => th.date === t) ? t : themes[0]?.date || t;
    setDateRaw(fallback);
  }, []);

  const maxDay = getMaxDay(role);
  const dateIndex = themes.findIndex((t) => t.date === date);
  const dayNumber = dateIndex >= 0 ? dateIndex + 1 : 0;
  const theme = dateIndex >= 0 ? themes[dateIndex] : undefined;

  const canPrev = dateIndex > 0;
  // canNext/canNext7: 테마 범위 끝이면 disabled, 접근 제한은 클릭 시 toast로 처리
  const canNext = dateIndex >= 0 && dateIndex < themes.length - 1;
  const canPrev7 = dateIndex > 0;
  const canNext7 = dateIndex >= 0 && dateIndex < themes.length - 1;

  const showToast = useCallback((msg: string) => {
    setAccessToast(msg);
    setTimeout(() => setAccessToast(""), 3000);
  }, []);

  const setDate = useCallback((d: string) => {
    const idx = themes.findIndex((t) => t.date === d);
    if (idx >= 0 && idx < maxDay) {
      setDateRaw(d);
      localStorage.setItem(STORAGE_KEY, d);
    }
  }, [maxDay]);

  const goPrev = useCallback(() => {
    if (dateIndex > 0) {
      const nd = themes[dateIndex - 1].date;
      setDateRaw(nd);
      localStorage.setItem(STORAGE_KEY, nd);
    }
  }, [dateIndex]);

  const goNext = useCallback(() => {
    if (dateIndex >= 0 && dateIndex < themes.length - 1) {
      if (dateIndex + 1 >= maxDay) {
        showToast(getAccessMessage(role));
        return;
      }
      const nd = themes[dateIndex + 1].date;
      setDateRaw(nd);
      localStorage.setItem(STORAGE_KEY, nd);
    }
  }, [dateIndex, maxDay, role, showToast]);

  const goPrev7 = useCallback(() => {
    const targetIdx = Math.max(0, dateIndex - 7);
    const nd = themes[targetIdx].date;
    setDateRaw(nd);
    localStorage.setItem(STORAGE_KEY, nd);
  }, [dateIndex]);

  const goNext7 = useCallback(() => {
    if (dateIndex >= 0) {
      const targetIdx = Math.min(themes.length - 1, dateIndex + 7);
      if (targetIdx >= maxDay) {
        showToast(getAccessMessage(role));
        return;
      }
      const nd = themes[targetIdx].date;
      setDateRaw(nd);
      localStorage.setItem(STORAGE_KEY, nd);
    }
  }, [dateIndex, maxDay, role, showToast]);

  const goToday = useCallback(() => {
    const t = getToday();
    const fallback = themes.find((th) => th.date === t) ? t : themes[0]?.date || t;
    setDateRaw(fallback);
    localStorage.setItem(STORAGE_KEY, fallback);
  }, []);

  const { minDate, maxDate } = getDateRange(role);

  return {
    date, today, theme, dayNumber,
    canPrev, canNext, canPrev7, canNext7,
    goPrev, goNext, goPrev7, goNext7,
    goToday, setDate,
    minDate, maxDate,
    accessToast,
  };
}
