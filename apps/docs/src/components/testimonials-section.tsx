"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { XformerlyTwitter } from "@/registry/new-york-v4/ui/x-icon";

interface Testimonial {
  quote: string;
  highlight: string;
  suffix: string;
  author: string;
  role: string;
}

const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    rotateY: direction > 0 ? 15 : -15,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.9,
    rotateY: direction > 0 ? -15 : 15,
    filter: "blur(8px)",
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

export function TestimonialsSection() {
  const t = useTranslations("testimonials");
  const testimonials = t.raw("items") as Testimonial[];
  const [[current, direction], setCurrent] = useState([0, 0]);

  const paginate = useCallback(
    (dir: number) => {
      setCurrent([
        (current + dir + testimonials.length) % testimonials.length,
        dir,
      ]);
    },
    [current, testimonials.length],
  );

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const item = testimonials[current];

  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="mb-16 text-center"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.5 },
              },
            }}
            className="mb-4 inline-block rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            {t("badge")}
          </motion.span>
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.5 },
              },
            }}
            className="mt-4 text-3xl font-semibold tracking-tight text-secondary-foreground md:text-4xl"
          >
            {t("title")}{" "}
            <span className="font-logo italic">{t("titleAccent")}</span>
          </motion.h2>
        </motion.div>

        <div className="relative mx-auto flex max-w-lg flex-col items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
              style={{ transformPerspective: 1000 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
                <div className="absolute -top-px left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

                <p className="text-base leading-relaxed text-card-foreground/80">
                  {item.quote}{" "}
                  <span className="rounded-sm bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-500 dark:text-emerald-400">
                    {item.highlight}
                  </span>{" "}
                  {item.suffix}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {item.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {item.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  </div>
                  <XformerlyTwitter className="size-5 text-muted-foreground/50" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              aria-label={t("prev")}
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((tm, i) => (
                <motion.button
                  key={tm.author}
                  type="button"
                  onClick={() => setCurrent([i, i > current ? 1 : -1])}
                  className={`h-1.5 rounded-full ${
                    i === current ? "bg-foreground/60" : "bg-foreground/15"
                  }`}
                  animate={{ width: i === current ? 24 : 6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  aria-label={t("dotLabel", { n: i + 1 })}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => paginate(1)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              aria-label={t("next")}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
