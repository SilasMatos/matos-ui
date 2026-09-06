"use client";

import {
  AnimatePresence,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Check } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { spring } from "@/registry/new-york-v4/lib/motion-tokens";

export const progressRingVariants = tv({
  base: ["relative inline-grid shrink-0 place-items-center text-primary"],
  variants: {
    size: {
      sm: "size-16 text-[0.8rem]",
      md: "size-24 text-base",
      lg: "size-32 text-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// Track thickness scales with the ring so the stroke reads the same weight at
// every size. Overridable via `thickness`.
const DEFAULT_THICKNESS = { sm: 6, md: 8, lg: 10 } as const;
// The geometry is authored on a fixed 100-unit viewBox and scaled by CSS, so
// one path math covers every size.
const VIEWBOX = 100;

// The tiers `motionForOffset` can't reach are still fine to pick by hand here:
// a ring filling is a value settling, not a surface lifting.
type RingTier = "fast" | "moderate" | "slow" | "playful";

export type ProgressRingProps = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof progressRingVariants> & {
    /** 0–100. Values outside the range are clamped. */
    value: number;
    /** Stroke width in viewBox units (the ring is a 100-unit square). */
    thickness?: number;
    /** Spring character for the fill + count-up. Defaults to `moderate`. */
    tier?: RingTier;
    /** Primary → chart-2 gradient stroke. `true` by default. */
    gradient?: boolean;
    /** Render the animated percentage in the centre. `true` by default. */
    showValue?: boolean;
    /** Swap the centre for a check once the value reaches 100. `true` by default. */
    checkOnComplete?: boolean;
    /** Replaces the centre entirely — you own what's shown. */
    children?: ReactNode;
    /** Accessible name for the progressbar. */
    "aria-label"?: string;
  };

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function ProgressRing({
  className,
  size = "md",
  value,
  thickness,
  tier = "moderate",
  gradient = true,
  showValue = true,
  checkOnComplete = true,
  children,
  "aria-label": ariaLabel,
  ...props
}: ProgressRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId();

  const target = clamp(value);
  const stroke = thickness ?? DEFAULT_THICKNESS[size ?? "md"];
  const radius = (VIEWBOX - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // One motion value drives everything — the arc and the number can never drift
  // out of sync because they read the same source.
  const progress = useMotionValue(0);
  const dashoffset = useTransform(
    progress,
    (p) => circumference * (1 - clamp(p) / 100),
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      type: "spring",
      visualDuration: spring[tier].visualDuration,
      bounce: spring[tier].bounce,
    });
    return () => controls.stop();
  }, [target, tier, shouldReduceMotion, progress]);

  const complete = target >= 100;
  const showCheck = checkOnComplete && complete && !children;

  return (
    <div
      data-slot="progress-ring"
      data-complete={complete || undefined}
      role="progressbar"
      aria-valuenow={Math.round(target)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? "Progress"}
      className={twMerge(progressRingVariants({ size }), className)}
      {...props}
    >
      <RingPulse active={complete} reduced={!!shouldReduceMotion}>
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          {gradient ? (
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-chart-2)" />
              </linearGradient>
            </defs>
          ) : null}
          <circle
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-current opacity-15"
          />
          <motion.circle
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={gradient ? `url(#${gradientId})` : "var(--color-primary)"}
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashoffset as MotionValue<number> }}
          />
        </svg>
      </RingPulse>

      <div className="absolute inset-0 grid place-items-center">
        {children ? (
          children
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {showCheck ? (
              <motion.span
                key="check"
                initial={
                  shouldReduceMotion ? false : { scale: 0.3, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { scale: 0.3, opacity: 0 }
                }
                transition={{
                  type: "spring",
                  visualDuration: spring.playful.visualDuration,
                  bounce: spring.playful.bounce,
                }}
                className="text-primary"
              >
                <Check
                  className="size-[1.6em]"
                  strokeWidth={2.75}
                  aria-hidden="true"
                />
              </motion.span>
            ) : showValue ? (
              <motion.span
                key="value"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{
                  type: "spring",
                  visualDuration: spring.fast.visualDuration,
                  bounce: spring.fast.bounce,
                }}
                className="font-semibold text-foreground tabular-nums tracking-tight"
              >
                <RingValue progress={progress} />
                <span className="ml-[0.1em] align-top text-[0.55em] font-medium text-muted-foreground">
                  %
                </span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/** Reads the shared motion value straight into text — no state, so the number
 *  updates on the same frame as the arc it belongs to. */
function RingValue({ progress }: { progress: MotionValue<number> }) {
  const text = useTransform(progress, (p) => String(Math.round(clamp(p))));
  return <motion.span>{text}</motion.span>;
}

/** A single soft scale pop the moment the ring completes — the celebration is
 *  one beat, not a loop. Silent under reduced motion. */
function RingPulse({
  active,
  reduced,
  children,
}: {
  active: boolean;
  reduced: boolean;
  children: ReactNode;
}) {
  const wasActive = useRef(active);
  const justCompleted = active && !wasActive.current;
  wasActive.current = active;

  return (
    <motion.div
      className="size-full"
      animate={
        justCompleted && !reduced ? { scale: [1, 1.045, 1] } : { scale: 1 }
      }
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
