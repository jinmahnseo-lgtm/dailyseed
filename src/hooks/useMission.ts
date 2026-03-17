"use client";

import { useState, useEffect, useCallback } from "react";

export function useMission(page: string, date: string) {
  const [done, setDoneState] = useState(false);
  const key = `dailyseed-${page}-${date}`;

  useEffect(() => {
    if (date) {
      setDoneState(localStorage.getItem(key) === "done");
    }
  }, [date, key]);

  const complete = useCallback(() => {
    localStorage.setItem(key, "done");
    setDoneState(true);
  }, [key]);

  return { done, complete };
}

export function isMissionDone(page: string, date: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`dailyseed-${page}-${date}`) === "done";
}
