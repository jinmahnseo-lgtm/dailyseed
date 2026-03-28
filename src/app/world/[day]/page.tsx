import { Metadata } from "next";
import themes from "@/data/themes.json";
import worldsRaw from "@/data/worlds.json";
import WorldContent from "../WorldContent";

const worlds = worldsRaw as { day: number; country: string; flag: string; region: string; title: string; story: string; culture_point: string; food: string | { name: string; description: string }; fun_fact: string; quiz: { question: string; options: string[]; answer: number } }[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = worlds[dayIndex];
  const title = item ? `${item.flag} ${item.country} — ${item.title}` : themes[dayIndex]?.keyword || "세계";
  return {
    title: `Day ${day} — ${title} — DailySeed 세계`,
    description: item?.story?.slice(0, 155) || "청소년을 위한 매일 세계 문화",
    alternates: { canonical: `/world/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 세계`,
      description: item?.story?.slice(0, 155) || "",
      url: `/world/${day}`,
    },
  };
}

export default async function WorldPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = worlds[dayIndex] || null;
  return <WorldContent item={item} dayNumber={dayNumber} />;
}
