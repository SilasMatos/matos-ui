"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Framer } from "@/components/icons/framer-motion";
import { ShadcnUI } from "@/components/icons/shadcn";
import { TailwindCSS } from "@/components/icons/tailwind";
import { Link } from "@/i18n/navigation";
import { Button } from "@/registry/new-york-v4/ui/button";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
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

const EDGE_LINES = 7;

const floatingBlocks = [
  { left: "6%", top: "10%", w: 90, h: 65, o: 0.07 },
  { left: "78%", top: "6%", w: 110, h: 85, o: 0.08 },
  { left: "88%", top: "38%", w: 95, h: 95, o: 0.09 },
  { left: "3%", top: "58%", w: 65, h: 85, o: 0.06 },
  { left: "92%", top: "70%", w: 75, h: 55, o: 0.05 },
  { left: "12%", top: "82%", w: 105, h: 65, o: 0.07 },
  { left: "68%", top: "78%", w: 85, h: 55, o: 0.06 },
  { left: "42%", top: "3%", w: 55, h: 45, o: 0.07 },
  { left: "58%", top: "88%", w: 70, h: 50, o: 0.05 },
  { left: "22%", top: "35%", w: 55, h: 55, o: 0.04 },
  { left: "82%", top: "18%", w: 45, h: 70, o: 0.06 },
  { left: "35%", top: "72%", w: 80, h: 45, o: 0.07 },
];

export function HeroSection() {
  const t = useTranslations("hero");
  const shouldReduceMotion = useReducedMotion();
  const features = [
    { icon: TailwindCSS, label: "Tailwind CSS" },
    { icon: Framer, label: "Framer Motion" },
    { icon: ShadcnUI, label: "shadcn/ui" },
  ];

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0">
        {floatingBlocks.map((block, i) => (
          <motion.div
            key={`${block.left}-${block.top}`}
            className="absolute rounded-lg border border-foreground/10"
            style={{
              left: block.left,
              top: block.top,
              width: block.w,
              height: block.h,
              backgroundColor: `rgba(var(--hero-block-rgb),${block.o})`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10 - (i % 3) * 4, 0],
            }}
            transition={{
              opacity: { duration: 1.2, delay: 0.2 + i * 0.08 },
              scale: { duration: 1.2, delay: 0.2 + i * 0.08 },
              y: {
                duration: 4 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5 + i * 0.3,
              },
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-6 md:inset-12 lg:inset-16">
        <motion.div
          className="absolute -left-px -top-px h-24 w-24 border-l border-t border-foreground/20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          style={{ transformOrigin: "top left" }}
        />
        <motion.div
          className="absolute -right-px -top-px h-24 w-24 border-r border-t border-foreground/20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          style={{ transformOrigin: "top right" }}
        />
        <motion.div
          className="absolute -bottom-px -left-px h-24 w-24 border-b border-l border-foreground/20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          style={{ transformOrigin: "bottom left" }}
        />
        <motion.div
          className="absolute -bottom-px -right-px h-24 w-24 border-b border-r border-foreground/20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          style={{ transformOrigin: "bottom right" }}
        />

        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-0.75">
          {Array.from({ length: EDGE_LINES }).map((_, i) => (
            <motion.div
              key={`t-${String(i)}`}
              className="h-20 w-px origin-top bg-linear-to-b from-foreground/25 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5 + i * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-0.75">
          {Array.from({ length: EDGE_LINES }).map((_, i) => (
            <motion.div
              key={`b-${String(i)}`}
              className="h-20 w-px origin-bottom bg-linear-to-t from-foreground/25 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5 + i * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(255,255,255,0.03),transparent_70%)]" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center gap-6 text-center"
      >
        <motion.div
          variants={fadeUp}
          whileHover={{
            scale: 1.04,
            transition: { type: "spring", stiffness: 420, damping: 24 },
          }}
          className="group relative isolate inline-flex overflow-hidden rounded-full p-px text-sm text-foreground/60"
        >
          <motion.span
            aria-hidden="true"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            className="-inset-16 absolute"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(var(--hero-block-rgb),0.02) 80deg, rgba(var(--hero-block-rgb),0.62) 135deg, transparent 190deg, transparent 360deg)",
            }}
            transition={{
              duration: 5.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
          <span className="relative z-10 inline-flex items-center gap-2.5 rounded-full border border-foreground/10 bg-background/75 px-4 py-1.5 backdrop-blur-md transition-colors group-hover:border-foreground/20 group-hover:bg-background/85">
            <span className="relative flex size-2">
              <span
                className="absolute inline-flex size-full animate-spin rounded-full border-2 border-dashed border-foreground/40"
                style={{ animationDuration: "2s" }}
              />
              <span
                className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40"
                style={{ animationDuration: "1.5s" }}
              />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
            <span>{t("badge")}</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            <span className="text-foreground/40">{t("titleLine1")} </span>
            <br className="hidden sm:block" />
            <span className="text-foreground/40">{t("titleLine2")} </span>
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      textShadow: [
                        "0 0 0px rgba(var(--hero-block-rgb),0)",
                        "0 0 28px rgba(var(--hero-block-rgb),0.28)",
                        "0 0 0px rgba(var(--hero-block-rgb),0)",
                      ],
                      y: [0, -2, 0],
                    }
              }
              className="relative inline-block text-foreground"
              transition={{
                duration: 4.2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              {t("brand")}
              <motion.span
                aria-hidden="true"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: [0.2, 0.75, 0.2],
                        scaleX: [0.16, 1, 0.16],
                      }
                }
                className="-bottom-1 absolute inset-x-1 h-px origin-center bg-linear-to-r from-transparent via-foreground/45 to-transparent"
                transition={{
                  duration: 4.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </motion.span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="max-w-xl text-base leading-relaxed text-foreground/50 md:text-lg"
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
            className="group gap-2 rounded-full bg-foreground px-6 text-sm text-background hover:bg-foreground/90"
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
            className="group gap-2 rounded-full border-foreground/15 bg-transparent px-6 text-sm text-foreground/80 hover:border-foreground/30 hover:bg-foreground/5"
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
          className="mt-8 flex flex-wrap items-center justify-center gap-5"
        >
          {features.map(({ icon: Icon, label }, index) => (
            <motion.div
              key={label}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                    }
              }
              variants={scaleIn}
              whileTap={{ scale: 0.98 }}
              whileHover={{
                scale: 1.07,
                y: -6,
                borderColor: "rgba(var(--hero-block-rgb),0.26)",
                backgroundColor: "rgba(var(--hero-block-rgb),0.08)",
                boxShadow: "0 18px 45px rgba(var(--hero-block-rgb),0.16)",
                transition: { type: "spring", stiffness: 360, damping: 22 },
              }}
              className="group relative flex cursor-default items-center gap-2.5 overflow-hidden rounded-xl border border-foreground/6 bg-foreground/3 px-4 py-2.5 text-sm text-foreground/55 backdrop-blur-sm"
              transition={{
                y: {
                  duration: 3.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.35,
                },
              }}
            >
              <motion.span
                aria-hidden="true"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: [0.1, 0.7, 0.1],
                        scaleX: [0.25, 1, 0.25],
                      }
                }
                className="absolute inset-x-3 top-0 h-px origin-center bg-linear-to-r from-transparent via-foreground/40 to-transparent"
                transition={{
                  duration: 3.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              />
              <motion.span
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.08, 1],
                        rotate: [0, index === 1 ? 2 : -2, 0],
                      }
                }
                className="relative flex size-7 items-center justify-center rounded-lg border border-foreground/8 bg-background/60 text-foreground/70 transition-colors group-hover:border-foreground/20 group-hover:text-foreground"
                transition={{
                  duration: 3.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 0.2 + index * 0.25,
                }}
              >
                <Icon className="size-4" />
              </motion.span>
              <span className="relative font-medium transition-colors group-hover:text-foreground/80">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
