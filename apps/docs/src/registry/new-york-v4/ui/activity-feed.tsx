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
  Sparkles,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const activityFeedVariants = tv({
  base: [
    "w-full overflow-hidden rounded-[1.25rem] border border-border",
    "bg-secondary text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[620px]",
      lg: "max-w-[760px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
  },
};

const toneStyles = {
  neutral: {
    icon: "border-border bg-muted text-muted-foreground",
    pulse: "bg-muted-foreground/20",
    badge: "border-border bg-muted text-muted-foreground",
  },
  info: {
    icon: "border-blue-500/25 bg-blue-500/10 text-blue-500",
    pulse: "bg-blue-500/18",
    badge: "border-blue-500/25 bg-blue-500/10 text-blue-500",
  },
  success: {
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
    pulse: "bg-emerald-500/18",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  },
  warning: {
    icon: "border-amber-500/25 bg-amber-500/10 text-amber-500",
    pulse: "bg-amber-500/18",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  },
  violet: {
    icon: "border-violet-500/25 bg-violet-500/10 text-violet-500",
    pulse: "bg-violet-500/18",
    badge: "border-violet-500/25 bg-violet-500/10 text-violet-500",
  },
} as const;

export type ActivityFeedTone = keyof typeof toneStyles;

export type ActivityFeedItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  actor?: {
    name: string;
    initials?: string;
  };
  icon?: ReactNode;
  tone?: ActivityFeedTone;
  unread?: boolean;
};

export type ActivityFeedProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof activityFeedVariants> & {
    items: ActivityFeedItem[];
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    emptyText?: ReactNode;
    compact?: boolean;
  };

function ActivityFeed({
  className,
  size,
  items,
  title,
  description,
  action,
  emptyText = "No activity yet",
  compact = false,
  ...props
}: ActivityFeedProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-slot="activity-feed"
      className={twMerge(activityFeedVariants({ size }), className)}
      {...props}
    >
      {(title || description || action) && (
        <div
          data-slot="activity-feed-header"
          className="flex items-start justify-between gap-4 px-5 pt-4 pb-3"
        >
          <div className="min-w-0">
            {title ? (
              <h3
                data-slot="activity-feed-title"
                className="truncate font-semibold text-[15px] tracking-[-0.01em]"
              >
                {title}
              </h3>
            ) : null}
            {description ? (
              <p
                data-slot="activity-feed-description"
                className="mt-1 text-muted-foreground text-sm leading-relaxed"
              >
                {description}
              </p>
            ) : null}
          </div>
          {action ? (
            <div data-slot="activity-feed-action" className="shrink-0">
              {action}
            </div>
          ) : null}
        </div>
      )}

      <motion.ol
        data-slot="activity-feed-list"
        variants={shouldReduceMotion ? undefined : listVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        className={twMerge(
          "mx-2 mb-2 overflow-hidden rounded-xl border border-border bg-background p-2",
          !title && !description && !action && "mt-2",
        )}
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
  );
}

type ActivityFeedRowProps = {
  item: ActivityFeedItem;
  compact?: boolean;
  isLast?: boolean;
};

function ActivityFeedRow({ item, compact, isLast }: ActivityFeedRowProps) {
  const shouldReduceMotion = useReducedMotion();
  const tone = toneStyles[item.tone ?? "neutral"];
  const icon = item.icon ?? getFallbackIcon(item.tone);

  return (
    <motion.li
      data-slot="activity-feed-item"
      data-unread={item.unread ? "" : undefined}
      variants={shouldReduceMotion ? undefined : itemVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      className={twMerge(
        "group relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-lg border border-transparent",
        "transition-colors duration-200 hover:border-border hover:bg-muted/25",
        compact ? "p-2.5" : "p-3",
      )}
    >
      <div
        data-slot="activity-feed-marker"
        className="relative flex justify-center"
      >
        {!isLast ? (
          <motion.span
            aria-hidden="true"
            data-slot="activity-feed-connector"
            initial={shouldReduceMotion ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-8 bottom-[-1rem] w-px origin-top bg-border"
          />
        ) : null}

        <span
          className={twMerge(
            "relative z-10 flex size-8 items-center justify-center rounded-full border",
            "[&_svg]:size-3.5",
            tone.icon,
          )}
        >
          {item.unread ? (
            <motion.span
              aria-hidden="true"
              data-slot="activity-feed-pulse"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.45, 1.45],
                      opacity: [0.45, 0, 0],
                    }
              }
              transition={{
                duration: 1.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
              className={twMerge("absolute inset-0 rounded-full", tone.pulse)}
            />
          ) : null}
          <span className="relative z-10">{icon}</span>
        </span>
      </div>

      <div data-slot="activity-feed-content" className="min-w-0 pt-0.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 truncate font-medium text-[13px] leading-5">
                {item.title}
              </p>
              {item.badge ? (
                <span
                  data-slot="activity-feed-badge"
                  className={twMerge(
                    "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
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
                className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed"
              >
                {item.description}
              </p>
            ) : null}
          </div>

          <motion.span
            aria-hidden="true"
            data-slot="activity-feed-arrow"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-foreground"
            animate={
              shouldReduceMotion
                ? undefined
                : { x: item.unread ? [0, 2, 0] : 0 }
            }
            transition={{
              duration: 1.4,
              repeat: item.unread ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            <ArrowUpRight className="size-3.5" />
          </motion.span>
        </div>

        {(item.actor || item.time || item.meta) && (
          <div
            data-slot="activity-feed-meta"
            className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs"
          >
            {item.actor ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-semibold text-foreground">
                  {item.actor.initials ?? item.actor.name.slice(0, 2)}
                </span>
                <span>{item.actor.name}</span>
              </span>
            ) : null}
            {item.time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3" aria-hidden="true" />
                {item.time}
              </span>
            ) : null}
            {item.meta ? (
              <span className="inline-flex items-center gap-1.5">
                <Radio className="size-3" aria-hidden="true" />
                {item.meta}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </motion.li>
  );
}

function ActivityFeedEmpty({
  className,
  children,
  ...props
}: HTMLMotionProps<"li">) {
  return (
    <motion.li
      data-slot="activity-feed-empty"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        "flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border",
        "bg-muted/20 px-4 text-center text-muted-foreground text-sm",
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

  return <GitCommitHorizontal className="size-3.5" aria-hidden="true" />;
}

export { ActivityFeed, ActivityFeedEmpty };
