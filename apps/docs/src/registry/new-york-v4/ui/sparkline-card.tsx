"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { type ComponentProps, type ReactNode, useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { useChartInteraction } from "./chart-interaction";

export const sparklineCardVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[280px]",
      md: "max-w-[340px]",
      lg: "max-w-[420px]",
      full: "max-w-full",
    },
    tone: {
      neutral: "",
      positive: "",
      negative: "",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "neutral",
  },
});

export type SparklineCardDatum = Record<string, number | string>;

export type SparklineCardCurveType =
  | "basis"
  | "bumpX"
  | "linear"
  | "monotoneX"
  | "natural"
  | "step";

export type SparklineCardProps = ComponentProps<"div"> &
  VariantProps<typeof sparklineCardVariants> & {
    data?: SparklineCardDatum[];
    label?: ReactNode;
    value?: number;
    prefix?: string;
    suffix?: string;
    trend?: number;
    trendLabel?: ReactNode;
    xKey?: string;
    yKey?: string;
    valueFormatter?: (value: number) => ReactNode;
    labelFormatter?: (label: string | number) => ReactNode;
    strokeWidth?: number;
    showDots?: boolean;
    animated?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    highlightActivePoint?: boolean;
    curveType?: SparklineCardCurveType;
    gradient?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    height?: number;
    loading?: boolean;
    emptyState?: ReactNode;
  };

const defaultData: SparklineCardDatum[] = [
  { label: "01", value: 18 },
  { label: "02", value: 24 },
  { label: "03", value: 21 },
  { label: "04", value: 32 },
  { label: "05", value: 28 },
  { label: "06", value: 38 },
  { label: "07", value: 44 },
  { label: "08", value: 41 },
  { label: "09", value: 52 },
];

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });
}

function getNumericValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function getTone(trend?: number): "neutral" | "positive" | "negative" {
  if (!trend) {
    return "neutral";
  }

  return trend > 0 ? "positive" : "negative";
}

const toneClasses = {
  neutral: {
    chart: "text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
    icon: ArrowRight,
  },
  positive: {
    chart: "text-chart-2",
    badge: "border-chart-2/20 bg-chart-2/10 text-chart-2",
    icon: ArrowUpRight,
  },
  negative: {
    chart: "text-destructive",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    icon: ArrowDownRight,
  },
} as const;

function ChartSkeleton() {
  return (
    <div
      data-slot="sparkline-card-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-3 h-7 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="sparkline-card-empty"
      className="grid min-h-44 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 h-8 w-20 rounded-full border border-border bg-muted" />
        <p className="text-sm font-medium text-foreground">No sparkline data</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide compact time-series data to render this card."}
        </p>
      </div>
    </div>
  );
}

type SparklineDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  active?: boolean;
  animated?: boolean;
  motionDelay?: number;
};

function SparklineDot({
  cx,
  cy,
  index = 0,
  active = false,
  animated = true,
  motionDelay = 0,
}: SparklineDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  return (
    <g data-slot={active ? "sparkline-card-active-dot" : "sparkline-card-dot"}>
      {active ? (
        <motion.circle
          cx={cx}
          cy={cy}
          r={9}
          fill="currentColor"
          opacity={0.16}
          initial={animated ? { r: 4, opacity: 0 } : false}
          animate={{ r: 9, opacity: 0.14 }}
          transition={{
            duration: 0.18,
            ease: "easeOut",
          }}
        />
      ) : null}
      <motion.circle
        cx={cx}
        cy={cy}
        r={active ? 3.5 : 2.5}
        className="fill-card"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        initial={animated ? { r: 0, opacity: 0 } : false}
        animate={{ r: active ? 3.5 : 2.5, opacity: active ? 1 : 0.72 }}
        transition={{
          delay: motionDelay + index * 0.03,
          duration: 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </g>
  );
}

function SparklineCursor({
  points,
  height,
}: {
  points?: { x?: number }[];
  height?: number;
}) {
  const x = points?.[0]?.x;

  if (typeof x !== "number") {
    return null;
  }

  return (
    <motion.line
      data-slot="sparkline-card-cursor"
      x1={x}
      x2={x}
      y1={4}
      y2={(height ?? 0) - 4}
      stroke="currentColor"
      strokeDasharray="3 6"
      strokeLinecap="round"
      className="text-muted-foreground/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
}

type ChartTooltipProps = Partial<
  Omit<TooltipContentProps, "labelFormatter">
> & {
  valueFormatter?: (value: number) => ReactNode;
  labelFormatter?: (label: string | number) => ReactNode;
};

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = getNumericValue(payload[0]?.value);

  return (
    <motion.div
      data-slot="sparkline-card-tooltip"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur tabular-nums"
    >
      <p className="text-[11px] font-medium text-muted-foreground">
        {labelFormatter?.(String(label)) ?? label}
      </p>
      <p className="mt-1 font-semibold text-foreground">
        {valueFormatter?.(value) ?? formatNumber(value)}
      </p>
    </motion.div>
  );
}

export function SparklineCard({
  className,
  size,
  data = defaultData,
  label = "Conversion",
  value,
  prefix = "",
  suffix = "%",
  trend = 12.4,
  trendLabel = "vs last week",
  xKey = "label",
  yKey = "value",
  valueFormatter,
  labelFormatter,
  strokeWidth = 2,
  showDots = true,
  animated = true,
  showGrid = true,
  showTooltip = true,
  highlightActivePoint = true,
  curveType = "monotoneX",
  gradient = true,
  motionDuration = 0.76,
  motionDelay = 0,
  height = 96,
  loading = false,
  emptyState,
  tone,
  ...props
}: SparklineCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId().replace(/:/g, "");
  const gradientId = `${generatedId}-sparkline-gradient`;
  const maskId = `${generatedId}-sparkline-mask`;
  const patternId = `${generatedId}-sparkline-pattern`;
  const chartData = useMemo(() => data, [data]);
  const resolvedAnimated = animated && !shouldReduceMotion;
  const { hasEnteredView, interactionProps, selectedIndex, selectIndex } =
    useChartInteraction(generatedId, chartData.length);
  const latest = chartData.at(-1);
  const latestValue =
    typeof value === "number"
      ? value
      : latest
        ? getNumericValue(latest[yKey])
        : 0;
  const resolvedTone = tone ?? getTone(trend);
  const toneStyle = toneClasses[resolvedTone];

  return (
    <div
      data-slot="sparkline-card"
      role="img"
      aria-label={`${String(label)} sparkline card with value ${formatNumber(
        latestValue,
      )}`}
      className={twMerge(
        sparklineCardVariants({ size, tone: resolvedTone }),
        className,
      )}
      {...interactionProps}
      {...props}
    >
      {loading ? (
        <ChartSkeleton />
      ) : chartData.length === 0 ? (
        <ChartEmpty>{emptyState}</ChartEmpty>
      ) : (
        <>
          <div data-slot="sparkline-card-header" className="px-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold leading-none text-foreground">
              {prefix}
              {valueFormatter?.(latestValue) ?? formatNumber(latestValue)}
              {suffix}
            </p>
          </div>
          <div
            data-slot="sparkline-card-chart"
            className={twMerge("mt-3", toneStyle.chart)}
            style={{ height }}
          >
            {!resolvedAnimated || hasEnteredView ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                  onClick={(state) => {
                    const index = Number(state?.activeTooltipIndex);
                    if (Number.isInteger(index)) selectIndex(index);
                  }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <pattern
                      id={patternId}
                      width="8"
                      height="8"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 0 8 L 8 0"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-border"
                        opacity="0.35"
                      />
                    </pattern>
                    <mask id={maskId}>
                      <motion.rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="white"
                        initial={resolvedAnimated ? { scaleX: 0 } : false}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: motionDuration,
                          delay: motionDelay,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ transformOrigin: "left center" }}
                      />
                    </mask>
                  </defs>
                  {showGrid ? (
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill={`url(#${patternId})`}
                      opacity={0.5}
                    />
                  ) : null}
                  <XAxis dataKey={xKey} hide />
                  <YAxis
                    hide
                    width={0}
                    domain={["dataMin - 8", "dataMax + 8"]}
                  />
                  {showTooltip ? (
                    <Tooltip
                      key={selectedIndex ?? "hover"}
                      active={selectedIndex === null ? undefined : true}
                      defaultIndex={selectedIndex ?? undefined}
                      cursor={<SparklineCursor />}
                      content={
                        <ChartTooltip
                          valueFormatter={valueFormatter}
                          labelFormatter={labelFormatter}
                        />
                      }
                    />
                  ) : null}
                  <Area
                    dataKey={yKey}
                    type={curveType}
                    fill={gradient ? `url(#${gradientId})` : "transparent"}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    mask={`url(#${maskId})`}
                    dot={
                      showDots
                        ? (dotProps: SparklineDotProps) => (
                            <SparklineDot
                              {...dotProps}
                              animated={resolvedAnimated}
                              motionDelay={motionDelay + motionDuration * 0.35}
                            />
                          )
                        : false
                    }
                    activeDot={
                      highlightActivePoint
                        ? (dotProps: SparklineDotProps) => (
                            <SparklineDot
                              {...dotProps}
                              active
                              animated={resolvedAnimated}
                            />
                          )
                        : false
                    }
                    isAnimationActive={resolvedAnimated}
                    animationBegin={motionDelay * 1000}
                    animationDuration={motionDuration * 1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          {trendLabel ? (
            <div className="mt-2 px-1 text-xs text-muted-foreground">
              {trendLabel}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export { ChartTooltip as SparklineCardTooltip, SparklineDot, SparklineCursor };
