"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  attentionGlow,
  directionalVariants,
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The card animates *and* joins the elevation ladder, so it must be both a
// motion element and an <Elevated>. `motion.create` keeps it one node.
const MotionElevated = motion.create(Elevated);

type TargetLike =
  | string
  | Element
  | RefObject<Element | null>
  | (() => Element | null);

export type CoachmarkStep = {
  target: TargetLike;
  title: ReactNode;
  description?: ReactNode;
  /** Force a side; otherwise it flips to wherever there's room. */
  placement?: "top" | "bottom";
  /** Breathing room around the target inside the cutout. */
  padding?: number;
};

export type CoachmarkProps = {
  steps: CoachmarkStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Fires when the last step is passed. */
  onComplete?: () => void;
  /** Click the scrim or press Escape to close. */
  dismissible?: boolean;
  labels?: Partial<{
    back: string;
    next: string;
    done: string;
    skip: string;
    of: string;
  }>;
  className?: string;
};

type Rect = { top: number; left: number; width: number; height: number };

function resolveTarget(target: TargetLike): Element | null {
  if (typeof target === "string") return document.querySelector(target);
  if (typeof target === "function") return target();
  if (target instanceof Element) return target;
  return target.current;
}

const DEFAULT_LABELS = {
  back: "Back",
  next: "Next",
  done: "Done",
  skip: "Skip",
  of: "of",
};

/**
 * An onboarding tour: a scrim dims the page with a cutout on the current
 * target, an attention ring blooms on the cutout, and a card is anchored beside
 * it. Three things move at once, on three tiers, and that's the point —
 *
 * - the **scrim** rides `spring.gentle` (0.6s, barely any bounce): ambient
 *   motion that recedes rather than announces itself. Between steps the cutout
 *   glides on the same tier.
 * - the **card** rides `spring.moderate`: a panel that has to land exactly where
 *   it was aimed.
 * - the **ring** is `attentionGlow`, fired once per step: a "look here" cue,
 *   not a tier.
 *
 * They can't share timing — the scrim would snap, or the card would drift, or
 * the cue would linger.
 *
 * Surface: the card is `Elevated offset={4}`, portaled with the substrate reset
 * to the page so that rung means the same anywhere. `prefers-reduced-motion`
 * drops the glide, the slide and the glow — the scrim and card still fade.
 */
export function Coachmark({
  steps,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  onComplete,
  dismissible = true,
  labels,
  className,
}: CoachmarkProps) {
  const reduce = useReducedMotion();
  const merged = { ...DEFAULT_LABELS, ...labels };

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isOpenControlled ? openProp : internalOpen;

  const isStepControlled = stepProp !== undefined;
  const [internalStep, setInternalStep] = useState(defaultStep);
  const index = Math.min(
    isStepControlled ? stepProp : internalStep,
    steps.length - 1,
  );
  const current = steps[index];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const ringControls = useAnimationControls();
  const glowedFor = useRef(-1);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const goTo = useCallback(
    (next: number) => {
      if (next < 0) return;
      if (next >= steps.length) {
        onComplete?.();
        setOpen(false);
        return;
      }
      if (!isStepControlled) setInternalStep(next);
      onStepChange?.(next);
    },
    [isStepControlled, onComplete, onStepChange, setOpen, steps.length],
  );

  // Measure the target: on step change, on resize/scroll, and briefly after
  // (the target may still be scrolling into view or laying out).
  useLayoutEffect(() => {
    if (!open || !current) return;
    const padding = current.padding ?? 8;

    const measure = () => {
      const node = resolveTarget(current.target);
      if (!node) {
        setRect(null);
        return;
      }
      const box = node.getBoundingClientRect();
      setRect({
        top: box.top - padding,
        left: box.left - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      });
    };

    resolveTarget(current.target)?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });

    measure();
    let frame = 0;
    const until = performance.now() + 700;
    const poll = () => {
      measure();
      if (performance.now() < until) frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, current, reduce]);

  // The "look here" cue — once per step, not on every re-measure.
  useEffect(() => {
    if (!open) {
      glowedFor.current = -1;
      return;
    }
    if (!rect || reduce || glowedFor.current === index) return;
    glowedFor.current = index;
    ringControls.start(attentionGlow.glow);
  }, [open, index, rect, reduce, ringControls]);

  // Escape to close.
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, setOpen]);

  if (!mounted || !open || !current || !rect) return null;

  const viewportH = window.innerHeight;
  const spaceBelow = viewportH - (rect.top + rect.height);
  const gap = 12;
  const place =
    current.placement ??
    (spaceBelow >= cardHeight + gap + 8 || spaceBelow >= rect.top
      ? "bottom"
      : "top");

  const cardLeft = Math.max(
    12,
    Math.min(rect.left, window.innerWidth - 360 - 12),
  );
  const cardTop =
    place === "bottom"
      ? rect.top + rect.height + gap
      : rect.top - cardHeight - gap;

  const entrance = directionalVariants(place === "bottom" ? "top" : "bottom");
  const cardVariants: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: entrance.hidden,
        visible: entrance.visible,
        exit: {
          opacity: 0,
          scale: 0.98,
          transition: { duration: duration.fast, ease: ease.accelerate },
        },
      };

  return createPortal(
    <SurfaceProvider value={1}>
      <div
        data-slot="coachmark"
        className={className ? `not-prose ${className}` : "not-prose"}
      >
        {/* Scrim click-catcher — one flat layer so the cutout box-shadow
         *  doesn't have to. */}
        <button
          type="button"
          aria-label="Close tour"
          tabIndex={-1}
          onClick={() => dismissible && setOpen(false)}
          className="fixed inset-0 z-[60] cursor-default"
        />

        {/* The cutout: a box the size of the target casting a page-sized shadow
         *  that *is* the scrim. It and the ring glide on `gentle`. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-[61] rounded-lg"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          }}
          transition={
            reduce
              ? {
                  opacity: { duration: duration.moderate },
                  default: { duration: 0 },
                }
              : spring.gentle
          }
          style={{
            boxShadow: "0 0 0 100vmax rgb(0 0 0 / 0.62)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={ringControls}
          className="pointer-events-none fixed top-0 left-0 z-[62] rounded-lg"
          style={{
            transform: `translate(${rect.left}px, ${rect.top}px)`,
            width: rect.width,
            height: rect.height,
          }}
        />

        <AnimatePresence mode="wait" custom={place}>
          <MotionElevated
            key={index}
            offset={4}
            data-slot="coachmark-card"
            role="dialog"
            aria-modal="false"
            aria-labelledby="coachmark-title"
            ref={(node: HTMLDivElement | null) => {
              if (node) setCardHeight(node.offsetHeight);
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={
              reduce ? { duration: duration.moderate } : spring.moderate
            }
            className="fixed z-[63] w-[min(360px,calc(100vw-24px))] rounded-xl p-4"
            style={{ top: cardTop, left: cardLeft }}
          >
            <div className="flex items-start justify-between gap-3">
              <p
                id="coachmark-title"
                className="font-medium text-foreground text-sm"
              >
                {current.title}
              </p>
              {dismissible ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="hover-lift -m-1 [--lift:1px] grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {current.description ? (
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {current.description}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs tabular-nums">
                {index + 1} {merged.of} {steps.length}
              </span>
              <div className="flex items-center gap-1.5">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    className="hover-lift [--lift:1px] rounded-md px-2.5 py-1 font-medium text-muted-foreground text-xs outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {merged.back}
                  </button>
                ) : dismissible ? (
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="hover-lift [--lift:1px] rounded-md px-2.5 py-1 font-medium text-muted-foreground text-xs outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {merged.skip}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="hover-lift [--lift:1px] rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]"
                >
                  {index === steps.length - 1 ? merged.done : merged.next}
                </button>
              </div>
            </div>
          </MotionElevated>
        </AnimatePresence>
      </div>
    </SurfaceProvider>,
    document.body,
  );
}
