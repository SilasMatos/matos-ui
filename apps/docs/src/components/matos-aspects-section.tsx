"use client";

import { motion, type Variants } from "framer-motion";
import {
  Accessibility,
  Boxes,
  type LucideIcon,
  Palette,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

type AspectItem = {
  label: string;
  title: string;
  description: string;
};

const icons: LucideIcon[] = [Boxes, Accessibility, Palette, Sparkles];

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

export function MatosAspectsSection() {
  const t = useTranslations("matosAspects");
  const items = t.raw("items") as AspectItem[];

  return (
    <section className="relative overflow-hidden bg-background pb-24 md:pb-32">
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

          <div className="mb-10 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-flex rounded-full border border-border/60 bg-muted/45 px-4 py-1.5 text-muted-foreground text-xs font-medium uppercase tracking-widest">
                {t("badge")}
              </span>
              <h2 className="max-w-xl font-display font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
                {t("title")}
              </h2>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base text-muted-foreground leading-relaxed md:justify-self-end"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => {
              const Icon = icons[index] ?? Boxes;

              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    borderColor:
                      "color-mix(in oklch, var(--border) 72%, var(--foreground))",
                    transition: { type: "spring", stiffness: 320, damping: 24 },
                  }}
                  className="group relative min-h-52 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 text-card-foreground shadow-sm backdrop-blur"
                >
                  <div className="pointer-events-none absolute inset-x-4 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-primary/45 to-transparent opacity-0 transition duration-300 group-hover:scale-x-100 group-hover:opacity-100" />

                  <div className="mb-7 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-muted-foreground text-xs">
                      {item.label}
                    </span>
                    <span className="grid size-9 place-items-center rounded-xl border border-border/60 bg-background/70 text-muted-foreground transition-colors group-hover:text-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground text-lg tracking-normal">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
