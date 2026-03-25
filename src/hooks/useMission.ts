"use client";

import { useCallback } from "react";
import { useMissionContext } from "@/contexts/MissionContext";

// 과목 페이지에서 사용하는 훅 — 인터페이스 동일: { done, complete }
export function useMission(page: string, dayIndex: number) {
  const { isMissionDone, completeMission } = useMissionContext();

  const done = isMissionDone(page, dayIndex);

  const complete = useCallback((answerData?: string) => {
    completeMission(page, dayIndex, answerData);
  }, [completeMission, page, dayIndex]);

  return { done, complete };
}
