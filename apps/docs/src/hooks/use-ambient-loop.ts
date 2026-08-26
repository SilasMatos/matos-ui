"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { type RefObject, useEffect, useState } from "react";

/**
 * Pauses a loop while the tab is in the background.
 *
 * A hidden tab still runs timers, only throttled, so without this a machine
 * would bank up transitions and burn through several of them in one frame the
 * moment the tab came forward.
 */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}

/**
 * The three conditions every ambient (self-driving, never-ending) demo on this
 * site has to satisfy before it is allowed to run: it is on screen, the tab is
 * in front, and the reader has not asked for less motion.
 *
 * Returned as one boolean because callers invariably want it as one — the
 * timer effects that drive these loops key off `cycling` and unwind themselves
 * when any of the three goes false. Reduced motion is folded in rather than
 * left to the caller for the same reason: an ambient loop has no "reduced"
 * version, it simply does not run, and the representative frozen state is the
 * component's own business.
 */
export function useAmbientLoop(ref: RefObject<Element | null>) {
  const shouldReduceMotion = !!useReducedMotion();
  const inView = useInView(ref);
  const pageVisible = usePageVisible();

  return {
    cycling: !shouldReduceMotion && inView && pageVisible,
    shouldReduceMotion,
  } as const;
}
