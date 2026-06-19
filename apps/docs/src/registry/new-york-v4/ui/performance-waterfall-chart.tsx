"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const performanceWaterfallChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[460px]",
      md: "max-w-[680px]",
      lg: "max-w-[840px]",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "md" },
});

export type PerformanceWaterfallDatum = {
  label: string;
  start: number;
  duration: number;
  tone?: string;
};

export type PerformanceWaterfallChartProps = ComponentProps<"div"> &
  VariantProps<typeof performanceWaterfallChartVariants> & {
    data?: PerformanceWaterfallDatum[];
    title?: ReactNode;
    description?: ReactNode;
    markerLabel?: string;
    markerAt?: number;
    valueFormatter?: (ms: number) => string;
    animated?: boolean;
    showTooltip?: boolean;
    showMarker?: boolean;
    height?: number;
    motionDelay?: number;
    loading?: boolean;
  };

const defaultData: PerformanceWaterfallDatum[] = [
  { label: "DNS Lookup", start: 0, duration: 28, tone: "chart-2" },
  { label: "TLS / SSL", start: 28, duration: 42, tone: "chart-4" },
  { label: "TTFB", start: 70, duration: 186, tone: "chart-3" },
  { label: "HTML Parse", start: 256, duration: 94, tone: "chart-2" },
  { label: "JS Bundle", start: 350, duration: 224, tone: "chart-1" },
  { label: "Images", start: 440, duration: 312, tone: "destructive" },
];

const fallbackTones = [
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-1)",
  "var(--destructive)",
  "var(--foreground)",
] as const;

function resolveTone(tone: string | undefined, index: number) {
  if (!tone) return fallbackTones[index % fallbackTones.length];
  if (
    tone.startsWith("var(") ||
    tone.startsWith("color-mix(") ||
    tone.startsWith("oklch(")
  )
    return tone;
  return `var(--${tone})`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function defaultFormatter(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

export function PerformanceWaterfallChart({
  className,
  size,
  data = defaultData,
  title = "Performance Waterfall",
  description = "Network resource timing breakdown",
  markerLabel = "LCP",
  markerAt,
  valueFormatter = defaultFormatter,
  animated = true,
  showTooltip = true,
  showMarker = true,
  height = 320,
  motionDelay = 0,
  loading = false,
  ...props
}: PerformanceWaterfallChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const motionEnabled = animated && !shouldReduceMotion;

  const normalizedData = useMemo(
    () =>
      data.filter(
        (d) =>
          Number.isFinite(d.start) &&
          Number.isFinite(d.duration) &&
          d.duration > 0,
      ),
    [data],
  );

  const totalTime = useMemo(
    () =>
      Math.max(1, ...normalizedData.map((d) => d.start + d.duration)) * 1.04,
    [normalizedData],
  );

  const slowestIndex = useMemo(() => {
    let maxDur = 0;
    let idx = 0;
    normalizedData.forEach((d, i) => {
      if (d.duration > maxDur) {
        maxDur = d.duration;
        idx = i;
      }
    });
    return idx;
  }, [normalizedData]);

  const n = normalizedData.length;

  // Layout constants
  const viewBoxWidth = 760;
  const labelWidth = 110;
  const barStartX = labelWidth + 12;
  const rightPad = 20;
  const barAreaWidth = viewBoxWidth - barStartX - rightPad;
  const topGutter = 34;
  const rowPitch = n > 0 ? Math.min(48, Math.max(36, (height * 0.72) / n)) : 40;
  const barH = Math.round(rowPitch * 0.54);
  const bottomGutter = 50;
  const viewBoxHeight = topGutter + n * rowPitch + bottomGutter;
  const axisY = topGutter + n * rowPitch;

  const bars = normalizedData.map((d, i) => {
    const bx = barStartX + (d.start / totalTime) * barAreaWidth;
    const bw = Math.max(4, (d.duration / totalTime) * barAreaWidth);
    const by = topGutter + i * rowPitch + Math.round((rowPitch - barH) / 2);
    const color = resolveTone(d.tone, i);
    const isSlowest = i === slowestIndex;
    return { ...d, bx, bw, by, color, isSlowest, i };
  });

  const activeBar = activeIndex !== null ? bars[activeIndex] : null;
  const tooltipWidth = 176;
  const tooltipHeight = 70;
  const tooltipX = activeBar
    ? clamp(
        activeBar.bx + activeBar.bw / 2 - tooltipWidth / 2,
        barStartX,
        viewBoxWidth - tooltipWidth - rightPad,
      )
    : 0;
  const tooltipY = activeBar
    ? clamp(activeBar.by - tooltipHeight - 10, 4, viewBoxHeight - tooltipHeight)
    : 0;

  const markerX =
    markerAt != null ? barStartX + (markerAt / totalTime) * barAreaWidth : null;

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, t) => ({
    x: barStartX + (t / (tickCount - 1)) * barAreaWidth,
    label: valueFormatter((t / (tickCount - 1)) * totalTime),
  }));

  return (
    <div
      data-slot="performance-waterfall-chart"
      className={twMerge(
        performanceWaterfallChartVariants({ size }),
        className,
      )}
      {...props}
    >
      <div data-slot="performance-waterfall-chart-header" className="mb-3">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div
        data-slot="performance-waterfall-chart-plot"
        className="overflow-hidden"
        style={{ height }}
      >
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="size-full"
          role="img"
          aria-labelledby={`${id}-title`}
        >
          <title id={`${id}-title`}>{String(title)}</title>
          <defs>
            <filter id={`${id}-glow`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {bars.map((bar) => (
              <clipPath key={`clip-${bar.i}`} id={`${id}-bc-${bar.i}`}>
                <motion.rect
                  x={bar.bx}
                  y={bar.by - 2}
                  height={barH + 4}
                  initial={motionEnabled ? { width: 0 } : { width: bar.bw }}
                  animate={{ width: bar.bw }}
                  transition={{
                    delay: motionDelay + bar.i * 0.09,
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </clipPath>
            ))}
          </defs>

          {/* Row tracks */}
          {bars.map((bar) => (
            <rect
              key={`track-${bar.i}`}
              x={barStartX}
              y={bar.by}
              width={barAreaWidth}
              height={barH}
              rx={barH / 2}
              fill="var(--muted)"
              fillOpacity="0.35"
            />
          ))}

          {/* Grid lines */}
          {ticks.slice(1, -1).map((tick) => (
            <line
              key={`grid-${tick.x}`}
              x1={tick.x}
              x2={tick.x}
              y1={topGutter - 2}
              y2={axisY}
              stroke="var(--border)"
              strokeDasharray="3 7"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Bars */}
          {bars.map((bar) => {
            const isActive = activeIndex === bar.i;
            return (
              <motion.g
                key={`bar-${bar.i}`}
                data-slot="performance-waterfall-chart-bar"
                tabIndex={0}
                role="button"
                aria-label={`${bar.label}: ${valueFormatter(bar.start)} + ${valueFormatter(bar.duration)}`}
                onPointerEnter={() => setActiveIndex(bar.i)}
                onPointerLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(bar.i)}
                onBlur={() => setActiveIndex(null)}
                animate={{ opacity: isActive ? 1 : 0.78 }}
                transition={{ duration: 0.22 }}
                className="outline-none focus-visible:[filter:drop-shadow(0_0_0.2rem_currentColor)]"
                style={{ color: bar.color }}
              >
                {/* Step label */}
                <text
                  x={labelWidth - 4}
                  y={bar.by + barH / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={
                    isActive ? "var(--foreground)" : "var(--muted-foreground)"
                  }
                  className="text-[11.5px] font-medium"
                >
                  {bar.label}
                </text>

                {/* Glow ring behind slowest bar */}
                {bar.isSlowest && motionEnabled ? (
                  <motion.rect
                    x={bar.bx - 2}
                    y={bar.by - 2}
                    width={bar.bw + 4}
                    height={barH + 4}
                    rx={(barH + 4) / 2}
                    fill="currentColor"
                    fillOpacity="0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    animate={{ strokeOpacity: [0.2, 0.48, 0.2] }}
                    transition={{
                      duration: 2.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: motionDelay + 0.8,
                    }}
                  />
                ) : null}

                {/* Bar body */}
                <rect
                  x={bar.bx}
                  y={bar.by}
                  width={bar.bw}
                  height={barH}
                  rx={barH / 2}
                  fill="currentColor"
                  clipPath={`url(#${id}-bc-${bar.i})`}
                />

                {/* Duration label inside bar if wide enough */}
                {bar.bw > 52 ? (
                  <motion.text
                    x={bar.bx + bar.bw - 8}
                    y={bar.by + barH / 2 + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="var(--background)"
                    fillOpacity="0.85"
                    className="text-[10px] font-semibold tabular-nums"
                    initial={motionEnabled ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: motionDelay + bar.i * 0.09 + 0.45,
                      duration: 0.22,
                    }}
                    clipPath={`url(#${id}-bc-${bar.i})`}
                  >
                    {valueFormatter(bar.duration)}
                  </motion.text>
                ) : null}
              </motion.g>
            );
          })}

          {/* Baseline */}
          <line
            x1={barStartX}
            x2={barStartX + barAreaWidth}
            y1={axisY}
            y2={axisY}
            stroke="var(--border)"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Time axis ticks */}
          {ticks.map((tick, ti) => (
            <g key={`tick-${tick.label}-${tick.x.toFixed(2)}`}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={axisY}
                y2={axisY + 5}
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={tick.x}
                y={axisY + 17}
                textAnchor={
                  ti === 0 ? "start" : ti === tickCount - 1 ? "end" : "middle"
                }
                fill="var(--muted-foreground)"
                className="text-[10px] font-medium tabular-nums"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* LCP / milestone marker */}
          {showMarker && markerX !== null ? (
            <g data-slot="performance-waterfall-chart-marker">
              <motion.line
                x1={markerX}
                x2={markerX}
                y1={topGutter - 4}
                y2={axisY + 2}
                stroke="var(--foreground)"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                strokeLinecap="round"
                opacity="0.55"
                initial={motionEnabled ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 0.55 }}
                transition={{
                  delay: motionDelay + 0.7,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              <motion.text
                x={markerX + 5}
                y={topGutter - 8}
                fill="var(--foreground)"
                className="text-[10px] font-semibold"
                initial={motionEnabled ? { opacity: 0 } : false}
                animate={{ opacity: 0.72 }}
                transition={{ delay: motionDelay + 1.1, duration: 0.24 }}
              >
                {markerLabel}
              </motion.text>
              <circle
                cx={markerX}
                cy={topGutter - 4}
                r="3"
                fill="var(--foreground)"
                opacity="0.55"
              />
            </g>
          ) : null}

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && activeBar ? (
              <motion.g
                data-slot="performance-waterfall-chart-tooltip"
                pointerEvents="none"
                initial={
                  motionEnabled
                    ? {
                        opacity: 0,
                        x: tooltipX,
                        y: tooltipY + 6,
                        scale: 0.97,
                      }
                    : false
                }
                animate={{ opacity: 1, x: tooltipX, y: tooltipY, scale: 1 }}
                exit={{ opacity: 0, x: tooltipX, y: tooltipY + 4, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <rect
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="12"
                  fill="var(--popover)"
                  stroke="var(--border)"
                />
                <text
                  x="14"
                  y="22"
                  fill="var(--popover-foreground)"
                  className="text-[12px] font-semibold"
                >
                  {activeBar.label}
                </text>
                <line
                  x1="14"
                  x2={tooltipWidth - 14}
                  y1="30"
                  y2="30"
                  stroke="var(--border)"
                  opacity="0.5"
                />
                <text
                  x="14"
                  y="45"
                  fill="var(--muted-foreground)"
                  className="text-[11px] font-medium"
                >
                  Start
                </text>
                <text
                  x={tooltipWidth - 14}
                  y="45"
                  textAnchor="end"
                  fill="var(--popover-foreground)"
                  className="text-[11px] font-semibold tabular-nums"
                >
                  {valueFormatter(activeBar.start)}
                </text>
                <text
                  x="14"
                  y="60"
                  fill="var(--muted-foreground)"
                  className="text-[11px] font-medium"
                >
                  Duration
                </text>
                <text
                  x={tooltipWidth - 14}
                  y="60"
                  textAnchor="end"
                  fill="var(--popover-foreground)"
                  className="text-[11px] font-semibold tabular-nums"
                  style={{ fill: activeBar.color }}
                >
                  {valueFormatter(activeBar.duration)}
                </text>
              </motion.g>
            ) : null}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
