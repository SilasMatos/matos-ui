import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { ScrollCardsSection } from "@/components/scroll-cards-section";
import { SiteFooter } from "@/components/site-footer";
import { TestimonialsSection } from "@/components/testimonials-section";

export default function HomePage() {
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
