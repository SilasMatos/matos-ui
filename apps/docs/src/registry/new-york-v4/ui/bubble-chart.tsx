"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { useChartInteraction } from "./chart-interaction";
import { chartAccentTransition, chartStaggerStep } from "./chart-motion";

export const bubbleChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[560px]",
      lg: "max-w-[720px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type BubbleDatum = {
  label: string;
  value: number;
  tone?: string;
  /** Optional placement in 0..100 space; auto-laid out on a spiral when omitted. */
  x?: number;
  y?: number;
};

export type BubbleChartProps = ComponentProps<"div"> &
  VariantProps<typeof bubbleChartVariants> & {
    data?: BubbleDatum[];
    title?: ReactNode;
    description?: ReactNode;
    valueFormatter?: (value: number) => ReactNode;
    height?: number;
    animated?: boolean;
    showTooltip?: boolean;
    showValues?: boolean;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (item: BubbleDatum, index: number) => void;
  };

const fallbackTones = [
  "var(--chart-4)",
  "var(--chart-2)",
  "var(--chart-1)",
  "var(--chart-5)",
  "var(--chart-3)",
] as const;

const defaultData: BubbleDatum[] = [
  { label: "Mobile", value: 54.621, tone: "chart-1", x: 33, y: 62 },
  { label: "Desktop", value: 43.401, tone: "foreground", x: 66, y: 58 },
  { label: "Tablet", value: 24.331, tone: "chart-4", x: 38, y: 30 },
  { label: "Watch", value: 12.4, tone: "chart-2", x: 64, y: 28 },
  { label: "TV", value: 8.9, tone: "chart-3", x: 80, y: 74 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function resolveTone(tone: string | undefined, index: number) {
  if (!tone) {
    return fallbackTones[index % fallbackTones.length];
  }
  if (
    tone.startsWith("var(") ||
    tone.startsWith("color-mix(") ||
    tone.startsWith("oklch(") ||
    tone === "currentColor"
  ) {
    return tone;
  }
  return `var(--${tone})`;
}

function ChartSkeleton({ height }: { height: number }) {
  const bubbles = [
    { cx: "32%", cy: "60%", r: 46 },
    { cx: "62%", cy: "54%", r: 38 },
    { cx: "44%", cy: "30%", r: 26 },
  ];
  return (
    <div
      data-slot="bubble-chart-skeleton"
      className="relative overflow-hidden rounded-xl border border-border/60 bg-card"
      style={{ height }}
    >
      {bubbles.map((bubble) => (
        <span
          key={`${bubble.cx}-${bubble.cy}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-muted"
          style={{
            left: bubble.cx,
            top: bubble.cy,
            width: bubble.r * 2,
            height: bubble.r * 2,
          }}
        />
      ))}
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="bubble-chart-empty"
      className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 flex h-10 items-center justify-center gap-1.5">
          <span className="size-6 rounded-full bg-muted-foreground/40" />
          <span className="size-4 rounded-full bg-muted-foreground/30" />
          <span className="size-8 rounded-full bg-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-foreground">No bubbles</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide weighted values to render this bubble chart."}
        </p>
      </div>
    </div>
  );
}

export function BubbleChart({
  className,
  size,
  data = defaultData,
  title = "Sales Report",
  description = "Weighted distribution by segment",
  valueFormatter,
  height = 300,
  animated = true,
  showTooltip = true,
  showValues = true,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: BubbleChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const motionEnabled = animated && !shouldReduceMotion;

  const normalized = useMemo(
    () => data.filter((item) => Number.isFinite(item.value) && item.value > 0),
    [data],
  );

  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, normalized.length);

  useEffect(() => {
    if (activeIndex !== null) {
      onActiveChange?.(normalized[activeIndex], activeIndex);
    }
  }, [activeIndex, normalized, onActiveChange]);

  function format(value: number) {
    const formatted = valueFormatter?.(value);
    return formatted === undefined ? formatNumber(value) : formatted;
  }

  if (loading) {
    return (
      <div
        data-slot="bubble-chart"
        className={twMerge(bubbleChartVariants({ size }), className)}
        {...props}
      >
        <ChartSkeleton height={height} />
      </div>
    );
  }

  if (!normalized.length) {
    return (
      <div
        data-slot="bubble-chart"
        className={twMerge(bubbleChartVariants({ size }), className)}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const viewBoxWidth = 480;
  const viewBoxHeight = 340;
  const maxValue = Math.max(...normalized.map((item) => item.value));
  const rMin = 20;
  const rMax = 64;

  const bubbles = normalized.map((item, index) => {
    // Spiral fallback layout keeps things deterministic without a packing lib.
    const angle = index * 2.399963;
    const spiral = Math.sqrt(index / Math.max(1, normalized.length));
    const px = item.x ?? 50 + Math.cos(angle) * spiral * 36;
    const py = item.y ?? 50 + Math.sin(angle) * spiral * 36;
    const r = rMin + Math.sqrt(item.value / maxValue) * (rMax - rMin);
    return {
      ...item,
      index,
      r,
      cx: clamp((px / 100) * viewBoxWidth, r + 6, viewBoxWidth - r - 6),
      cy: clamp((py / 100) * viewBoxHeight, r + 6, viewBoxHeight - r - 6),
      color: resolveTone(item.tone, index),
    };
  });

  const active = activeIndex === null ? null : bubbles[activeIndex];
  const tooltipWidth = 150;
  const tooltipHeight = 48;
  const tooltipX = active
    ? clamp(active.cx - tooltipWidth / 2, 4, viewBoxWidth - tooltipWidth - 4)
    : 0;
  const tooltipY = active
    ? clamp(active.cy - active.r - tooltipHeight - 8, 4, 9999)
    : 0;

  return (
    <div
      data-slot="bubble-chart"
      className={twMerge(bubbleChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="bubble-chart-header" className="mb-3">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div
        data-slot="bubble-chart-plot"
        className="overflow-hidden"
        style={{ height }}
      >
        {!motionEnabled || hasEnteredView ? (
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="size-full"
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
          >
            <title id={`${id}-title`}>{String(title)}</title>
            <desc id={`${id}-desc`}>
              Bubble chart with {bubbles.length} weighted segments.
            </desc>

            {bubbles.map((bubble) => {
              const isActive = activeIndex === bubble.index;
              const dim = activeIndex !== null && !isActive;
              const gradientId = `${id}-bubble-${bubble.index}`;
              const showValue = showValues && bubble.r >= 26;

              return (
                <motion.g
                  key={bubble.label}
                  data-slot="bubble-chart-bubble"
                  tabIndex={0}
                  role="button"
                  aria-label={`${bubble.label}: ${format(bubble.value)}`}
                  {...getItemProps(bubble.index)}
                  animate={{ opacity: dim ? 0.45 : 1 }}
                  transition={chartAccentTransition}
                  style={{ color: bubble.color, cursor: "pointer" }}
                  className="outline-none"
                >
                  <defs>
                    <radialGradient id={gradientId} cx="38%" cy="32%" r="75%">
                      <stop
                        offset="0%"
                        stopColor="color-mix(in oklab, currentColor 55%, white)"
                      />
                      <stop offset="55%" stopColor="currentColor" />
                      <stop
                        offset="100%"
                        stopColor="color-mix(in oklab, currentColor 78%, black)"
                      />
                    </radialGradient>
                  </defs>

                  <motion.g
                    initial={motionEnabled ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      ...spring.moderate,
                      delay: motionDelay + bubble.index * chartStaggerStep,
                    }}
                    whileHover={
                      motionEnabled
                        ? { scale: 1.015, transition: chartAccentTransition }
                        : undefined
                    }
                    style={{ transformOrigin: `${bubble.cx}px ${bubble.cy}px` }}
                  >
                    <g>
                      {isActive ? (
                        <circle
                          cx={bubble.cx}
                          cy={bubble.cy}
                          r={bubble.r + 5}
                          fill="none"
                          stroke="currentColor"
                          strokeOpacity="0.4"
                          strokeWidth="1.5"
                        />
                      ) : null}
                      <circle
                        cx={bubble.cx}
                        cy={bubble.cy}
                        r={bubble.r}
                        fill={`url(#${gradientId})`}
                      />
                      {showValue ? (
                        <text
                          x={bubble.cx}
                          y={bubble.cy + 4}
                          textAnchor="middle"
                          className="text-[12px] font-semibold"
                          fill="white"
                        >
                          {format(bubble.value)}
                        </text>
                      ) : null}
                    </g>
                  </motion.g>
                </motion.g>
              );
            })}

            <AnimatePresence>
              {showTooltip && active ? (
                <motion.g
                  data-slot="bubble-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? { opacity: 0, y: tooltipY + 6, scale: 0.97 }
                      : false
                  }
                  animate={{ opacity: 1, y: tooltipY, scale: 1 }}
                  exit={{ opacity: 0, y: tooltipY + 4, scale: 0.97 }}
                  transition={spring.fast}
                  style={{ transformOrigin: `${tooltipX}px ${tooltipY}px` }}
                >
                  <rect
                    x={tooltipX}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="12"
                    fill="var(--popover)"
                    stroke="var(--border)"
                  />
                  <circle
                    cx={tooltipX + 18}
                    cy={20}
                    r="5"
                    fill={active.color}
                  />
                  <text
                    x={tooltipX + 32}
                    y={24}
                    className="fill-popover-foreground text-[12px] font-semibold"
                  >
                    {active.label}
                  </text>
                  <text
                    x={tooltipX + 14}
                    y={40}
                    className="fill-muted-foreground text-[11px] font-medium tabular-nums"
                  >
                    {format(active.value)}
                  </text>
                </motion.g>
              ) : null}
            </AnimatePresence>
          </svg>
        ) : null}
      </div>
    </div>
  );
}
