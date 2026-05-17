import type { Metadata } from "next";

import { siteConfig } from "@/lib/config";

export const siteKeywords = [
  "Matos UI",
  "shadcn/ui",
  "React components",
  "Next.js components",
  "Tailwind CSS",
  "component registry",
  "accessible UI",
];

export const defaultOgImage = {
  url: "/logo.png",
  width: 1536,
  height: 1024,
  alt: siteConfig.name,
};

export function createOpenGraphMetadata({
  title,
  description,
  url,
  images = [defaultOgImage],
}: {
  title: string;
  description: string;
  url: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: siteConfig.name,
    title,
    description,
    url,
    images,
  };
}

export function createTwitterMetadata({
  title,
  description,
  images = [defaultOgImage],
}: {
  title: string;
  description: string;
  images?: NonNullable<Metadata["twitter"]>["images"];
}): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    site: "@silasmatos_",
    creator: "@silasmatos_",
    title,
    description,
    images,
  };
}
