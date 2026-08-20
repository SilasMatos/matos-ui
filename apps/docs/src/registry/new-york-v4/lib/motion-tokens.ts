"use client";

import type { Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Three timing/character tiers, not just three speeds.
 *
 * - fast: micro-feedback: toggles, checkboxes, single-step surface lifts.
 * - moderate: critically damped (bounce: 0). Same perceived speed as a
 *   bouncier tier, but lands exactly with no overshoot; useful for panels that
 *   must settle precisely: dropdowns, tabs, drawers, select menus, and
 *   merged-selection backgrounds.
 * - slow: dialogs, sheets, and anything travelling far enough that a touch of
 *   overshoot (bounce: 0.12) reads as alive rather than sluggish.
 * - playful: a character tier, not a fourth speed. The bounce (0.4) is loud on
 *   purpose, for the one-off moment worth celebrating: a deploy that finished,
 *   a goal that was hit. It is never reached through motionForOffset — a
 *   component opts into it by hand, so no ordinary overlay turns festive by
 *   accident.
 */
export const spring = {
  fast: {
    type: "spring" as const,
    duration: 0.08,
    bounce: 0,
    exit: { duration: 0.06 },
  },
  moderate: {
    type: "spring" as const,
    duration: 0.16,
    bounce: 0,
    exit: { duration: 0.12 },
  },
  slow: {
    type: "spring" as const,
    duration: 0.24,
    bounce: 0.12,
    exit: { duration: 0.16 },
  },
  playful: {
    type: "spring" as const,
    duration: 0.32,
    bounce: 0.4,
    exit: { duration: 0.2 },
  },
} as const;

export type SpringTierName = keyof typeof spring;
export type SpringTier = (typeof spring)[SpringTierName];

/**
 * Fallback delay (ms) for deferred-unmount timers that guard an exit tween.
 *
 * Popups keep their portal mounted until onAnimationComplete fires, but a
 * throttled/background tab can stall the animation, so a timer force-unmounts
 * after the tier's exit duration plus a safety buffer.
 */
export const exitFallbackMs = (tier: SpringTier) =>
  Math.round(tier.exit.duration * 1000) + 100;

/**
 * Ties motion to elevation: how far a surface travels away from its substrate
 * should decide how it moves, not just how it looks.
 *
 * Mirrors the conventional Elevated offsets so a component that already knows
 * its offset gets the right tier without a second manual choice.
 *
 * Deliberately maps onto fast/moderate/slow only. `spring.playful` is a tone,
 * not a distance, so nothing here can produce it.
 */
export function motionForOffset(offset: number): SpringTier {
  if (offset <= 1) return spring.fast;
  if (offset <= 2) return spring.moderate;
  return spring.slow;
}

/**
 * Stagger delays, using the same tiers as spring, for groups: activity feeds,
 * notification stacks, and list entrances.
 *
 * `playful` is the group counterpart of `spring.playful` — a wide enough gap
 * that each item reads as its own small arrival, for sequences that are the
 * celebration rather than a list that happens to animate.
 */
export const stagger = {
  fast: 0.02,
  moderate: 0.04,
  slow: 0.06,
  playful: 0.08,
} as const;

export type StaggerTierName = keyof typeof stagger;

/**
 * Variants for a stagger container. Spread staggerContainer("moderate") onto a
 * motion.ul/motion.div and give children a matching visible variant.
 */
export function staggerContainer(
  tier: StaggerTierName = "moderate",
  delayChildren = 0,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger[tier],
        delayChildren,
      },
    },
  };
}

/**
 * The entrance half of the elevation story. `motionForOffset` answers *how
 * fast* a surface lifts; this answers *how far* it travels to get there, so a
 * component no longer hand-picks a y/scale pair next to a tier it was already
 * given. Elevation is the fill, the shadow, and the arrival — one decision.
 *
 * The defaults are shared, not universal: pass y/scale when a surface is large
 * or slow enough that 4px reads as a twitch.
 */
export function liftVariants(
  offset: number,
  options?: { y?: number; scale?: number },
): Variants {
  const y = options?.y ?? 4;
  const scale = options?.scale ?? 0.98;
  return {
    hidden: { opacity: 0, y, scale },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: motionForOffset(offset),
    },
  };
}

export type Direction = "top" | "bottom" | "left" | "right";

/**
 * An element that grows out of the edge it is anchored to, instead of fading in
 * from nowhere. `direction` is the side the element travels *from*, which for
 * an anchored popup is the opposite of its resolved placement: a menu that had
 * to flip above the cursor (side "top") enters from "bottom".
 *
 * 6px, not the 4px of liftVariants: this reads as origin, not as lift, and the
 * offset has to survive being seen sideways.
 */
export function directionalVariants(
  direction: Direction,
  tier: SpringTier = spring.moderate,
): Variants {
  const distance = 6;
  const offsetMap: Record<Direction, { x?: number; y?: number }> = {
    top: { y: -distance },
    bottom: { y: distance },
    left: { x: -distance },
    right: { x: distance },
  };
  return {
    hidden: { opacity: 0, ...offsetMap[direction] },
    visible: { opacity: 1, x: 0, y: 0, transition: tier },
  };
}

/**
 * Attention cues, not tiers: no offset, no elevation, nothing to compose with.
 * They interrupt a component that is already on screen — a field that just
 * failed validation, a total that changed under the user.
 *
 * Drive them by flipping `animate` to "shake"/"pulse" and back; they are meant
 * to live inside existing form and feedback components rather than to be
 * wrapped in one of their own.
 */
export const attentionShake: Variants = {
  shake: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.32, ease: "easeInOut" },
  },
};

export const attentionPulse: Variants = {
  pulse: {
    scale: [1, 1.03, 1],
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

/**
 * Generalizes the guarded-unmount pattern behind exitFallbackMs: keep a
 * portal/overlay mounted through its exit animation, but never rely on
 * onAnimationComplete alone.
 */
export function useExitAnimation(
  open: boolean,
  tier: SpringTier = spring.moderate,
) {
  const [mounted, setMounted] = useState(open);
  // Ref mirror of `mounted`, kept in sync at every write. The effect below has
  // to know whether anything is still on screen before arming the exit timer,
  // but reading the state value there would either close over a stale value or
  // pull `mounted` into the dependency list — and that re-runs the effect on
  // its own update, re-arming the timer mid-exit. A ref read is neither.
  const mountedRef = useRef(open);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyMounted = useCallback((value: boolean) => {
    mountedRef.current = value;
    setMounted(value);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      clearTimer();
      applyMounted(true);
      return;
    }

    // Already unmounted: nothing to animate out, so don't arm a timer.
    if (!mountedRef.current) return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      applyMounted(false);
    }, exitFallbackMs(tier));

    return clearTimer;
  }, [open, tier, clearTimer, applyMounted]);

  const onAnimationComplete = useCallback(() => {
    if (open) return;
    clearTimer();
    applyMounted(false);
  }, [open, clearTimer, applyMounted]);

  return { mounted, onAnimationComplete } as const;
}
