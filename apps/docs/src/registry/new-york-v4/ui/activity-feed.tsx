"use client";

import {
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  GitCommitHorizontal,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const activityFeedVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2.5 text-foreground sm:p-3",
  ],
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[620px]",
      lg: "max-w-[760px]",
    },
  },
  defaultVariants: {
    size: undefined,
  },
});

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.055,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -4, y: 8, scale: 0.995 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  hover: {
    x: 2,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const markerVariants: Variants = {
  visible: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const softToneStyles = {
  neutral: {
    icon: "border-border/70 bg-muted text-muted-foreground",
    badge: "border-border/70 bg-secondary text-muted-foreground",
  },
  info: {
    icon: "border-border/70 bg-secondary text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
  },
  success: {
    icon: "border-primary/20 bg-primary/10 text-foreground",
    badge: "border-primary/15 bg-primary/5 text-foreground",
  },
  warning: {
    icon: "border-border/70 bg-muted text-muted-foreground",
    badge: "border-border/70 bg-secondary text-muted-foreground",
  },
  violet: {
    icon: "border-border/70 bg-secondary text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
  },
} as const;

export type ActivityFeedTone = keyof typeof softToneStyles;

export type ActivityFeedItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
  badge?: ReactNode;
  checks?: ReactNode;
  meta?: ReactNode;
  actor?: {
    name: string;
    initials?: string;
  };
  icon?: ReactNode;
  tone?: ActivityFeedTone;
  unread?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export type ActivityFeedProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof activityFeedVariants> & {
    items: ActivityFeedItem[];
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    actionLabel?: ReactNode;
    emptyText?: ReactNode;
    compact?: boolean;
    showAction?: boolean;
    onActionClick?: () => void;
  };

function ActivityFeed({
  className,
  size,
  items,
  title,
  description,
  action,
  actionLabel = "View all",
  emptyText = "No activity yet",
  compact = false,
  showAction = false,
  onActionClick,
  ...props
}: ActivityFeedProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasHeader = title || description || showAction || action;

  return (
    <div
      data-slot="activity-feed"
      className={twMerge(activityFeedVariants({ size }), className)}
      {...props}
    >
      <div
        data-slot="activity-feed-panel"
        className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
      >
        {hasHeader ? (
          <div
            data-slot="activity-feed-header"
            className="flex items-start justify-between gap-3 border-border/60 border-b px-3 py-3"
          >
            <div className="min-w-0">
              {title ? (
                <h3
                  data-slot="activity-feed-title"
                  className="truncate text-[13px] font-semibold leading-none text-foreground"
                >
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p
                  data-slot="activity-feed-description"
                  className="mt-1 text-muted-foreground text-xs leading-4"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {action ? (
              <motion.div
                data-slot="activity-feed-action"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="shrink-0"
              >
                {action}
              </motion.div>
            ) : showAction ? (
              <ActivityFeedHeaderAction
                label={actionLabel}
                onClick={onActionClick}
              />
            ) : null}
          </div>
        ) : null}

        <motion.ol
          data-slot="activity-feed-list"
          variants={shouldReduceMotion ? undefined : listVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          className={twMerge("space-y-0.5 p-1.5", compact ? "p-1" : "p-1.5")}
        >
          {items.length ? (
            items.map((item, index) => (
              <ActivityFeedRow
                key={item.id}
                item={item}
                compact={compact}
                isLast={index === items.length - 1}
              />
            ))
          ) : (
            <ActivityFeedEmpty>{emptyText}</ActivityFeedEmpty>
          )}
        </motion.ol>
      </div>
    </div>
  );
}

type ActivityFeedHeaderActionProps = {
  label: ReactNode;
  onClick?: () => void;
};

function ActivityFeedHeaderAction({
  label,
  onClick,
}: ActivityFeedHeaderActionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      data-slot="activity-feed-header-action"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      onClick={onClick}
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-secondary px-2 text-muted-foreground text-xs font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{label}</span>
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </motion.button>
  );
}

type ActivityFeedRowProps = {
  item: ActivityFeedItem;
  compact?: boolean;
  isLast?: boolean;
};

function ActivityFeedRow({ item, compact, isLast }: ActivityFeedRowProps) {
  const shouldReduceMotion = useReducedMotion();
  const tone = softToneStyles[item.tone ?? "neutral"];
  const icon = item.icon ?? getFallbackIcon(item.tone);
  const checks = item.checks ?? item.meta;

  return (
    <motion.li
      data-slot="activity-feed-item"
      data-unread={item.unread ? "" : undefined}
      variants={shouldReduceMotion ? undefined : itemVariants}
      whileHover={shouldReduceMotion ? undefined : "hover"}
      className={twMerge(
        "group relative grid grid-cols-[1.75rem_minmax(0,1fr)_1.5rem] gap-2.5 rounded-lg outline-none",
        "transition-colors duration-200 hover:bg-muted/35 focus-within:bg-muted/35",
        compact ? "px-2 py-1.5" : "px-2.5 py-2",
      )}
    >
      <div
        data-slot="activity-feed-marker"
        className="relative flex justify-center pt-0.5"
      >
        {!isLast ? (
          <motion.span
            aria-hidden="true"
            data-slot="activity-feed-connector"
            initial={shouldReduceMotion ? false : { opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-8 bottom-[-1rem] w-px origin-top bg-border"
          />
        ) : null}

        <motion.span
          data-slot="activity-feed-icon"
          variants={shouldReduceMotion ? undefined : markerVariants}
          className={twMerge(
            "relative z-10 flex size-7 items-center justify-center rounded-full border shadow-xs",
            "[&_svg]:size-3.5 [&_svg]:shrink-0",
            tone.icon,
          )}
        >
          {item.unread ? (
            <span
              aria-hidden="true"
              data-slot="activity-feed-unread"
              className="absolute right-0 top-0 size-2 rounded-full border border-card bg-primary"
            />
          ) : null}
          <span aria-hidden="true" className="flex items-center justify-center">
            {icon}
          </span>
        </motion.span>
      </div>

      <div data-slot="activity-feed-content" className="min-w-0 pt-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 truncate text-[13px] font-medium leading-5 text-foreground">
            {item.title}
          </p>
          {item.badge ? (
            <span
              data-slot="activity-feed-badge"
              className={twMerge(
                "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none",
                "transition-colors duration-200 group-hover:border-border group-hover:bg-muted group-hover:text-foreground",
                tone.badge,
              )}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        {item.description ? (
          <p
            data-slot="activity-feed-item-description"
            className="mt-0.5 line-clamp-1 text-muted-foreground text-xs leading-5"
          >
            {item.description}
          </p>
        ) : null}

        {(item.actor || item.time || checks) && (
          <div
            data-slot="activity-feed-meta"
            className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground"
          >
            {item.actor ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-[9px] font-medium text-muted-foreground">
                  {item.actor.initials ?? item.actor.name.slice(0, 2)}
                </span>
                <span className="truncate">{item.actor.name}</span>
              </span>
            ) : null}
            {item.time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3" aria-hidden="true" />
                <span>{item.time}</span>
              </span>
            ) : null}
            {checks ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                <span>{checks}</span>
              </span>
            ) : null}
          </div>
        )}
      </div>

      <motion.button
        type="button"
        data-slot="activity-feed-item-action"
        aria-label={item.actionLabel ?? "Open activity details"}
        onClick={item.onAction}
        className={twMerge(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground",
          "transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          shouldReduceMotion
            ? "opacity-100"
            : "-translate-x-1 opacity-0 transition-[background-color,color,opacity,transform] duration-200 group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100",
        )}
      >
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </motion.button>
    </motion.li>
  );
}

function ActivityFeedEmpty({
  className,
  children,
  ...props
}: HTMLMotionProps<"li">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      data-slot="activity-feed-empty"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        "flex min-h-28 items-center justify-center rounded-xl border border-border/60 border-dashed",
        "bg-secondary/60 px-4 text-center text-muted-foreground text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </motion.li>
  );
}

function getFallbackIcon(tone?: ActivityFeedTone) {
  if (tone === "success") {
    return <CheckCircle2 className="size-3.5" aria-hidden="true" />;
  }

  if (tone === "warning") {
    return <Bell className="size-3.5" aria-hidden="true" />;
  }

  if (tone === "violet") {
    return <Sparkles className="size-3.5" aria-hidden="true" />;
  }

  if (tone === "info") {
    return <Radio className="size-3.5" aria-hidden="true" />;
  }

  if (tone === "neutral") {
    return <ShieldCheck className="size-3.5" aria-hidden="true" />;
  }

  return <GitCommitHorizontal className="size-3.5" aria-hidden="true" />;
}

export { ActivityFeed, ActivityFeedEmpty };
