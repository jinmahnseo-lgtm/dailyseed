import { Metadata } from "next";
import themes from "@/data/themes.json";
import artsRaw from "@/data/arts.json";
import ArtContent from "../ArtContent";

const arts = artsRaw as { day: number; title: string; artist: string; year: number; country: string; image_url: string; source_url?: string; source_label?: string; story: string; look_for: string; fun_fact: string }[];

export function generateStaticParams() {
  return themes.map((_, i) => ({ day: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }): Promise<Metadata> {
  const { day } = await params;
  const dayIndex = parseInt(day, 10) - 1;
  const item = arts[dayIndex];
  const title = item ? `${item.title} — ${item.artist}` : themes[dayIndex]?.keyword || "예술";
  return {
    title: `Day ${day} — ${title} — DailySeed 예술`,
    description: item?.story?.slice(0, 155) || "청소년을 위한 매일 예술 감상",
    alternates: { canonical: `/art/${day}` },
    openGraph: {
      title: `Day ${day} — ${title} — DailySeed 예술`,
      description: item?.story?.slice(0, 155) || "",
      url: `/art/${day}`,
      ...(item?.image_url ? { images: [{ url: item.image_url, alt: `${item.title} — ${item.artist}` }] } : {}),
    },
  };
}

export default async function ArtPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  const dayNumber = parseInt(day, 10);
  const dayIndex = dayNumber - 1;
  const item = arts[dayIndex] || null;
  const theme = themes[dayIndex];

  const jsonLd = item ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${item.title} — ${item.artist} — DailySeed 예술`,
    description: item.story?.slice(0, 155),
    url: `https://www.dailyseed.net/art/${day}`,
    about: {
      "@type": "VisualArtwork",
      name: item.title,
      creator: { "@type": "Person", name: item.artist },
      dateCreated: String(item.year),
      ...(item.image_url ? { image: item.image_url } : {}),
    },
    isPartOf: { "@type": "WebSite", name: "DailySeed", url: "https://www.dailyseed.net" },
    publisher: { "@type": "Organization", name: "DailySeed" },
    inLanguage: "ko",
    keywords: theme?.keyword,
    educationalLevel: "중고등학생",
    ...(item.image_url ? { image: item.image_url } : {}),
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ArtContent item={item} dayNumber={dayNumber} />
    </>
  );
}
