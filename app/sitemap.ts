import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/equipe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/mediatheque`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
