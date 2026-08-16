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
 */
export function motionForOffset(offset: number): SpringTier {
  if (offset <= 1) return spring.fast;
  if (offset <= 2) return spring.moderate;
  return spring.slow;
}

/**
 * Stagger delays, using the same three tiers as spring, for groups: activity
 * feeds, notification stacks, and list entrances.
 */
export const stagger = {
  fast: 0.02,
  moderate: 0.04,
  slow: 0.06,
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
