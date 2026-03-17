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

const ADMIN_EMAIL = "jinmahn.seo@gmail.com";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/PLACEHOLDER/exec";

const MISSION_LABELS: Record<string, string> = {
  news: "📰 찬반토론",
  classic: "📖 오늘의 질문",
  art: "🎨 작품평",
  world: "🌍 퀴즈",
  why: "🔬 실험",
  english: "📝 단어 퀴즈",
};

type Props = {
  date: string;
  keyword: string;
};

export default function MissionComplete({ date, keyword }: Props) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [studentName, setName] = useState("");
  const [parentEmail, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setSent(isReportSent(date));
    setName(getStudentName());
    setEmail(getParentEmail());
  }, [date]);

  const missionData = Object.entries(MISSION_LABELS).map(([key, label]) => ({
    label,
    answer: getMissionData(key, date),
  }));

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
      adminEmail: ADMIN_EMAIL,
      date,
      keyword,
      missions: missionData,
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // no-cors always returns opaque response, so we assume success
      markReportSent(date);
      setSent(true);
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
        <div className="bg-white rounded-xl p-4 mb-4 space-y-2">
          {missionData.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-green-500 mt-0.5">✅</span>
              <div>
                <span className="font-semibold text-gray-700">{m.label}</span>
                {m.answer && (
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                    {m.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <span className="text-2xl">✉️</span>
            <p className="text-green-700 font-semibold mt-1 text-sm">
              리포트가 발송되었어!
            </p>
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md transition-all active:scale-[0.98]"
          >
            ✉️ 부모님께 리포트 보내기
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
                부모님 이메일
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
            <button
              onClick={handleSend}
              disabled={sending}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                sending
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {sending ? "전송 중..." : "✉️ 리포트 보내기"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
