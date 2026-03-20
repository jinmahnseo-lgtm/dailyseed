import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 영어 — DailySeed",
  description: "매일 핵심 영어 문장, 문법 해설, 단어 퀴즈로 영어 실력을 키워보세요. 청소년을 위한 영어 학습.",
  openGraph: {
    title: "오늘의 영어 — DailySeed",
    description: "매일 핵심 영어 문장, 문법 해설, 단어 퀴즈로 영어 실력을 키워보세요. 청소년을 위한 영어 학습.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
