import { Metadata } from "next";
import themes from "@/data/themes.json";
import newsRaw from "@/data/news.json";
import NewsContent from "../NewsContent";

const news = newsRaw as { day: number; title: string; summary: string; insight: string; question: string; glossary?: { term: string; def: string }[]; debate?: { topic: string; pro: string; con: string } }[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = news[dayIndex];
  const theme = themes[dayIndex];
  const title = item?.title || theme?.keyword || "뉴스";
  return {
    title: `Day ${day} — ${title} — DailySeed 뉴스`,
    description: item?.summary?.slice(0, 155) || "청소년을 위한 매일 뉴스",
    alternates: { canonical: `/news/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 뉴스`,
      description: item?.summary?.slice(0, 155) || "",
      url: `/news/${day}`,
    },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = news[dayIndex] || null;
  return <NewsContent item={item} dayNumber={dayNumber} />;
}
