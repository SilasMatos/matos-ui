"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { MiniDataTable } from "./mini-data-table";
import { OrbitIcons } from "./orbit-icons";
import { ToggleExemple } from "./toggle-exemple";

interface CardData {
  id: string;
  number: string;
  title: string;
  description: string;
  heightClass: string;
  yOffset: number;
}

const cardHeightClasses: Record<string, string> = {
  "card-01": "min-h-[330px]",
  "card-02": "min-h-[280px]",
  "card-03": "min-h-[310px]",
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 100, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      delay: i * 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function Card({ card, index }: { card: CardData; index: number }) {
  return (
    <motion.div
      className={`relative flex flex-col rounded-2xl p-7 ${cardHeightClasses[card.id] ?? ""} group overflow-hidden border border-border/40 bg-muted/50`}
      style={{ marginTop: card.yOffset, transformPerspective: 800 }}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-20%" }}
      whileHover={{
        scale: 1.03,
        y: -8,
        rotateX: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-foreground/3 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-2xl border border-border/20 transition duration-500 group-hover:border-border/60" />

      <div className="flex flex-col h-full">
        <motion.span
          className="mb-2 text-6xl font-bold text-foreground/10"
          initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.2 + 0.3,
            duration: 0.7,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {card.number}
        </motion.span>

        <motion.h3
          className="mb-1 text-base font-semibold text-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.45 }}
        >
          {card.title}
        </motion.h3>

        <motion.p
          className="text-sm leading-relaxed text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.55 }}
        >
          {card.description}
        </motion.p>

        {card.id === "card-01" && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
            <OrbitIcons />
          </div>
        )}
        {card.id === "card-02" && (
          <div className="mt-auto pt-4 flex justify-center ">
            <ToggleExemple />
          </div>
        )}
        {card.id === "card-03" && (
          <div className="absolute -bottom-30 left-1/2 -translate-x-1/2 w-full px-4">
            <MiniDataTable />
          </div>
        )}
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-linear-to-r from-foreground/30 to-transparent"
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 + 0.6, duration: 1 }}
      />
    </motion.div>
  );
}

export function ScrollCardsSection() {
  const t = useTranslations("scrollCards");
  const cards = t.raw("cards") as CardData[];
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        ref={sectionRef}
        className="relative mx-auto max-w-5xl px-6 py-24 md:py-32"
      >
        <motion.div
          className="absolute inset-0"
          style={{ opacity: bgOpacity }}
        />

        <div className="relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="mb-14 text-center"
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
              className="mt-4 text-3xl font-semibold tracking-tight text-card-foreground md:text-4xl"
            >
              {t("title")}
            </motion.h2>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.5 },
                },
              }}
              className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              {t("subtitle")}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-2 md:grid-cols-3">
            {cards.map((card, i) => (
              <div key={card.id}>
                <Card card={card} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
