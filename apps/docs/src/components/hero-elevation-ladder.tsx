"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

/**
 * Compact, ambient cousin of examples/elevated-demo.tsx's `Ladder` — the
 * same recursive "one Elevated per step" shape, scaled down and capped at a
 * handful of levels. The hero isn't the place for the full 8-level
 * explainer (that's Foundations' job); this is just a taste of the same
 * idea — alive enough to notice, quiet enough not to fight the headline.
 *
 * Only the innermost square breathes. A version where every level pulsed in
 * sequence (a wave sweeping outward → inward through the steps) was built
 * and confirmed working, but a pulse that *travels* across four nested
 * shapes reads as more animated than one that stays put, even at the same
 * low amplitude — motion changing position draws the eye more than motion
 * in place. One slow, small pulse at the core won out on "quiet enough."
 */
function HeroLadder({
  steps,
  shouldReduceMotion,
}: {
  steps: number;
  shouldReduceMotion: boolean;
}) {
  if (steps <= 0) {
    return (
      <motion.div
        className="size-7 rounded-lg bg-surface-4 shadow-surface-4"
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [1, 0.82, 1], scale: [1, 1.06, 1] }
        }
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  return (
    <Elevated
      offset={1}
      className="flex items-center justify-center rounded-2xl p-2.5"
    >
      <HeroLadder steps={steps - 1} shouldReduceMotion={shouldReduceMotion} />
    </Elevated>
  );
}

/** Defaults to 3 steps (4 visible levels) — enough to read as a ladder
 *  without turning into the full Foundations explainer. */
export function HeroElevationLadder({ steps = 3 }: { steps?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SurfaceProvider value={1}>
      <div
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center rounded-3xl p-3",
          surfaceClasses(1),
        )}
      >
        <HeroLadder steps={steps} shouldReduceMotion={!!shouldReduceMotion} />
      </div>
    </SurfaceProvider>
  );
}
