"use client";

import {
  type MotionValue,
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
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
 * tokens for every timing — the travel is a spring calibrated to `duration.slow`
 * with a hair of bounce (0.1: no perceptible overshoot on a pointer hop, but it
 * arrives with intent instead of creeping the last few pixels), and the click
 * depress is `spring.fast`, the tier for micro-feedback.
 *
 * ## Why the position never touches React state
 *
 * The hook re-samples the target rectangle every frame for up to a second
 * after each aim (the hero surface finishing a morph, content mounting a beat
 * late). Routing that through `useState` re-rendered the whole subtree ~60
 * times per hop. Instead the raw target is written to a `MotionValue` and a
 * `useSpring` follows it — the glide, the morph-tracking and the framerate all
 * live on the compositor, and React only re-renders when `visible`/`clicking`
 * actually flip.
 *
 * Vestibular note: a pointer travelling across a region is Tier-1 motion. The
 * hook does not run and the component is not mounted under
 * `prefers-reduced-motion` — every consumer already gates on `useAmbientLoop`,
 * whose `cycling` folds that in — and each demo keeps its own frozen frame.
 */

/** The tip of the SVG below, in its own 24px box — the point that has to land
 *  on the target, not the box's centre. The art is authored in a 32-unit
 *  viewBox and rendered at 24px, so the index fingertip at (12.9, 8.5) maps to
 *  (12.9, 8.5) × 24/32. */
const TIP = { x: 9.7, y: 6.4 } as const;

/** Nominal travel time for one hop, still exported for a consumer that wants to
 *  pace something else against the glide. It is no longer how the demos know
 *  the pointer has landed — that is `moveTo`'s `onArrive`, which watches the
 *  actual spring — so a small mismatch here no longer desyncs a click. */
export const CURSOR_TRAVEL_MS = Math.round(duration.slow * 1000);

/** Follow spring for the pointer's travel. `visualDuration` sets the glide to
 *  `duration.slow`; the small bounce gives an organic deceleration rather than
 *  the slow creep a `bounce: 0` tail leaves. */
const TRAVEL_SPRING = { visualDuration: duration.slow, bounce: 0.1 } as const;

/** How long the pointer holds its pressed pose. Long enough to register as a
 *  press rather than a flicker; `spring.fast` carries it in and out. */
const CLICK_HOLD_MS = 150;

/**
 * How long after the reader's real cursor last moved over the stage before the
 * scripted one is allowed back. `pointerleave` alone is not enough: a browser
 * does not always fire it when the element under the pointer unmounts (which
 * the hero surface does on every morph), so without a movement-based timeout
 * the scripted pointer could vanish for good after a single hover.
 */
const USER_IDLE_MS = 2500;

/** The idle float. A pointer that has arrived and is waiting out a dwell should
 *  still be breathing, not frozen — matches the ambient-pulse convention the
 *  demo files already use (`duration` + `repeat: Infinity` + `easeInOut`). */
const IDLE_BOB_ANIMATE = { y: [0, -2.5, 0] };
const IDLE_BOB_TRANSITION = {
  duration: 2.4,
  repeat: Number.POSITIVE_INFINITY,
  ease: "easeInOut" as const,
};

function PointerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 32 32"
      aria-hidden="true"
      // Foreground fill with a background-coloured seam, so the pointer keeps
      // its edge on any rung of the surface ladder, in either theme.
      className="fill-foreground stroke-background drop-shadow-sm"
    >
      <path
        d="M11.3,20.4c-0.3-0.4-0.6-1.1-1.2-2c-0.3-0.5-1.2-1.5-1.5-1.9c-0.2-0.4-0.2-0.6-0.1-1
        c0.1-0.6,0.7-1.1,1.4-1.1c0.5,0,1,0.4,1.4,0.7c0.2,0.2,0.5,0.6,0.7,0.8c0.2,0.2,0.2,0.3,0.4,0.5c0.2,0.3,0.3,0.5,0.2,0.1
        c-0.1-0.5-0.2-1.3-0.4-2.1c-0.1-0.6-0.2-0.7-0.3-1.1c-0.1-0.5-0.2-0.8-0.3-1.3c-0.1-0.3-0.2-1.1-0.3-1.5c-0.1-0.5-0.1-1.4,0.3-1.8
        c0.3-0.3,0.9-0.4,1.3-0.2c0.5,0.3,0.8,1,0.9,1.3c0.2,0.5,0.4,1.2,0.5,2c0.2,1,0.5,2.5,0.5,2.8c0-0.4-0.1-1.1,0-1.5
        c0.1-0.3,0.3-0.7,0.7-0.8c0.3-0.1,0.6-0.1,0.9-0.1c0.3,0.1,0.6,0.3,0.8,0.5c0.4,0.6,0.4,1.9,0.4,1.8c0.1-0.4,0.1-1.2,0.3-1.6
        c0.1-0.2,0.5-0.4,0.7-0.5c0.3-0.1,0.7-0.1,1,0c0.2,0,0.6,0.3,0.7,0.5c0.2,0.3,0.3,1.3,0.4,1.7c0,0.1,0.1-0.4,0.3-0.7
        c0.4-0.6,1.8-0.8,1.9,0.6c0,0.7,0,0.6,0,1.1c0,0.5,0,0.8,0,1.2c0,0.4-0.1,1.3-0.2,1.7c-0.1,0.3-0.4,1-0.7,1.4c0,0-1.1,1.2-1.2,1.8
        c-0.1,0.6-0.1,0.6-0.1,1c0,0.4,0.1,0.9,0.1,0.9s-0.8,0.1-1.2,0c-0.4-0.1-0.9-0.8-1-1.1c-0.2-0.3-0.5-0.3-0.7,0
        c-0.2,0.4-0.7,1.1-1.1,1.1c-0.7,0.1-2.1,0-3.1,0c0,0,0.2-1-0.2-1.4c-0.3-0.3-0.8-0.8-1.1-1.1L11.3,20.4z"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Knuckle creases — same background stroke, dialled back so they read as
       *  detail rather than a second outline. */}
      <g
        className="stroke-background/70"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="19.6" y1="20.7" x2="19.6" y2="17.3" />
        <line x1="17.6" y1="20.7" x2="17.5" y2="17.3" />
        <line x1="15.6" y1="17.3" x2="15.6" y2="20.7" />
      </g>
    </svg>
  );
}

export function GuidedCursor({
  x,
  y,
  ready,
  clicking,
  clickId,
  visible,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  ready: boolean;
  clicking: boolean;
  clickId: number;
  visible: boolean;
}) {
  const show = visible && ready;

  // Offset the tip onto the target without a second animated property: the
  // spring drives `x`/`y`, this just shifts the frame it renders in.
  const tx = useTransform(x, (v) => v - TIP.x);
  const ty = useTransform(y, (v) => v - TIP.y);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
      style={{ x: tx, y: ty }}
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        // Shrinks away rather than just fading, so a real cursor entering the
        // area (which flips `visible` off) reads as this one stepping aside.
        scale: show ? 1 : 0.5,
      }}
      transition={{
        opacity: { duration: duration.moderate, ease: ease.standard },
        scale: spring.fast,
      }}
    >
      {/* Idle float on its own layer, so it composes with the travel above and
       *  the click-press below instead of fighting either. It never stops —
       *  that is the point: the pointer is always animating, even mid-dwell. */}
      <motion.div animate={IDLE_BOB_ANIMATE} transition={IDLE_BOB_TRANSITION}>
        <motion.div
          className="relative"
          animate={{ scale: clicking ? 0.82 : 1 }}
          transition={spring.fast}
        >
          <PointerIcon />

          {/* One ripple per click: keying on the counter remounts the ring so
           *  its keyframe replays without an AnimatePresence round-trip.
           *  `border` + `opacity` + `scale` are all compositor-cheap. */}
          <motion.span
            key={clickId}
            className="absolute rounded-full border border-foreground/45"
            style={{ left: TIP.x - 4, top: TIP.y - 4, width: 8, height: 8 }}
            initial={
              clickId > 0 ? { scale: 0.4, opacity: 0.75 } : { opacity: 0 }
            }
            animate={clickId > 0 ? { scale: 3.4, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: duration.slow, ease: ease.decelerate }}
          />
        </motion.div>
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
 * fires the press pulse, `reset()` stops the tracking work but leaves the
 * pointer where it is. `bind` goes on the stage so the scripted pointer yields
 * while the reader's real cursor is moving over it and returns USER_IDLE_MS
 * after it stops.
 *
 * `visible` is `active && !userPresent`; when it goes false the component just
 * fades out (staying put), and fades back in where it left off.
 */
export function useGuidedCursor(
  stageRef: RefObject<HTMLElement | null>,
  { active }: { active: boolean },
) {
  // Raw target, written straight from a rAF loop; `x`/`y` are the spring that
  // the component actually renders. Neither touches React state, so the
  // per-frame re-sampling below costs nothing in the tree.
  const x = useSpring(0, TRAVEL_SPRING);
  const y = useSpring(0, TRAVEL_SPRING);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [clicking, setClicking] = useState(false);
  const [clickId, setClickId] = useState(0);
  const [userPresent, setUserPresent] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef(0);
  const arrivalRafRef = useRef(0);
  const pollUntilRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One read of the stage, one of the target — batched, no interleaved writes.
  const sample = useCallback(() => {
    const stage = stageRef.current;
    const el = targetRef.current;
    if (!stage || !el) return;
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const cx = r.left - s.left + r.width / 2;
    const cy = r.top - s.top + r.height / 2;

    if (!readyRef.current) {
      // First placement: land there, don't glide in from the origin.
      x.jump(cx);
      y.jump(cy);
      readyRef.current = true;
      setReady(true);
      return;
    }
    // Sub-pixel deltas aren't worth waking the spring for.
    if (Math.abs(x.get() - cx) < 0.1 && Math.abs(y.get() - cy) < 0.1) return;
    x.set(cx);
    y.set(cy);
  }, [stageRef, x, y]);

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

  const cancelArrival = useCallback(() => {
    cancelAnimationFrame(arrivalRafRef.current);
    arrivalRafRef.current = 0;
  }, []);

  /**
   * Fires `onArrive` once the spring has actually reached the current target and
   * all but stopped — so a demo can hang a click, a selection or the next hop on
   * the pointer *being there* rather than on a `setTimeout` guess at how long the
   * travel takes. A deadline guards against a hop that never settles (a target
   * that unmounted mid-flight).
   */
  const watchArrival = useCallback(
    (onArrive: () => void) => {
      cancelArrival();
      const deadline = performance.now() + 1600;
      const tick = () => {
        const stage = stageRef.current;
        const el = targetRef.current;
        if (stage && el) {
          const s = stage.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          const cx = r.left - s.left + r.width / 2;
          const cy = r.top - s.top + r.height / 2;
          const gap = Math.hypot(x.get() - cx, y.get() - cy);
          const speed = Math.hypot(x.getVelocity(), y.getVelocity());
          if ((gap < 2.5 && speed < 60) || performance.now() > deadline) {
            arrivalRafRef.current = 0;
            onArrive();
            return;
          }
        } else if (performance.now() > deadline) {
          arrivalRafRef.current = 0;
          onArrive();
          return;
        }
        arrivalRafRef.current = requestAnimationFrame(tick);
      };
      arrivalRafRef.current = requestAnimationFrame(tick);
    },
    [cancelArrival, stageRef, x, y],
  );

  const moveTo = useCallback(
    (
      target: MaybeRef,
      options?: number | { settleMs?: number; onArrive?: () => void },
    ) => {
      const settleMs =
        typeof options === "number" ? options : (options?.settleMs ?? 1000);
      const onArrive =
        typeof options === "number" ? undefined : options?.onArrive;
      const el = resolve(target);
      if (!el) {
        cancelArrival();
        return;
      }
      targetRef.current = el;
      pollFor(settleMs);
      if (onArrive) watchArrival(onArrive);
      else cancelArrival();
    },
    [pollFor, watchArrival, cancelArrival],
  );

  const click = useCallback(() => {
    setClicking(true);
    setClickId((n) => n + 1);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClicking(false), CLICK_HOLD_MS);
  }, []);

  // Stops the tracking work but keeps the last point: while the demo is paused
  // (off screen, tab in back) the pointer just fades out via `visible` and
  // fades back in where it left off, rather than blanking and re-homing.
  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelArrival();
  }, [cancelArrival]);

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
      cancelAnimationFrame(arrivalRafRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    [],
  );

  // Movement-based, not enter/leave-based: the scripted pointer steps aside
  // while the reader is actively moving over the stage and comes back
  // USER_IDLE_MS after they stop. `pointerleave` still clears it immediately
  // when it does fire, but nothing depends on it firing.
  const bind = useMemo(() => {
    const markPresent = () => {
      setUserPresent(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(
        () => setUserPresent(false),
        USER_IDLE_MS,
      );
    };
    return {
      onPointerMove: markPresent,
      onPointerDown: markPresent,
      onPointerLeave: () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        setUserPresent(false);
      },
    };
  }, []);

  return {
    x,
    y,
    ready,
    clicking,
    clickId,
    visible: active && !userPresent,
    moveTo,
    click,
    reset,
    cancelArrival,
    bind,
  } as const;
}
