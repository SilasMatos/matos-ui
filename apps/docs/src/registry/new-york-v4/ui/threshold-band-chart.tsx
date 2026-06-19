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

export const thresholdBandChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[380px]",
      md: "max-w-[560px]",
      lg: "max-w-[720px]",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "md" },
});

export type ThresholdBand = {
  label: string;
  max?: number;
  tone?: string;
};

export type ThresholdBandChartProps = ComponentProps<"div"> &
  VariantProps<typeof thresholdBandChartVariants> & {
    bands?: ThresholdBand[];
    value?: number;
    title?: ReactNode;
    description?: ReactNode;
    totalMax?: number;
    unit?: string;
    valueFormatter?: (value: number) => string;
    animated?: boolean;
    showTooltip?: boolean;
    motionDelay?: number;
  };

const defaultBands: ThresholdBand[] = [
  { label: "Good", max: 2500, tone: "chart-2" },
  { label: "Needs improvement", max: 4000, tone: "oklch(0.75 0.16 70)" },
  { label: "Poor", tone: "destructive" },
];

function resolveTone(tone: string | undefined, fallback: string) {
  if (!tone) return fallback;
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

function defaultFormatter(v: number, unit: string) {
  if (unit === "ms") {
    return v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`;
  }
  return `${v}${unit}`;
}

export function ThresholdBandChart({
  className,
  size,
  bands = defaultBands,
  value = 2800,
  title = "LCP Threshold",
  description = "Largest Contentful Paint — how fast your page feels",
  totalMax,
  unit = "ms",
  valueFormatter,
  animated = true,
  showTooltip = true,
  motionDelay = 0,
  ...props
}: ThresholdBandChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const [activeBandIndex, setActiveBandIndex] = useState<number | null>(null);

  const motionEnabled = animated && !shouldReduceMotion;
  const fmt = (v: number) =>
    valueFormatter ? valueFormatter(v) : defaultFormatter(v, unit);

  // Normalize band maxes
  const resolvedBands = useMemo(() => {
    const maxes = bands.map((b) => b.max ?? null);
    // Auto total max = last defined max * 1.5
    const lastDefined = [...maxes].reverse().find((m) => m !== null);
    const auto = (lastDefined ?? 100) * 1.6;
    const safeTotal = totalMax ?? auto;

    let prev = 0;
    return bands.map((b) => {
      const end = b.max ?? safeTotal;
      const result = { ...b, start: prev, end, safeTotal };
      prev = end;
      return result;
    });
  }, [bands, totalMax]);

  const safeTotal = resolvedBands[resolvedBands.length - 1]?.safeTotal ?? 100;
  const safeValue = clamp(value, 0, safeTotal);

  // Current band index
  const currentBandIndex = useMemo(() => {
    for (let i = 0; i < resolvedBands.length - 1; i++) {
      if (safeValue <= resolvedBands[i].end) return i;
    }
    return resolvedBands.length - 1;
  }, [resolvedBands, safeValue]);

  const currentBand = resolvedBands[currentBandIndex];

  // SVG layout
  const viewBoxWidth = 560;
  const viewBoxHeight = 148;
  const bandAreaX = 12;
  const bandAreaW = viewBoxWidth - 24;
  const bandY = 56;
  const bandH = 28;
  const bandRx = bandH / 2;

  const markerX = bandAreaX + (safeValue / safeTotal) * bandAreaW;

  const tooltipWidth = 168;
  const tooltipHeight = 58;
  const tooltipX = clamp(
    markerX - tooltipWidth / 2,
    4,
    viewBoxWidth - tooltipWidth - 4,
  );
  const tooltipY = bandY + bandH + 24;

  const activeBand =
    activeBandIndex !== null ? resolvedBands[activeBandIndex] : null;

  return (
    <div
      data-slot="threshold-band-chart"
      className={twMerge(thresholdBandChartVariants({ size }), className)}
      {...props}
    >
      <div data-slot="threshold-band-chart-header" className="mb-3">
        <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div data-slot="threshold-band-chart-plot" className="overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full"
          role="img"
          aria-labelledby={`${id}-title`}
        >
          <title id={`${id}-title`}>{String(title)}</title>
          <defs>
            {resolvedBands.map((band, bi) => (
              <clipPath
                key={`clip-${band.label}-${band.start}-${band.end}`}
                id={`${id}-band-clip-${bi}`}
              >
                <motion.rect
                  x={bandAreaX + (band.start / safeTotal) * bandAreaW}
                  y={bandY - 2}
                  height={bandH + 4}
                  rx={bandRx}
                  initial={
                    motionEnabled
                      ? { width: 0 }
                      : {
                          width:
                            ((band.end - band.start) / safeTotal) * bandAreaW,
                        }
                  }
                  animate={{
                    width: ((band.end - band.start) / safeTotal) * bandAreaW,
                  }}
                  transition={{
                    delay: motionDelay + bi * 0.1,
                    duration: 0.64,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </clipPath>
            ))}
            <filter id={`${id}-glow`}>
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Band segments */}
          {resolvedBands.map((band, bi) => {
            const bx = bandAreaX + (band.start / safeTotal) * bandAreaW;
            const bw = ((band.end - band.start) / safeTotal) * bandAreaW;
            const tone = resolveTone(band.tone, "var(--muted-foreground)");
            const isActive = activeBandIndex === bi;
            const isCurrent = currentBandIndex === bi;

            return (
              <g
                key={`band-${band.label}-${band.start}-${band.end}`}
                onPointerEnter={() => setActiveBandIndex(bi)}
                onPointerLeave={() => setActiveBandIndex(null)}
                style={{ cursor: "default" }}
              >
                <rect
                  x={bx}
                  y={bandY}
                  width={bw}
                  height={bandH}
                  rx={bandRx}
                  fill={tone}
                  fillOpacity={
                    isCurrent ? (isActive ? 0.28 : 0.2) : isActive ? 0.16 : 0.1
                  }
                  clipPath={`url(#${id}-band-clip-${bi})`}
                />
                <motion.rect
                  x={bx}
                  y={bandY}
                  width={bw}
                  height={bandH}
                  rx={bandRx}
                  fill={tone}
                  fillOpacity={isCurrent ? 1 : 0.5}
                  stroke={isCurrent ? tone : "none"}
                  strokeWidth={isCurrent ? "0.5" : "0"}
                  clipPath={`url(#${id}-band-clip-${bi})`}
                  animate={{
                    fillOpacity: isCurrent
                      ? isActive
                        ? 0.82
                        : 0.62
                      : isActive
                        ? 0.45
                        : 0.3,
                  }}
                  transition={{ duration: 0.22 }}
                />
                {/* Band label above */}
                <motion.text
                  x={bx + bw / 2}
                  y={bandY - 10}
                  textAnchor="middle"
                  fill={tone}
                  fillOpacity={isCurrent ? 1 : 0.6}
                  className="text-[11px] font-semibold"
                  initial={motionEnabled ? { opacity: 0, y: bandY - 4 } : false}
                  animate={{ opacity: isCurrent ? 1 : 0.6, y: bandY - 10 }}
                  transition={{
                    delay: motionDelay + bi * 0.1 + 0.3,
                    duration: 0.28,
                  }}
                >
                  {band.label}
                </motion.text>
                {/* Band max label */}
                {bi < resolvedBands.length - 1 ? (
                  <text
                    x={bx + bw}
                    y={bandY + bandH + 14}
                    textAnchor="middle"
                    fill="var(--muted-foreground)"
                    className="text-[10px] font-medium tabular-nums"
                  >
                    {fmt(band.end)}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Value marker */}
          <motion.g
            data-slot="threshold-band-chart-marker"
            filter={`url(#${id}-glow)`}
            initial={
              motionEnabled
                ? { x: bandAreaX, opacity: 0 }
                : { x: markerX - 1, opacity: 1 }
            }
            animate={{ x: markerX - 1, opacity: 1 }}
            transition={{
              x: {
                delay: motionDelay + 0.5,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              },
              opacity: { delay: motionDelay + 0.5, duration: 0.32 },
            }}
          >
            {/* Vertical line */}
            <line
              x1="1"
              x2="1"
              y1={bandY - 3}
              y2={bandY + bandH + 3}
              stroke="var(--foreground)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Top diamond */}
            <polygon
              points="1,-4 5,0 1,4 -3,0"
              transform={`translate(0 ${bandY - 7})`}
              fill="var(--foreground)"
            />
            {/* Bottom label */}
            <text
              x="1"
              y={bandY + bandH + 26}
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[12.5px] font-semibold tabular-nums"
            >
              {fmt(safeValue)}
            </text>
          </motion.g>

          {/* Active band tooltip */}
          <AnimatePresence>
            {showTooltip && activeBand ? (
              <motion.g
                data-slot="threshold-band-chart-tooltip"
                pointerEvents="none"
                initial={
                  motionEnabled
                    ? { opacity: 0, x: tooltipX, y: tooltipY + 5, scale: 0.97 }
                    : false
                }
                animate={{ opacity: 1, x: tooltipX, y: tooltipY, scale: 1 }}
                exit={{ opacity: 0, x: tooltipX, y: tooltipY + 3, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <rect
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="10"
                  fill="var(--popover)"
                  stroke="var(--border)"
                />
                <text
                  x="12"
                  y="22"
                  fill="var(--popover-foreground)"
                  className="text-[11px] font-semibold"
                >
                  {activeBand.label}
                </text>
                <text
                  x="12"
                  y="40"
                  fill="var(--muted-foreground)"
                  className="text-[10px] font-medium"
                >
                  Range
                </text>
                <text
                  x={tooltipWidth - 12}
                  y="40"
                  textAnchor="end"
                  fill="var(--popover-foreground)"
                  className="text-[10px] font-semibold tabular-nums"
                >
                  {activeBand.start === 0 ? "0" : fmt(activeBand.start)}
                  {" – "}
                  {activeBandIndex === resolvedBands.length - 1
                    ? "∞"
                    : fmt(activeBand.end)}
                </text>
                <text
                  x="12"
                  y="52"
                  fill="var(--muted-foreground)"
                  className="text-[10px] font-medium"
                >
                  Current value
                </text>
                <text
                  x={tooltipWidth - 12}
                  y="52"
                  textAnchor="end"
                  fill={resolveTone(
                    currentBand?.tone,
                    "var(--muted-foreground)",
                  )}
                  className="text-[10px] font-semibold tabular-nums"
                >
                  {fmt(safeValue)}
                </text>
              </motion.g>
            ) : null}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
