"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import newsRaw from "@/data/news.json";
import { useSharedDate, isAdminEmail } from "@/hooks/useSharedDate";
import { useMission } from "@/hooks/useMission";
import { useAuthContext } from "@/contexts/AuthContext";
import DayNavigator from "@/components/DayNavigator";

interface GlossaryItem {
  term: string;
  def: string;
}
interface DebateItem {
  topic: string;
  pro: string;
  con: string;
}
interface NewsItem {
  date: string;
  title: string;
  summary: string;
  insight: string;
  question: string;
  glossary?: GlossaryItem[];
  debate?: DebateItem;
}

const news = newsRaw as NewsItem[];

export default function NewsPage() {
  const { user } = useAuthContext();
  const role = isAdminEmail(user?.email) ? "admin" : user ? "user" : "guest";
  const { date, today, theme, canPrev, canNext, goPrev, goNext, goToday, setDate, minDate, maxDate } =
    useSharedDate(role);
  const item = news.find((n) => n.date === date) || null;
  const { done, complete } = useMission("news", item?.date || "");

  const [side, setSide] = useState<"pro" | "con" | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setSide(null);
    setReason("");
  }, [date]);

  const handleSubmitDebate = () => {
    if (side && reason.trim()) {
      const label = side === "pro" ? "찬성" : "반대";
      complete(`[${label}] ${reason.trim()}`);
    }
  };

  return (
    <div
      className="theme-news min-h-screen px-4 py-8 max-w-lg mx-auto"
      style={{ background: "var(--background)" }}
    >
      <DayNavigator
        title="오늘의 뉴스"
        emoji="📰"
        date={date}
        today={today}
        keyword={theme?.keyword}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onSelectDate={setDate}
        topicKey="news"
        minDate={minDate}
        maxDate={maxDate}
        isGuest={role === "guest"}
      />

      {!item ? (
        <section className="mb-6">
          <div className="w-full bg-white rounded-2xl p-8 shadow-sm text-center">
            <span className="text-5xl block mb-4">📰</span>
            <h2 className="text-lg font-bold text-gray-700 mb-2">
              아직 뉴스가 준비되지 않았어요
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              이 날의 뉴스 콘텐츠는 아직 나오지 않았어요.<br />
              다른 날짜를 확인하거나, 나중에 다시 방문해 주세요!
            </p>
          </div>
        </section>
      ) : (
      <>
      {/* 뉴스 요약 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📰</span>
            <span className="font-semibold text-[var(--accent)]">
              오늘의 뉴스
            </span>
          </div>
          <h2 className="text-lg font-bold mb-3">{item.title}</h2>
          <div className="text-[1.05rem] leading-[1.8] whitespace-pre-line">
            {item.summary}
          </div>
        </div>
      </section>

      {/* 시사용어 */}
      {item.glossary && item.glossary.length > 0 && (
        <section className="mb-4">
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📚</span>
              <span className="font-semibold text-[var(--accent)]">
                시사용어
              </span>
            </div>
            <div className="space-y-3">
              {item.glossary.map((g, i) => (
                <div key={i} className="bg-blue-50 rounded-xl p-3">
                  <p className="font-bold text-blue-700 text-sm mb-0.5">
                    {g.term}
                  </p>
                  <p className="text-sm text-gray-700">{g.def}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 시사점 */}
      <section className="mb-4">
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="font-semibold text-[var(--accent)]">시사점</span>
          </div>
          <p className="text-base leading-relaxed">{item.insight}</p>
        </div>
      </section>

      {/* 찬반 토론 */}
      <section className="mb-6">
        <div className="w-full bg-[var(--accent-light)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚖️</span>
            <span className="font-semibold text-[var(--accent)]">
              미션! - 오늘의 찬반토론
            </span>
          </div>
          {item.debate ? (
            <>
              <p className="text-base font-medium mb-4">{item.debate.topic}</p>
              {done ? (
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <span className="text-2xl">✅</span>
                  <p className="text-green-700 font-semibold mt-1">
                    미션 완료!
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setSide("pro")}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                        side === "pro"
                          ? "bg-blue-100 border-blue-400 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      👍 찬성
                      <p className="text-xs font-normal mt-1 text-gray-500">
                        {item.debate.pro}
                      </p>
                    </button>
                    <button
                      onClick={() => setSide("con")}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                        side === "con"
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      👎 반대
                      <p className="text-xs font-normal mt-1 text-gray-500">
                        {item.debate.con}
                      </p>
                    </button>
                  </div>
                  {side && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="이유를 한 줄로 적어봐!"
                        className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm focus:border-[var(--accent)] focus:outline-none"
                        maxLength={200}
                      />
                      <button
                        onClick={handleSubmitDebate}
                        disabled={!reason.trim()}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                          reason.trim()
                            ? "bg-[var(--accent)] text-white hover:shadow-md"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        미션 완료! 🎉
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-lg font-medium leading-relaxed">
              {item.question}
            </p>
          )}
        </div>
      </section>

      <footer className="text-center mt-6 space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          🏠 홈으로 돌아가기
        </Link>
        <p className="text-xs text-[var(--text-muted)]">{item.date}</p>
      </footer>
      </>
      )}
    </div>
  );
}
