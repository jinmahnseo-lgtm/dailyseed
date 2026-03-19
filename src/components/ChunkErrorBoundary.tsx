"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // ChunkLoadError 또는 is not a function 에러 → 캐시 문제이므로 강제 리로드
    const msg = error?.message || "";
    if (
      msg.includes("is not a function") ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch")
    ) {
      const key = "dailyseed-reload-count";
      const count = Number(sessionStorage.getItem(key) || "0");
      if (count < 2) {
        sessionStorage.setItem(key, String(count + 1));
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-4xl mb-4">🌱</p>
            <h2 className="text-lg font-bold mb-2">페이지를 불러오지 못했어요</h2>
            <p className="text-sm text-gray-500 mb-4">
              브라우저 캐시 문제일 수 있어요.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem("dailyseed-reload-count");
                window.location.reload();
              }}
              className="px-6 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
