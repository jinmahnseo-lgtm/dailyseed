"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDateShort, getMaxDate } from "@/hooks/useSharedDate";
import themes from "@/data/themes.json";

const TOPICS = [
  { key: "news", emoji: "📰", label: "뉴스", href: "/news" },
  { key: "classic", emoji: "📖", label: "고전", href: "/classic" },
  { key: "art", emoji: "🎨", label: "예술", href: "/art" },
  { key: "world", emoji: "🌍", label: "세계", href: "/world" },
  { key: "why", emoji: "🔬", label: "과학", href: "/why" },
  { key: "english", emoji: "🔤", label: "영어", href: "/english" },
];

type DayNavigatorProps = {
  title: string;
  emoji: string;
  date: string;
  today: string;
  keyword?: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate?: (date: string) => void;
  /** Current topic key for tab highlight (e.g. "classic") */
  topicKey?: string;
};

const themeSet = new Set(themes.map((t) => t.date));
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = Array(startDow).fill(null);

  for (let d = 1; d <= lastDay; d++) {
    row.push(d);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }
  return rows;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DayNavigator({
  title,
  emoji,
  date,
  today,
  keyword,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
  topicKey,
}: DayNavigatorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const parsedDate = date ? new Date(date + "T00:00:00") : new Date();
  const [calYear, setCalYear] = useState(parsedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    if (date) {
      const d = new Date(date + "T00:00:00");
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
    }
  }, [date]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const dateLabel = date ? formatDateShort(date) : "–";
  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  };

  const maxDate = getMaxDate();

  const handleDayClick = (day: number) => {
    const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
    if (themeSet.has(dateStr) && dateStr <= maxDate && onSelectDate) {
      onSelectDate(dateStr);
      setOpen(false);
    }
  };

  // Topic navigation
  const currentTopicIdx = TOPICS.findIndex((t) => t.key === topicKey);

  return (
    <header className="text-center mb-6 relative">
      {/* Top bar: Home button + Topic tabs */}
      {topicKey && (
        <div className="flex items-center gap-2 mb-4">
          {/* Home button */}
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            title="홈으로"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
          {/* Topic tabs */}
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
            {TOPICS.map((t) => (
              <button
                key={t.key}
                onClick={() => router.push(t.href)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  t.key === topicKey
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date navigator */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-30 text-4xl font-bold w-14 h-14 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ‹
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {dateLabel}{keyword ? ` — "${keyword}"` : ""}
          <span className="text-xs opacity-60">{open ? "▲" : "▼"}</span>
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-30 text-4xl font-bold w-14 h-14 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ›
        </button>
      </div>

      {/* Calendar popup */}
      {open && (
        <div
          ref={calRef}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-[320px] animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold">‹</button>
            <span className="font-bold text-gray-800">{calYear}년 {calMonth + 1}월</span>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold">›</button>
          </div>
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>{d}</div>
            ))}
          </div>
          {calDays.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-0">
              {row.map((day, ci) => {
                if (day === null) return <div key={ci} className="h-9" />;
                const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
                const hasTheme = themeSet.has(dateStr) && dateStr <= maxDate;
                const isSelected = dateStr === date;
                const isToday = dateStr === today;
                return (
                  <button
                    key={ci}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasTheme}
                    className={`h-9 w-full rounded-lg text-sm font-medium transition-all relative
                      ${isSelected ? "bg-[var(--accent)] text-white font-bold shadow-md"
                        : isToday ? "bg-[var(--accent-light)] text-[var(--accent)] font-bold ring-2 ring-[var(--accent)] ring-opacity-40"
                        : hasTheme ? "hover:bg-gray-100 text-gray-700 cursor-pointer" : "text-gray-200 cursor-default"}
                      ${ci === 0 && !isSelected ? "text-red-400" : ""}
                      ${ci === 6 && !isSelected ? "text-blue-400" : ""}
                    `}
                  >
                    {day}
                    {hasTheme && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          <button
            onClick={() => { onToday(); setOpen(false); }}
            className="mt-3 w-full py-2 rounded-xl text-sm font-semibold bg-[var(--accent-light)] text-[var(--accent)] hover:shadow-md transition-all"
          >
            📍 오늘로 이동
          </button>
        </div>
      )}
    </header>
  );
}
