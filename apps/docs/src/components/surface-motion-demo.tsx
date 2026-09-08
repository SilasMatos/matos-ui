"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";

import { useAmbientLoop } from "@/hooks/use-ambient-loop";
import { cn } from "@/lib/utils";
import {
  duration,
  ease,
  motionForOffset,
  type SpringTierName,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// Animating an <Elevated> — one node, per DESIGN §2.6.
const MotionElevated = motion.create(Elevated);

/**
 * The chain, by role: a card holds a dialog, the dialog a popover, the popover a
 * menu. Each opener carries the offset its kind of surface conventionally lifts
 * by (§2.5.2), and `motionForOffset` reads that offset to pick the spring the
 * layer opens on (§3.3). The panels themselves nest in uniform `+1` steps so all
 * four resolved levels stay legible — `LAYER_OFFSET` is only the number that
 * decides the timing.
 *
 * `card` is the substrate the rest open onto, so it names its level but no tier.
 */
const LAYER_OFFSET = [1, 4, 2, 2] as const;
const LAYER_COUNT = LAYER_OFFSET.length;

const TIER_NAME_BY_REF = new Map(
  (Object.keys(spring) as SpringTierName[]).map((name) => [spring[name], name]),
);

/** `motionForOffset` returns a `spring` tier by reference, so this is an exact
 *  lookup, not a match by value. */
function tierNameForOffset(offset: number): SpringTierName {
  return TIER_NAME_BY_REF.get(motionForOffset(offset)) ?? "moderate";
}

/** Concentric radii and padding, tightening with the nesting. */
const SHAPE = [
  "rounded-[1.75rem] p-5 sm:p-6",
  "rounded-2xl p-5",
  "rounded-xl p-4",
  "rounded-lg p-4",
];

/**
 * The loop's beats, off the motion tokens. Opening is stepwise — one layer per
 * `duration.slow`, each its own focal event; the close is a single beat, since
 * the demonstration is in how each layer *arrives*.
 */
const STEP_MS = Math.round(duration.slow * 1000);
const HOLD_OPEN_MS = Math.round(duration.slower * 1000 * 4);
const HOLD_CLOSED_MS = Math.round(duration.slower * 1000 * 1.5);
const KICKOFF_MS = Math.round(duration.moderate * 1000);

function Layer({
  depth,
  openCount,
  reduced,
}: {
  depth: number;
  openCount: number;
  reduced: boolean;
}) {
  // The real resolved level, read from context the same way `Elevated` computes
  // it — so the label is the panel's actual `data-surface`.
  const substrate = useSurface();
  const level = Math.min(substrate + 1, 8);
  const tier = motionForOffset(LAYER_OFFSET[depth]);
  const tierName = tierNameForOffset(LAYER_OFFSET[depth]);
  const isBase = depth === 0;
  const isInnermost = depth === LAYER_COUNT - 1;

  // The layer one step in, and the spring it opens on — which is also the spring
  // this panel resizes on as that layer arrives or leaves.
  const childOpen = depth + 1 < openCount;
  const childTier = isInnermost
    ? spring.moderate
    : motionForOffset(LAYER_OFFSET[depth + 1]);

  const inner = isInnermost ? (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-1.5 w-16 rounded-full bg-foreground/25" />
      ))}
    </div>
  ) : (
    <Layer depth={depth + 1} openCount={openCount} reduced={reduced} />
  );

  return (
    <MotionElevated
      offset={1}
      layout={!reduced}
      className={cn("flex flex-col gap-3", SHAPE[depth])}
      initial={false}
      transition={reduced ? { duration: 0 } : childTier}
    >
      {/* `layout` here too: it counter-projects against the panel's FLIP resize
       *  so the label doesn't stretch while the box grows or folds. */}
      <motion.div layout={!reduced} className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-foreground/80 tabular-nums">
            surface-{level}
          </span>
          {!isBase && (
            <>
              <span className="h-px flex-1 bg-foreground/15" />
              <span className="text-foreground">spring.{tierName}</span>
            </>
          )}
        </div>
        {!isBase && (
          <span className="font-mono text-[10px] text-foreground/55 tabular-nums">
            {tier.visualDuration}s · bounce {tier.bounce}
          </span>
        )}
      </motion.div>

      {isInnermost ? (
        <div className="flex justify-center">{inner}</div>
      ) : (
        <AnimatePresence initial={false}>
          {childOpen && (
            <motion.div
              key="child"
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: reduced
                  ? { duration: 0 }
                  : {
                      duration: childTier.exit.duration,
                      ease: ease.accelerate,
                    },
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: childTier.visualDuration, ease: ease.standard }
              }
            >
              {inner}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </MotionElevated>
  );
}

/**
 * Surface and motion as one thing. Four real panels nest a step apart up the
 * elevation ladder, and each opens on the spring `motionForOffset` reads off its
 * depth — the row names both the level it resolves to and the tier that step
 * earns it, and the panel around it grows on exactly that spring.
 *
 * The chain opens a layer at a time, holds with all four visible, folds shut,
 * repeats. This is §1 made literal: elevation and motion are the same decision,
 * told twice. A popover with a fixed background inside a dialog vanishes into it
 * (§2.1) — here every layer stays legible *and* names the timing its depth chose.
 *
 * Ambient — drives itself, stops off screen or in a background tab, parks fully
 * open under `prefers-reduced-motion`.
 */
function SurfaceMotionDemoImpl() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { cycling, shouldReduceMotion } = useAmbientLoop(stageRef);
  const [openCount, setOpenCount] = useState(1);
  const openCountRef = useRef(1);
  const phaseRef = useRef<"open" | "holdOpen" | "holdClosed">("open");

  useEffect(() => {
    if (!cycling) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const set = (count: number) => {
      openCountRef.current = count;
      setOpenCount(count);
    };

    const tick = () => {
      if (!alive) return;

      if (phaseRef.current === "open") {
        if (openCountRef.current < LAYER_COUNT) {
          set(openCountRef.current + 1);
          timer = setTimeout(tick, STEP_MS);
        } else {
          phaseRef.current = "holdOpen";
          timer = setTimeout(tick, HOLD_OPEN_MS);
        }
        return;
      }

      if (phaseRef.current === "holdOpen") {
        set(1); // fold the whole chain shut in one beat
        phaseRef.current = "holdClosed";
        timer = setTimeout(tick, HOLD_CLOSED_MS);
        return;
      }

      phaseRef.current = "open";
      timer = setTimeout(tick, STEP_MS);
    };

    timer = setTimeout(tick, KICKOFF_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [cycling]);

  // Reduced motion parks the chain fully open: every row labelled, nothing
  // moving — the clearest single frame of what the loop is saying.
  const activeCount = shouldReduceMotion ? LAYER_COUNT : openCount;

  return (
    <div ref={stageRef} className="flex justify-center" aria-hidden="true">
      <Layer depth={0} openCount={activeCount} reduced={shouldReduceMotion} />
    </div>
  );
}

export const SurfaceMotionDemo = memo(SurfaceMotionDemoImpl);
