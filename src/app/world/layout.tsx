import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 세계 — DailySeed",
  description: "매일 세계 각국의 문화, 음식, 놀라운 사실을 탐험해보세요. 청소년을 위한 세계 문화 탐구.",
  openGraph: {
    title: "오늘의 세계 — DailySeed",
    description: "매일 세계 각국의 문화, 음식, 놀라운 사실을 탐험해보세요. 청소년을 위한 세계 문화 탐구.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
