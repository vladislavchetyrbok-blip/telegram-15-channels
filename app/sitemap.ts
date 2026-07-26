import type { MetadataRoute } from "next";

import { zodiacPublicSigns } from "@/lib/public-website";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://zodiac-love-check.vercel.app").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/tarot", "/compatibility", "/zodiac", "/privacy", "/terms"];

  return [
    ...routes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...zodiacPublicSigns.map((sign) => ({
      url: `${siteUrl}/zodiac/${sign.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
