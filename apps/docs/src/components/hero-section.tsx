"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { HeroSurfaceShowcase } from "@/components/hero-surface-showcase";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import {
  liftVariants,
  revealVariants,
  staggerContainer,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";

export function HeroSection({ componentCount }: { componentCount: number }) {
  const t = useTranslations("hero");
  const shouldReduceMotion = !!useReducedMotion();

  // One element carries the entrance: the headline. It is the only node that
  // rides `revealVariants` — the longer travel and the focus-pull blur — so it
  // reads as the hero coming into focus. Everything else (badge, copy, buttons,
  // trust) enters on a quiet `liftVariants(2)`: a short fade with 4px of
  // travel, no blur, no character of its own. Support behind the headline, not
  // six identical reveals. `withReducedMotion` keeps every crossfade and drops
  // the travel and the blur, so the final states are identical.
  const headlineBase = revealVariants({ y: 24, blur: 8 });
  const supportBase = liftVariants(2);
  const headline = shouldReduceMotion
    ? withReducedMotion(headlineBase)
    : headlineBase;
  const support = shouldReduceMotion
    ? withReducedMotion(supportBase)
    : supportBase;

  // The showcase is its own stagger container with its own `delayChildren`, so
  // it enters last, after the headline block has settled. It rides
  // `liftVariants(4)` — dialog weight, `slow` tier — with the travel widened
  // because 4px on a panel this size reads as a twitch. Its internal ladder
  // pulse and morph clock both run from first paint, so it fades in already in
  // motion rather than sitting still waiting for the first cycle.
  const showcaseBase = liftVariants(4, { y: 12 });
  const showcase = shouldReduceMotion
    ? withReducedMotion(showcaseBase)
    : showcaseBase;

  return (
    // Altura de conteúdo, não de viewport: `min-h-svh` sozinho respondia por
    // boa parte da sensação de "área excessiva" antes da dobra.
    <section className="flex flex-col items-center px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        variants={staggerContainer("slow", 0.1)}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-3xl flex-col items-center gap-5 text-center"
      >
        <motion.div
          variants={support}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-muted-foreground text-xs">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-foreground/50"
            />
            {t("badge")}
          </p>
          <span className="text-muted-foreground/50 text-xs">
            {t("badgeCount", { count: componentCount })}
          </span>
        </motion.div>

        <motion.h1
          variants={headline}
          className="text-balance font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl md:tracking-tighter"
        >
          {t("titleBrand")}{" "}
          <span className="text-foreground/60">{t("titleTagline")}</span>
        </motion.h1>

        <motion.p
          variants={support}
          className="max-w-xl text-balance text-base text-muted-foreground"
        >
          {t("description")}
        </motion.p>

        <motion.div
          variants={support}
          className="mt-1 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            nativeButton={false}
            variant="default"
            size="lg"
            className="group gap-2 rounded-full px-5"
            render={
              <Link href="/docs/components">
                <span>{t("browseComponents")}</span>
                <ArrowRight className="size-4 transition-transform ease-spring group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <Button
            nativeButton={false}
            variant="outline"
            size="lg"
            className="rounded-full px-5"
            render={
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
                {t("viewOnGitHub")}
              </Link>
            }
          />
        </motion.div>

        <motion.p
          variants={support}
          className="text-muted-foreground/70 text-xs"
        >
          {t("trust")}
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer("slow", 0.85)}
        initial="hidden"
        animate="visible"
        className="mt-7 w-full max-w-3xl"
      >
        <motion.div variants={showcase}>
          <HeroSurfaceShowcase />
        </motion.div>
      </motion.div>
    </section>
  );
}
