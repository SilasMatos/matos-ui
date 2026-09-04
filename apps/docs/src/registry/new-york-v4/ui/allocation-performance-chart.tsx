"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { useChartInteraction } from "./chart-interaction";

export const allocationPerformanceChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[680px]",
      lg: "max-w-[840px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type AllocationPerformanceChartDatum = {
  label: string;
  value: number;
  tone?: string;
};

export type AllocationPerformanceChartProps = ComponentProps<"div"> &
  VariantProps<typeof allocationPerformanceChartVariants> & {
    data?: AllocationPerformanceChartDatum[];
    title?: ReactNode;
    description?: ReactNode;
    assetLabel?: ReactNode;
    valueFormatter?: (value: number) => ReactNode;
    max?: number;
    height?: number;
    animated?: boolean;
    showTooltip?: boolean;
    showMarker?: boolean;
    showValues?: boolean;
    showToolbar?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (
      item: AllocationPerformanceChartDatum,
      index: number,
    ) => void;
  };

const defaultData: AllocationPerformanceChartDatum[] = [
  { label: "Bonds", value: 45, tone: "destructive" },
  { label: "Stocks", value: 85, tone: "chart-4" },
  {
    label: "ETFs",
    value: 48,
    tone: "color-mix(in oklab, var(--foreground) 18%, var(--background) 82%)",
  },
  {
    label: "Crypto",
    value: 14,
    tone: "color-mix(in oklab, var(--muted-foreground) 44%, var(--background) 56%)",
  },
];

const fallbackTones = [
  "var(--destructive)",
  "var(--chart-3)",
  "var(--foreground)",
  "var(--muted-foreground)",
  "var(--chart-2)",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getTextValue(value: number, formatter?: (value: number) => ReactNode) {
  const formatted = formatter?.(value) ?? formatPercent(value);

  if (typeof formatted === "number" || typeof formatted === "string") {
    return String(formatted);
  }

  return formatPercent(value);
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
  const skeletonBars = [
    { id: "skeleton-bonds", height: 42 },
    { id: "skeleton-stocks", height: 76 },
    { id: "skeleton-etfs", height: 52 },
    { id: "skeleton-crypto", height: 28 },
  ];

  return (
    <div
      data-slot="allocation-performance-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-5"
      style={{ height }}
    >
      <div className="flex h-full items-end gap-4">
        {skeletonBars.map((bar) => (
          <div
            key={bar.id}
            className="flex-1 animate-pulse rounded-xl bg-muted"
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="allocation-performance-chart-empty"
      className="grid min-h-56 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-60">
        <div className="mx-auto mb-4 flex h-12 w-20 items-end gap-1.5 rounded-xl border border-border bg-muted p-2">
          <span className="h-5 flex-1 rounded bg-muted-foreground/35" />
          <span className="h-8 flex-1 rounded bg-muted-foreground/50" />
          <span className="h-4 flex-1 rounded bg-muted-foreground/30" />
          <span className="h-7 flex-1 rounded bg-muted-foreground/45" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No allocation data
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide allocation values to render this chart."}
        </p>
      </div>
    </div>
  );
}

export function AllocationPerformanceChart({
  className,
  size,
  data = defaultData,
  title = "Allocation Performance",
  description = "Asset allocation by class",
  assetLabel = "Asset class",
  valueFormatter,
  max = 100,
  height = 320,
  animated = true,
  showTooltip = true,
  showMarker = true,
  showValues = false,
  showToolbar = false,
  motionDuration = 0.58,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: AllocationPerformanceChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const safeMax = Math.max(1, max);

  const normalizedData = useMemo(
    () =>
      data
        .filter((item) => Number.isFinite(item.value))
        .map((item, index) => ({
          ...item,
          value: clamp(item.value, 0, safeMax),
          color: resolveTone(item.tone, index),
        })),
    [data, safeMax],
  );

  const {
    activeIndex,
    getItemProps,
    hasEnteredView,
    interactionProps,
    selectIndex,
  } = useChartInteraction(id, normalizedData.length);
  const activeItem =
    activeIndex === null ? null : (normalizedData[activeIndex] ?? null);
  const displayItem = activeItem ?? normalizedData[0];

  useEffect(() => {
    if (activeItem && activeIndex !== null) {
      onActiveChange?.(activeItem, activeIndex);
    }
  }, [activeIndex, activeItem, onActiveChange]);

  if (loading) {
    return (
      <div
        data-slot="allocation-performance-chart"
        className={twMerge(
          allocationPerformanceChartVariants({ size }),
          className,
        )}
        {...props}
      >
        <ChartSkeleton height={height} />
      </div>
    );
  }

  if (!normalizedData.length || !displayItem) {
    return (
      <div
        data-slot="allocation-performance-chart"
        className={twMerge(
          allocationPerformanceChartVariants({ size }),
          className,
        )}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const viewBoxWidth = 760;
  const viewBoxHeight = 296;
  const plotX = 38;
  const plotY = 40;
  const plotWidth = 684;
  const baselineY = 226;
  const plotHeight = baselineY - plotY;
  const labelY = 266;
  const itemCount = normalizedData.length;
  const preferredGap = itemCount > 4 ? 28 : 48;
  const barWidth = Math.max(
    42,
    Math.min(132, (plotWidth - preferredGap * (itemCount - 1)) / itemCount),
  );
  const gap =
    itemCount > 1 ? (plotWidth - barWidth * itemCount) / (itemCount - 1) : 0;

  const bars = normalizedData.map((item, index) => {
    const x = plotX + index * (barWidth + gap);
    const heightValue = Math.max(18, (plotHeight * item.value) / safeMax);
    const y = baselineY - heightValue;

    return {
      ...item,
      x,
      y,
      width: barWidth,
      height: heightValue,
      centerX: x + barWidth / 2,
      markerY: y,
      formattedValue: getTextValue(item.value, valueFormatter),
    };
  });

  const activeBar = activeIndex === null ? null : (bars[activeIndex] ?? null);
  const tooltipWidth = 172;
  const tooltipHeight = 66;
  const tooltipX = activeBar
    ? clamp(
        activeBar.centerX - tooltipWidth / 2,
        plotX + 8,
        plotX + plotWidth - tooltipWidth - 8,
      )
    : 0;
  const tooltipY = activeBar
    ? clamp(activeBar.y - tooltipHeight - 14, 12, baselineY - 112)
    : 0;
  const anchorX = activeBar
    ? clamp(activeBar.centerX - tooltipX, 18, tooltipWidth - 18)
    : tooltipWidth / 2;
  const motionEnabled = animated && !shouldReduceMotion;

  return (
    <div
      data-slot="allocation-performance-chart"
      className={twMerge(
        allocationPerformanceChartVariants({ size }),
        className,
      )}
      {...interactionProps}
      {...props}
    >
      <div
        data-slot="allocation-performance-chart-header"
        className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {showToolbar ? (
          <div className="relative flex shrink-0 items-center gap-2">
            <motion.button
              data-slot="allocation-performance-chart-select"
              type="button"
              aria-expanded={selectorOpen}
              onClick={() => setSelectorOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-muted px-4 text-xs font-medium text-foreground outline-none transition-colors hover:border-border hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
              whileHover={motionEnabled ? { scale: 1.01 } : undefined}
              whileTap={motionEnabled ? { scale: 0.99 } : undefined}
            >
              <span>{assetLabel}</span>
              <span className="hidden text-muted-foreground sm:inline">
                {displayItem.label}
              </span>
              <motion.span
                aria-hidden="true"
                animate={{ rotate: selectorOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </motion.span>
            </motion.button>

            <motion.button
              data-slot="allocation-performance-chart-icon-button"
              type="button"
              aria-label="Inspect allocation chart"
              className="grid size-10 place-items-center rounded-full border border-border/70 bg-muted text-foreground outline-none transition-colors hover:border-border hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
              whileHover={
                motionEnabled ? { rotate: 3, scale: 1.025 } : undefined
              }
              whileTap={motionEnabled ? { scale: 0.98 } : undefined}
            >
              <BarChart3 className="size-4" />
            </motion.button>

            <AnimatePresence>
              {selectorOpen ? (
                <motion.div
                  data-slot="allocation-performance-chart-menu"
                  className="absolute right-12 top-12 z-20 min-w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-sm"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {normalizedData.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        selectIndex(index);
                        setSelectorOpen(false);
                      }}
                      className={twMerge(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        activeIndex === index && "bg-muted text-foreground",
                      )}
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {getTextValue(item.value, valueFormatter)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      <div
        data-slot="allocation-performance-chart-plot"
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
              Allocation performance chart with {normalizedData.length} asset
              classes. Use pointer, touch, or arrow keys to inspect each value.
            </desc>
            <defs>
              <pattern
                id={`${id}-diagonal-pattern`}
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="8"
                  stroke="var(--muted-foreground)"
                  strokeWidth="1.5"
                  opacity="0.13"
                />
              </pattern>
              <clipPath id={`${id}-plot-clip`}>
                <rect
                  x={plotX}
                  y={plotY}
                  width={plotWidth}
                  height={plotHeight}
                  rx="18"
                />
              </clipPath>
              <linearGradient
                id={`${id}-panel-shade`}
                x1="0"
                x2="1"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--card)" />
                <stop
                  offset="100%"
                  stopColor="var(--muted)"
                  stopOpacity="0.28"
                />
              </linearGradient>
              <filter id={`${id}-tooltip-shadow`}>
                <feDropShadow
                  dx="0"
                  dy="2"
                  floodColor="var(--foreground)"
                  floodOpacity="0.12"
                  stdDeviation="3"
                />
              </filter>
            </defs>

            <rect
              x="10"
              y="10"
              width="740"
              height="274"
              rx="24"
              fill={`url(#${id}-panel-shade)`}
              stroke="var(--border)"
            />
            <rect
              x={plotX}
              y={plotY}
              width={plotWidth}
              height={plotHeight}
              rx="18"
              fill={`url(#${id}-diagonal-pattern)`}
              clipPath={`url(#${id}-plot-clip)`}
            />

            {[0.25, 0.5, 0.75].map((step) => {
              const y = baselineY - plotHeight * step;

              return (
                <line
                  key={step}
                  x1={plotX}
                  x2={plotX + plotWidth}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 8"
                  opacity="0.34"
                />
              );
            })}

            {showMarker && activeBar ? (
              <motion.line
                data-slot="allocation-performance-chart-marker"
                x1={plotX}
                x2={plotX + plotWidth}
                y1={activeBar.markerY}
                y2={activeBar.markerY}
                stroke="var(--foreground)"
                strokeDasharray="6 8"
                strokeLinecap="round"
                opacity="0.28"
                initial={motionEnabled ? { pathLength: 0, opacity: 0 } : false}
                animate={{
                  pathLength: 1,
                  opacity: 0.28,
                  y1: activeBar.markerY,
                  y2: activeBar.markerY,
                }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : null}

            <line
              x1={plotX}
              x2={plotX + plotWidth}
              y1={baselineY}
              y2={baselineY}
              stroke="var(--border)"
              strokeWidth="1.5"
              opacity="0.72"
            />

            {bars.map((bar, index) => {
              const active = activeIndex === index;
              const dimmed = activeIndex !== null && !active;
              const clipId = `${id}-bar-${index}`;
              const valueY = clamp(bar.y - 12, plotY + 18, baselineY - 24);

              return (
                <motion.g
                  key={bar.label}
                  data-slot="allocation-performance-chart-bar"
                  tabIndex={0}
                  role="button"
                  aria-label={`${bar.label}: ${bar.formattedValue}`}
                  {...getItemProps(index)}
                  animate={{
                    opacity: dimmed ? 0.58 : 1,
                    y: active ? -1 : 0,
                    scale: active ? 1.002 : 1,
                  }}
                  whileHover={
                    motionEnabled ? { y: -1.2, scale: 1.003 } : undefined
                  }
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 24,
                    mass: 0.8,
                  }}
                  style={{
                    color: bar.color,
                    transformOrigin: `${bar.centerX}px ${baselineY}px`,
                  }}
                  className="outline-none focus-visible:[&_[data-fill]]:stroke-ring focus-visible:[&_[data-fill]]:stroke-2"
                >
                  <defs>
                    <clipPath id={clipId}>
                      <rect
                        x={bar.x}
                        y={plotY}
                        width={bar.width}
                        height={plotHeight}
                        rx="16"
                      />
                    </clipPath>
                  </defs>
                  <rect
                    x={bar.x}
                    y={plotY}
                    width={bar.width}
                    height={plotHeight}
                    rx="16"
                    fill="var(--muted)"
                    opacity="0.12"
                  />
                  <motion.rect
                    data-fill=""
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx="15"
                    fill="currentColor"
                    clipPath={`url(#${clipId})`}
                    initial={motionEnabled ? { scaleY: 0, opacity: 0 } : false}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 118,
                      damping: 24,
                      mass: 0.9,
                      delay: motionDelay + index * 0.07,
                      duration: motionDuration,
                    }}
                    style={{
                      transformOrigin: `${bar.centerX}px ${baselineY}px`,
                    }}
                  />
                  {showValues ? (
                    <motion.text
                      x={bar.centerX}
                      y={valueY}
                      textAnchor="middle"
                      fill={
                        active ? "var(--foreground)" : "var(--muted-foreground)"
                      }
                      className="text-[13px] font-semibold"
                      initial={
                        motionEnabled ? { opacity: 0, y: bar.y + 4 } : false
                      }
                      animate={{
                        opacity: active ? 1 : 0.72,
                        y: valueY,
                      }}
                      transition={{
                        delay: motionDelay + 0.12 + index * 0.05,
                        duration: 0.26,
                      }}
                    >
                      {bar.formattedValue}
                    </motion.text>
                  ) : null}
                  <text
                    x={bar.centerX}
                    y={labelY}
                    textAnchor="middle"
                    fill={
                      active ? "var(--foreground)" : "var(--muted-foreground)"
                    }
                    className="text-[13px] font-medium"
                  >
                    {bar.label}
                  </text>
                  <motion.rect
                    x={bar.centerX - 17}
                    y={labelY + 10}
                    width="34"
                    height="2"
                    rx="1"
                    fill="currentColor"
                    initial={false}
                    animate={{
                      opacity: active ? 0.8 : 0,
                      scaleX: active ? 1 : 0.35,
                    }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      transformOrigin: `${bar.centerX}px ${labelY + 11}px`,
                    }}
                  />
                </motion.g>
              );
            })}

            <AnimatePresence>
              {showTooltip && activeBar && activeItem ? (
                <motion.g
                  data-slot="allocation-performance-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? {
                          opacity: 0,
                          x: tooltipX,
                          y: tooltipY + 8,
                          scale: 0.98,
                        }
                      : false
                  }
                  animate={{
                    opacity: 1,
                    x: tooltipX,
                    y: tooltipY,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: tooltipX,
                    y: tooltipY + 6,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="14"
                    fill="var(--popover)"
                    stroke="var(--border)"
                    filter={`url(#${id}-tooltip-shadow)`}
                  />
                  <path
                    d={`M ${anchorX - 7} ${tooltipHeight - 1} L ${anchorX} ${
                      tooltipHeight + 8
                    } L ${anchorX + 7} ${tooltipHeight - 1} Z`}
                    fill="var(--popover)"
                    stroke="var(--border)"
                    strokeLinejoin="round"
                  />
                  <text
                    x="16"
                    y="25"
                    fill="var(--popover-foreground)"
                    className="text-[13px] font-semibold"
                  >
                    {activeItem.label}
                  </text>
                  <circle cx="20" cy="47" r="5" fill={activeBar.color} />
                  <text
                    x="34"
                    y="52"
                    fill="var(--muted-foreground)"
                    className="text-[13px] font-medium"
                  >
                    Allocation
                  </text>
                  <text
                    x={tooltipWidth - 16}
                    y="52"
                    textAnchor="end"
                    fill="var(--popover-foreground)"
                    className="text-[13px] font-semibold"
                  >
                    {activeBar.formattedValue}
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
