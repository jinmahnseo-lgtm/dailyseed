import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ChunkErrorBoundary from "@/components/ChunkErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { DayProvider } from "@/contexts/DayContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailySeed — 매일의 씨앗",
  description: "청소년의 교양을 위한 매일의 씨앗",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32 48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://www.dailyseed.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DailySeed — 매일의 씨앗",
    description: "매일 10분, 뉴스·고전·예술·세계·과학·영어 6개 분야 교양 콘텐츠",
    url: "https://www.dailyseed.net",
    siteName: "DailySeed",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://www.dailyseed.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "DailySeed — 청소년의 교양을 위한 매일의 씨앗",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DailySeed — 매일의 씨앗",
    description: "매일 10분, 뉴스·고전·예술·세계·과학·영어 6개 분야 교양 콘텐츠",
    images: ["https://www.dailyseed.net/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister()})})}
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DailySeed",
            "alternateName": "매일의 씨앗",
            "url": "https://www.dailyseed.net",
            "description": "매일 10분, 뉴스·고전·예술·세계·과학·영어 6개 분야 교양 콘텐츠. 청소년을 위한 매일의 교양 학습 서비스.",
            "inLanguage": "ko",
            "publisher": {
              "@type": "Organization",
              "name": "DailySeed",
              "url": "https://www.dailyseed.net",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.dailyseed.net/icon-512.png"
              }
            },
            "hasPart": [
              { "@type": "LearningResource", "name": "오늘의 뉴스", "url": "https://www.dailyseed.net/news", "learningResourceType": "시사 뉴스·용어·찬반 토론" },
              { "@type": "LearningResource", "name": "오늘의 고전", "url": "https://www.dailyseed.net/classic", "learningResourceType": "고전 문학·작가·작품 배경" },
              { "@type": "LearningResource", "name": "오늘의 예술", "url": "https://www.dailyseed.net/art", "learningResourceType": "예술 작품·감상 포인트" },
              { "@type": "LearningResource", "name": "오늘의 세계", "url": "https://www.dailyseed.net/world", "learningResourceType": "세계 문화·음식·놀라운 사실" },
              { "@type": "LearningResource", "name": "오늘의 과학", "url": "https://www.dailyseed.net/why", "learningResourceType": "과학·놀라운 사실·실험" },
              { "@type": "LearningResource", "name": "오늘의 영어", "url": "https://www.dailyseed.net/english", "learningResourceType": "영어 문장·문법·단어 퀴즈" }
            ]
          }) }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <DayProvider>
            <ChunkErrorBoundary>
              {children}
            </ChunkErrorBoundary>
            <BottomNav />
          </DayProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
