import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 예술 — DailySeed",
  description: "매일 하나의 예술 작품을 감상하고, 감상 포인트와 작품평을 나눠보세요. 청소년을 위한 예술 감상.",
  alternates: { canonical: "/art" },
  openGraph: {
    title: "오늘의 예술 — DailySeed",
    description: "매일 하나의 예술 작품을 감상하고, 감상 포인트와 작품평을 나눠보세요. 청소년을 위한 예술 감상.",
    url: "/art",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
