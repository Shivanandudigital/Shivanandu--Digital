import type { MetadataRoute } from "next";

const siteUrl = "https://shivanandudigital.com";

const toolSlugs = [
  "passport-photo-maker",
  "photo-enhancer",
  "background-remover",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "compress-pdf",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolSlugs.map((slug) => ({
      url: `${siteUrl}/tools/${slug}`,
      changeFrequency: "monthly" as const,
      priority: slug === "passport-photo-maker" ? 0.9 : 0.8,
    })),
  ];
}
