import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 고전 — DailySeed",
  description: "매일 한 편의 고전 문학 작품을 읽고, 작가와 작품 배경을 알아보세요. 청소년을 위한 고전 읽기.",
  openGraph: {
    title: "오늘의 고전 — DailySeed",
    description: "매일 한 편의 고전 문학 작품을 읽고, 작가와 작품 배경을 알아보세요. 청소년을 위한 고전 읽기.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
