"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { aiLogos } from "@/components/icons/ai-logos";
import { McpInstallClaude } from "@/components/mcp-install";

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function LogoMarquee({ reverse = false }: { reverse?: boolean }) {
  const track = [...aiLogos, ...aiLogos];

  return (
    <div
      className="relative overflow-hidden py-1.5"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <motion.div
        className="flex w-max items-center gap-3"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {track.map(({ id, name, Icon }, index) => {
          const key = `${id}-${index}`;

          return (
            <div
              key={key}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-card-foreground shadow-sm backdrop-blur"
            >
              <Icon className="size-4 shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">
                {name}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function McpSection() {
  const t = useTranslations("mcpSection");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="relative border-border/60 border-t pt-14"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/25 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <motion.span
                variants={itemVariants}
                className="mb-4 inline-flex rounded-full border border-border/60 bg-muted/45 px-4 py-1.5 text-muted-foreground text-xs font-medium uppercase tracking-widest"
              >
                {t("badge")}
              </motion.span>

              <motion.h2
                variants={itemVariants}
                className="max-w-lg font-display font-semibold text-3xl text-foreground tracking-tight md:text-4xl"
              >
                {t("title")}
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed"
              >
                {t("subtitle")}
              </motion.p>

              <motion.div variants={itemVariants} className="mt-8">
                <McpInstallClaude />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-5">
                <Link
                  href={`/${locale}/docs/mcp`}
                  className="group inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {t("cta")}
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <LogoMarquee />
              <LogoMarquee reverse />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
