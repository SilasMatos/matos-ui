"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Circle,
  Loader2,
  type LucideIcon,
  Pause,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export type ProcessTimelineStatus =
  | "complete"
  | "active"
  | "pending"
  | "blocked"
  | "paused";

export type ProcessTimelineItem = {
  id: string;
  title: string;
  description?: string;
  status: ProcessTimelineStatus;
  timestamp?: string;
  meta?: string;
  icon?: ReactNode;
  progress?: number;
  target?: string;
  result?: string;
  badge?: string;
};

export const processTimelineEngineVariants = tv({
  base: [
    "relative not-prose w-full overflow-hidden rounded-xl border border-zinc-200",
    "bg-zinc-50 p-1 text-zinc-950 shadow-sm",
    "dark:border-white/10 dark:bg-[#171717] dark:text-zinc-100",
  ],
  variants: {
    size: {
      sm: "max-w-[390px]",
      md: "max-w-[560px]",
      lg: "max-w-[660px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const SEGMENT_COUNT = 48;
const smoothEase = [0.2, 0, 0, 1] as const;

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: smoothEase,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: smoothEase,
    },
  },
};

const statusStyles: Record<
  ProcessTimelineStatus,
  {
    label: string;
    accent: string;
    soft: string;
    track: string;
    segment: string;
    segmentGlow: string;
    icon: LucideIcon;
  }
> = {
  complete: {
    label: "Passed",
    accent: "text-teal-600 dark:text-teal-300",
    soft: "border-teal-500/25 bg-teal-50 text-teal-700 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-200",
    track:
      "bg-teal-50 ring-teal-200/70 dark:bg-teal-400/5 dark:ring-teal-400/15",
    segment: "bg-teal-500 dark:bg-teal-300",
    segmentGlow: "",
    icon: Check,
  },
  active: {
    label: "Phase",
    accent: "text-blue-600 dark:text-blue-300",
    soft: "border-blue-500/25 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-200",
    track:
      "bg-blue-50 ring-blue-200/70 dark:bg-blue-400/5 dark:ring-blue-400/15",
    segment: "bg-blue-500 dark:bg-blue-300",
    segmentGlow: "",
    icon: Loader2,
  },
  pending: {
    label: "Pending",
    accent: "text-zinc-500 dark:text-zinc-400",
    soft: "border-zinc-200 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300",
    track:
      "bg-zinc-100 ring-zinc-200/80 dark:bg-white/[0.04] dark:ring-white/10",
    segment: "bg-zinc-400 dark:bg-zinc-500",
    segmentGlow: "",
    icon: Circle,
  },
  blocked: {
    label: "Blocked",
    accent: "text-red-600 dark:text-red-300",
    soft: "border-red-500/25 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200",
    track: "bg-red-50 ring-red-200/70 dark:bg-red-400/5 dark:ring-red-400/15",
    segment: "bg-red-500 dark:bg-red-300",
    segmentGlow: "",
    icon: AlertTriangle,
  },
  paused: {
    label: "Paused",
    accent: "text-amber-600 dark:text-amber-300",
    soft: "border-amber-500/25 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200",
    track:
      "bg-amber-50 ring-amber-200/70 dark:bg-amber-400/5 dark:ring-amber-400/15",
    segment: "bg-amber-500 dark:bg-amber-300",
    segmentGlow: "",
    icon: Pause,
  },
};

export type ProcessTimelineEngineProps = ComponentProps<"div"> &
  VariantProps<typeof processTimelineEngineVariants> & {
    items: ProcessTimelineItem[];
    activeId?: string;
    title?: string;
    subtitle?: string;
    onItemSelect?: (item: ProcessTimelineItem) => void;
  };

export function ProcessTimelineEngine({
  className,
  size,
  items,
  activeId,
  title = "Challenge Progress",
  subtitle,
  onItemSelect,
  ...props
}: ProcessTimelineEngineProps) {
  const shouldReduceMotion = useReducedMotion();

  const completedCount = items.filter(
    (item) => item.status === "complete",
  ).length;

  const activeIndex = items.findIndex(
    (item) => item.id === activeId || item.status === "active",
  );

  const progressIndex =
    activeIndex >= 0 ? activeIndex : Math.min(completedCount, items.length - 1);

  const overallProgress =
    items.length > 1 ? (progressIndex / (items.length - 1)) * 100 : 0;

  return (
    <div
      data-slot="process-timeline-engine"
      className={twMerge(processTimelineEngineVariants({ size }), className)}
      {...props}
    >
      <motion.div
        variants={panelVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
      >
        {(title || subtitle) && (
          <div className=" flex justify-between py-2.5 items-center gap-2 px-2 pb">
            <p className="m-0 truncate text-[13px] font-medium leading-none text-zinc-950 dark:text-zinc-100">
              {title}
            </p>

            <motion.div
              className="hidden h-5 shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium leading-5 text-zinc-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 sm:flex"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.16, ease: smoothEase }}
            >
              <span className="text-zinc-950 dark:text-zinc-100">
                {completedCount}
              </span>
              <span>/</span>
              <span>{items.length}</span>
            </motion.div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-white/[0.075] dark:bg-[#202020]">
          {items.map((item, index) => (
            <ProcessTimelineStep
              key={item.id}
              item={item}
              index={index}
              fallbackProgress={getFallbackProgress(
                item,
                index,
                overallProgress,
              )}
              isSelected={activeId === item.id}
              onSelect={onItemSelect}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

type ProcessTimelineStepProps = {
  item: ProcessTimelineItem;
  index: number;
  fallbackProgress: number;
  isSelected: boolean;
  onSelect?: (item: ProcessTimelineItem) => void;
  shouldReduceMotion: boolean | null;
};

function ProcessTimelineStep({
  item,
  index,
  fallbackProgress,
  isSelected,
  onSelect,
  shouldReduceMotion,
}: ProcessTimelineStepProps) {
  const styles = statusStyles[item.status];
  const StatusIcon = styles.icon;
  const interactive = Boolean(onSelect);
  const progress = clampProgress(item.progress ?? fallbackProgress);
  const filledSegments = Math.round((progress / 100) * SEGMENT_COUNT);
  const metricLabel = item.description ?? "Target";
  const metricValue = item.target ?? item.title;
  const result = item.result ?? item.meta ?? item.timestamp ?? item.description;
  const target = item.target ?? item.timestamp ?? item.title;
  const badge = item.badge ?? styles.label;

  const row = (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center py-2 gap-2">
        <p className="flex min-h-5 min-w-0 items-center truncate text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          <span className="truncate">
            {metricLabel}:{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-100">
              {metricValue}
            </span>
          </span>
        </p>

        <div className="flex h-5 shrink-0 items-center gap-1">
          <motion.span
            className={twMerge(
              "inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[10px] font-medium leading-5",
              "[&_svg]:size-3 [&_svg]:shrink-0",
              styles.soft,
            )}
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.9, y: -3 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: 0.08 + index * 0.04,
              ease: smoothEase,
            }}
          >
            <span className="grid size-3 shrink-0 place-items-center">
              <StatusIcon
                className={twMerge(
                  "size-3",
                  item.status === "active" && "animate-spin",
                )}
                strokeWidth={2.5}
              />
            </span>

            <span className="translate-y-px whitespace-nowrap">{badge}</span>
          </motion.span>

          <motion.span
            className="inline-flex h-5 items-center gap-1 rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-medium leading-5 text-zinc-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.9, y: -3 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: 0.1 + index * 0.04,
              ease: smoothEase,
            }}
          >
            <span className="grid size-3 shrink-0 place-items-center">
              <Loader2
                className="size-3 animate-spin text-zinc-400 dark:text-zinc-500"
                strokeWidth={2.4}
              />
            </span>

            <span className="translate-y-px whitespace-nowrap">
              {Math.round(progress)}%
            </span>
          </motion.span>
        </div>
      </div>

      <motion.div
        role="progressbar"
        aria-label={`${badge} ${Math.round(progress)}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className={twMerge(
          "mt-2 grid h-8 grid-cols-[repeat(48,minmax(2px,1fr))] items-center gap-0.5 rounded-md px-1 ring-1 ring-inset",
          styles.track,
        )}
        initial={shouldReduceMotion ? false : { opacity: 0.72 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.22,
          delay: shouldReduceMotion ? 0 : index * 0.04,
          ease: smoothEase,
        }}
      >
        {Array.from({ length: SEGMENT_COUNT }, (_, segmentIndex) => ({
          id: `${item.id}-segment-${segmentIndex}`,
          segmentIndex,
        })).map(({ id, segmentIndex }) => {
          const filled = segmentIndex < filledSegments;

          return (
            <motion.span
              key={id}
              className={twMerge(
                "relative h-5 rounded-[2px]",
                filled ? styles.segment : "bg-zinc-200 dark:bg-[#2f2f2f]",
                filled && styles.segmentGlow,
              )}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: filled ? 0 : 0.32,
                      scaleY: filled ? 0.08 : 0.54,
                    }
              }
              animate={{
                opacity: filled ? 1 : 0.56,
                scaleY: filled ? [0.08, 1.08, 1] : 0.82,
              }}
              style={{ transformOrigin: "bottom" }}
              transition={{
                duration: filled ? 0.48 : 0.24,
                delay: shouldReduceMotion
                  ? 0
                  : index * 0.1 + segmentIndex * 0.018,
                ease: smoothEase,
              }}
            />
          );
        })}
      </motion.div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] leading-4">
        <p className="min-w-0 truncate text-zinc-500 dark:text-zinc-400">
          Results:{" "}
          <span className={twMerge("font-medium", styles.accent)}>
            {result}
          </span>
        </p>

        <p className="shrink-0 text-zinc-500 dark:text-zinc-400">{target}</p>
      </div>
    </>
  );

  return (
    <motion.div
      variants={itemVariants}
      className={twMerge(
        "relative border-t border-zinc-200 first:border-t-0 dark:border-white/[0.065]",
        isSelected && "bg-zinc-100/80 dark:bg-white/[0.035]",
      )}
    >
      {interactive ? (
        <motion.button
          type="button"
          onClick={() => onSelect?.(item)}
          className="group block w-full px-3 py-2.5 text-left transition-colors duration-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:hover:bg-white/[0.035] dark:focus-visible:ring-teal-300/70 dark:focus-visible:ring-offset-[#171717]"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
          transition={{ duration: 0.16, ease: smoothEase }}
        >
          <div className="relative">{row}</div>
        </motion.button>
      ) : (
        <div className="px-3 py-2.5">{row}</div>
      )}
    </motion.div>
  );
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getFallbackProgress(
  item: ProcessTimelineItem,
  index: number,
  overallProgress: number,
) {
  if (item.status === "complete") {
    return 100;
  }

  if (item.status === "active") {
    return Math.max(12, Math.min(88, overallProgress || 40));
  }

  if (item.status === "paused") {
    return 55;
  }

  if (item.status === "blocked") {
    return 18;
  }

  return index === 0 ? overallProgress : 0;
}
