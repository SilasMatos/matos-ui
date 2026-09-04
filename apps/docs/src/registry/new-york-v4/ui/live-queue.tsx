"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Activity, AlertCircle, Check, Clock, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { cn } from "@/lib/utils";
import {
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export type LiveQueueItemStatus = "pending" | "running" | "done" | "failed";

export type LiveQueueItemData = {
  id: string;
  title: string;
  description?: string;
  status: LiveQueueItemStatus;
};

type LiveQueueContextValue = {
  onItemComplete?: (id: string) => void;
};

const LiveQueueContext = createContext<LiveQueueContextValue>({});

export function useLiveQueueContext() {
  return useContext(LiveQueueContext);
}

export interface LiveQueueProps<T extends LiveQueueItemData> {
  items: T[];
  /** Called when a terminal (done/failed) item should leave the queue. */
  onItemComplete?: (id: string) => void;
  children: (item: T) => ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function LiveQueue<T extends LiveQueueItemData>({
  items,
  onItemComplete,
  children,
  className,
  "aria-label": ariaLabel = "Live queue",
}: LiveQueueProps<T>) {
  const shouldReduceMotion = useReducedMotion();
  const contextValue = useMemo<LiveQueueContextValue>(
    () => ({ onItemComplete }),
    [onItemComplete],
  );

  return (
    <LiveQueueContext.Provider value={contextValue}>
      <motion.ul
        data-slot="live-queue"
        aria-live="polite"
        aria-label={ariaLabel}
        variants={shouldReduceMotion ? undefined : staggerContainer("fast")}
        initial="hidden"
        animate="visible"
        className={cn("flex list-none flex-col gap-2", className)}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => children(item))}
        </AnimatePresence>
      </motion.ul>
    </LiveQueueContext.Provider>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.fast },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const statusConfig: Record<
  LiveQueueItemStatus,
  { label: string; icon: typeof Clock; toneClassName: string }
> = {
  pending: {
    label: "Queued",
    icon: Clock,
    toneClassName: "text-muted-foreground",
  },
  running: {
    label: "Running",
    icon: Activity,
    toneClassName: "text-foreground",
  },
  done: {
    label: "Done",
    icon: Check,
    toneClassName: "text-primary",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    toneClassName: "text-destructive",
  },
};

// How long a "done" item lingers before it clears itself. Failures don't
// auto-clear — an error disappearing on its own would be easy to miss.
const AUTO_COMPLETE_DELAY_MS = 2400;

export interface LiveQueueItemProps<
  T extends LiveQueueItemData = LiveQueueItemData,
> {
  item: T;
  className?: string;
}

export function LiveQueueItem<T extends LiveQueueItemData>({
  item,
  className,
}: LiveQueueItemProps<T>) {
  const { onItemComplete } = useLiveQueueContext();
  const shouldReduceMotion = useReducedMotion();
  const firedRef = useRef(false);

  useEffect(() => {
    if (item.status !== "done") {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;

    const timer = window.setTimeout(() => {
      onItemComplete?.(item.id);
    }, AUTO_COMPLETE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [item.status, item.id, onItemComplete]);

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;
  const isTerminal = item.status === "done" || item.status === "failed";
  const isRunning = item.status === "running";

  return (
    <motion.li
      layout={!shouldReduceMotion}
      variants={shouldReduceMotion ? reducedItemVariants : itemVariants}
      exit={
        shouldReduceMotion
          ? { opacity: 0, transition: { duration: 0 } }
          : { opacity: 0, scale: 0.96, transition: spring.fast }
      }
      className={cn("list-none", className)}
    >
      <Elevated
        offset={1}
        className="relative flex items-center gap-3 overflow-hidden rounded-xl p-3"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60",
            config.toneClassName,
          )}
        >
          <StatusIcon className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {item.title}
          </p>
          {item.description ? (
            <p className="truncate text-xs text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>

        <span
          className={cn("shrink-0 text-xs font-medium", config.toneClassName)}
        >
          {config.label}
        </span>

        {isTerminal ? (
          <button
            type="button"
            onClick={() => onItemComplete?.(item.id)}
            aria-label={`Dismiss ${item.title}`}
            className="shrink-0 rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}

        {isRunning ? (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-muted/50"
          >
            <motion.span
              className="block h-full w-1/3 rounded-full bg-primary/70"
              animate={
                shouldReduceMotion ? { x: "0%" } : { x: ["-100%", "300%"] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 1.1,
                      ease: "linear",
                      repeat: Number.POSITIVE_INFINITY,
                    }
              }
            />
          </span>
        ) : null}
      </Elevated>
    </motion.li>
  );
}
