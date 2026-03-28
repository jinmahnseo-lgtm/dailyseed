import { Metadata } from "next";
import themes from "@/data/themes.json";
import englishRaw from "@/data/english.json";
import classicsData from "@/data/classics.json";
import artsData from "@/data/arts.json";
import worldsData from "@/data/worlds.json";
import whysData from "@/data/whys.json";
import EnglishContent from "../EnglishContent";

interface EnglishItem {
  day: number;
  sentences: { source: string; emoji: string; en: string; ko: string; note: string }[];
  vocab?: { word: string; meaning: string }[];
}

const english = englishRaw as EnglishItem[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = english[dayIndex];
  const theme = themes[dayIndex];
  const title = theme?.keyword || "영어";
  const desc = item?.sentences?.[0]?.en?.slice(0, 155) || "청소년을 위한 매일 영어";
  return {
    title: `Day ${day} — ${title} — DailySeed 영어`,
    description: desc,
    alternates: { canonical: `/english/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 영어`,
      description: desc,
      url: `/english/${day}`,
    },
  };
}

export default async function EnglishPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = english[dayIndex] || null;

  // 빌드타임에 소스 제목 추출 → 클라이언트에 전체 JSON 미전송
  const sourceTitles = {
    classic: (classicsData[dayIndex] as { title?: string })?.title,
    art: (artsData[dayIndex] as { title?: string })?.title,
    world: (worldsData[dayIndex] as { country?: string })?.country,
    why: (whysData[dayIndex] as { question?: string })?.question,
  };

  return <EnglishContent item={item} dayNumber={dayNumber} sourceTitles={sourceTitles} />;
}
