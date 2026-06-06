"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  type RadialBarSectorProps,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const radialMetricChartVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2 text-foreground shadow-sm",
  ],
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[420px]",
      lg: "max-w-[520px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type RadialMetricChartProps = ComponentProps<"div"> &
  VariantProps<typeof radialMetricChartVariants> & {
    value?: number;
    max?: number;
    title?: ReactNode;
    description?: ReactNode;
    label?: ReactNode;
    valueFormatter?: (value: number) => ReactNode;
    strokeWidth?: number;
    showDots?: boolean;
    animated?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    highlightActivePoint?: boolean;
    curveType?: "linear" | "monotoneX" | "natural";
    gradient?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    height?: number;
    loading?: boolean;
    emptyState?: ReactNode;
  };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      data-slot="radial-metric-chart-skeleton"
      className="grid place-items-center overflow-hidden rounded-xl border border-border/60 bg-card"
      style={{ height }}
    >
      <div className="size-36 animate-pulse rounded-full border-[18px] border-muted" />
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="radial-metric-chart-empty"
      className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 size-12 rounded-full border-[8px] border-muted" />
        <p className="text-sm font-medium text-foreground">No metric data</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide a value to render this radial metric chart."}
        </p>
      </div>
    </div>
  );
}

type RadialSectorShapeProps = RadialBarSectorProps & {
  animated?: boolean;
  gradientId?: string;
  motionDuration?: number;
  motionDelay?: number;
  highlightActivePoint?: boolean;
};

function RadialSectorShape({
  animated = true,
  gradientId,
  motionDuration = 0.8,
  motionDelay = 0,
  highlightActivePoint = true,
  ...props
}: RadialSectorShapeProps) {
  return (
    <motion.g
      data-slot="radial-metric-chart-sector"
      initial={animated ? { opacity: 0, scale: 0.94, rotate: -8 } : false}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: motionDuration,
        delay: motionDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        transformOrigin: `${props.cx ?? 0}px ${props.cy ?? 0}px`,
      }}
    >
      <Sector
        {...props}
        fill={gradientId ? `url(#${gradientId})` : "currentColor"}
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.94}
      />
      {highlightActivePoint ? (
        <Sector
          {...props}
          innerRadius={Number(props.outerRadius ?? 0) - 2}
          outerRadius={Number(props.outerRadius ?? 0) + 3}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.24}
        />
      ) : null}
    </motion.g>
  );
}

type ChartTooltipProps = Partial<TooltipContentProps> & {
  valueFormatter?: (value: number) => ReactNode;
};

function ChartTooltip({ active, payload, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0]?.value ?? 0);

  return (
    <motion.div
      data-slot="radial-metric-chart-tooltip"
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
    >
      <p className="text-[11px] font-medium text-muted-foreground">
        Current metric
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="size-2 rounded-full bg-chart-2" />
        <span className="font-semibold text-foreground">
          {valueFormatter?.(value) ?? formatPercent(value)}
        </span>
      </div>
    </motion.div>
  );
}

function RingOverlay({
  progress,
  strokeWidth,
  showDots,
  animated,
  gradientId,
  motionDuration,
  motionDelay,
}: {
  progress: number;
  strokeWidth: number;
  showDots: boolean;
  animated: boolean;
  gradientId: string;
  motionDuration: number;
  motionDelay: number;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const endAngle = -90 + progress * 3.6;
  const endX = 60 + Math.cos((endAngle * Math.PI) / 180) * radius;
  const endY = 60 + Math.sin((endAngle * Math.PI) / 180) * radius;

  return (
    <motion.svg
      data-slot="radial-metric-chart-svg-overlay"
      viewBox="0 0 120 120"
      className="pointer-events-none absolute inset-0 size-full -rotate-90 text-chart-2"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
        opacity={0.7}
      />
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={
          animated ? { strokeDashoffset: circumference, opacity: 0 } : false
        }
        animate={{ strokeDashoffset: offset, opacity: 1 }}
        transition={{
          duration: motionDuration,
          delay: motionDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
      {showDots ? (
        <motion.circle
          cx={endX}
          cy={endY}
          r={3.5}
          fill="currentColor"
          initial={animated ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: motionDelay + motionDuration,
            duration: 0.24,
            ease: "easeOut",
          }}
        />
      ) : null}
    </motion.svg>
  );
}

function AnimatedPercentValue({
  value,
  formatter,
  animated,
}: {
  value: number;
  formatter?: (value: number) => ReactNode;
  animated: boolean;
}) {
  const display = useAnimatedValue(value, animated);

  return (
    <span className="text-3xl font-semibold leading-none text-foreground">
      {formatter?.(display) ?? formatPercent(display)}
    </span>
  );
}

function useAnimatedValue(value: number, animated: boolean) {
  const [display, setDisplay] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 720;

    function tick(now: number) {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [animated, value]);

  return display;
}

export function RadialMetricChart({
  className,
  size,
  value = 78,
  max = 100,
  title = "Deployment health",
  description = "Release readiness",
  label = "Ready",
  valueFormatter,
  strokeWidth = 8,
  showDots = true,
  animated = true,
  showGrid = true,
  showTooltip = true,
  highlightActivePoint = true,
  gradient = true,
  motionDuration = 0.82,
  motionDelay = 0,
  height = 280,
  loading = false,
  emptyState,
  ...props
}: RadialMetricChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId().replace(/:/g, "");
  const gradientId = `${generatedId}-radial-gradient`;
  const patternId = `${generatedId}-radial-pattern`;
  const progress = clamp((value / max) * 100, 0, 100);
  const resolvedAnimated = animated && !shouldReduceMotion;
  const chartData = [{ name: String(label), value: progress }];

  return (
    <div
      data-slot="radial-metric-chart"
      role="img"
      aria-label={`${String(title)} radial metric at ${formatPercent(progress)}`}
      className={twMerge(radialMetricChartVariants({ size }), className)}
      {...props}
    >
      <div
        data-slot="radial-metric-chart-header"
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
          Metric
        </span>
      </div>

      {loading ? (
        <ChartSkeleton height={height} />
      ) : Number.isNaN(progress) ? (
        <ChartEmpty>{emptyState}</ChartEmpty>
      ) : (
        <div
          data-slot="radial-metric-chart-panel"
          className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-3"
          style={{ height }}
        >
          <svg className="absolute size-0" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-2)"
                  stopOpacity={gradient ? 0.72 : 1}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-1)"
                  stopOpacity={1}
                />
              </linearGradient>
              <pattern
                id={patternId}
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="1"
                  cy="1"
                  r="1"
                  fill="currentColor"
                  className="text-border"
                  opacity="0.55"
                />
              </pattern>
            </defs>
          </svg>
          {showGrid ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-xl opacity-40"
              style={{ backgroundImage: `url(#${patternId})` }}
            />
          ) : null}
          <div className="relative mx-auto aspect-square h-full max-h-[232px] text-chart-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%"
                outerRadius="88%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                {showTooltip ? (
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltip valueFormatter={valueFormatter} />}
                  />
                ) : null}
                <RadialBar
                  dataKey="value"
                  cornerRadius={16}
                  background={{
                    fill: "var(--muted)",
                    opacity: 0.65,
                  }}
                  fill="currentColor"
                  isAnimationActive={resolvedAnimated}
                  animationBegin={motionDelay * 1000}
                  animationDuration={motionDuration * 1000}
                  shape={(shapeProps: RadialSectorShapeProps) => (
                    <RadialSectorShape
                      {...shapeProps}
                      animated={resolvedAnimated}
                      gradientId={gradient ? gradientId : undefined}
                      motionDuration={motionDuration}
                      motionDelay={motionDelay}
                      highlightActivePoint={highlightActivePoint}
                    />
                  )}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <RingOverlay
              progress={progress}
              strokeWidth={strokeWidth}
              showDots={showDots}
              animated={resolvedAnimated}
              gradientId={gradientId}
              motionDuration={motionDuration}
              motionDelay={motionDelay}
            />
            <div
              data-slot="radial-metric-chart-label"
              className="absolute inset-0 grid place-items-center text-center"
            >
              <div>
                <AnimatedPercentValue
                  value={progress}
                  formatter={valueFormatter}
                  animated={resolvedAnimated}
                />
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export {
  ChartTooltip as RadialMetricChartTooltip,
  RadialSectorShape as RadialMetricChartSector,
};
