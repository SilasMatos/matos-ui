"use client";

import { motion, type Variants } from "framer-motion";
import { Blocks, Paintbrush, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

interface FeatureCard {
  number: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const icons = [Blocks, Paintbrush, Sparkles];

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function FeaturesSection() {
  const t = useTranslations("features");
  const rawCards = t.raw("cards") as {
    number: string;
    title: string;
    description: string;
  }[];

  const features: FeatureCard[] = rawCards.map((card, i) => ({
    ...card,
    icon: icons[i] ?? Blocks,
  }));

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t("badge")}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}{" "}
            <span className="text-muted-foreground/60">{t("titleAccent")}</span>
          </h2>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.number}
              variants={cardVariants}
              className="group relative flex flex-col gap-6 rounded-2xl border border-border/60 bg-card p-7 transition-colors hover:border-border hover:bg-accent/50"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-muted-foreground">
                  {feature.number}
                </span>
                <feature.icon className="size-5 text-muted-foreground/50 transition-colors group-hover:text-foreground/70" />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              <motion.div
                className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.5, duration: 0.8 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
