"use client";

import { useState, useEffect } from "react";
import arts from "@/data/arts.json";
import { useSharedDate } from "@/hooks/useSharedDate";
import { useMission } from "@/hooks/useMission";
import DayNavigator from "@/components/DayNavigator";

export default function ArtPage() {
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday } =
    useSharedDate();
  const art = arts.find((a) => a.date === date) || arts[0];
  const { done, complete } = useMission("art", art?.date || "");
  const [review, setReview] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setReview("");
    setImgError(false);
  }, [date]);

  if (!art) return null;

  return (
    <div
      className="theme-art min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator
        title="오늘의 명화"
        emoji="🎨"
        date={art.date}
        today={today}
        keyword={theme?.keyword}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      {/* 작품 정보 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🖼️</span>
            <span className="font-semibold text-[var(--accent)]">
              작품 소개
            </span>
          </div>
          <h2 className="text-xl font-bold">{art.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            {art.artist} · {art.year}년 · {art.country}
          </p>
          {art.image_url && !imgError && (
            <div className="mb-3">
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={art.image_url}
                  alt={`${art.title} — ${art.artist}`}
                  className="w-full h-auto object-contain max-h-[400px]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              </div>
              {art.source_url && (
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  출처:{" "}
                  <a
                    href={art.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-500"
                  >
                    {art.source_label || "Wikipedia"}
                  </a>
                </p>
              )}
            </div>
          )}
          <div className="text-[1.05rem] leading-[1.8]">{art.story}</div>
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-[var(--accent)]">
              이것만은 봐!
            </span>
          </div>
          <p className="text-base leading-relaxed">{art.look_for}</p>
        </div>
      </section>

      {/* 재미있는 사실 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-[var(--accent)]">
              알고 보면 더 재밌는
            </span>
          </div>
          <p className="text-base leading-relaxed">{art.fun_fact}</p>
        </div>
      </section>

      {/* 나의 그림평 미션 */}
      <section className="mb-6">
        <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✏️</span>
            <span className="font-semibold text-[var(--accent)]">
              나의 그림평
            </span>
          </div>
          {done ? (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-semibold mt-1">미션 완료!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="이 그림에 대한 감상을 한 줄로 적어봐!"
                className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm focus:border-[var(--accent)] focus:outline-none bg-white"
                maxLength={200}
              />
              <button
                onClick={() => {
                  if (review.trim()) complete();
                }}
                disabled={!review.trim()}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  review.trim()
                    ? "bg-[var(--accent)] text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                미션 완료! 🎉
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-[var(--text-muted)]">
        <p>{art.date}</p>
      </footer>
    </div>
  );
}
