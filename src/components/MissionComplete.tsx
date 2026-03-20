"use client";

import { useState, useEffect } from "react";
import {
  getMissionData,
  isReportSent,
  markReportSent,
  getStudentName,
  setStudentName as saveStudentName,
  getParentEmail,
  setParentEmail as saveParentEmail,
} from "@/hooks/useMission";
import { useAuthContext } from "@/contexts/AuthContext";
import { syncReportToSupabase } from "@/lib/sync";
import newsData from "@/data/news.json";
import classicsData from "@/data/classics.json";
import artsData from "@/data/arts.json";
import worldsData from "@/data/worlds.json";

const REPORT_API_URL = "/api/send-report";

const MISSION_KEYS = ["news", "classic", "art", "world", "why", "english"] as const;

function getMissionLabel(key: string, dayIndex: number): string {
  if (key === "news") {
    const n = newsData[dayIndex];
    return n?.debate ? `📰 오늘의 뉴스 - 찬반토론 '${n.debate.topic}'` : "📰 오늘의 뉴스 - 찬반토론";
  }
  if (key === "classic") {
    const c = classicsData[dayIndex];
    return c ? `📖 오늘의 고전 - '${c.question}'` : "📖 오늘의 고전 - 질문";
  }
  if (key === "art") {
    const a = artsData[dayIndex];
    return a ? `🎨 오늘의 예술 - '${a.title}'에 대한 작품평` : "🎨 오늘의 예술 - 작품평";
  }
  if (key === "world") {
    const w = worldsData[dayIndex];
    return w ? `🌍 오늘의 세계 - 퀴즈: '${w.quiz.question}'` : "🌍 오늘의 세계 - 퀴즈";
  }
  if (key === "why") return "🔬 오늘의 과학 - 실험";
  if (key === "english") return "📝 오늘의 영어 - 단어 퀴즈";
  return key;
}

type Props = {
  dayIndex: number;
  keyword: string;
  onGoNext?: () => void;
};

export default function MissionComplete({ dayIndex, keyword, onGoNext }: Props) {
  const { user, profile } = useAuthContext();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [studentName, setName] = useState("");
  const [parentEmail, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setSent(isReportSent(dayIndex));
    // Use profile display_name if logged in, otherwise localStorage
    setName(profile?.display_name || getStudentName());
    setEmail(getParentEmail());
  }, [dayIndex, profile]);

  const missionData = MISSION_KEYS.map((key) => {
    const answer = getMissionData(key, dayIndex);
    return {
      key,
      label: getMissionLabel(key, dayIndex),
      answer,
    };
  });

  const handleSend = async () => {
    if (!studentName.trim()) {
      setError("이름을 입력해줘!");
      return;
    }
    if (!parentEmail.trim() || !parentEmail.includes("@")) {
      setError("부모님 이메일을 정확히 입력해줘!");
      return;
    }

    setError("");
    setSending(true);

    // Save for next time
    saveStudentName(studentName.trim());
    saveParentEmail(parentEmail.trim());

    const payload = {
      studentName: studentName.trim(),
      parentEmail: parentEmail.trim(),
      dayLabel: `Day ${dayIndex + 1}`,
      keyword,
      missions: missionData,
    };

    try {
      const res = await fetch(REPORT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Send failed");
      markReportSent(dayIndex);
      setSent(true);

      // Sync report to Supabase (background)
      if (user?.id) {
        syncReportToSupabase(user.id, `day${dayIndex}`, parentEmail.trim()).catch(() => {});
      }
    } catch {
      setError("전송 실패. 다시 시도해줘!");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mb-6">
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 shadow-sm border border-yellow-200">
        <div className="text-center mb-4">
          <span className="text-5xl">🎉</span>
          <h3 className="text-xl font-bold text-amber-700 mt-2">
            오늘의 미션 완수!
          </h3>
          <p className="text-sm text-amber-600 mt-1">
            6개 미션을 모두 완료했어!
          </p>
        </div>

        {/* 미션 요약 */}
        <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
          {missionData.map((m, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-500">✅</span>
                <span className="font-semibold text-gray-700 text-sm">{m.label}</span>
              </div>
              {m.answer && (
                <p className="text-gray-600 text-sm ml-7 leading-relaxed">
                  {m.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        {sent ? (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <span className="text-2xl">✉️</span>
            <p className="text-green-700 font-semibold mt-1 text-sm">
              리포트가 발송되었어!
            </p>
            {onGoNext && (
              <button
                onClick={onGoNext}
                className="text-xs text-amber-600 font-semibold mt-2 hover:underline"
              >
                다음 날짜로 이동하기 →
              </button>
            )}
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md transition-all active:scale-[0.98]"
          >
            ✉️ 내 생각 공유하기
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                내 이름
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해줘"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:outline-none"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                받는 사람 이메일
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:outline-none"
                maxLength={100}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 font-semibold">{error}</p>
            )}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              공유하기 버튼 클릭을 통해, 향후 위의 메일로<br />
              DailySeed 안내가 발송되는 것에 동의합니다.
            </p>
            <button
              onClick={handleSend}
              disabled={sending}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                sending
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {sending ? "전송 중..." : "✉️ 공유하기"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
