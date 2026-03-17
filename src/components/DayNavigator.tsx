"use client";

type DayNavigatorProps = {
  title: string;
  emoji: string;
  dayNum: number;
  date: string;
  today: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function DayNavigator({
  title,
  emoji,
  dayNum,
  date,
  today,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
}: DayNavigatorProps) {
  const isToday = date === today;

  return (
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {emoji} {title}
      </h1>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="text-[var(--accent)] disabled:opacity-30 text-xl font-bold px-2"
        >
          ‹
        </button>
        <span className="bg-[var(--accent-light)] text-[var(--accent)] px-3 py-1 rounded-full text-sm font-semibold">
          Day {dayNum}
        </span>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="text-[var(--accent)] disabled:opacity-30 text-xl font-bold px-2"
        >
          ›
        </button>
      </div>
      {!isToday && (
        <button
          onClick={onToday}
          className="mt-2 text-xs text-[var(--accent)] underline"
        >
          오늘로 돌아가기
        </button>
      )}
    </header>
  );
}
