"use client";

import { motion, type Variants } from "framer-motion";
import { AlertTriangle, Check, Circle, Loader2, Pause } from "lucide-react";
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
};

export const processTimelineEngineVariants = tv({
  base: [
    "w-full rounded-2xl border border-border bg-card text-foreground",
    "p-3 shadow-sm",
  ],
  variants: {
    size: {
      sm: "max-w-[340px]",
      md: "max-w-[480px]",
      lg: "max-w-[600px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const smoothEase = [0.2, 0, 0, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      delay: index * 0.05,
      ease: smoothEase,
    },
  }),
};

const statusStyles: Record<
  ProcessTimelineStatus,
  {
    label: string;
    dot: string;
    icon: typeof Check;
  }
> = {
  complete: {
    label: "Complete",
    dot: "bg-chart-2 text-white ring-chart-2/15",
    icon: Check,
  },
  active: {
    label: "Active",
    dot: "bg-primary text-primary-foreground ring-primary/15",
    icon: Loader2,
  },
  pending: {
    label: "Pending",
    dot: "bg-secondary text-muted-foreground ring-border",
    icon: Circle,
  },
  blocked: {
    label: "Blocked",
    dot: "bg-destructive text-destructive-foreground ring-destructive/15",
    icon: AlertTriangle,
  },
  paused: {
    label: "Paused",
    dot: "bg-amber-500 text-white ring-amber-500/15",
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
  title = "Process Timeline",
  subtitle,
  onItemSelect,
  ...props
}: ProcessTimelineEngineProps) {
  const completedCount = items.filter(
    (item) => item.status === "complete",
  ).length;
  const activeIndex = items.findIndex(
    (item) => item.id === activeId || item.status === "active",
  );
  const progressIndex =
    activeIndex >= 0 ? activeIndex : Math.min(completedCount, items.length - 1);
  const progress =
    items.length > 1 ? (progressIndex / (items.length - 1)) * 100 : 0;

  return (
    <div
      data-slot="process-timeline-engine"
      className={twMerge(processTimelineEngineVariants({ size }), className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-sm font-semibold leading-5">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 line-clamp-1 text-xs leading-4 text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <span className="text-foreground">{completedCount}</span>
            <span>/</span>
            <span>{items.length}</span>
          </div>
        </div>
      )}

      <div
        className={twMerge(
          "h-1 overflow-hidden rounded-full bg-secondary",
          title || subtitle ? "mt-3" : "",
        )}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: smoothEase }}
        />
      </div>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="relative flex min-w-max items-start gap-2 px-1">
          <div className="absolute left-9 right-9 top-4 h-px bg-border" />
          <motion.div
            className="absolute left-9 top-4 h-px bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `calc((100% - 4.5rem) * ${progress / 100})` }}
            transition={{ duration: 0.45, ease: smoothEase }}
          />

          {items.map((item, index) => (
            <ProcessTimelineStep
              key={item.id}
              item={item}
              index={index}
              isSelected={activeId === item.id}
              onSelect={onItemSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type ProcessTimelineStepProps = {
  item: ProcessTimelineItem;
  index: number;
  isSelected: boolean;
  onSelect?: (item: ProcessTimelineItem) => void;
};

function ProcessTimelineStep({
  item,
  index,
  isSelected,
  onSelect,
}: ProcessTimelineStepProps) {
  const styles = statusStyles[item.status];
  const StatusIcon = styles.icon;
  const interactive = Boolean(onSelect);
  const detail = item.meta ?? item.timestamp ?? item.description;

  const content = (
    <>
      <motion.div
        className={twMerge(
          "relative z-10 flex size-8 items-center justify-center rounded-full ring-4",
          styles.dot,
        )}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: isSelected ? 1.06 : 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 26,
          delay: index * 0.035,
        }}
      >
        {item.icon ?? (
          <StatusIcon
            className={twMerge(
              "size-3.5",
              item.status === "active" && "animate-spin",
            )}
            strokeWidth={2.4}
          />
        )}
      </motion.div>

      <div className="mt-2 min-w-0 text-center">
        <h4 className="truncate text-xs font-medium leading-4">{item.title}</h4>
        {detail && (
          <p className="mt-0.5 truncate text-[11px] leading-4 text-muted-foreground">
            {detail}
          </p>
        )}
        <span className="sr-only">{styles.label}</span>
      </div>
    </>
  );

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      {interactive ? (
        <button
          type="button"
          onClick={() => onSelect?.(item)}
          className={twMerge(
            "relative z-10 flex w-[104px] shrink-0 flex-col items-center rounded-xl px-2 py-2",
            "transition-colors hover:bg-secondary/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isSelected && "bg-secondary/80",
          )}
        >
          {content}
        </button>
      ) : (
        <div
          className={twMerge(
            "relative z-10 flex w-[104px] shrink-0 flex-col items-center rounded-xl px-2 py-2",
            isSelected && "bg-secondary/80",
          )}
        >
          {content}
        </div>
      )}
    </motion.div>
  );
}
