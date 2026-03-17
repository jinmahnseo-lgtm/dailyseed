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

export function getDayNumber(dateStr: string) {
  const start = new Date("2026-03-16");
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

export function useSharedDate() {
  const [date, setDateRaw] = useState("");
  const [today, setTodayVal] = useState("");

  useEffect(() => {
    const t = getToday();
    setTodayVal(t);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && themes.some((th) => th.date === stored)) {
      setDateRaw(stored);
    } else {
      const fallback = themes.find((th) => th.date === t) ? t : themes[0]?.date || t;
      setDateRaw(fallback);
    }
  }, []);

  const dateIndex = themes.findIndex((t) => t.date === date);
  const theme = dateIndex >= 0 ? themes[dateIndex] : undefined;
  const canPrev = dateIndex > 0;
  const canNext = dateIndex >= 0 && dateIndex < themes.length - 1;

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

  return { date, today: today, theme, canPrev, canNext, goPrev, goNext, goToday, setDate };
}
