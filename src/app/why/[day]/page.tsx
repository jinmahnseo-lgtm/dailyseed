import { Metadata } from "next";
import themes from "@/data/themes.json";
import whysRaw from "@/data/whys.json";
import WhyContent from "../WhyContent";

const whys = whysRaw as { day: number; question: string; emoji: string; short_answer: string; deep_dive: string; mind_blown: string; experiment: string }[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = whys[dayIndex];
  const title = item?.question || themes[dayIndex]?.keyword || "과학";
  return {
    title: `Day ${day} — ${title} — DailySeed 과학`,
    description: item?.short_answer?.slice(0, 155) || "청소년을 위한 매일 과학",
    alternates: { canonical: `/why/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 과학`,
      description: item?.short_answer?.slice(0, 155) || "",
      url: `/why/${day}`,
    },
  };
}

export default async function WhyPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = whys[dayIndex] || null;
  const theme = themes[dayIndex];

  const jsonLd = item ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${item.question} — DailySeed 과학`,
    description: item.short_answer?.slice(0, 155),
    url: `https://www.dailyseed.net/why/${day}`,
    isPartOf: { "@type": "WebSite", name: "DailySeed", url: "https://www.dailyseed.net" },
    publisher: { "@type": "Organization", name: "DailySeed" },
    inLanguage: "ko",
    keywords: theme?.keyword,
    educationalLevel: "중고등학생",
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <WhyContent item={item} dayNumber={dayNumber} />
    </>
  );
}
