"use client";

import { useCallback } from "react";
import { useMissionContext } from "@/contexts/MissionContext";
import { useAuthContext } from "@/contexts/AuthContext";

// 과목 페이지에서 사용하는 훅 — { done, complete, loading, isLoggedIn }
export function useMission(page: string, dayIndex: number) {
  const { isMissionDone, completeMission, loading } = useMissionContext();
  const { user } = useAuthContext();

  const done = isMissionDone(page, dayIndex);
  const isLoggedIn = !!user;

  const complete = useCallback((answerData?: string) => {
    completeMission(page, dayIndex, answerData);
  }, [completeMission, page, dayIndex]);

  return { done, complete, loading, isLoggedIn };
}
