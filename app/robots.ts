import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://zodiac-love-check.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/tarot", "/compatibility", "/zodiac", "/privacy", "/terms"],
        disallow: ["/admin", "/api", "/dashboard", "/login", "/settings", "/publishing-center"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
