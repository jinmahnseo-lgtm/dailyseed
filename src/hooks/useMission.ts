"use client";

import { useState, useEffect, useCallback } from "react";

export function useMission(page: string, date: string) {
  const [done, setDoneState] = useState(false);
  const key = `dailyseed-${page}-${date}`;
  const dataKey = `dailyseed-${page}-${date}-data`;

  useEffect(() => {
    if (date) {
      setDoneState(localStorage.getItem(key) === "done");
    }
  }, [date, key]);

  const complete = useCallback((answerData?: string) => {
    localStorage.setItem(key, "done");
    if (answerData) {
      localStorage.setItem(dataKey, answerData);
    }
    setDoneState(true);
  }, [key, dataKey]);

  return { done, complete };
}

export function isMissionDone(page: string, date: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`dailyseed-${page}-${date}`) === "done";
}

export function getMissionData(page: string, date: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`dailyseed-${page}-${date}-data`) || "";
}

export function isReportSent(date: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`dailyseed-report-${date}`) === "sent";
}

export function markReportSent(date: string): void {
  localStorage.setItem(`dailyseed-report-${date}`, "sent");
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
