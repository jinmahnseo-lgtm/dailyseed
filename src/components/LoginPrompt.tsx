"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";

export default function LoginPrompt() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700 font-medium leading-relaxed">
          로그인하면 학습 기록이 저장되고,<br />학습 결과를 메일로 공유할 수 있습니다.
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="mt-2 px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-[0.97]"
        >
          로그인하기
        </button>
      </div>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
