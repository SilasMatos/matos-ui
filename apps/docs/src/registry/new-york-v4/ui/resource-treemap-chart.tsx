"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ComponentProps, type ReactNode, useId, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { useChartInteraction } from "./chart-interaction";

export const resourceTreemapChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[400px]",
      md: "max-w-[600px]",
      lg: "max-w-[780px]",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "md" },
});

export type ResourceTreemapDatum = {
  label: string;
  value: number;
  unit?: string;
  tone?: string;
};

export type ResourceTreemapChartProps = ComponentProps<"div"> &
  VariantProps<typeof resourceTreemapChartVariants> & {
    data?: ResourceTreemapDatum[];
    title?: ReactNode;
    description?: ReactNode;
    valueFormatter?: (value: number, unit?: string) => string;
    animated?: boolean;
    showTooltip?: boolean;
    showLabels?: boolean;
    height?: number;
    motionDelay?: number;
  };

const defaultData: ResourceTreemapDatum[] = [
  { label: "JavaScript", value: 48, unit: "KB", tone: "chart-1" },
  { label: "Images", value: 28, unit: "KB", tone: "chart-2" },
  { label: "CSS", value: 12, unit: "KB", tone: "chart-4" },
  { label: "Fonts", value: 8, unit: "KB", tone: "chart-3" },
  { label: "Other", value: 4, unit: "KB", tone: "muted-foreground" },
];

const fallbackTones = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
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

type TileRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function layoutTreemap(
  values: number[],
  x: number,
  y: number,
  width: number,
  height: number,
): TileRect[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [{ x, y, w: width, h: height }];

  const total = values.reduce((s, v) => s + v, 0);
  let leftSum = 0;
  let splitIdx = 1;
  for (let i = 0; i < values.length - 1; i++) {
    leftSum += values[i];
    splitIdx = i + 1;
    if (leftSum / total >= 0.5) break;
  }

  const leftFraction = leftSum / total;
  const leftValues = values.slice(0, splitIdx);
  const rightValues = values.slice(splitIdx);

  if (width >= height) {
    const lw = width * leftFraction;
    return [
      ...layoutTreemap(leftValues, x, y, lw, height),
      ...layoutTreemap(rightValues, x + lw, y, width - lw, height),
    ];
  }

  const th = height * leftFraction;
  return [
    ...layoutTreemap(leftValues, x, y, width, th),
    ...layoutTreemap(rightValues, x, y + th, width, height - th),
  ];
}

export function ResourceTreemapChart({
  className,
  size,
  data = defaultData,
  title = "Resource Treemap",
  description = "Page weight breakdown by resource type",
  valueFormatter,
  animated = true,
  showTooltip = true,
  showLabels = true,
  height = 320,
  motionDelay = 0,
  ...props
}: ResourceTreemapChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const motionEnabled = animated && !shouldReduceMotion;

  const normalizedData = useMemo(
    () => data.filter((d) => Number.isFinite(d.value) && d.value > 0),
    [data],
  );
  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, normalizedData.length);

  const total = useMemo(
    () => normalizedData.reduce((s, d) => s + d.value, 0),
    [normalizedData],
  );

  const sorted = useMemo(
    () => [...normalizedData].sort((a, b) => b.value - a.value),
    [normalizedData],
  );

  const fmt = (d: ResourceTreemapDatum) => {
    if (valueFormatter) return valueFormatter(d.value, d.unit);
    return d.unit ? `${d.value}${d.unit}` : String(d.value);
  };

  // SVG layout
  const viewBoxWidth = 560;
  const viewBoxHeight = 320;
  const gap = 3;
  const outerPad = 0;

  const tiles = useMemo(() => {
    const values = sorted.map((d) => d.value);
    const rects = layoutTreemap(
      values,
      outerPad,
      outerPad,
      viewBoxWidth - outerPad * 2,
      viewBoxHeight - outerPad * 2,
    );
    return sorted.map((d, i) => ({
      ...d,
      i,
      originalIndex: normalizedData.indexOf(d),
      color: resolveTone(d.tone, i),
      rect: rects[i],
      percent: Math.round((d.value / total) * 100),
    }));
  }, [sorted, total, normalizedData]);

  const activePoint = activeIndex !== null ? tiles[activeIndex] : null;

  const tooltipWidth = 168;
  const tooltipHeight = 64;
  const tooltipX = activePoint
    ? clamp(
        activePoint.rect.x + activePoint.rect.w / 2 - tooltipWidth / 2,
        2,
        viewBoxWidth - tooltipWidth - 2,
      )
    : 0;
  const tooltipY = activePoint
    ? clamp(
        activePoint.rect.y + activePoint.rect.h / 2 - tooltipHeight - 10,
        2,
        viewBoxHeight - tooltipHeight - 2,
      )
    : 0;

  return (
    <div
      data-slot="resource-treemap-chart"
      className={twMerge(resourceTreemapChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="resource-treemap-chart-header" className="mb-3">
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
        data-slot="resource-treemap-chart-plot"
        className="overflow-hidden rounded-xl"
        style={{ height }}
      >
        {!motionEnabled || hasEnteredView ? (
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="size-full"
            role="img"
            aria-labelledby={`${id}-title`}
          >
            <title id={`${id}-title`}>{String(title)}</title>
            <defs>
              {tiles.map((tile) => (
                <radialGradient
                  key={`grad-${tile.i}`}
                  id={`${id}-grad-${tile.i}`}
                  cx="30%"
                  cy="28%"
                  r="80%"
                >
                  <stop
                    offset="0%"
                    stopColor={`color-mix(in oklab, ${tile.color} 55%, white)`}
                  />
                  <stop offset="55%" stopColor={tile.color} />
                  <stop
                    offset="100%"
                    stopColor={`color-mix(in oklab, ${tile.color} 70%, black)`}
                  />
                </radialGradient>
              ))}
            </defs>

            {tiles.map((tile) => {
              const isActive = activeIndex === tile.i;
              const r = tile.rect;
              const rx = r.x + gap / 2;
              const ry = r.y + gap / 2;
              const rw = Math.max(0, r.w - gap);
              const rh = Math.max(0, r.h - gap);
              const cx = rx + rw / 2;
              const cy = ry + rh / 2;
              const isLargest = tile.i === 0;
              const showLabel = showLabels && rw > 60 && rh > 36;
              const showValue = rw > 60 && rh > 54;

              return (
                <motion.g
                  key={`tile-${tile.i}`}
                  data-slot="resource-treemap-chart-tile"
                  tabIndex={0}
                  role="button"
                  aria-label={`${tile.label}: ${fmt(tile)}, ${tile.percent}%`}
                  {...getItemProps(tile.i)}
                  className="outline-none"
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                  animate={{
                    scale: isActive ? 1.012 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                >
                  <motion.rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    rx="6"
                    fill={`url(#${id}-grad-${tile.i})`}
                    fillOpacity={isActive ? 1 : 0.88}
                    stroke="var(--background)"
                    strokeWidth="0"
                    initial={
                      motionEnabled
                        ? { scale: 0, opacity: 0 }
                        : { scale: 1, opacity: 0.88 }
                    }
                    animate={{ scale: 1, opacity: isActive ? 1 : 0.88 }}
                    transition={{
                      scale: {
                        delay: motionDelay + tile.i * 0.06,
                        type: "spring",
                        stiffness: 180,
                        damping: 20,
                      },
                      opacity: {
                        delay: motionDelay + tile.i * 0.06,
                        duration: 0.32,
                      },
                    }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />

                  {/* Highlight edge on active */}
                  {isActive ? (
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      rx="6"
                      fill="none"
                      stroke="white"
                      strokeOpacity="0.25"
                      strokeWidth="1.5"
                      pointerEvents="none"
                    />
                  ) : null}

                  {/* Percentage badge for large tiles */}
                  {isLargest && rw > 100 ? (
                    <motion.text
                      x={rx + 10}
                      y={ry + 18}
                      fill="white"
                      fillOpacity="0.55"
                      className="text-[11px] font-semibold tabular-nums"
                      initial={motionEnabled ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ delay: motionDelay + 0.5, duration: 0.3 }}
                    >
                      {tile.percent}%
                    </motion.text>
                  ) : null}

                  {showLabel ? (
                    <motion.text
                      x={cx}
                      y={showValue ? cy - 8 : cy + 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fillOpacity="0.92"
                      className="text-[12px] font-semibold"
                      initial={motionEnabled ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: motionDelay + tile.i * 0.06 + 0.32,
                        duration: 0.28,
                      }}
                    >
                      {tile.label}
                    </motion.text>
                  ) : null}

                  {showValue ? (
                    <motion.text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fillOpacity="0.65"
                      className="text-[11px] font-medium tabular-nums"
                      initial={motionEnabled ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: motionDelay + tile.i * 0.06 + 0.4,
                        duration: 0.28,
                      }}
                    >
                      {fmt(tile)}
                    </motion.text>
                  ) : null}
                </motion.g>
              );
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && activePoint ? (
                <motion.g
                  data-slot="resource-treemap-chart-tooltip"
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
                  exit={{
                    opacity: 0,
                    x: tooltipX,
                    y: tooltipY + 4,
                    scale: 0.97,
                  }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="10"
                    fill="var(--popover)"
                    stroke="var(--border)"
                  />
                  <circle cx="14" cy="18" r="4.5" fill={activePoint.color} />
                  <text
                    x="26"
                    y="22"
                    fill="var(--popover-foreground)"
                    className="text-[12px] font-semibold"
                  >
                    {activePoint.label}
                  </text>
                  <text
                    x="14"
                    y="40"
                    fill="var(--muted-foreground)"
                    className="text-[10.5px] font-medium"
                  >
                    Size
                  </text>
                  <text
                    x={tooltipWidth - 14}
                    y="40"
                    textAnchor="end"
                    fill="var(--popover-foreground)"
                    className="text-[10.5px] font-semibold tabular-nums"
                  >
                    {fmt(activePoint)}
                  </text>
                  <text
                    x="14"
                    y="54"
                    fill="var(--muted-foreground)"
                    className="text-[10.5px] font-medium"
                  >
                    Share
                  </text>
                  <text
                    x={tooltipWidth - 14}
                    y="54"
                    textAnchor="end"
                    fill="var(--popover-foreground)"
                    className="text-[10.5px] font-semibold tabular-nums"
                  >
                    {activePoint.percent}%
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
