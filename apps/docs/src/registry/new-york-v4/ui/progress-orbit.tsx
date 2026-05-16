"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const progressOrbitVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2 text-foreground",
  ],
  variants: {
    size: {
      sm: "[--orbit-size:--spacing(18)] [--orbit-stroke:5]",
      md: "[--orbit-size:--spacing(22)] [--orbit-stroke:5]",
      lg: "[--orbit-size:--spacing(26)] [--orbit-stroke:5.5]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const toneStyles = {
  neutral: {
    icon: "border-border/70 bg-secondary text-muted-foreground",
    progress: "text-foreground",
    chip: "border-border/70 bg-secondary text-muted-foreground",
  },
  primary: {
    icon: "border-primary/20 bg-primary/10 text-primary",
    progress: "text-primary",
    chip: "border-primary/20 bg-primary/10 text-primary",
  },
  muted: {
    icon: "border-border/70 bg-muted text-muted-foreground",
    progress: "text-muted-foreground",
    chip: "border-border/70 bg-muted text-muted-foreground",
  },
  destructive: {
    icon: "border-destructive/20 bg-destructive/10 text-destructive",
    progress: "text-destructive",
    chip: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const;

export type ProgressOrbitTone = keyof typeof toneStyles;

export type ProgressOrbitMilestone = {
  value: number;
  label: ReactNode;
};

export type ProgressOrbitProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof progressOrbitVariants> & {
    value: number;
    max?: number;
    label: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    tone?: ProgressOrbitTone;
    suffix?: string;
    milestones?: ProgressOrbitMilestone[];
    footer?: ReactNode;
  };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ProgressOrbit({
  className,
  size,
  value,
  max = 100,
  label,
  description,
  icon,
  tone = "neutral",
  suffix = "%",
  milestones = [],
  footer,
  ...props
}: ProgressOrbitProps) {
  const shouldReduceMotion = useReducedMotion();
  const toneStyle = toneStyles[tone];
  const progress = clamp((value / max) * 100, 0, 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      data-slot="progress-orbit"
      className={twMerge(progressOrbitVariants({ size }), className)}
      role="img"
      aria-label={`${String(label)} ${Math.round(progress)}${suffix}`}
      {...props}
    >
      <div
        data-slot="progress-orbit-panel"
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
      >
        <div
          data-slot="progress-orbit-visual"
          className="relative flex size-(--orbit-size) shrink-0 items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 120 120"
            className="absolute inset-0 size-full -rotate-90"
            aria-hidden="true"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--orbit-stroke)"
              className="text-border"
            />

            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--orbit-stroke)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              className={toneStyle.progress}
              initial={
                shouldReduceMotion
                  ? { strokeDashoffset: offset, opacity: 1 }
                  : { strokeDashoffset: circumference, opacity: 0 }
              }
              animate={{ strokeDashoffset: offset, opacity: 1 }}
              transition={{
                strokeDashoffset: {
                  type: "spring",
                  stiffness: 78,
                  damping: 22,
                  mass: 0.86,
                },
                opacity: { duration: shouldReduceMotion ? 0 : 0.2 },
              }}
            />
          </motion.svg>

          <div
            data-slot="progress-orbit-value"
            className="relative z-10 flex flex-col items-center justify-center text-center"
          >
            <AnimatedProgressValue value={progress} suffix={suffix} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                data-slot="progress-orbit-icon"
                className={twMerge(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                  "[&_svg]:size-3.5",
                  toneStyle.icon,
                )}
              >
                {icon ?? <Sparkles className="size-3.5" aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <h3
                  data-slot="progress-orbit-label"
                  className="truncate text-[13px] font-semibold leading-4"
                >
                  {label}
                </h3>
                {description ? (
                  <p
                    data-slot="progress-orbit-description"
                    className="mt-0.5 truncate text-[11px] leading-4 text-muted-foreground"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {milestones.length ? (
            <div
              data-slot="progress-orbit-milestones"
              className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5"
            >
              {milestones.map((milestone, index) => {
                const complete = milestone.value <= value;

                return (
                  <motion.div
                    key={`${String(milestone.label)}-${milestone.value}`}
                    data-slot="progress-orbit-milestone"
                    data-complete={complete ? "" : undefined}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : index * 0.045,
                      duration: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={twMerge(
                      "inline-flex min-w-0 items-center gap-1 rounded-full border px-1.5 py-0.5",
                      "text-[10px] leading-none transition-colors duration-200",
                      complete
                        ? "border-border bg-secondary text-foreground"
                        : toneStyle.chip,
                    )}
                  >
                    <span className="flex size-3 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      {complete ? (
                        <Check
                          className="size-2 text-foreground"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="truncate">{milestone.label}</span>
                  </motion.div>
                );
              })}
            </div>
          ) : null}

          {footer ? (
            <div
              data-slot="progress-orbit-footer"
              className="mt-2 text-[11px] leading-4 text-muted-foreground"
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type AnimatedProgressValueProps = {
  value: number;
  suffix?: string;
};

function AnimatedProgressValue({
  value,
  suffix = "%",
}: AnimatedProgressValueProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 20,
    mass: 0.8,
  });
  const display = useTransform(
    spring,
    (latest) => `${Math.round(latest)}${suffix}`,
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  if (shouldReduceMotion) {
    return (
      <span className="text-sm font-semibold leading-none text-foreground">
        {Math.round(value)}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span className="text-sm font-semibold leading-none text-foreground">
      {display}
    </motion.span>
  );
}

export { AnimatedProgressValue, ProgressOrbit };
