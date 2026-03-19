"use client";

import { useState, useEffect, useCallback } from "react";
import themes from "@/data/themes.json";

const STORAGE_KEY = "dailyseed-selected-day";

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

/** 하위 호환용 */
export function getDateRange(role: "guest" | "user" | "admin") {
  const maxDay = getMaxDay(role);
  const maxIdx = Math.min(maxDay - 1, themes.length - 1);
  const maxDate = themes[maxIdx]?.date || "2099-12-31";
  return { minDate: themes[0]?.date || "2026-03-16", maxDate };
}

export function getMaxDate(role: "guest" | "user" | "admin") {
  return getDateRange(role).maxDate;
}

// 하위 호환용 - 사용하지 않지만 import 에러 방지
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
  const idx = themes.findIndex((t) => t.date === dateStr);
  return idx >= 0 ? idx + 1 : 0;
}

export function useSharedDate(role: "guest" | "user" | "admin" = "guest") {
  const [dayIndex, setDayIndex] = useState(-1); // -1 = not initialized
  const [accessToast, setAccessToast] = useState("");

  // 초기화: localStorage에서 마지막 학습 Day 복원, 없으면 Day 1 (index 0)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedIdx = saved ? parseInt(saved, 10) : 0;
    // 유효 범위 확인
    if (savedIdx >= 0 && savedIdx < themes.length) {
      setDayIndex(savedIdx);
    } else {
      setDayIndex(0);
    }
  }, []);

  const maxDay = getMaxDay(role);
  const dayNumber = dayIndex >= 0 ? dayIndex + 1 : 0;
  const date = dayIndex >= 0 ? themes[dayIndex]?.date || "" : "";
  const theme = dayIndex >= 0 ? themes[dayIndex] : undefined;

  const canPrev = dayIndex > 0;
  const canNext = dayIndex >= 0 && dayIndex < themes.length - 1;
  const canPrev7 = dayIndex > 0;
  const canNext7 = dayIndex >= 0 && dayIndex < themes.length - 1;

  const showToast = useCallback((msg: string) => {
    setAccessToast(msg);
    setTimeout(() => setAccessToast(""), 3000);
  }, []);

  const saveDayIndex = useCallback((idx: number) => {
    setDayIndex(idx);
    localStorage.setItem(STORAGE_KEY, String(idx));
  }, []);

  const setDate = useCallback((d: string) => {
    const idx = themes.findIndex((t) => t.date === d);
    if (idx >= 0 && idx < maxDay) {
      saveDayIndex(idx);
    }
  }, [maxDay, saveDayIndex]);

  const goPrev = useCallback(() => {
    if (dayIndex > 0) saveDayIndex(dayIndex - 1);
  }, [dayIndex, saveDayIndex]);

  const goNext = useCallback(() => {
    if (dayIndex >= 0 && dayIndex < themes.length - 1) {
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
    if (dayIndex >= 0) {
      const targetIdx = Math.min(themes.length - 1, dayIndex + 7);
      if (targetIdx >= maxDay) {
        showToast(getAccessMessage(role));
        return;
      }
      saveDayIndex(targetIdx);
    }
  }, [dayIndex, maxDay, role, showToast, saveDayIndex]);

  // goToday는 더 이상 "오늘 날짜"가 아니라 Day 1로 리셋
  const goToday = useCallback(() => {
    saveDayIndex(0);
  }, [saveDayIndex]);

  const { minDate, maxDate } = getDateRange(role);
  const today = ""; // 더 이상 사용하지 않음

  return {
    date, today, theme, dayNumber,
    canPrev, canNext, canPrev7, canNext7,
    goPrev, goNext, goPrev7, goNext7,
    goToday, setDate,
    minDate, maxDate,
    accessToast,
  };
}
