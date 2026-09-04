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
import { useChartInteraction } from "./chart-interaction";

export const candlestickChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[620px]",
      lg: "max-w-[820px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type CandlestickDatum = {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = ComponentProps<"div"> &
  VariantProps<typeof candlestickChartVariants> & {
    data?: CandlestickDatum[];
    title?: ReactNode;
    description?: ReactNode;
    valueFormatter?: (value: number) => ReactNode;
    height?: number;
    animated?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
    upTone?: string;
    downTone?: string;
    motionDuration?: number;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (item: CandlestickDatum, index: number) => void;
  };

const defaultData: CandlestickDatum[] = [
  { label: "01", open: 30, high: 38, low: 28, close: 36 },
  { label: "02", open: 36, high: 40, low: 33, close: 34 },
  { label: "03", open: 34, high: 37, low: 30, close: 32 },
  { label: "04", open: 32, high: 35, low: 29, close: 34 },
  { label: "05", open: 34, high: 44, low: 33, close: 42 },
  { label: "06", open: 42, high: 46, low: 39, close: 40 },
  { label: "07", open: 40, high: 43, low: 36, close: 43 },
  { label: "08", open: 43, high: 52, low: 42, close: 50 },
  { label: "09", open: 50, high: 54, low: 46, close: 47 },
  { label: "10", open: 47, high: 50, low: 44, close: 49 },
  { label: "11", open: 49, high: 58, low: 48, close: 57 },
  { label: "12", open: 57, high: 61, low: 53, close: 55 },
  { label: "13", open: 55, high: 60, low: 52, close: 59 },
  { label: "14", open: 59, high: 68, low: 58, close: 66 },
  { label: "15", open: 66, high: 70, low: 62, close: 64 },
  { label: "16", open: 64, high: 72, low: 61, close: 71 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function resolveTone(tone: string) {
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
  const bars = [40, 64, 52, 70, 48, 80, 58, 72];
  return (
    <div
      data-slot="candlestick-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-5"
      style={{ height }}
    >
      <div className="flex h-full items-center justify-between gap-3">
        {bars.map((value, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed skeleton bars
            key={index}
            className="w-2.5 animate-pulse rounded-full bg-muted"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="candlestick-chart-empty"
      className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 flex h-10 w-20 items-end justify-center gap-1.5">
          <span className="h-6 w-1.5 rounded-full bg-muted-foreground/40" />
          <span className="h-9 w-1.5 rounded-full bg-muted-foreground/50" />
          <span className="h-5 w-1.5 rounded-full bg-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-foreground">No price data</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide OHLC data to render this candlestick chart."}
        </p>
      </div>
    </div>
  );
}

export function CandlestickChart({
  className,
  size,
  data = defaultData,
  title = "Sales Report",
  description = "Open-high-low-close price action",
  valueFormatter,
  height = 280,
  animated = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  upTone = "chart-2",
  downTone = "destructive",
  motionDuration = 0.5,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: CandlestickChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const motionEnabled = animated && !shouldReduceMotion;
  const upColor = resolveTone(upTone);
  const downColor = resolveTone(downTone);

  const normalized = useMemo(
    () => data.filter((item) => Number.isFinite(item.close)),
    [data],
  );

  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, normalized.length);
  const activeItem = activeIndex === null ? null : normalized[activeIndex];

  useEffect(() => {
    if (activeItem && activeIndex !== null) {
      onActiveChange?.(activeItem, activeIndex);
    }
  }, [activeIndex, activeItem, onActiveChange]);

  function format(value: number) {
    const formatted = valueFormatter?.(value);
    return formatted === undefined ? formatNumber(value) : formatted;
  }

  if (loading) {
    return (
      <div
        data-slot="candlestick-chart"
        className={twMerge(candlestickChartVariants({ size }), className)}
        {...props}
      >
        <ChartSkeleton height={height} />
      </div>
    );
  }

  if (!normalized.length) {
    return (
      <div
        data-slot="candlestick-chart"
        className={twMerge(candlestickChartVariants({ size }), className)}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const viewBoxWidth = 720;
  const viewBoxHeight = 300;
  const plotTop = 16;
  const plotBottom = 258;
  const plotLeft = 14;
  const plotRight = 706;
  const plotHeight = plotBottom - plotTop;
  const plotWidth = plotRight - plotLeft;
  const labelY = 282;

  const highest = Math.max(...normalized.map((item) => item.high));
  const lowest = Math.min(...normalized.map((item) => item.low));
  const pad = Math.max(1, (highest - lowest) * 0.08);
  const domainMax = highest + pad;
  const domainMin = lowest - pad;

  function yFor(value: number) {
    return (
      plotTop + ((domainMax - value) / (domainMax - domainMin)) * plotHeight
    );
  }

  const slot = plotWidth / normalized.length;
  const bodyWidth = Math.min(18, Math.max(4, slot * 0.58));

  const candles = normalized.map((item, index) => {
    const cx = plotLeft + slot * (index + 0.5);
    const up = item.close >= item.open;
    const bodyTop = yFor(Math.max(item.open, item.close));
    const bodyBottom = yFor(Math.min(item.open, item.close));
    return {
      ...item,
      index,
      cx,
      up,
      color: up ? upColor : downColor,
      yHigh: yFor(item.high),
      yLow: yFor(item.low),
      bodyTop,
      bodyHeight: Math.max(2, bodyBottom - bodyTop),
    };
  });

  const active = activeIndex === null ? null : candles[activeIndex];
  const tooltipWidth = 150;
  const tooltipHeight = 78;
  const tooltipX = active
    ? clamp(active.cx - tooltipWidth / 2, 4, viewBoxWidth - tooltipWidth - 4)
    : 0;
  const tooltipY = active
    ? clamp(active.yHigh - tooltipHeight - 12, 6, 9999)
    : 0;

  return (
    <div
      data-slot="candlestick-chart"
      className={twMerge(candlestickChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="candlestick-chart-header" className="mb-3">
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
        data-slot="candlestick-chart-plot"
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
              Candlestick chart with {candles.length} periods. Latest close:{" "}
              {format(normalized[normalized.length - 1].close)}.
            </desc>

            {showGrid
              ? [0.25, 0.5, 0.75].map((step) => {
                  const y = plotTop + plotHeight * step;
                  return (
                    <line
                      key={step}
                      x1={plotLeft}
                      x2={plotRight}
                      y1={y}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 9"
                      opacity="0.5"
                    />
                  );
                })
              : null}

            {candles.map((candle) => {
              const isActive = activeIndex === candle.index;
              const dim = activeIndex !== null && !isActive;
              return (
                <motion.g
                  key={candle.label}
                  data-slot="candlestick-chart-candle"
                  tabIndex={0}
                  role="button"
                  aria-label={`${candle.label}: open ${format(candle.open)}, high ${format(candle.high)}, low ${format(candle.low)}, close ${format(candle.close)}`}
                  {...getItemProps(candle.index)}
                  animate={{ opacity: dim ? 0.4 : 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ color: candle.color, cursor: "pointer" }}
                  className="outline-none"
                >
                  <motion.line
                    x1={candle.cx}
                    x2={candle.cx}
                    y1={candle.yHigh}
                    y2={candle.yLow}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={motionEnabled ? { scaleY: 0, opacity: 0 } : false}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      duration: motionDuration,
                      delay: motionDelay + candle.index * 0.035,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      transformOrigin: `${candle.cx}px ${
                        (candle.yHigh + candle.yLow) / 2
                      }px`,
                    }}
                  />
                  <motion.rect
                    x={candle.cx - bodyWidth / 2}
                    y={candle.bodyTop}
                    width={bodyWidth}
                    height={candle.bodyHeight}
                    rx="2.5"
                    fill="currentColor"
                    initial={motionEnabled ? { scaleY: 0, opacity: 0 } : false}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      duration: motionDuration,
                      delay: motionDelay + 0.06 + candle.index * 0.035,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      transformOrigin: `${candle.cx}px ${
                        candle.bodyTop + candle.bodyHeight / 2
                      }px`,
                    }}
                  />
                </motion.g>
              );
            })}

            {normalized.map((item, index) =>
              index % 2 === 0 ? (
                <text
                  key={item.label}
                  x={plotLeft + slot * (index + 0.5)}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {item.label}
                </text>
              ) : null,
            )}

            <AnimatePresence>
              {showTooltip && active ? (
                <motion.g
                  data-slot="candlestick-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? { opacity: 0, y: tooltipY + 6, scale: 0.97 }
                      : false
                  }
                  animate={{ opacity: 1, y: tooltipY, scale: 1 }}
                  exit={{ opacity: 0, y: tooltipY + 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
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
                  <text
                    x={tooltipX + 14}
                    y={22}
                    className="fill-popover-foreground text-[12px] font-semibold"
                  >
                    {active.label}
                  </text>
                  <circle
                    cx={tooltipX + tooltipWidth - 16}
                    cy={18}
                    r="4.5"
                    fill={active.color}
                  />
                  {(
                    [
                      ["O", active.open],
                      ["H", active.high],
                      ["L", active.low],
                      ["C", active.close],
                    ] as const
                  ).map(([key, value], row) => {
                    const col = row % 2;
                    const line = Math.floor(row / 2);
                    const tx = tooltipX + 14 + col * 70;
                    const ty = 42 + line * 20;
                    return (
                      <text key={key} x={tx} y={ty} className="text-[11px]">
                        <tspan className="fill-muted-foreground font-medium">
                          {key}{" "}
                        </tspan>
                        <tspan className="fill-popover-foreground font-semibold">
                          {format(value)}
                        </tspan>
                      </text>
                    );
                  })}
                </motion.g>
              ) : null}
            </AnimatePresence>
          </svg>
        ) : null}
      </div>

      {showLegend ? (
        <div
          data-slot="candlestick-chart-legend"
          className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: upColor }}
            />
            Bullish
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: downColor }}
            />
            Bearish
          </span>
          {activeItem ? (
            <span className="ml-auto tabular-nums text-foreground">
              {activeItem.label} {"·"} {format(activeItem.close)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
