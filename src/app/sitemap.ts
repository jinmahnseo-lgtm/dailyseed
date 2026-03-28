import type { MetadataRoute } from "next";
import themes from "@/data/themes.json";

export const dynamic = "force-static";

const BASE_URL = "https://www.dailyseed.net";
const TOPICS = ["news", "classic", "art", "world", "why", "english"];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/notice`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const topic of TOPICS) {
    for (let i = 0; i < themes.length; i++) {
      urls.push({
        url: `${BASE_URL}/${topic}/${i + 1}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return urls;
}
