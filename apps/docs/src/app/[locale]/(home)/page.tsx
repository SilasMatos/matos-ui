import { setRequestLocale } from "next-intl/server";

import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { ScrollCardsSection } from "@/components/scroll-cards-section";
import { SiteFooter } from "@/components/site-footer";
import { TestimonialsSection } from "@/components/testimonials-section";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ScrollCardsSection />
      <TestimonialsSection />
      <SiteFooter />
    </>
  );
}
