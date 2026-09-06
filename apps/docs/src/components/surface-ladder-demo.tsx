"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  CURSOR_TRAVEL_MS,
  GuidedCursor,
  useGuidedCursor,
} from "@/components/guided-cursor";
import { useAmbientLoop } from "@/hooks/use-ambient-loop";
import { cn } from "@/lib/utils";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

/**
 * The rungs this demo walks, expressed as levels rather than as a count.
 *
 * They start at 3 and not at 1 because the demo does not reset its substrate:
 * it is rendered inside a column that is itself an `Elevated`, so the outermost
 * rung genuinely resolves to level 3. Quoting a synthetic 1 → 4 ladder here —
 * which is what `examples/elevated-demo.tsx` does, legitimately, by wrapping
 * itself in `SurfaceProvider value={1}` — would mean the section demonstrated
 * substrate context by opting out of it. The label under the stack therefore
 * reads `surface-3` on a rung that really is at level 3.
 */
const LEVELS = [3, 4, 5, 6] as const;

/** How long a rung stays lit after the pointer clicks it, before the pointer
 *  sets off for the next one. Long enough to read the label that changes with
 *  it. */
const DWELL_MS = 1200;

/**
 * The highlight is a tint, not a shadow step.
 *
 * Cross-fading `shadow-surface-N` to `shadow-surface-N+1` is the move the hero
 * uses, and it is wrong here for two reasons. The blur radius roughly doubles
 * per level in light mode, so by rung 6 the lift would be a 24px drop painted
 * inside a parent with 16px of padding — the highlight would smear across the
 * rung containing it instead of picking out the rung it belongs to. And it
 * would make the four rungs' highlights visibly different from each other,
 * when the whole claim is that every step of the ladder is the same step.
 *
 * A flat tint is uniform at every level and stays inside its own box. It is
 * also the currency the system already uses for elevation in dark mode, where
 * each level is a lighter fill — so the highlighted rung reads as briefly
 * standing one step further up its own ladder.
 */
const HIGHLIGHT_OPACITY = 0.06;

/** Where the stack parks when the reader has asked for less motion: a middle
 *  rung, so the frozen frame still shows a highlight sitting *inside* two
 *  surfaces and above one more, which is the whole idea the loop animates. */
const FROZEN_INDEX = 1;

/** Concentric radii, stepping down with the nesting. Equal radii at every rung
 *  — the shape `elevated-demo`'s `Ladder` uses — read as fine at two levels and
 *  as a stack of unrelated boxes at four. */
const RUNG_SHAPE = [
  "rounded-3xl p-5",
  "rounded-2xl p-5",
  "rounded-xl p-5",
  "size-16 rounded-lg",
];

function Rung({
  depth,
  activeLevel,
  registerRung,
}: {
  depth: number;
  activeLevel: number;
  registerRung: (depth: number, el: HTMLDivElement | null) => void;
}) {
  const level = LEVELS[depth];
  const isCore = depth === LEVELS.length - 1;

  return (
    <Elevated
      ref={(el) => registerRung(depth, el)}
      offset={1}
      className={cn(
        "relative flex items-center justify-center",
        RUNG_SHAPE[depth],
      )}
    >
      {/* Painted behind the next rung in, so the tint reads as this surface
       *  brightening rather than as a scrim laid over its contents. A positioned
       *  element outranks its non-positioned siblings in paint order, which is
       *  why the rung it wraps is given `relative` in turn. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-foreground"
        initial={false}
        animate={{ opacity: level === activeLevel ? HIGHLIGHT_OPACITY : 0 }}
        transition={spring.moderate}
      />
      {!isCore && (
        <div className="relative">
          <Rung
            depth={depth + 1}
            activeLevel={activeLevel}
            registerRung={registerRung}
          />
        </div>
      )}
    </Elevated>
  );
}

/**
 * Four real surfaces, one at a time, in a slow loop — with the token that names
 * the lit rung changing under it, and a scripted pointer stepping the highlight
 * inward by clicking each rung.
 *
 * The point is the pairing rather than either half: a reader who watches the
 * pointer click `surface-3`, then `surface-4` one step further in, has learned
 * what the token means without being told, which a paragraph about nested
 * elevation cannot do at this length.
 */
export function SurfaceLadderDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { cycling, shouldReduceMotion } = useAmbientLoop(stageRef);
  const [index, setIndex] = useState(0);
  const rungRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);

  const cursor = useGuidedCursor(stageRef, { active: cycling });
  const { moveTo, click, reset } = cursor;

  useEffect(() => {
    if (!cycling) {
      reset();
      return;
    }

    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    // Resume from wherever the walk had got to, so scrolling the section out
    // and back does not snap the highlight to the top rung.
    const step = (k: number) => {
      if (!alive) return;
      indexRef.current = k;
      moveTo(rungRefs.current[k], 700);
      timer = setTimeout(() => {
        if (!alive) return;
        click();
        setIndex(k);
        timer = setTimeout(() => step((k + 1) % LEVELS.length), DWELL_MS);
      }, CURSOR_TRAVEL_MS);
    };

    step(indexRef.current);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [cycling, moveTo, click, reset]);

  // Derived rather than pushed into state on a reduced-motion effect: this way
  // flipping the OS setting while the loop is mid-walk parks it immediately,
  // and flipping it back resumes from wherever the timer had got to.
  const activeLevel = LEVELS[shouldReduceMotion ? FROZEN_INDEX : index];

  return (
    <div
      ref={stageRef}
      className="relative flex flex-col items-center gap-4"
      aria-hidden="true"
      {...(shouldReduceMotion ? {} : cursor.bind)}
    >
      <Rung
        depth={0}
        activeLevel={activeLevel}
        registerRung={(depth, el) => {
          rungRefs.current[depth] = el;
        }}
      />

      {/* Keyed, so each token arrives rather than cross-fading with the one
       *  before it — at 1.2s apart a cross-fade would be over long before the
       *  next change and reads as a flicker. `tabular-nums` and a fixed row
       *  keep the digit from nudging the label sideways as it changes. */}
      <motion.span
        key={activeLevel}
        initial={shouldReduceMotion ? false : { opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.moderate}
        className="font-mono text-[11px] text-muted-foreground tabular-nums"
      >
        surface-{activeLevel}
      </motion.span>

      {!shouldReduceMotion && (
        <GuidedCursor
          point={cursor.point}
          clicking={cursor.clicking}
          clickId={cursor.clickId}
          visible={cursor.visible}
        />
      )}
    </div>
  );
}
