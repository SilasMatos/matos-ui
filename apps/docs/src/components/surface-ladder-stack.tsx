"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { memo } from "react";

import {
  duration,
  motionForOffset,
  type SpringTierName,
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// Animating an <Elevated>'s presence — one node, per DESIGN §2.6.
const MotionElevated = motion.create(Elevated);

const TIER_NAME_BY_REF = new Map(
  (Object.keys(spring) as SpringTierName[]).map((name) => [spring[name], name]),
);

/** `motionForOffset` returns a `spring` tier by reference, so this is an exact
 *  lookup — the tier the panel actually opens on, not a match by value. */
function tierNameForOffset(offset: number): SpringTierName {
  return TIER_NAME_BY_REF.get(motionForOffset(offset)) ?? "moderate";
}

/**
 * Three real surfaces at three conventional offsets — a card (`+1`), a dropdown
 * (`+2`), a dialog (`+4`). Each resolves to `surface-{1 + offset}` on the page's
 * substrate, and each enters on the spring `motionForOffset` reads off that same
 * offset. So `card` snaps in on `fast`, `dropdown` settles on `moderate`, and
 * `dialog` arrives on `slow` with a touch of overshoot — the difference in how
 * they land *is* the motion half of the section.
 */
const PANELS = [
  { role: "card", offset: 1 },
  { role: "dropdown", offset: 2 },
  { role: "dialog", offset: 4 },
] as const;

const container = staggerContainer("playful", 0.05);

function panelVariants(offset: number, reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: duration.fast } },
    };
  }
  return {
    hidden: { opacity: 0, y: 22, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: motionForOffset(offset),
    },
  };
}

function SurfaceLadderStackImpl() {
  const reduced = !!useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20%" }}
      className="mx-auto flex w-full max-w-[19rem] flex-col items-center"
    >
      {PANELS.map((panel, index) => {
        const level = 1 + panel.offset;
        const tier = tierNameForOffset(panel.offset);
        return (
          <MotionElevated
            key={panel.role}
            offset={panel.offset}
            variants={panelVariants(panel.offset, reduced)}
            style={{
              // A slight taper and a 20px pull keep them a deck rather than a
              // list. Each panel's own bottom edge is the only part the one
              // above covers, so the label rides the top where it stays clear;
              // z-order climbs with elevation so the dialog sits in front.
              width: `${100 - index * 5}%`,
              marginTop: index === 0 ? 0 : -20,
              zIndex: index,
            }}
            className="flex w-full flex-col gap-3 rounded-2xl p-3.5"
          >
            <div className="flex items-baseline justify-between gap-2 font-mono text-[10px]">
              <span className="text-foreground/70">{panel.role}</span>
              <span className="text-foreground/45 tabular-nums">
                surface-{level} · {tier}
              </span>
            </div>
            {/* Two skeleton dashes — enough that the panel reads as a surface
             *  with something on it, not a bare rectangle. */}
            <div className="flex flex-col gap-1.5">
              <span className="h-1.5 w-2/5 rounded-full bg-foreground/15" />
              <span className="h-1.5 w-3/5 rounded-full bg-foreground/10" />
            </div>
          </MotionElevated>
        );
      })}
    </motion.div>
  );
}

export const SurfaceLadderStack = memo(SurfaceLadderStackImpl);
