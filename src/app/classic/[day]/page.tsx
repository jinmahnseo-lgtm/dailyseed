import { Metadata } from "next";
import themes from "@/data/themes.json";
import classicsRaw from "@/data/classics.json";
import ClassicContent from "../ClassicContent";

const classics = classicsRaw as { day: number; title: string; author: string; year: number; summary: string; question: string; author_bio?: string; historical_context?: string }[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = classics[dayIndex];
  const title = item ? `${item.title} — ${item.author}` : themes[dayIndex]?.keyword || "고전";
  return {
    title: `Day ${day} — ${title} — DailySeed 고전`,
    description: item?.summary?.slice(0, 155) || "청소년을 위한 매일 고전 읽기",
    alternates: { canonical: `/classic/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 고전`,
      description: item?.summary?.slice(0, 155) || "",
      url: `/classic/${day}`,
    },
  };
}

export default async function ClassicPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = classics[dayIndex] || null;
  return <ClassicContent item={item} dayNumber={dayNumber} />;
}
