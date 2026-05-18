import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/konto/", "/checkout/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
