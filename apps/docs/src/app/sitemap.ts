import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { source } from "@/lib/source";

function absoluteUrl(path: string) {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${normalizedPath}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const docsPages = source.getLanguages().flatMap((entry) =>
    entry.pages.map((page) => ({
      url: absoluteUrl(page.url),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: page.slugs.length === 0 ? 0.9 : 0.7,
    })),
  );

  return [
    {
      url: getSiteUrl(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docsPages,
  ];
}
