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
  metadataBase: new URL("https://dailyseed.net"),
  openGraph: {
    title: "DailySeed — 매일의 씨앗",
    description: "청소년의 교양을 위한 매일의 씨앗",
    url: "https://dailyseed.net",
    siteName: "DailySeed",
    locale: "ko_KR",
    type: "website",
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
