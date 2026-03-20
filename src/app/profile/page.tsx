"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, profile, loading, signOut } =
    useAuthContext();

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace("/login");
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSignOut = async () => {
    try { await signOut(); } catch { /* ignore */ }
    window.location.href = "/";
  };

  const provider = user.app_metadata?.provider || "email";
  const email = user.email || "";
  const userName = profile?.display_name || user.user_metadata?.name || user.user_metadata?.full_name || "";

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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">
            {userName ? userName[0] : "U"}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {userName || "사용자"}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              {provider === "kakao" ? "카카오" : provider === "google" ? "Google" : provider} 로그인
              {profile?.tier === "premium" && (
                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">365일 이용권</span>
              )}
            </p>
            {email && (
              <p className="text-xs text-gray-400">{email}</p>
            )}
          </div>
        </div>
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
