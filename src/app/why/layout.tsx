import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 과학 — DailySeed",
  description: "매일 흥미로운 과학 주제와 놀라운 사실, 실험을 만나보세요. 청소년을 위한 과학 탐구.",
  alternates: { canonical: "/why" },
  openGraph: {
    title: "오늘의 과학 — DailySeed",
    description: "매일 흥미로운 과학 주제와 놀라운 사실, 실험을 만나보세요. 청소년을 위한 과학 탐구.",
    url: "/why",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
