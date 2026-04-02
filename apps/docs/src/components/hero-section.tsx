"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Blocks, Sparkle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/registry/new-york-v4/ui/button";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function HeroSection() {
  const t = useTranslations("hero");
  const features = [
    { icon: Zap, label: t("featurePowerful") },
    { icon: Blocks, label: t("featureAccessible") },
    { icon: Sparkle, label: t("featureStyled") },
  ];

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 md:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center gap-6 text-center"
      >
        <motion.div variants={fadeUp}>
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-border hover:bg-muted"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
            <span>{t("badge")}</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            <span className="text-muted-foreground/50">{t("titleLine1")} </span>
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/50">{t("titleLine2")} </span>
            <span className="hero-highlight relative inline-block text-foreground">
              {t("brand")}
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-base leading-relaxed text-muted-foreground/80 md:text-lg"
        >
          {t("description")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            nativeButton={false}
            variant="default"
            size="lg"
            className="group gap-2 rounded-full px-5 text-sm"
            render={
              <Link href="/docs">
                <span>{t("getStarted")}</span>
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:ml-1 group-hover:rotate-0" />
              </Link>
            }
          />
          <Button
            nativeButton={false}
            variant="outline"
            size="lg"
            className="group gap-2 rounded-full px-5 text-sm"
            render={
              <Link href="/docs/components">
                <span>{t("components")}</span>
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:ml-1 group-hover:rotate-0" />
              </Link>
            }
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-wrap items-center justify-center gap-6"
        >
          {features.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={scaleIn}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 px-4 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
