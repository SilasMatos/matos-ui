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

export const activityWaveformChartVariants = tv({
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

export type WaveformBar = number | { value: number; label?: string };

export type WaveformSegment = {
  label: string;
  value: number;
  tone?: string;
};

export type ActivityWaveformChartProps = ComponentProps<"div"> &
  VariantProps<typeof activityWaveformChartVariants> & {
    data?: WaveformBar[];
    title?: ReactNode;
    value?: ReactNode;
    valueCaption?: ReactNode;
    description?: ReactNode;
    segments?: WaveformSegment[];
    startLabel?: ReactNode;
    endLabel?: ReactNode;
    tone?: string;
    valueFormatter?: (value: number) => ReactNode;
    height?: number;
    animated?: boolean;
    showTooltip?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (value: number, index: number) => void;
  };

const fallbackTones = ["var(--chart-2)", "var(--chart-4)", "var(--chart-3)"];

// Deterministic default waveform so SSR and client stay in sync.
function buildDefaultData(count: number): number[] {
  return Array.from({ length: count }, (_, index) => {
    const wave =
      Math.sin(index * 0.55) * 0.5 +
      Math.sin(index * 0.21 + 1.3) * 0.32 +
      Math.cos(index * 0.9) * 0.18;
    return Math.round((wave + 1.2) * 38);
  });
}

const defaultSegments: WaveformSegment[] = [
  { label: "Credit card", value: 83, tone: "chart-2" },
  { label: "Cash", value: 17, tone: "chart-4" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

function barValue(bar: WaveformBar) {
  return typeof bar === "number" ? bar : bar.value;
}

function barLabel(bar: WaveformBar, index: number) {
  return typeof bar === "number"
    ? `#${index + 1}`
    : (bar.label ?? `#${index + 1}`);
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="activity-waveform-chart-empty"
      className="grid min-h-44 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-56">
        <div className="mx-auto mb-3 flex h-8 items-end justify-center gap-1">
          {[5, 8, 4, 7, 6].map((value, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed empty bars
              key={index}
              className="w-1 rounded-full bg-muted-foreground/40"
              style={{ height: value * 3 }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">No activity</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide a series of values to render this waveform."}
        </p>
      </div>
    </div>
  );
}

export function ActivityWaveformChart({
  className,
  size,
  data,
  title = "Sales activity",
  value = "−$3,245.00",
  valueCaption = "This week you spent",
  description,
  segments = defaultSegments,
  startLabel = "Mon",
  endLabel = "Sun",
  tone = "chart-2",
  valueFormatter,
  height = 150,
  animated = true,
  showTooltip = true,
  motionDuration = 0.5,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: ActivityWaveformChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const motionEnabled = animated && !shouldReduceMotion;
  const accent = resolveTone(tone, 0);

  const bars = useMemo(() => data ?? buildDefaultData(56), [data]);

  const peakIndex = useMemo(() => {
    let best = 0;
    for (let index = 1; index < bars.length; index += 1) {
      if (barValue(bars[index]) > barValue(bars[best])) {
        best = index;
      }
    }
    return best;
  }, [bars]);
  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, bars.length);

  useEffect(() => {
    if (activeIndex !== null) {
      onActiveChange?.(barValue(bars[activeIndex]), activeIndex);
    }
  }, [activeIndex, bars, onActiveChange]);

  const resolvedSegments = useMemo(
    () =>
      segments.map((segment, index) => ({
        ...segment,
        color: resolveTone(segment.tone, index),
      })),
    [segments],
  );
  const segmentsTotal = resolvedSegments.reduce(
    (sum, segment) => sum + Math.max(0, segment.value),
    0,
  );

  function format(input: number) {
    const formatted = valueFormatter?.(input);
    return formatted === undefined ? String(input) : formatted;
  }

  if (loading) {
    return (
      <div
        data-slot="activity-waveform-chart"
        className={twMerge(activityWaveformChartVariants({ size }), className)}
        {...props}
      >
        <div
          className="overflow-hidden rounded-xl border border-border/60 bg-card p-4"
          style={{ height: height + 70 }}
        >
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-8 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="mt-5 h-20 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!bars.length) {
    return (
      <div
        data-slot="activity-waveform-chart"
        className={twMerge(activityWaveformChartVariants({ size }), className)}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const viewBoxWidth = 720;
  const viewBoxHeight = 200;
  const plotTop = 14;
  const baseline = 176;
  const plotLeft = 6;
  const plotRight = 714;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = baseline - plotTop;
  const maxValue = Math.max(1, ...bars.map(barValue));
  const slot = plotWidth / bars.length;
  const barWidth = Math.max(2, slot * 0.55);

  const computed = bars.map((bar, index) => {
    const v = barValue(bar);
    const barHeight = Math.max(3, (v / maxValue) * plotHeight);
    return {
      value: v,
      label: barLabel(bar, index),
      index,
      x: plotLeft + slot * index + (slot - barWidth) / 2,
      y: baseline - barHeight,
      height: barHeight,
      centerX: plotLeft + slot * index + slot / 2,
    };
  });

  const active = activeIndex === null ? null : computed[activeIndex];
  const tooltipWidth = 92;
  const tooltipHeight = 30;
  const tooltipX = active
    ? clamp(
        active.centerX - tooltipWidth / 2,
        2,
        viewBoxWidth - tooltipWidth - 2,
      )
    : 0;
  const tooltipY = active ? clamp(active.y - tooltipHeight - 10, 2, 9999) : 0;

  return (
    <div
      data-slot="activity-waveform-chart"
      className={twMerge(activityWaveformChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="activity-waveform-chart-header" className="mb-3">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {valueCaption ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {valueCaption}
          </p>
        ) : null}
        {value ? (
          <p className="mt-0.5 text-3xl font-semibold leading-tight text-foreground tabular-nums">
            {value}
          </p>
        ) : null}
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div
        data-slot="activity-waveform-chart-plot"
        className="overflow-hidden"
        style={{ height, color: accent }}
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
              Activity waveform with {bars.length} samples. Peak value{" "}
              {format(computed[peakIndex].value)}.
            </desc>

            {computed.map((bar) => {
              const isActive = activeIndex === bar.index;
              return (
                <motion.rect
                  key={bar.index}
                  x={bar.x}
                  y={bar.y}
                  width={barWidth}
                  height={bar.height}
                  rx={Math.min(barWidth / 2, 3)}
                  fill="currentColor"
                  fillOpacity={isActive ? 1 : 0.85}
                  tabIndex={0}
                  role="button"
                  aria-label={`${bar.label}: ${format(bar.value)}`}
                  {...getItemProps(bar.index)}
                  initial={motionEnabled ? { scaleY: 0, opacity: 0 } : false}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{
                    duration: motionDuration,
                    delay: motionEnabled ? motionDelay + bar.index * 0.012 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    transformOrigin: `${bar.centerX}px ${baseline}px`,
                    cursor: "pointer",
                  }}
                  className="outline-none"
                />
              );
            })}

            <AnimatePresence>
              {showTooltip && active ? (
                <motion.g
                  data-slot="activity-waveform-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? { opacity: 0, y: tooltipY + 4, scale: 0.96 }
                      : false
                  }
                  animate={{ opacity: 1, y: tooltipY, scale: 1 }}
                  exit={{ opacity: 0, y: tooltipY + 4, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${tooltipX}px ${tooltipY}px` }}
                >
                  <rect
                    x={tooltipX}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="9"
                    fill="var(--popover)"
                    stroke="var(--border)"
                  />
                  <text
                    x={tooltipX + tooltipWidth / 2}
                    y={tooltipHeight / 2 + 4}
                    textAnchor="middle"
                    className="fill-popover-foreground text-[12px] font-semibold tabular-nums"
                  >
                    {format(active.value)}
                  </text>
                </motion.g>
              ) : null}
            </AnimatePresence>
          </svg>
        ) : null}
      </div>

      <div
        data-slot="activity-waveform-chart-axis"
        className="mt-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground"
      >
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>

      {resolvedSegments.length && segmentsTotal > 0 ? (
        <div data-slot="activity-waveform-chart-legend" className="mt-3">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {resolvedSegments.map((segment, index) => (
              <motion.span
                key={segment.label}
                className="block h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  backgroundColor: segment.color,
                  width: `${(segment.value / segmentsTotal) * 100}%`,
                }}
                initial={motionEnabled ? { scaleX: 0 } : false}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.5,
                  delay: motionDelay + 0.1 + index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {resolvedSegments.map((segment) => (
              <span
                key={segment.label}
                className="inline-flex items-center gap-1.5"
              >
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}
                <span className="font-medium text-foreground tabular-nums">
                  {Math.round((segment.value / segmentsTotal) * 100)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
