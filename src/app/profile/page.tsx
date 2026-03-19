"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, profile, loading, isConfigured, signOut, updateProfile } =
    useAuthContext();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    // Optimistic: show success immediately, DB saves in background
    updateProfile({ display_name: displayName.trim() || null }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRoleChange = async (role: "student" | "parent") => {
    await updateProfile({ role });
  };

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ignore */ }
    localStorage.removeItem("dailyseed-auth");
    window.location.href = "/";
  };

  const provider = user.app_metadata?.provider || "email";
  const email = user.email || "";
  const userName = displayName || user.user_metadata?.name || user.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 pb-24">
      {/* Header */}
      <header className="pt-8 pb-6">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-4 block"
        >
          ← 돌아가기
        </button>
        <h1 className="text-xl font-bold text-gray-800">내 프로필</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">
            {userName ? userName[0] : "U"}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {userName || "이름을 입력해주세요"}
            </p>
            <p className="text-xs text-gray-400">
              {provider === "kakao" ? "카카오" : provider === "google" ? "Google" : provider} 로그인 · {email}
            </p>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            표시 이름
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:outline-none"
            maxLength={20}
          />
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">
            역할
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleRoleChange("student")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                profile?.role === "student"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              🎒 학생
            </button>
            <button
              onClick={() => handleRoleChange("parent")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                profile?.role === "parent"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              👨‍👩‍👧 학부모
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-green-500 text-white"
              : saving
              ? "bg-gray-200 text-gray-400"
              : "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]"
          }`}
        >
          {saved ? "✓ 저장 완료" : saving ? "저장 중..." : "저장하기"}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
      >
        로그아웃
      </button>
    </div>
  );
}
