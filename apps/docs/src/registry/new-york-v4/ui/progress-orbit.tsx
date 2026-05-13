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
    "not-prose group/progress-orbit relative w-full overflow-hidden rounded-2xl border border-border bg-card p-(--orbit-padding)",
    "text-foreground shadow-sm",
  ],
  variants: {
    size: {
      sm: "[--orbit-padding:--spacing(3)] [--orbit-panel-padding:--spacing(3.5)] [--orbit-ring-stroke:5]",
      md: "[--orbit-padding:--spacing(3.5)] [--orbit-panel-padding:--spacing(4)] [--orbit-ring-stroke:5]",
      lg: "[--orbit-padding:--spacing(4)] [--orbit-panel-padding:--spacing(4.5)] [--orbit-ring-stroke:5.5]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const toneStyles = {
  neutral: {
    color: "currentColor",
    icon: "border-border bg-secondary text-muted-foreground",
    chip: "border-border bg-secondary text-muted-foreground",
  },
  emerald: {
    color: "currentColor",
    icon: "border-border bg-secondary text-muted-foreground",
    chip: "border-border bg-secondary text-muted-foreground",
  },
  blue: {
    color: "currentColor",
    icon: "border-border bg-secondary text-muted-foreground",
    chip: "border-border bg-secondary text-muted-foreground",
  },
  violet: {
    color: "currentColor",
    icon: "border-border bg-secondary text-muted-foreground",
    chip: "border-border bg-secondary text-muted-foreground",
  },
  amber: {
    color: "currentColor",
    icon: "border-border bg-secondary text-muted-foreground",
    chip: "border-border bg-secondary text-muted-foreground",
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
        className="flex items-start justify-between gap-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            data-slot="progress-orbit-icon"
            className={twMerge(
              "flex size-9 shrink-0 items-center justify-center rounded-xl border",
              "[&_svg]:size-4",
              toneStyle.icon,
            )}
          >
            {icon ?? <Sparkles className="size-4" aria-hidden="true" />}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3
              data-slot="progress-orbit-label"
              className="truncate text-[13px] font-semibold leading-tight"
            >
              {label}
            </h3>
            {description ? (
              <p
                data-slot="progress-orbit-description"
                className="truncate text-[11px] leading-none text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <span
          data-slot="progress-orbit-chip"
          className={twMerge(
            "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
            "text-[10px] font-medium leading-none",
            toneStyle.chip,
          )}
        >
          <span
            className="size-1.5 rounded-full bg-foreground"
            aria-hidden="true"
          />
          {Math.round(progress)}
          {suffix}
        </span>
      </div>

      <div
        data-slot="progress-orbit-panel"
        className="mt-4 overflow-hidden rounded-[1.25rem] border border-border bg-secondary p-(--orbit-panel-padding)"
      >
        <div
          data-slot="progress-orbit-visual"
          className="relative mx-auto flex aspect-square w-full items-center justify-center"
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
              duration: 4.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-[18%] rounded-full bg-foreground blur-xl"
          />

          <motion.span
            aria-hidden="true"
            data-slot="progress-orbit-satellite"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={{
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-[15%] rounded-full"
          >
            <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-foreground" />
          </motion.span>

          <motion.svg
            viewBox="0 0 120 120"
            className="relative z-10 size-full -rotate-90"
            aria-hidden="true"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
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
                  stopOpacity="0.64"
                />
              </linearGradient>
            </defs>

            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--orbit-ring-stroke)"
              className="text-border"
            />

            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={`url(#${gradientId}-orbit)`}
              strokeWidth="var(--orbit-ring-stroke)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              className="text-foreground"
              initial={
                shouldReduceMotion
                  ? { strokeDashoffset: offset, opacity: 1 }
                  : { strokeDashoffset: circumference, opacity: 0 }
              }
              animate={{ strokeDashoffset: offset, opacity: 1 }}
              transition={{
                strokeDashoffset: {
                  type: "spring",
                  stiffness: 76,
                  damping: 22,
                  mass: 0.9,
                },
                opacity: {
                  duration: shouldReduceMotion ? 0 : 0.28,
                  ease: "easeOut",
                },
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
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                transition={{
                  delay: 0.35 + index * 0.08,
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
              />
            ))}
          </motion.svg>

          <div
            data-slot="progress-orbit-value"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
          >
            <AnimatedProgressValue value={progress} suffix={suffix} />
            <span className="mt-0.5 text-[9px] leading-none text-muted-foreground">
              of {max}
            </span>
          </div>
        </div>

        {preparedMilestones.length ? (
          <div
            data-slot="progress-orbit-milestones"
            className="mt-4 flex min-w-0 flex-wrap items-center justify-center gap-1.5"
          >
            {preparedMilestones.map((milestone) => (
              <motion.div
                key={`${String(milestone.label)}-${milestone.value}-label`}
                data-slot="progress-orbit-milestone"
                data-complete={milestone.complete ? "" : undefined}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.24 + milestone.value / 800,
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={twMerge(
                  "flex min-w-0 items-center gap-1 rounded-full border border-border bg-card px-2 py-1",
                  "text-[10px] leading-none text-muted-foreground transition-colors duration-200",
                  milestone.complete && "text-foreground",
                )}
              >
                <span
                  className={twMerge(
                    "flex size-3 shrink-0 items-center justify-center rounded-full border border-border bg-secondary",
                    milestone.complete && "bg-card",
                  )}
                >
                  {milestone.complete ? (
                    <Check
                      className="size-2 text-foreground"
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                <span className="truncate">{milestone.label}</span>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div
          data-slot="progress-orbit-footer"
          className="mt-3 text-[11px] leading-relaxed text-muted-foreground"
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
    <motion.span className="text-2xl font-semibold leading-none text-foreground">
      {display}
    </motion.span>
  );
}

export { AnimatedProgressValue, ProgressOrbit };
