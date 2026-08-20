import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/hero-section";
import { MatosAspectsSection } from "@/components/matos-aspects-section";
import { ScrollCardsSection } from "@/components/scroll-cards-section";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/config";
import { createOpenGraphMetadata, createTwitterMetadata } from "@/lib/seo";
import { getRegistryBaseUrl } from "@/lib/site-url";
import { getComponentPages } from "@/lib/source";

// import { TestimonialsSection } from '@/components/testimonials-section'

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: createOpenGraphMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  }),
  twitter: createTwitterMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
  }),
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const componentCount = getComponentPages(locale).length;

  return (
    <>
      <HeroSection
        componentCount={componentCount}
        installCommand={`npx shadcn@latest add ${getRegistryBaseUrl()}/magnetic-card.json`}
      />

      <ScrollCardsSection />
      <MatosAspectsSection />
      {/* <TestimonialsSection /> */}
      <SiteFooter />
    </>
  );
}
