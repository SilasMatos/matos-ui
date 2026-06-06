"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  type BarShapeProps as RechartsBarShapeProps,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const interactiveBarChartVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2 text-foreground shadow-sm",
  ],
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

export type InteractiveBarChartDatum = Record<string, number | string>;

export type InteractiveBarChartProps = ComponentProps<"div"> &
  VariantProps<typeof interactiveBarChartVariants> & {
    data?: InteractiveBarChartDatum[];
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
    curveType?: "linear" | "step" | "monotoneX";
    gradient?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    height?: number;
    loading?: boolean;
    emptyState?: ReactNode;
  };

const defaultData: InteractiveBarChartDatum[] = [
  { label: "Mon", value: 38 },
  { label: "Tue", value: 55 },
  { label: "Wed", value: 42 },
  { label: "Thu", value: 71 },
  { label: "Fri", value: 64 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 76 },
];

const barToneClasses = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
  "text-chart-5",
] as const;

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });
}

function getNumericValue(value: unknown) {
  if (Array.isArray(value)) {
    return getNumericValue(value.at(-1));
  }

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
  const skeletonBars = [
    { id: "skeleton-1", height: 34 },
    { id: "skeleton-2", height: 53 },
    { id: "skeleton-3", height: 72 },
    { id: "skeleton-4", height: 39 },
    { id: "skeleton-5", height: 58 },
    { id: "skeleton-6", height: 77 },
    { id: "skeleton-7", height: 44 },
    { id: "skeleton-8", height: 63 },
  ];

  return (
    <div
      data-slot="interactive-bar-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-4"
      style={{ height }}
    >
      <div className="flex h-full items-end gap-2">
        {skeletonBars.map((bar) => (
          <div
            key={bar.id}
            className="flex-1 animate-pulse rounded-t-lg bg-muted"
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
      data-slot="interactive-bar-chart-empty"
      className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 flex h-10 w-16 items-end gap-1 rounded-lg border border-border bg-muted p-2">
          <span className="h-3 flex-1 rounded-sm bg-muted-foreground/35" />
          <span className="h-5 flex-1 rounded-sm bg-muted-foreground/45" />
          <span className="h-7 flex-1 rounded-sm bg-muted-foreground/55" />
        </div>
        <p className="text-sm font-medium text-foreground">No bar data</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Add values to render this interactive bar chart."}
        </p>
      </div>
    </div>
  );
}

type PremiumBarShapeProps = RechartsBarShapeProps & {
  activeIndex?: number | null;
  animated?: boolean;
  gradient?: boolean;
  strokeWidth?: number;
  motionDuration?: number;
  motionDelay?: number;
  gradientId?: string;
  onActivate?: (index: number | null) => void;
  valueFormatter?: (value: number) => ReactNode;
};

function PremiumBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  value,
  activeIndex,
  animated = true,
  gradient = true,
  strokeWidth = 2,
  motionDuration = 0.8,
  motionDelay = 0,
  gradientId,
  onActivate,
  valueFormatter,
}: PremiumBarShapeProps) {
  const active = activeIndex === index;
  const toneClass = barToneClasses[index % barToneClasses.length];
  const radius = Math.min(width / 2, 10);
  const barValue = getNumericValue(value);

  return (
    <motion.g
      data-slot="interactive-bar-chart-bar"
      onMouseEnter={() => onActivate?.(index)}
      onMouseLeave={() => onActivate?.(null)}
      onFocus={() => onActivate?.(index)}
      onBlur={() => onActivate?.(null)}
      tabIndex={0}
      role="img"
      aria-label={`Bar ${index + 1}: ${formatNumber(barValue)}`}
      initial={animated ? { opacity: 0, y: 12, scaleY: 0.76 } : false}
      animate={{ opacity: 1, y: active ? -2 : 0, scaleY: 1 }}
      transition={{
        delay: motionDelay + index * 0.04,
        duration: motionDuration,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformOrigin: `${x + width / 2}px ${y + height}px` }}
      className={twMerge(
        toneClass,
        "outline-none focus-visible:[filter:drop-shadow(0_0_0.5rem_currentColor)]",
      )}
    >
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={gradient && gradientId ? `url(#${gradientId})` : "currentColor"}
        opacity={active ? 1 : 0.78}
        stroke="currentColor"
        strokeWidth={active ? strokeWidth : 0}
        initial={false}
        animate={{
          opacity: active ? 1 : 0.78,
          filter: active ? "drop-shadow(0 0 0.65rem currentColor)" : "none",
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />
      <motion.line
        x1={x + width * 0.22}
        x2={x + width * 0.78}
        y1={y + Math.min(height * 0.32, 18)}
        y2={y + Math.min(height * 0.32, 18)}
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray="1 4"
        strokeWidth={1}
        opacity={0.5}
        initial={animated ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{
          delay: motionDelay + motionDuration * 0.45 + index * 0.025,
          duration: 0.36,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
      {active ? (
        <motion.g
          data-slot="interactive-bar-chart-active-label"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <rect
            x={x + width / 2 - 24}
            y={Math.max(y - 30, 4)}
            width="48"
            height="22"
            rx="11"
            className="fill-background stroke-border"
          />
          <text
            x={x + width / 2}
            y={Math.max(y - 15, 19)}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {valueFormatter?.(barValue) ?? formatNumber(barValue)}
          </text>
        </motion.g>
      ) : null}
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
      data-slot="interactive-bar-chart-tooltip"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
    >
      <p className="text-[11px] font-medium text-muted-foreground">
        {labelFormatter?.(String(label)) ?? label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="size-2 rounded-full bg-chart-1" />
        <span className="font-semibold text-foreground">
          {valueFormatter?.(value) ?? formatNumber(value)}
        </span>
      </div>
    </motion.div>
  );
}

export function InteractiveBarChart({
  className,
  size,
  data = defaultData,
  title = "Weekly activity",
  description = "Hover a bar to inspect the value",
  xKey = "label",
  yKey = "value",
  valueFormatter,
  labelFormatter,
  strokeWidth = 1.5,
  showDots = true,
  animated = true,
  showGrid = true,
  showTooltip = true,
  highlightActivePoint = true,
  gradient = true,
  motionDuration = 0.58,
  motionDelay = 0,
  height = 260,
  loading = false,
  emptyState,
  ...props
}: InteractiveBarChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId().replace(/:/g, "");
  const gradientId = `${generatedId}-bar-gradient`;
  const patternId = `${generatedId}-bar-pattern`;
  const chartData = useMemo(() => data, [data]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const resolvedAnimated = animated && !shouldReduceMotion;
  const latest = chartData.at(-1);
  const latestValue = latest ? getNumericValue(latest[yKey]) : 0;

  return (
    <div
      data-slot="interactive-bar-chart"
      role="img"
      aria-label={`${String(title)} bar chart with latest value ${formatNumber(
        latestValue,
      )}`}
      className={twMerge(interactiveBarChartVariants({ size }), className)}
      {...props}
    >
      <div
        data-slot="interactive-bar-chart-header"
        className="flex items-start justify-between gap-4 px-2 pb-2"
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="rounded-full border border-border/70 bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground">
          Inspect
        </span>
      </div>

      {loading ? (
        <ChartSkeleton height={height} />
      ) : chartData.length === 0 ? (
        <ChartEmpty>{emptyState}</ChartEmpty>
      ) : (
        <div
          data-slot="interactive-bar-chart-panel"
          className="overflow-hidden rounded-xl border border-border/60 bg-card p-2"
          style={{ height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 22, right: 12, bottom: 8, left: 0 }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity={0.95}
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity={0.58}
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
                    strokeWidth="0.75"
                    className="text-border"
                    opacity="0.4"
                  />
                </pattern>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={`url(#${patternId})`}
                opacity={showGrid ? 0.22 : 0}
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
              <YAxis hide width={0} domain={[0, "dataMax + 12"]} />
              {showTooltip ? (
                <Tooltip
                  cursor={{
                    fill: "var(--muted)",
                    opacity: highlightActivePoint ? 0.22 : 0,
                  }}
                  content={
                    <ChartTooltip
                      valueFormatter={valueFormatter}
                      labelFormatter={labelFormatter}
                    />
                  }
                />
              ) : null}
              <Bar
                dataKey={yKey}
                radius={[10, 10, 6, 6]}
                isAnimationActive={false}
                shape={(shapeProps: RechartsBarShapeProps) => (
                  <PremiumBarShape
                    {...shapeProps}
                    activeIndex={showDots ? activeIndex : null}
                    animated={resolvedAnimated}
                    gradient={gradient}
                    gradientId={gradientId}
                    strokeWidth={strokeWidth}
                    motionDuration={motionDuration}
                    motionDelay={motionDelay}
                    onActivate={setActiveIndex}
                    valueFormatter={valueFormatter}
                  />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export {
  ChartTooltip as InteractiveBarChartTooltip,
  PremiumBarShape as InteractiveBarChartShape,
};
