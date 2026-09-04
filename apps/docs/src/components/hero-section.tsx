"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { HeroSurfaceShowcase } from "@/components/hero-surface-showcase";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { Button } from "@/registry/new-york-v4/ui/button";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function HeroSection({ componentCount }: { componentCount: number }) {
  const t = useTranslations("hero");

  return (
    // Altura de conteúdo, não de viewport: `min-h-svh` sozinho respondia por
    // boa parte da sensação de "área excessiva" antes da dobra.
    <section className="flex flex-col items-center px-4 py-20 sm:px-6 sm:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-3xl flex-col items-center gap-5 text-center"
      >
        <motion.div
          variants={fadeUp}
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
          variants={fadeUp}
          className="text-balance font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl md:tracking-tighter"
        >
          {t("titleBrand")}{" "}
          <span className="text-foreground/60">{t("titleTagline")}</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-balance text-base text-muted-foreground"
        >
          {t("description")}
        </motion.p>

        <motion.div
          variants={fadeUp}
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
          variants={fadeUp}
          className="text-muted-foreground/70 text-xs"
        >
          {t("trust")}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-2 w-full">
          <HeroSurfaceShowcase />
        </motion.div>
      </motion.div>
    </section>
  );
}
