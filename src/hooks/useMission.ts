"use client";

import { useState, useEffect, useCallback } from "react";
import { syncMissionToSupabase } from "@/lib/sync";

let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null) {
  _currentUserId = userId;
}

export function useMission(page: string, dayIndex: number) {
  const [done, setDoneState] = useState(false);
  const key = `dailyseed-${page}-day${dayIndex}`;
  const dataKey = `dailyseed-${page}-day${dayIndex}-data`;

  useEffect(() => {
    setDoneState(localStorage.getItem(key) === "done");
  }, [key]);

  const complete = useCallback((answerData?: string) => {
    localStorage.setItem(key, "done");
    if (answerData) {
      localStorage.setItem(dataKey, answerData);
    }
    setDoneState(true);

    if (_currentUserId) {
      syncMissionToSupabase(_currentUserId, page, String(dayIndex), answerData).catch(() => {});
    }
  }, [key, dataKey, page, dayIndex]);

  return { done, complete };
}

export function isMissionDone(page: string, dayIndex: number): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`dailyseed-${page}-day${dayIndex}`) === "done";
}

export function getMissionData(page: string, dayIndex: number): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`dailyseed-${page}-day${dayIndex}-data`) || "";
}

export function isReportSent(dayIndex: number): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`dailyseed-report-day${dayIndex}`) === "sent";
}

export function markReportSent(dayIndex: number): void {
  localStorage.setItem(`dailyseed-report-day${dayIndex}`, "sent");
}

export function getStudentName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("dailyseed-student-name") || "";
}

export function setStudentName(name: string): void {
  localStorage.setItem("dailyseed-student-name", name);
}

export function getParentEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("dailyseed-parent-email") || "";
}

export function setParentEmail(email: string): void {
  localStorage.setItem("dailyseed-parent-email", email);
}
