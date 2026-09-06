"use client";

import {
  type MotionValue,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Seven timing/character tiers, not seven speeds.
 *
 * - fast: micro-feedback: toggles, checkboxes, single-step surface lifts.
 * - moderate: dropdowns, tabs, drawers, select menus, and merged-selection
 *   backgrounds — panels that have to settle precisely where they were aimed.
 * - slow: dialogs, sheets, and anything travelling far enough that a little
 *   overshoot reads as alive rather than sluggish.
 * - snappy: zero-latency follow. A dragged sheet, a magnetic button, an element
 *   tracking the cursor — motion that must feel like a direct response to the
 *   hand, not a panel arriving. Bounce is 0 and the visual duration is shorter
 *   than `fast`, because any overshoot on something the user is actively moving
 *   reads as lag. Never reached through motionForOffset.
 * - gentle: ambient, unhurried motion — a backdrop fading up, a hero settling on
 *   load, a section easing in as it scrolls into view. Longer and calmer than
 *   `slow`, with barely any bounce, so it recedes instead of announcing itself.
 *   Never reached through motionForOffset.
 * - morph: shape, not distance. For a `layout` animation where width, height
 *   and border-radius change together — the element becoming a different
 *   thing, rather than the same thing arriving. The other tiers are calibrated
 *   for a panel translating a few pixels while it fades; a box crossing 200px
 *   of width at those timings reads as a snap. Bounce stays low for the same
 *   reason: overshoot on a large dimension change reads as unstable rather
 *   than alive. Like playful, it is never reached through motionForOffset.
 * - playful: a character tier, not a speed. The bounce (0.45) is loud on
 *   purpose, for the one-off moment worth celebrating: a deploy that finished,
 *   a goal that was hit. It is never reached through motionForOffset — a
 *   component opts into it by hand, so no ordinary overlay turns festive by
 *   accident.
 *
 * ## Why `visualDuration` and not `duration`
 *
 * A spring's `duration` covers the whole animation *including* the settling
 * tail, and the tail is the part nobody perceives as travel. Calibrating on it
 * means every tier lands visually earlier than its own number claims — so a
 * scale that reads as reasonable in the source is systematically faster than
 * that on screen, and the discrepancy grows with bounce.
 *
 * `visualDuration` is the time to visual arrival, with the tail falling after
 * it. It is the number a reader's eye actually experiences, which makes it the
 * only one of the two worth tuning by feel. It also composes with time-based
 * animations: the CSS custom properties a dozen components derive from these
 * tiers (`--motion-duration` and friends, driving Base UI's CSS enter/exit)
 * are plain durations, and pairing a CSS transition with a spring's *total*
 * duration is how the two end up visibly out of step.
 *
 * `visualDuration` overrides `duration` when both are set, so these tiers
 * deliberately carry only the one field — the other would be dead weight that
 * looks authoritative.
 *
 * ## Why nothing common is critically damped any more
 *
 * `fast` and `moderate` used to sit at `bounce: 0`, on the reasoning that a
 * panel which must land exactly should not overshoot. The reasoning was right
 * and the value was too literal: zero bounce plus a very short duration is the
 * recipe for movement that reads as a state swap rather than a transition —
 * mechanical, and with no deceleration for the eye to follow.
 *
 * A small bounce (0.10–0.15) still has no perceptible overshoot at these
 * distances; what it buys is the organic slow-down at the end. If a specific
 * panel ever reads as unstable, take *that* tier back to 0 rather than the
 * pair of them. `snappy` is the deliberate exception — see its note above.
 *
 * The `exit` durations are plain tweens (not springs — nothing needs character
 * on the way out) held at roughly 70% of their tier's entrance, which is the
 * ratio the previous scale already used.
 */
export const spring = {
  fast: {
    type: "spring" as const,
    visualDuration: 0.15,
    bounce: 0.1,
    exit: { duration: 0.1 },
  },
  snappy: {
    type: "spring" as const,
    visualDuration: 0.11,
    bounce: 0,
    exit: { duration: 0.08 },
  },
  moderate: {
    type: "spring" as const,
    visualDuration: 0.28,
    bounce: 0.15,
    exit: { duration: 0.2 },
  },
  slow: {
    type: "spring" as const,
    visualDuration: 0.42,
    bounce: 0.2,
    exit: { duration: 0.3 },
  },
  gentle: {
    type: "spring" as const,
    visualDuration: 0.6,
    bounce: 0.06,
    exit: { duration: 0.4 },
  },
  morph: {
    type: "spring" as const,
    visualDuration: 0.75,
    bounce: 0.12,
    exit: { duration: 0.52 },
  },
  playful: {
    type: "spring" as const,
    visualDuration: 0.5,
    bounce: 0.45,
    exit: { duration: 0.35 },
  },
} as const;

export type SpringTierName = keyof typeof spring;
export type SpringTier = (typeof spring)[SpringTierName];

/**
 * Named cubic-bézier curves for the animation a spring does *not* cover: a
 * multi-keyframe sequence, a colour or blur crossfade, anything driven by a
 * `duration` rather than by physics.
 *
 * Springs stay the default for anything that travels — panels, lifts, list
 * entrances. Reach for these only when the motion is a shape over time, not a
 * mass arriving somewhere.
 *
 * - standard: the everyday in-out. A touch of ease on both ends.
 * - decelerate: fast start, soft landing — for something *entering* (a reveal,
 *   a value counting up).
 * - accelerate: soft start, fast exit — for something *leaving* the frame.
 * - emphasized: a slow, expressive start and a long glide out, for a hero
 *   element or a full-bleed transition that should feel deliberate.
 * - anticipate: dips backward before it moves — the 12-principles anticipation
 *   beat, for a playful confirm or a bouncy icon.
 * - linear: no easing, for a constant-velocity loop (a marquee, a spinner).
 *
 * These are JS-only. The CSS side keeps just `--ease-spring` / `--ease-lift`
 * (see globals.css) because that Tailwind v4 setup drops a named `--ease-*`
 * entry nothing else in the file references.
 */
export const ease = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0.05, 0.7, 0.1, 1],
  accelerate: [0.3, 0, 0.8, 0.15],
  emphasized: [0.16, 1, 0.3, 1],
  anticipate: [0.68, -0.55, 0.27, 1.55],
  linear: [0, 0, 1, 1],
} as const;

export type EaseName = keyof typeof ease;

/**
 * Tween durations, in seconds, for the `ease`-driven half of the system. The
 * first three are the exact JS counterpart of `--duration-*` in globals.css and
 * must move together with them — see DESIGN.md §3.8. `slower` has no CSS twin;
 * it is for `gentle`-tier tweens (ambient reveals, hero intros).
 */
export const duration = {
  instant: 0,
  fast: 0.18,
  moderate: 0.28,
  slow: 0.42,
  slower: 0.6,
} as const;

export type DurationName = keyof typeof duration;

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
 * Deliberately maps onto fast/moderate/slow only. `snappy`, `gentle`,
 * `playful` and `morph` are a response, a mood, a tone and a kind of change
 * respectively — none of them a distance — so nothing here can produce them.
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

/**
 * A premium in-view entrance: fade + a longer travel than `liftVariants` + an
 * optional focus-pull (`blur(6px)` → `blur(0)`) that reads as content coming
 * into focus rather than sliding on. Driven by a `decelerate` tween, not a
 * spring — a reveal should glide to a stop, not bounce.
 *
 * Blur is GPU work: keep it to text blocks, cards and media, not full sections,
 * and always pair with `withReducedMotion` — the blur and the travel are
 * exactly what a vestibular-sensitive reader needs dropped.
 */
export function revealVariants(options?: {
  y?: number;
  x?: number;
  blur?: number;
  scale?: number;
  tier?: DurationName;
}): Variants {
  const y = options?.y ?? 14;
  const x = options?.x ?? 0;
  const blur = options?.blur ?? 6;
  const scale = options?.scale ?? 1;
  const seconds = duration[options?.tier ?? "slow"];
  return {
    hidden: {
      opacity: 0,
      y,
      x,
      scale,
      filter: `blur(${blur}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: seconds, ease: ease.decelerate },
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
 * A surface that slides its whole self in from an edge — a drawer, a sheet, a
 * toast rail. Bigger travel than `directionalVariants` (that one is a 6px hint
 * on an anchored popup; this one is the panel actually entering the viewport),
 * and it defaults to the `slow` tier for the same reason a sheet does.
 */
export function slideVariants(
  direction: Direction,
  options?: { distance?: number; tier?: SpringTier; fade?: boolean },
): Variants {
  const distance = options?.distance ?? 24;
  const tier = options?.tier ?? spring.slow;
  const fade = options?.fade ?? true;
  const axis: Record<Direction, { x?: number; y?: number }> = {
    top: { y: -distance },
    bottom: { y: distance },
    left: { x: -distance },
    right: { x: distance },
  };
  return {
    hidden: { ...(fade ? { opacity: 0 } : {}), ...axis[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: tier,
    },
  };
}

/**
 * Press/hover feedback for a surface that is itself the target — a card, a
 * tile, a custom button. The 12-principles "ease + squash": floats up and
 * scales a hair on hover, presses back in on tap, on the `fast` spring so it
 * tracks the finger.
 *
 * Spread the result onto a `motion` element. Pass `reduced` (from
 * `useReducedMotion()`) to collapse it to nothing — a press cue is pure
 * decoration and safe to drop entirely.
 *
 *   const reduce = useReducedMotion();
 *   <motion.button {...pressable({ reduced: !!reduce })} />
 */
export function pressable(options?: {
  hover?: number;
  press?: number;
  lift?: number;
  reduced?: boolean;
}) {
  if (options?.reduced) return {} as const;
  const hover = options?.hover ?? 1.02;
  const press = options?.press ?? 0.97;
  const lift = options?.lift ?? -2;
  return {
    whileHover: { scale: hover, y: lift },
    whileTap: { scale: press, y: 0 },
    transition: spring.fast,
  } as const;
}

/**
 * Cursor-magnetism for a button or card: the element leans toward the pointer
 * while it hovers and springs back on leave, on the `snappy` tier so it feels
 * attached to the hand. `strength` is how far it travels as a fraction of the
 * pointer's offset from centre (0.25 ≈ a quarter of the way).
 *
 *   const magnet = useMagneticPull();
 *   <motion.button ref={magnet.ref} style={magnet.style} {...magnet.handlers} />
 *
 * No-ops under `prefers-reduced-motion` — the values stay pinned at 0.
 */
export function useMagneticPull(strength = 0.25): {
  ref: RefObject<HTMLElement | null>;
  style: { x: MotionValue<number>; y: MotionValue<number> };
  handlers: {
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
} {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const config = { stiffness: 260, damping: 22, mass: 0.6 };
  const sx = useSpring(x, config);
  const sy = useSpring(y, config);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reduced) return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [reduced, strength, x, y],
  );

  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    ref,
    style: { x: sx, y: sy },
    handlers: { onPointerMove, onPointerLeave },
  };
}

/**
 * Accessibility filter for the "tiered, not all-or-nothing" pattern: when
 * `useReducedMotion()` is true, run a variants object through this to keep the
 * opacity crossfade (safe, non-vestibular) while dropping every transform, blur
 * and rotation. The element still appears and disappears with intent — it just
 * doesn't travel.
 *
 *   const reduce = useReducedMotion();
 *   const v = reduce ? withReducedMotion(revealVariants()) : revealVariants();
 */
const MOTION_KEYS = new Set([
  "x",
  "y",
  "z",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY",
  "filter",
  "translateX",
  "translateY",
  "originX",
  "originY",
]);

export function withReducedMotion(variants: Variants): Variants {
  const out: Variants = {};
  for (const [name, definition] of Object.entries(variants)) {
    if (typeof definition !== "object" || definition === null) {
      out[name] = definition;
      continue;
    }
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(definition)) {
      if (MOTION_KEYS.has(key)) continue;
      cleaned[key] = value;
    }
    out[name] = cleaned as Variants[string];
  }
  return out;
}

/**
 * A constant-velocity loop for a marquee / logo strip / ticker. Pair with a
 * track translated by exactly one copy of its content:
 *
 *   <motion.div animate={{ x: "-50%" }} transition={marqueeTransition(24)} />
 */
export function marqueeTransition(seconds = 20): Transition {
  return {
    duration: seconds,
    ease: "linear",
    repeat: Number.POSITIVE_INFINITY,
    repeatType: "loop",
  };
}

/**
 * Attention cues, not tiers: no offset, no elevation, nothing to compose with.
 * They interrupt a component that is already on screen — a field that just
 * failed validation, a total that changed under the user, a row that needs a
 * glance.
 *
 * Drive them by flipping `animate` to the variant name and back; they are meant
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
 * A single ring that blooms out and fades — softer than a shake, for drawing
 * the eye to something that changed rather than something that broke. Uses the
 * theme ring colour so it inherits the active palette.
 */
export const attentionGlow: Variants = {
  glow: {
    boxShadow: [
      "0 0 0 0 rgba(0,0,0,0)",
      "0 0 0 6px color-mix(in oklab, var(--color-ring) 35%, transparent)",
      "0 0 0 10px rgba(0,0,0,0)",
    ],
    transition: { duration: 0.7, ease: "easeOut" },
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
