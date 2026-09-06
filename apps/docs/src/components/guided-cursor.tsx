"use client";

import { motion } from "framer-motion";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";

/**
 * A scripted pointer that operates the ambient demos on the home page — it
 * glides between targets a demo hands it and clicks them, so a surface that
 * would otherwise just cycle on a timer reads as something being *used*.
 *
 * Not part of the registry: it names no font, it is `aria-hidden` decoration,
 * and it exists only for these marketing surfaces. It does lean on the motion
 * tokens for every timing — the travel is a `duration` + `ease` tween (a real
 * cursor does not overshoot, so no spring), and the click depress is
 * `spring.fast`, the tier for micro-feedback.
 *
 * Vestibular note: a pointer travelling across a region is Tier-1 motion. The
 * hook does not run and the component is not mounted under
 * `prefers-reduced-motion` — every consumer already gates on `useAmbientLoop`,
 * whose `cycling` folds that in — and each demo keeps its own frozen frame.
 */

/** The tip of the SVG below, in its own 22px box — the point that has to land
 *  on the target, not the box's centre. */
const TIP = { x: 4.6, y: 2.9 } as const;

/** Travel time for one hop, matched to the tween that actually moves the
 *  cursor so a demo's `setTimeout` choreography and the animation agree.
 *  `duration.slower` is the ambient/`gentle` tween length — right for a glide
 *  that should read as unhurried rather than as a panel arriving. */
export const CURSOR_TRAVEL_MS = Math.round(duration.slower * 1000);

/** How long the pointer holds its pressed pose. Long enough to register as a
 *  press rather than a flicker; `spring.fast` carries it in and out. */
const CLICK_HOLD_MS = 150;

function PointerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      // Foreground fill with a background-coloured seam, so the pointer keeps
      // its edge on any rung of the surface ladder, in either theme.
      className="fill-foreground stroke-background drop-shadow-sm"
    >
      <path
        d="M5 3 L5 19 L9 15.3 L11.5 20.8 L14 19.7 L11.5 14.2 L17.5 14 Z"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GuidedCursor({
  point,
  clicking,
  clickId,
  visible,
}: {
  point: { x: number; y: number } | null;
  clicking: boolean;
  clickId: number;
  visible: boolean;
}) {
  const show = visible && point !== null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
      initial={false}
      animate={{
        x: (point?.x ?? 0) - TIP.x,
        y: (point?.y ?? 0) - TIP.y,
        opacity: show ? 1 : 0,
        // Shrinks away rather than just fading, so a real cursor entering the
        // area (which flips `visible` off) reads as this one stepping aside.
        scale: show ? 1 : 0.5,
      }}
      transition={{
        x: { duration: duration.slower, ease: ease.standard },
        y: { duration: duration.slower, ease: ease.standard },
        opacity: { duration: duration.moderate, ease: ease.standard },
        scale: spring.fast,
      }}
    >
      <motion.div
        className="relative"
        animate={{ scale: clicking ? 0.82 : 1 }}
        transition={spring.fast}
      >
        <PointerIcon />
        {/* One ripple per click: keying on the counter remounts the ring so its
         *  keyframe replays without an AnimatePresence round-trip. `border` +
         *  `opacity` + `scale` are all compositor-cheap. */}
        <motion.span
          key={clickId}
          className="absolute rounded-full border border-foreground/45"
          style={{ left: TIP.x - 4, top: TIP.y - 4, width: 8, height: 8 }}
          initial={clickId > 0 ? { scale: 0.4, opacity: 0.75 } : { opacity: 0 }}
          animate={clickId > 0 ? { scale: 3.4, opacity: 0 } : { opacity: 0 }}
          transition={{ duration: duration.slow, ease: ease.decelerate }}
        />
      </motion.div>
    </motion.div>
  );
}

type MaybeRef = RefObject<HTMLElement | null> | HTMLElement | null;

function resolve(target: MaybeRef): HTMLElement | null {
  if (!target) return null;
  return "current" in target ? target.current : target;
}

/**
 * Wiring for one guided pointer. The demo drives it: `moveTo(ref)` aims at an
 * element's centre (measured live, so it follows a morphing box), `click()`
 * fires the press pulse, `reset()` parks it. `bind` goes on the stage so the
 * scripted pointer yields the moment the reader's real cursor arrives.
 *
 * `visible` is `active && !userPresent`; when it goes false the component fades
 * and the demo's own effects (which also gate on `active`) tear their timers
 * down.
 */
export function useGuidedCursor(
  stageRef: RefObject<HTMLElement | null>,
  { active }: { active: boolean },
) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [clicking, setClicking] = useState(false);
  const [clickId, setClickId] = useState(0);
  const [userPresent, setUserPresent] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);
  const pollUntilRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One read of the stage, one of the target — batched, no interleaved writes.
  const sample = useCallback(() => {
    const stage = stageRef.current;
    const el = targetRef.current;
    if (!stage || !el) return;
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    setPoint({
      x: r.left - s.left + r.width / 2,
      y: r.top - s.top + r.height / 2,
    });
  }, [stageRef]);

  // Re-sample every frame for a short window after each aim, so the pointer
  // tracks a target that is still settling (the hero surface finishing a morph,
  // content mounting a beat after its state flips).
  const pollFor = useCallback(
    (ms: number) => {
      pollUntilRef.current = performance.now() + ms;
      cancelAnimationFrame(rafRef.current);
      const tick = () => {
        sample();
        if (performance.now() < pollUntilRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [sample],
  );

  const moveTo = useCallback(
    (target: MaybeRef, settleMs = 1000) => {
      const el = resolve(target);
      if (!el) return;
      targetRef.current = el;
      pollFor(settleMs);
    },
    [pollFor],
  );

  const click = useCallback(() => {
    setClicking(true);
    setClickId((n) => n + 1);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClicking(false), CLICK_HOLD_MS);
  }, []);

  const reset = useCallback(() => {
    targetRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setPoint(null);
  }, []);

  // Follow the stage resizing under a parked target.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => sample());
    ro.observe(stage);
    return () => ro.disconnect();
  }, [sample, stageRef]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    },
    [],
  );

  const bind = useMemo(
    () => ({
      onPointerEnter: () => setUserPresent(true),
      onPointerLeave: () => setUserPresent(false),
    }),
    [],
  );

  return {
    point,
    clicking,
    clickId,
    visible: active && !userPresent,
    moveTo,
    click,
    reset,
    bind,
  } as const;
}
