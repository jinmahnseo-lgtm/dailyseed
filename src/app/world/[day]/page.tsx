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
  const theme = themes[dayIndex];

  const jsonLd = item ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${item.flag} ${item.country} — ${item.title} — DailySeed 세계`,
    description: item.story?.slice(0, 155),
    url: `https://www.dailyseed.net/world/${day}`,
    about: { "@type": "Country", name: item.country },
    isPartOf: { "@type": "WebSite", name: "DailySeed", url: "https://www.dailyseed.net" },
    publisher: { "@type": "Organization", name: "DailySeed" },
    inLanguage: "ko",
    keywords: `${theme?.keyword}, ${item.country}`,
    educationalLevel: "중고등학생",
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <WorldContent item={item} dayNumber={dayNumber} />
    </>
  );
}
