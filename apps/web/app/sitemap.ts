import type { MetadataRoute } from "next";
import { getEbooks, getCategories } from "@/lib/strapi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

  const [ebooksRes, categories] = await Promise.all([
    getEbooks({ pageSize: 200 }).catch(() => ({ data: [] as Awaited<ReturnType<typeof getEbooks>>["data"] })),
    getCategories().catch(() => [] as Awaited<ReturnType<typeof getCategories>>),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/katalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const ebookRoutes: MetadataRoute.Sitemap = ebooksRes.data.map((ebook) => ({
    url: `${base}/katalog/${ebook.slug}`,
    lastModified: new Date(ebook.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/katalog?kategoria=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...ebookRoutes, ...categoryRoutes];
}
