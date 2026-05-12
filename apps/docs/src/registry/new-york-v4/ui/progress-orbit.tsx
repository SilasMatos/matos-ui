"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const progressOrbitVariants = tv({
  base: [
    "group/progress-orbit relative w-full overflow-hidden rounded-2xl",
    "border border-border bg-card text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[220px]",
      md: "max-w-[260px]",
      lg: "max-w-[300px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const toneStyles = {
  neutral: {
    color: "var(--foreground)",
    icon: "border-border bg-muted/35 text-muted-foreground",
    chip: "border-border bg-muted/35 text-muted-foreground",
    dot: "bg-foreground",
  },
  emerald: {
    color: "rgb(16 185 129)",
    icon: "border-border bg-muted/35 text-muted-foreground",
    chip: "border-border bg-muted/35 text-muted-foreground",
    dot: "bg-emerald-500",
  },
  blue: {
    color: "rgb(59 130 246)",
    icon: "border-border bg-muted/35 text-muted-foreground",
    chip: "border-border bg-muted/35 text-muted-foreground",
    dot: "bg-blue-500",
  },
  violet: {
    color: "rgb(139 92 246)",
    icon: "border-border bg-muted/35 text-muted-foreground",
    chip: "border-border bg-muted/35 text-muted-foreground",
    dot: "bg-violet-500",
  },
  amber: {
    color: "rgb(245 158 11)",
    icon: "border-border bg-muted/35 text-muted-foreground",
    chip: "border-border bg-muted/35 text-muted-foreground",
    dot: "bg-amber-500",
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
  const gradientId = useId().replace(/:/g, "");
  const toneStyle = toneStyles[tone];
  const progress = clamp((value / max) * 100, 0, 100);
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const preparedMilestones = useMemo(
    () =>
      milestones.map((milestone) => {
        const milestoneProgress = clamp((milestone.value / max) * 100, 0, 100);
        const angle = (milestoneProgress / 100) * 360 - 90;
        const radians = (angle * Math.PI) / 180;
        const orbitRadius = 43;

        return {
          ...milestone,
          x: 60 + Math.cos(radians) * orbitRadius,
          y: 60 + Math.sin(radians) * orbitRadius,
          complete: milestone.value <= value,
        };
      }),
    [max, milestones, value],
  );

  return (
    <div
      data-slot="progress-orbit"
      className={twMerge(progressOrbitVariants({ size }), className)}
      role="img"
      aria-label={`${String(label)} ${Math.round(progress)}${suffix}`}
      {...props}
    >
      <div
        data-slot="progress-orbit-header"
        className="flex items-start justify-between gap-3 px-3.5 pt-3.5 pb-2.5"
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              data-slot="progress-orbit-icon"
              className={twMerge(
                "flex size-7 shrink-0 items-center justify-center rounded-md border",
                "[&_svg]:size-3.5",
                toneStyle.icon,
              )}
            >
              {icon ?? <Sparkles className="size-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <h3
                data-slot="progress-orbit-label"
                className="truncate font-medium text-[13px]"
              >
                {label}
              </h3>
              {description ? (
                <p
                  data-slot="progress-orbit-description"
                  className="mt-0.5 truncate text-[11px] text-muted-foreground"
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <span
          data-slot="progress-orbit-chip"
          className={twMerge(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5",
            "font-medium text-[10px]",
            toneStyle.chip,
          )}
        >
          <span
            className={twMerge("size-1.5 rounded-full", toneStyle.dot)}
            aria-hidden="true"
          />
          {Math.round(progress)}
          {suffix}
        </span>
      </div>

      <div
        data-slot="progress-orbit-panel"
        className="mx-2 mb-2 overflow-hidden rounded-xl border border-border bg-background p-3"
      >
        <div
          data-slot="progress-orbit-visual"
          className="relative mx-auto flex aspect-square w-full  items-center justify-center"
        >
          <motion.span
            aria-hidden="true"
            data-slot="progress-orbit-aura"
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.04, 1], opacity: [0.08, 0.14, 0.08] }
            }
            transition={{
              duration: 3.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-5 rounded-full bg-foreground blur-xl"
          />

          <motion.span
            aria-hidden="true"
            data-slot="progress-orbit-satellite"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-[15%] rounded-full"
          >
            <span
              className={twMerge(
                "absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full",
                toneStyle.dot,
              )}
            />
          </motion.span>

          <svg
            viewBox="0 0 120 120"
            className="relative z-10 size-full -rotate-90"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`${gradientId}-orbit`}
                x1="0"
                x2="1"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={toneStyle.color} stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor={toneStyle.color}
                  stopOpacity="0.56"
                />
              </linearGradient>
            </defs>

            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-muted"
            />

            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={`url(#${gradientId}-orbit)`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            />

            {preparedMilestones.map((milestone, index) => (
              <motion.circle
                key={`${String(milestone.label)}-${milestone.value}`}
                cx={milestone.x}
                cy={milestone.y}
                r={milestone.complete ? 2.7 : 2}
                fill={milestone.complete ? toneStyle.color : "currentColor"}
                className={milestone.complete ? "" : "text-border"}
                initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.35 + index * 0.08,
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
              />
            ))}
          </svg>

          <div
            data-slot="progress-orbit-value"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
          >
            <AnimatedProgressValue value={progress} suffix={suffix} />
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              of {max}
            </span>
          </div>
        </div>

        {preparedMilestones.length ? (
          <div
            data-slot="progress-orbit-milestones"
            className="mt-3 flex min-w-0 flex-wrap gap-1.5"
          >
            {preparedMilestones.map((milestone) => (
              <div
                key={`${String(milestone.label)}-${milestone.value}-label`}
                data-slot="progress-orbit-milestone"
                data-complete={milestone.complete ? "" : undefined}
                className={twMerge(
                  "flex min-w-0 items-center gap-1 rounded-full border border-border bg-muted/15 px-2 py-0.5",
                  "text-[10px] text-muted-foreground transition-colors duration-200",
                  milestone.complete && "bg-muted/45 text-foreground",
                )}
              >
                <span
                  className={twMerge(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-full border border-border",
                    milestone.complete && "border-transparent bg-background",
                  )}
                >
                  {milestone.complete ? (
                    <Check
                      className="size-2.5 text-foreground"
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                <span className="truncate">{milestone.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div
          data-slot="progress-orbit-footer"
          className="px-3.5 pb-3.5 text-[11px] text-muted-foreground"
        >
          {footer}
        </div>
      ) : null}
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

  return (
    <motion.span className="font-semibold text-2xl tracking-[-0.03em]">
      {display}
    </motion.span>
  );
}

export { AnimatedProgressValue, ProgressOrbit };
