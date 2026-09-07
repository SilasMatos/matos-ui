"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  ease,
  revealVariants,
  staggerContainer,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

type Stat = {
  id: string;
  label: string;
  value: number;
  format: (value: number) => string;
  delta: number;
  series: number[];
};

const STATS: Stat[] = [
  {
    id: "mrr",
    label: "MRR",
    value: 48200,
    format: (value) => `$${(value / 1000).toFixed(1)}k`,
    delta: 12.4,
    series: [12, 14, 13, 17, 16, 21, 20, 24, 27, 26, 31, 34],
  },
  {
    id: "active",
    label: "Active teams",
    value: 1284,
    format: (value) => Math.round(value).toLocaleString("en-US"),
    delta: 6.1,
    series: [40, 42, 41, 45, 47, 46, 50, 53, 52, 58, 61, 64],
  },
  {
    id: "churn",
    label: "Churn",
    value: 1.8,
    format: (value) => `${value.toFixed(1)}%`,
    delta: -0.4,
    series: [30, 28, 29, 26, 24, 25, 22, 21, 19, 20, 17, 15],
  },
  {
    id: "nps",
    label: "NPS",
    value: 62,
    format: (value) => Math.round(value).toString(),
    delta: 3.0,
    series: [44, 45, 48, 47, 50, 52, 51, 55, 57, 56, 60, 62],
  },
];

const COUNT_MS = 900;

function useCountUp(target: number, run: boolean, reduce: boolean) {
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      // ease.decelerate, sampled — fast in, soft landing, same curve the
      // reveal uses so the number and the card settle together.
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduce]);

  return value;
}

/** Normalises a series into an SVG polyline that fills a 0..w / 0..h box. */
function sparkPoints(series: number[], width: number, height: number) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series
    .map((point, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((point - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function Tile({ stat, inView }: { stat: Stat; inView: boolean }) {
  const reduce = !!useReducedMotion();
  const value = useCountUp(stat.value, inView, reduce);
  const up = stat.delta >= 0;
  const points = sparkPoints(stat.series, 96, 28);

  return (
    <Elevated
      offset={1}
      hoverLift
      className="flex flex-col gap-3 rounded-xl p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
          {stat.label}
        </span>
        <span
          className={twMerge(
            "flex items-center gap-0.5 font-medium text-[11px] tabular-nums",
            up ? "text-primary" : "text-muted-foreground",
          )}
        >
          {up ? (
            <TrendingUp className="size-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3" aria-hidden="true" />
          )}
          {up ? "+" : ""}
          {stat.delta.toFixed(1)}%
        </span>
      </div>

      <p className="font-semibold text-2xl tabular-nums tracking-tight">
        {stat.format(value)}
      </p>

      <svg
        viewBox="0 0 96 28"
        preserveAspectRatio="none"
        className="h-7 w-full text-primary/70"
        aria-hidden="true"
      >
        <motion.polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={
            inView
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 0.7, ease: ease.decelerate }}
        />
      </svg>
    </Elevated>
  );
}

/**
 * A row of KPI tiles that reads its substrate and animates once, on scroll.
 *
 * The panel is the app background (level 1); each tile is an `Elevated`
 * `offset={1}` that lifts a further shadow step under the cursor. The grid
 * reveals with `revealVariants` + a `staggerContainer`, the numbers count up on
 * the same `decelerate` curve as the reveal, and each sparkline draws itself
 * in. `useInView` fires the whole thing once; `prefers-reduced-motion` lands
 * every tile, number and line at its final state with no travel.
 */
export function StatTiles01() {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const tile = revealVariants({ y: 16, blur: 4 });
  const tileVariant = reduce ? withReducedMotion(tile) : tile;

  return (
    <SurfaceProvider value={1}>
      <div
        ref={ref}
        data-slot="stat-tiles-01"
        className={twMerge(
          "@container/stats w-full rounded-2xl p-4 text-foreground",
          surfaceClasses(1),
        )}
      >
        <motion.div
          className="grid gap-3 @md/stats:grid-cols-2 @3xl/stats:grid-cols-4"
          variants={staggerContainer("moderate")}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {STATS.map((stat) => (
            <motion.div key={stat.id} variants={tileVariant}>
              <Tile stat={stat} inView={inView} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SurfaceProvider>
  );
}
