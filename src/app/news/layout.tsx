import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 뉴스 — DailySeed",
  description: "매일 새로운 시사 뉴스, 시사 용어 해설, 찬반 토론까지. 청소년을 위한 뉴스 읽기 습관을 길러보세요.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "오늘의 뉴스 — DailySeed",
    description: "매일 새로운 시사 뉴스, 시사 용어 해설, 찬반 토론까지. 청소년을 위한 뉴스 읽기 습관을 길러보세요.",
    url: "/news",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
