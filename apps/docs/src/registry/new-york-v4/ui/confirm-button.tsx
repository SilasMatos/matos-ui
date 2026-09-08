"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import type { FocusEvent as ReactFocusEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  attentionGlow,
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The box climbs the elevation ladder as it arms (offset 1 → 2) and morphs its
// width and radius at the same time — one node doing both. Per DESIGN §2.6 that
// makes it motion.create(Elevated), never an <Elevated> wrapped in <motion.div>.
const MotionElevated = motion.create(Elevated);

type Phase = "idle" | "armed" | "pending" | "confirming" | "cancelling";
type Size = "sm" | "md" | "lg";

export const confirmButtonVariants = tv({
  base: "not-prose relative inline-flex w-fit items-center p-1 text-foreground transition-colors",
  variants: {
    size: {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
    },
    grow: {
      // The box grows from one edge as it arms; the other edge stays put. `start`
      // keeps the right edge fixed (the trash slides left, the keys fill the space
      // it vacated — where the cursor already is), which is what a `justify-end`
      // row of destructive actions wants.
      start: "ml-auto",
      end: "mr-auto",
    },
  },
  defaultVariants: { size: "md", grow: "start" },
});

const SIZES: Record<
  Size,
  {
    trash: string;
    key: string;
    svg: string;
    ml: string;
    gap: string;
    radius: { idle: number; armed: number };
  }
> = {
  sm: {
    trash: "size-6",
    key: "size-6",
    svg: "[&_svg]:size-3.5",
    ml: "ml-1.5",
    gap: "gap-1",
    radius: { idle: 8, armed: 10 },
  },
  md: {
    trash: "size-8",
    key: "size-7",
    svg: "[&_svg]:size-4",
    ml: "ml-2",
    gap: "gap-1",
    radius: { idle: 12, armed: 16 },
  },
  lg: {
    trash: "size-10",
    key: "size-9",
    svg: "[&_svg]:size-5",
    ml: "ml-2.5",
    gap: "gap-1.5",
    radius: { idle: 14, armed: 20 },
  },
};

/**
 * A trash can whose lid is hinged at the left end of its bar. Arming dips the lid
 * a few degrees before it swings open — the anticipation beat — courtesy of
 * `ease.anticipate`, which undershoots then overshoots a plain 0 → -26° tween.
 * Cancelling lets it settle back on `spring.fast`; confirming slams it shut on
 * `ease.accelerate`. That difference is most of what separates the two outcomes.
 */
function TrashCan({ phase, reduce }: { phase: Phase; reduce: boolean }) {
  const open = phase === "armed" || phase === "pending";
  const lidTransition = reduce
    ? { duration: 0 }
    : phase === "confirming"
      ? { duration: duration.fast, ease: ease.accelerate }
      : phase === "cancelling"
        ? spring.fast
        : { duration: duration.fast, ease: ease.anticipate };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      <path d="M10 12v5" />
      <path d="M14 12v5" />
      <motion.g
        style={{ transformOrigin: "5px 7px", transformBox: "view-box" }}
        initial={false}
        animate={{ rotate: reduce ? 0 : open ? -26 : 0 }}
        transition={lidTransition}
      >
        <path d="M4 7h16" />
        <path d="M9.5 7V4.6A1.6 1.6 0 0 1 11.1 3h1.8A1.6 1.6 0 0 1 14.5 4.6V7" />
      </motion.g>
    </svg>
  );
}

export type ConfirmButtonProps = VariantProps<typeof confirmButtonVariants> & {
  /** Runs on confirm. Return a Promise to hold the armed state until it settles. */
  onConfirm: () => void | Promise<void>;
  /** Runs on cancel, Escape, blur-out, or timeout. */
  onCancel?: () => void;
  /** Accessible name for the action, e.g. "Delete invoice". */
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  /**
   * `push` (default) grows the box in flow, into the space beside it. `overlay`
   * floats the keys over the trigger instead — the escape hatch for a fixed-width
   * cell or a clipped container where push has nowhere to go.
   */
  mode?: "push" | "overlay";
  /** Where focus lands when armed. Defaults to the cancel key — a reflex second press is then safe. */
  defaultFocus?: "confirm" | "cancel";
  /** Auto-cancel after N ms with no interaction. Paused while hovered or focused. */
  timeout?: number;
  disabled?: boolean;
  /** Replaces the trash can. With a custom icon there is no animated lid. */
  icon?: ReactNode;
  armed?: boolean;
  defaultArmed?: boolean;
  onArmedChange?: (armed: boolean) => void;
  className?: string;
};

/**
 * A destructive action that arms in place instead of opening a dialog. One press
 * grows the control; a ✓ / ✕ pair slides out of the space the trash just vacated,
 * with the cursor landing on ✕ so a reflex second press cancels.
 *
 * Three outcomes, three choreographies. Arming leads with the lid's anticipation
 * dip, then the box widens on `spring.moderate` while the keys overlap in on
 * `spring.fast` — the tier contrast is what makes it read as one motion rather
 * than two steps. Cancelling reverses it, softly. Confirming does not: ✕ leaves
 * first, ✓ blooms an `attentionGlow` ring, the lid slams, the box collapses.
 *
 * Surface: the box sits at `offset={1}` and steps to `offset={2}` as it arms
 * (same node); the ✓ / ✕ group is a nested `offset={1}`, a half-step above it.
 * `prefers-reduced-motion` keeps the resize (it is layout, not decoration) but
 * drops the travel, the lid swing and the glow.
 */
export function ConfirmButton({
  onConfirm,
  onCancel,
  label = "Delete",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  size = "md",
  grow = "start",
  mode = "push",
  defaultFocus = "cancel",
  timeout,
  disabled = false,
  icon,
  armed: armedProp,
  defaultArmed = false,
  onArmedChange,
  className,
}: ConfirmButtonProps) {
  const reduce = !!useReducedMotion();
  const s = SIZES[size ?? "md"];
  const overlay = mode === "overlay";
  const isArmedControlled = armedProp !== undefined;

  const [phase, setPhaseState] = useState<Phase>(
    (armedProp ?? defaultArmed) ? "armed" : "idle",
  );
  const phaseRef = useRef(phase);
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const refocusTrigger = useRef(false);
  const hoverRef = useRef(false);
  const prevPhaseRef = useRef<Phase>(phase);
  const glow = useAnimationControls();

  const expanded = phase === "armed" || phase === "pending";

  const arm = useCallback(() => {
    if (disabled || phaseRef.current !== "idle") return;
    setPhase("armed");
    onArmedChange?.(true);
  }, [disabled, onArmedChange, setPhase]);

  const finishConfirm = useCallback(() => {
    setPhase("confirming");
    if (!reduce) glow.start(attentionGlow.glow);
  }, [glow, reduce, setPhase]);

  const confirm = useCallback(() => {
    if (phaseRef.current !== "armed") return;
    refocusTrigger.current = true;
    let result: void | Promise<void>;
    try {
      result = onConfirm();
    } catch (err) {
      setPhase("armed");
      throw err;
    }
    if (
      result != null &&
      typeof (result as Promise<void>).then === "function"
    ) {
      setPhase("pending");
      (result as Promise<void>).then(finishConfirm, () => setPhase("armed"));
    } else {
      finishConfirm();
    }
  }, [finishConfirm, onConfirm, setPhase]);

  const cancel = useCallback(
    (refocus = true) => {
      if (phaseRef.current !== "armed") return;
      refocusTrigger.current = refocus;
      setPhase("cancelling");
      onCancel?.();
    },
    [onCancel, setPhase],
  );

  // Controlled `armed` ↔ phase.
  useEffect(() => {
    if (!isArmedControlled) return;
    if (armedProp && phaseRef.current === "idle") setPhase("armed");
    if (!armedProp && phaseRef.current === "armed") {
      refocusTrigger.current = false;
      setPhase("cancelling");
    }
  }, [armedProp, isArmedControlled, setPhase]);

  // Move focus into the group when it arms — but not if it mounted armed.
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev !== "armed" && phase === "armed") {
      (defaultFocus === "confirm" ? confirmRef : cancelRef).current?.focus();
    }
  }, [phase, defaultFocus]);

  // Escape cancels.
  useEffect(() => {
    if (phase !== "armed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cancel(true);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [phase, cancel]);

  // Timeout auto-cancel, held while hovered or focused.
  useEffect(() => {
    if (phase !== "armed" || !timeout) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const paused =
        hoverRef.current || !!rootRef.current?.contains(document.activeElement);
      if (paused) {
        timer = setTimeout(tick, timeout);
        return;
      }
      cancel(false);
    };
    timer = setTimeout(tick, timeout);
    return () => clearTimeout(timer);
  }, [phase, timeout, cancel]);

  const handleExitComplete = useCallback(() => {
    setPhase("idle");
    onArmedChange?.(false);
    if (refocusTrigger.current) {
      refocusTrigger.current = false;
      triggerRef.current?.focus();
    }
  }, [onArmedChange, setPhase]);

  const onRootBlur = useCallback(
    (e: ReactFocusEvent<HTMLDivElement>) => {
      if (phaseRef.current !== "armed") return;
      const next = e.relatedTarget as Node | null;
      if (next && rootRef.current?.contains(next)) return;
      cancel(false);
    },
    [cancel],
  );

  // The keys unfurl out of the space the trash vacated — a scale from the left
  // edge, nothing translating in from beyond the box. Combined with the clip
  // below, the animation stays inside the control it belongs to.
  const groupVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduce
        ? { duration: duration.fast }
        : { staggerChildren: 0.05, delayChildren: 0.06 },
    },
    exit: {
      transition: reduce
        ? { duration: duration.fast }
        : { staggerChildren: 0.04, staggerDirection: -1 },
    },
  };

  const keyEnter = reduce
    ? { opacity: 0 }
    : { opacity: 0, scaleX: 0.25, scaleY: 0.7 };
  const keyVisible = reduce
    ? { opacity: 1, transition: { duration: duration.fast } }
    : { opacity: 1, scaleX: 1, scaleY: 1, transition: spring.fast };
  const slamExit = { ease: ease.accelerate, duration: duration.fast };
  const softExit = {
    ease: ease.accelerate,
    duration: spring.fast.exit.duration,
  };
  const retract = {
    opacity: 0,
    scaleX: 0.25,
    scaleY: 0.7,
    transition: softExit,
  };

  const confirmVariants: Variants = {
    hidden: keyEnter,
    visible: keyVisible,
    exit: reduce
      ? { opacity: 0 }
      : phase === "confirming"
        ? { opacity: 0, scale: 0.7, transition: slamExit }
        : retract,
  };
  const cancelVariants: Variants = {
    hidden: keyEnter,
    visible: keyVisible,
    exit: reduce
      ? { opacity: 0 }
      : phase === "confirming"
        ? { opacity: 0, scale: 0.4, transition: slamExit }
        : retract,
  };

  const keyBase = twMerge(
    "grid shrink-0 origin-left place-items-center rounded-md outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    "disabled:pointer-events-none",
    s.key,
    s.svg,
  );

  // Clip the keys to the control while they reveal or retract, so nothing paints
  // outside it — but not at rest (the trash's focus ring) or on confirm (the ✓
  // ring blooms past the edge on purpose).
  const clip =
    phase === "armed" || phase === "pending" || phase === "cancelling";

  return (
    <MotionElevated
      ref={rootRef}
      offset={expanded && !overlay ? 2 : 1}
      hoverLift={phase === "idle" && !disabled}
      layout={!reduce}
      data-slot="confirm-button"
      data-state={phase}
      onBlur={onRootBlur}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      style={{
        borderRadius: expanded && !overlay ? s.radius.armed : s.radius.idle,
      }}
      transition={reduce ? { duration: 0 } : spring.moderate}
      className={twMerge(
        confirmButtonVariants({ size, grow }),
        "[--lift:1px]",
        clip && !overlay ? "overflow-hidden" : "overflow-visible",
        className,
      )}
    >
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={arm}
        disabled={disabled || phase !== "idle"}
        aria-hidden={phase !== "idle" || undefined}
        aria-label={label}
        layout={!reduce}
        whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.9 }}
        transition={spring.fast}
        className={twMerge(
          "grid shrink-0 place-items-center rounded-lg text-muted-foreground outline-none",
          "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          s.trash,
          s.svg,
        )}
      >
        {icon ?? <TrashCan phase={phase} reduce={reduce} />}
      </motion.button>

      <AnimatePresence
        initial={false}
        mode="popLayout"
        onExitComplete={handleExitComplete}
      >
        {expanded && (
          <MotionElevated
            key="group"
            offset={1}
            layout={!reduce}
            role="group"
            aria-label={`${label} — confirm?`}
            data-slot="confirm-button-actions"
            variants={groupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={twMerge(
              "flex items-center rounded-lg p-0.5",
              s.gap,
              s.ml,
              overlay &&
                twMerge(
                  "absolute inset-y-1 z-10",
                  grow === "end" ? "left-1" : "right-1",
                ),
            )}
          >
            <motion.button
              ref={confirmRef}
              type="button"
              onClick={confirm}
              disabled={phase !== "armed"}
              aria-label={confirmLabel}
              variants={confirmVariants}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              className={twMerge(
                keyBase,
                "relative",
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={glow}
                className="pointer-events-none absolute inset-0 rounded-md"
              />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={phase === "pending" ? "load" : "check"}
                  className="col-start-1 row-start-1 flex"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  transition={
                    reduce ? { duration: duration.fast } : spring.fast
                  }
                >
                  {phase === "pending" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              ref={cancelRef}
              type="button"
              onClick={() => cancel(true)}
              disabled={phase !== "armed"}
              aria-label={cancelLabel}
              variants={cancelVariants}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              className={twMerge(
                keyBase,
                "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <X />
            </motion.button>
          </MotionElevated>
        )}
      </AnimatePresence>

      <output aria-live="polite" className="sr-only">
        {phase === "armed" ? `Confirm ${label}?` : ""}
      </output>
    </MotionElevated>
  );
}
