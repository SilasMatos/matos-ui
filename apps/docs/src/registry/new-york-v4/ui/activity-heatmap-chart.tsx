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
import {
  chartAccentTransition,
  chartCascadeStep,
  chartDraw,
} from "./chart-motion";

export const activityHeatmapChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[460px]",
      md: "max-w-[680px]",
      lg: "max-w-[840px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ActivityHeatmapDatum = {
  value: number;
  label?: string;
};

export type ActivityHeatmapChartProps = ComponentProps<"div"> &
  VariantProps<typeof activityHeatmapChartVariants> & {
    data?: ActivityHeatmapDatum[];
    title?: ReactNode;
    description?: ReactNode;
    monthLabels?: string[];
    dayLabels?: string[];
    tone?: string;
    max?: number;
    weeks?: number;
    valueFormatter?: (value: number) => ReactNode;
    animated?: boolean;
    showTooltip?: boolean;
    showLegend?: boolean;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (item: ActivityHeatmapDatum, index: number) => void;
  };

const DAYS = 7;

// Deterministic default pattern so SSR and client render identically.
function buildDefaultData(weeks: number): ActivityHeatmapDatum[] {
  const total = weeks * DAYS;
  return Array.from({ length: total }, (_, index) => {
    const wave = Math.sin(index * 0.7) + Math.cos(index * 0.27);
    const ramp = index / total;
    const raw = (wave + 1.6) * 2.1 * (0.45 + ramp);
    const value = Math.max(0, Math.round(raw)) % 11;
    return { value };
  });
}

const defaultMonthLabels = ["Jan", "Feb", "Mar", "Apr"];
const defaultDayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

function ChartSkeleton({ weeks }: { weeks: number }) {
  return (
    <div
      data-slot="activity-heatmap-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-5"
    >
      <div className="flex gap-1.5">
        {Array.from({ length: weeks }).map((_, column) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed skeleton grid
            key={column}
            className="flex flex-col gap-1.5"
          >
            {Array.from({ length: DAYS }).map((__, row) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed skeleton grid
                key={row}
                className="size-3 animate-pulse rounded-[3px] bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="activity-heatmap-chart-empty"
      className="grid min-h-56 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-60">
        <div className="mx-auto mb-4 grid w-fit grid-cols-4 gap-1 rounded-xl border border-border bg-muted p-2.5">
          {Array.from({ length: 12 }).map((_, cell) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed empty grid
              key={cell}
              className="size-2 rounded-[2px] bg-muted-foreground/30"
            />
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">No activity yet</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide activity values to render this heatmap."}
        </p>
      </div>
    </div>
  );
}

export function ActivityHeatmapChart({
  className,
  size,
  data,
  title = "Activity Heatmap",
  description = "Daily engagement over the last weeks",
  monthLabels = defaultMonthLabels,
  dayLabels = defaultDayLabels,
  tone = "chart-2",
  max,
  weeks = 18,
  valueFormatter,
  animated = true,
  showTooltip = true,
  showLegend = true,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: ActivityHeatmapChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const resolvedData = useMemo(
    () => data ?? buildDefaultData(weeks),
    [data, weeks],
  );
  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, resolvedData.length);

  const columns = Math.max(1, Math.ceil(resolvedData.length / DAYS));
  const safeMax = useMemo(() => {
    if (max && max > 0) {
      return max;
    }
    return Math.max(1, ...resolvedData.map((item) => item.value));
  }, [max, resolvedData]);

  const total = useMemo(
    () => resolvedData.reduce((sum, item) => sum + Math.max(0, item.value), 0),
    [resolvedData],
  );

  const activeItem = activeIndex === null ? null : resolvedData[activeIndex];

  useEffect(() => {
    if (activeItem && activeIndex !== null) {
      onActiveChange?.(activeItem, activeIndex);
    }
  }, [activeIndex, activeItem, onActiveChange]);

  const motionEnabled = animated && !shouldReduceMotion;
  const accent = resolveTone(tone);

  if (loading) {
    return (
      <div
        data-slot="activity-heatmap-chart"
        className={twMerge(activityHeatmapChartVariants({ size }), className)}
        {...props}
      >
        <ChartSkeleton weeks={columns} />
      </div>
    );
  }

  if (!resolvedData.length) {
    return (
      <div
        data-slot="activity-heatmap-chart"
        className={twMerge(activityHeatmapChartVariants({ size }), className)}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const cell = 15;
  const gap = 4;
  const pitch = cell + gap;
  const leftGutter = 30;
  const topGutter = 18;
  const gridWidth = columns * pitch - gap;
  const gridHeight = DAYS * pitch - gap;
  const viewBoxWidth = leftGutter + gridWidth + 4;
  const viewBoxHeight = topGutter + gridHeight + 6;

  // Levels: 0 = empty track, 1..4 increasing intensity.
  const levelOpacity = [0.16, 0.34, 0.58, 0.82, 1];

  function levelFor(value: number) {
    if (value <= 0) {
      return 0;
    }
    return clamp(Math.ceil((value / safeMax) * 4), 1, 4);
  }

  const cells = resolvedData.map((item, index) => {
    const column = Math.floor(index / DAYS);
    const row = index % DAYS;
    const x = leftGutter + column * pitch;
    const y = topGutter + row * pitch;
    const level = levelFor(item.value);
    return { ...item, index, column, row, x, y, level };
  });

  const active =
    activeIndex === null ? null : cells.find((c) => c.index === activeIndex);

  const tooltipWidth = 150;
  const tooltipHeight = 46;
  const tooltipX = active
    ? clamp(
        active.x + cell / 2 - tooltipWidth / 2,
        2,
        viewBoxWidth - tooltipWidth - 2,
      )
    : 0;
  const tooltipY = active ? clamp(active.y - tooltipHeight - 8, 2, 9999) : 0;

  return (
    <div
      data-slot="activity-heatmap-chart"
      className={twMerge(activityHeatmapChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="activity-heatmap-chart-header" className="mb-3">
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
        data-slot="activity-heatmap-chart-plot"
        className="overflow-hidden"
        style={{ color: accent }}
      >
        {!motionEnabled || hasEnteredView ? (
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full"
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
          >
            <title id={`${id}-title`}>{String(title)}</title>
            <desc id={`${id}-desc`}>
              Activity heatmap with {cells.length} days across {columns} weeks.
              Total activity: {total}.
            </desc>

            {monthLabels.map((label, monthIndex) => {
              const column = Math.round(
                (monthIndex * columns) / monthLabels.length,
              );
              return (
                <text
                  key={`${label}-${column}`}
                  x={leftGutter + column * pitch}
                  y={topGutter - 6}
                  className="fill-muted-foreground text-[9px] font-medium"
                >
                  {label}
                </text>
              );
            })}

            {dayLabels.map((label, row) =>
              label ? (
                <text
                  key={label}
                  x={leftGutter - 8}
                  y={topGutter + row * pitch + cell - 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px] font-medium"
                >
                  {label}
                </text>
              ) : null,
            )}

            {cells.map((c) => {
              const isActive = activeIndex === c.index;
              const isEmpty = c.level === 0;

              return (
                <motion.rect
                  key={c.index}
                  x={c.x}
                  y={c.y}
                  width={cell}
                  height={cell}
                  rx="3.5"
                  fill={isEmpty ? "var(--muted)" : "currentColor"}
                  fillOpacity={isEmpty ? 0.5 : levelOpacity[c.level]}
                  stroke={isActive ? "currentColor" : "var(--border)"}
                  strokeOpacity={isActive ? 0.9 : 0.4}
                  strokeWidth={isActive ? 1.5 : 0.75}
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.label ?? `Day ${c.index + 1}`}: ${c.value}`}
                  {...getItemProps(c.index)}
                  initial={motionEnabled ? { opacity: 0, scale: 0.3 } : false}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.16 : 1,
                  }}
                  transition={{
                    opacity: {
                      ...chartDraw(0.32),
                      delay: motionEnabled
                        ? motionDelay + (c.column + c.row) * chartCascadeStep
                        : 0,
                    },
                    scale: isActive
                      ? chartAccentTransition
                      : {
                          ...chartDraw(0.32),
                          delay: motionEnabled
                            ? motionDelay +
                              (c.column + c.row) * chartCascadeStep
                            : 0,
                        },
                  }}
                  style={{
                    transformOrigin: `${c.x + cell / 2}px ${c.y + cell / 2}px`,
                    cursor: "pointer",
                  }}
                  className="outline-none"
                />
              );
            })}

            <AnimatePresence>
              {showTooltip && active ? (
                <motion.g
                  data-slot="activity-heatmap-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? { opacity: 0, y: tooltipY + 6, scale: 0.96 }
                      : false
                  }
                  animate={{ opacity: 1, y: tooltipY, scale: 1 }}
                  exit={{ opacity: 0, y: tooltipY + 4, scale: 0.96 }}
                  transition={spring.fast}
                  style={{ transformOrigin: `${tooltipX}px ${tooltipY}px` }}
                >
                  <rect
                    x={tooltipX}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="10"
                    fill="var(--popover)"
                    stroke="var(--border)"
                  />
                  <text
                    x={tooltipX + 12}
                    y={18}
                    fill="var(--popover-foreground)"
                    className="text-[11px] font-semibold tabular-nums"
                  >
                    {getTextValue(active.value, valueFormatter)}
                  </text>
                  <text
                    x={tooltipX + 12}
                    y={34}
                    fill="var(--muted-foreground)"
                    className="text-[10px] font-medium"
                  >
                    {active.label ?? `Week ${active.column + 1}`}
                  </text>
                  <rect
                    x={tooltipX + tooltipWidth - 26}
                    y={tooltipHeight / 2 - 7}
                    width="14"
                    height="14"
                    rx="3"
                    fill="currentColor"
                    fillOpacity={levelOpacity[active.level]}
                  />
                </motion.g>
              ) : null}
            </AnimatePresence>
          </svg>
        ) : null}
      </div>

      {showLegend ? (
        <div
          data-slot="activity-heatmap-chart-legend"
          className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground"
        >
          <span>
            {columns} weeks {"·"} {DAYS * columns} days
          </span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: accent }}
          >
            Less
            {levelOpacity.map((opacity, level) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed legend scale
                key={level}
                className="size-2.5 rounded-[2px]"
                style={{
                  backgroundColor:
                    level === 0 ? "var(--muted)" : "currentColor",
                  opacity: level === 0 ? 0.5 : opacity,
                }}
              />
            ))}
            More
          </span>
        </div>
      ) : null}
    </div>
  );
}

function getTextValue(value: number, formatter?: (value: number) => ReactNode) {
  const formatted = formatter?.(value) ?? value;
  if (typeof formatted === "number" || typeof formatted === "string") {
    return String(formatted);
  }
  return String(value);
}
