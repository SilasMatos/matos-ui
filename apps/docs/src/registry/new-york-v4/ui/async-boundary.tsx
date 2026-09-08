"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import {
  duration,
  ease,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The error state both lifts a rung and animates its presence — one node, per
// DESIGN §2.6.
const MotionElevated = motion.create(Elevated);

type Phase = "pending" | "error" | "empty" | "success";

/**
 * The shape of a TanStack Query result this needs — structural, so any
 * `useQuery` / `useInfiniteQuery` return value fits without importing the lib.
 */
export type QueryLike<T> = {
  status: "pending" | "error" | "success";
  data: T | undefined;
  error: unknown;
  refetch?: () => unknown;
  isFetching?: boolean;
  fetchStatus?: "fetching" | "paused" | "idle";
};

export type EmptyStateConfig = {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export type AsyncBoundaryProps<T> = {
  /** The `useQuery` result. */
  query: QueryLike<T>;
  /** Rendered on success. A node, or a function given the (non-empty) data. */
  children: ReactNode | ((data: T) => ReactNode);
  /** Decides the empty state. Default: `null`/`undefined`, or an empty array. */
  isEmpty?: (data: T) => boolean;
  /** The pending state. Default: a generic shimmer. */
  pending?: ReactNode;
  /** The empty state. A node, or `{ icon, title, description, action }`. */
  empty?: ReactNode | EmptyStateConfig;
  /** The error state. A node, or a function given the error and a retry callback. */
  errorFallback?:
    | ReactNode
    | ((error: unknown, retry: () => void) => ReactNode);
  /** Retry handler for the default error state. Falls back to `query.refetch`. */
  onRetry?: () => void;
  /** Thin indeterminate bar while a *successful* query is refetching. Default `true`. */
  fetchingIndicator?: boolean;
  className?: string;
};

function isEmptyConfig(value: unknown): value is EmptyStateConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    !Array.isArray(value)
  );
}

function defaultIsEmpty(data: unknown): boolean {
  return data == null || (Array.isArray(data) && data.length === 0);
}

function resolvePhase<T>(
  query: QueryLike<T>,
  isEmpty: (data: T) => boolean,
): Phase {
  if (query.status === "pending") return "pending";
  if (query.status === "error") return "error";
  return isEmpty(query.data as T) ? "empty" : "success";
}

function Shimmer({ reduce }: { reduce: boolean }) {
  // One ambient beat, ~three `duration.slower`s, with a small per-row delay so
  // it reads as a slow wave receding rather than a strobe.
  const rows = ["h-4 w-1/3", "h-24 w-full", "h-4 w-full", "h-4 w-5/6"];
  return (
    <div data-slot="async-boundary-skeleton" className="not-prose space-y-3">
      {rows.map((shape, index) => (
        <motion.div
          key={shape}
          className={twMerge("rounded-md bg-foreground/8", shape)}
          animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: duration.slower * 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: index * 0.12,
                }
          }
        />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: EmptyStateConfig) {
  return (
    <div
      data-slot="async-boundary-empty"
      className="not-prose flex flex-col items-center gap-2 px-6 py-12 text-center"
    >
      <span className="text-muted-foreground [&_svg]:size-8" aria-hidden="true">
        {icon ?? <Inbox strokeWidth={1.25} />}
      </span>
      <p className="font-medium text-foreground text-sm">
        {title ?? "Nothing here yet"}
      </p>
      {description ? (
        <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

function DefaultError({ error, retry }: { error: unknown; retry: () => void }) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "The request didn't go through.";
  return (
    <div className="not-prose flex flex-col items-center gap-2 px-6 py-10 text-center">
      {/* No red: the rung the card sits on is what says "this stopped". */}
      <AlertTriangle
        strokeWidth={1.25}
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="font-medium text-foreground text-sm">Couldn't load this</p>
      <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={retry}
        className="hover-lift [--lift:1px] mt-2 inline-flex items-center gap-1.5 rounded-lg bg-foreground/8 px-3 py-1.5 font-medium text-foreground text-xs outline-none hover:bg-foreground/12 focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
      >
        <RotateCw aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}

/**
 * One wrapper for the four states a `useQuery` resolves to — pending, error,
 * empty, success — on a single motion system, so the app stops re-writing this
 * by hand for every screen.
 *
 * Surface: the error state is `Elevated offset={1}` — a rung above the content.
 * Error interrupts, and the elevation says so without reaching for red. The
 * skeleton and the content share one offset (flush), which is what keeps the
 * swap between them from jumping.
 *
 * Motion: the container animates its own height with `layout`; states cross-fade
 * through `AnimatePresence mode="wait"` — out on an `ease.accelerate` tween, in
 * on `spring.moderate`, except **content**, which enters on `spring.fast`
 * because it is a response. The skeleton pulses on an ambient, receding beat.
 * That ambient-vs-responsive contrast is the tier system's whole point.
 *
 * `prefers-reduced-motion` keeps the cross-fade and drops the height animation,
 * the travel and the pulse.
 */
export function AsyncBoundary<T>({
  query,
  children,
  isEmpty = defaultIsEmpty,
  pending,
  empty,
  errorFallback,
  onRetry,
  fetchingIndicator = true,
  className,
}: AsyncBoundaryProps<T>) {
  const reduce = !!useReducedMotion();
  const phase = resolvePhase(query, isEmpty);
  const retry = () => {
    if (onRetry) onRetry();
    else query.refetch?.();
  };
  const refetching =
    phase === "success" &&
    (query.isFetching === true || query.fetchStatus === "fetching");

  let body: ReactNode;
  if (phase === "pending") {
    body = pending ?? <Shimmer reduce={reduce} />;
  } else if (phase === "error") {
    if (typeof errorFallback === "function") {
      body = errorFallback(query.error, retry);
    } else if (errorFallback !== undefined) {
      body = errorFallback;
    } else {
      body = <DefaultError error={query.error} retry={retry} />;
    }
  } else if (phase === "empty") {
    body = isEmptyConfig(empty) ? (
      <EmptyState {...empty} />
    ) : (
      (empty ?? <EmptyState />)
    );
  } else {
    body =
      typeof children === "function"
        ? (children as (data: T) => ReactNode)(query.data as T)
        : children;
  }

  const enter = reduce
    ? { duration: duration.fast }
    : phase === "success"
      ? spring.fast
      : spring.moderate;
  const exit = {
    opacity: 0,
    y: reduce ? 0 : -4,
    transition: reduce
      ? { duration: duration.fast }
      : { duration: spring.moderate.exit.duration, ease: ease.accelerate },
  };
  const initial = reduce ? { opacity: 0 } : { opacity: 0, y: 6 };
  const animate = reduce ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      data-slot="async-boundary"
      data-phase={phase}
      data-fetching={refetching || undefined}
      aria-busy={phase === "pending" || refetching || undefined}
      layout={!reduce}
      transition={reduce ? { duration: 0 } : spring.moderate}
      className={twMerge("relative", className)}
    >
      <AnimatePresence>
        {fetchingIndicator && refetching && !reduce ? (
          <motion.div
            key="fetching"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="block h-full w-1/3 rounded-full bg-primary/60"
              animate={{ x: ["-120%", "420%"] }}
              transition={{
                duration: 1.1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {phase === "error" ? (
          <MotionElevated
            key="error"
            offset={1}
            role="alert"
            data-slot="async-boundary-error"
            className="overflow-hidden rounded-xl"
            initial={initial}
            animate={animate}
            exit={exit}
            transition={enter}
          >
            {body}
          </MotionElevated>
        ) : (
          <motion.div
            key={phase}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={enter}
          >
            {body}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
