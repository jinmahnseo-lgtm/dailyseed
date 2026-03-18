"use client";

import Link from "next/link";
import { formatDateShort, formatDateCompact } from "@/hooks/useSharedDate";

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
};

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
}: DayNavigatorProps) {
  const isToday = date === today;
  const dateLabel = date ? formatDateShort(date) : "–";
  const todayCompact = today ? formatDateCompact(today) : "";

  return (
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {emoji} {title}
      </h1>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-30 text-4xl font-bold w-14 h-14 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ‹
        </button>
        <span className="bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-sm font-semibold">
          {dateLabel}{keyword ? ` — "${keyword}"` : ""}
        </span>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-30 text-4xl font-bold w-14 h-14 flex items-center justify-center rounded-full hover:bg-[var(--accent-light)] active:scale-90 transition-all"
        >
          ›
        </button>
      </div>
    </header>
  );
}
