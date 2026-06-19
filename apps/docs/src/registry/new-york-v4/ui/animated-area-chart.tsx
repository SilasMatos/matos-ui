"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ComponentProps, type ReactNode, useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const animatedAreaChartVariants = tv({
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

export type AnimatedAreaChartDatum = Record<string, number | string>;

export type AnimatedAreaChartCurveType =
  | "basis"
  | "bumpX"
  | "linear"
  | "monotone"
  | "monotoneX"
  | "natural"
  | "step";

export type AnimatedAreaChartProps = ComponentProps<"div"> &
  VariantProps<typeof animatedAreaChartVariants> & {
    data?: AnimatedAreaChartDatum[];
    title?: ReactNode;
    description?: ReactNode;
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
    curveType?: AnimatedAreaChartCurveType;
    gradient?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    height?: number;
    loading?: boolean;
    emptyState?: ReactNode;
  };

const defaultData: AnimatedAreaChartDatum[] = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 53 },
  { month: "Apr", value: 49 },
  { month: "May", value: 68 },
  { month: "Jun", value: 74 },
  { month: "Jul", value: 69 },
  { month: "Aug", value: 86 },
  { month: "Sep", value: 91 },
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

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      data-slot="animated-area-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-4"
      style={{ height }}
    >
      <div className="h-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="animated-area-chart-empty"
      className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 h-10 w-16 rounded-full border border-border bg-muted" />
        <p className="text-sm font-medium text-foreground">No chart data</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Connect a dataset to render this animated area chart."}
        </p>
      </div>
    </div>
  );
}

type AreaDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  active?: boolean;
  animated?: boolean;
  motionDelay?: number;
};

function AreaDot({
  cx,
  cy,
  index = 0,
  active = false,
  animated = true,
  motionDelay = 0,
}: AreaDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") {
    return null;
  }

  const ringRadius = active ? 10 : 5;

  return (
    <g
      data-slot={
        active ? "animated-area-chart-active-dot" : "animated-area-chart-dot"
      }
    >
      {active ? (
        <motion.circle
          cx={cx}
          cy={cy}
          r={ringRadius}
          className="text-chart-2"
          fill="currentColor"
          initial={animated ? { r: 4, opacity: 0 } : false}
          animate={
            animated
              ? { r: [8, 13, 8], opacity: [0.12, 0.22, 0.12] }
              : { r: ringRadius, opacity: 0.16 }
          }
          transition={{
            duration: 1.8,
            repeat: animated ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        />
      ) : null}
      <motion.circle
        cx={cx}
        cy={cy}
        r={active ? 4 : 3}
        className="text-card"
        fill="currentColor"
        stroke="var(--chart-2)"
        strokeWidth={active ? 2 : 1.5}
        initial={animated ? { r: 0, opacity: 0 } : false}
        animate={{ r: active ? 4 : 3, opacity: active ? 1 : 0.78 }}
        transition={{
          delay: motionDelay + index * 0.035,
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </g>
  );
}

function AreaCursor({
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
    <motion.g
      data-slot="animated-area-chart-cursor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <line
        x1={x}
        x2={x}
        y1={8}
        y2={(height ?? 0) - 8}
        stroke="currentColor"
        strokeDasharray="4 6"
        strokeLinecap="round"
        className="text-muted-foreground/45"
      />
    </motion.g>
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

  const item = payload[0];
  const value = getNumericValue(item?.value);

  return (
    <motion.div
      data-slot="animated-area-chart-tooltip"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
    >
      <p className="text-[11px] font-medium text-muted-foreground">
        {labelFormatter?.(String(label)) ?? label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="size-2 rounded-full bg-chart-2" />
        <span className="font-semibold text-foreground">
          {valueFormatter?.(value) ?? formatNumber(value)}
        </span>
      </div>
    </motion.div>
  );
}

export function AnimatedAreaChart({
  className,
  size,
  data = defaultData,
  title = "Revenue velocity",
  description = "Animated area trend",
  xKey = "month",
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
  motionDuration = 0.8,
  motionDelay = 0,
  height = 260,
  loading = false,
  emptyState,
  ...props
}: AnimatedAreaChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId().replace(/:/g, "");
  const gradientId = `${generatedId}-area-gradient`;
  const patternId = `${generatedId}-area-pattern`;
  const clipId = `${generatedId}-area-reveal`;
  const resolvedAnimated = animated && !shouldReduceMotion;
  const chartData = useMemo(() => data, [data]);

  const latest = chartData.at(-1);
  const latestValue = latest ? getNumericValue(latest[yKey]) : 0;

  return (
    <div
      data-slot="animated-area-chart"
      role="img"
      aria-label={`${String(title)} area chart with latest value ${formatNumber(
        latestValue,
      )}`}
      className={twMerge(animatedAreaChartVariants({ size }), className)}
      {...props}
    >
      <div data-slot="animated-area-chart-header" className="mb-3">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {loading ? (
        <ChartSkeleton height={height} />
      ) : chartData.length === 0 ? (
        <ChartEmpty>{emptyState}</ChartEmpty>
      ) : (
        <div
          data-slot="animated-area-chart-panel"
          className="text-chart-2"
          style={{ height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 18, bottom: 8, left: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="56%"
                    stopColor="currentColor"
                    stopOpacity={0.09}
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity={0}
                  />
                </linearGradient>
                <pattern
                  id={patternId}
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-border"
                    opacity="0.45"
                  />
                </pattern>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <motion.rect
                    x="0"
                    y="0"
                    height="1"
                    initial={resolvedAnimated ? { width: 0 } : false}
                    animate={{ width: 1 }}
                    transition={{
                      duration: motionDuration,
                      delay: motionDelay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </clipPath>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${patternId})`}
                opacity={gradient ? 0.42 : 0}
              />
              {showGrid ? (
                <CartesianGrid
                  vertical={false}
                  stroke="currentColor"
                  strokeDasharray="2 8"
                  className="text-border/75"
                />
              ) : null}
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis hide width={0} domain={["dataMin - 8", "dataMax + 10"]} />
              {showTooltip ? (
                <Tooltip
                  cursor={<AreaCursor />}
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
                fillOpacity={1}
                stroke="none"
                clipPath={`url(#${clipId})`}
                dot={false}
                activeDot={false}
                isAnimationActive={resolvedAnimated}
                animationBegin={motionDelay * 1000}
                animationDuration={motionDuration * 1000}
              />
              <Line
                dataKey={yKey}
                type={curveType}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                clipPath={`url(#${clipId})`}
                dot={
                  showDots
                    ? (dotProps: AreaDotProps) => (
                        <AreaDot
                          {...dotProps}
                          animated={resolvedAnimated}
                          motionDelay={motionDelay + motionDuration * 0.35}
                        />
                      )
                    : false
                }
                activeDot={
                  highlightActivePoint
                    ? (dotProps: AreaDotProps) => (
                        <AreaDot
                          {...dotProps}
                          active
                          animated={resolvedAnimated}
                          motionDelay={0}
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
        </div>
      )}
    </div>
  );
}

export {
  AreaDot as AnimatedAreaChartDot,
  ChartTooltip as AnimatedAreaChartTooltip,
};
