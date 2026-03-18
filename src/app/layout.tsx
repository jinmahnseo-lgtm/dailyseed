import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailySeed — 매일의 씨앗",
  description: "청소년의 교양을 위한 매일의 씨앗",
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
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
