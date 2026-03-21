import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항 — DailySeed",
  description: "DailySeed의 새로운 소식, 이벤트, 제휴 문의 안내를 확인하세요.",
  alternates: { canonical: "/notice" },
  openGraph: {
    title: "공지사항 — DailySeed",
    description: "DailySeed의 새로운 소식, 이벤트, 제휴 문의 안내를 확인하세요.",
    url: "/notice",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
