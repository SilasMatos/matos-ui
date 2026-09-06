"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ComponentProps, type ReactNode, useId, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { useChartInteraction } from "./chart-interaction";
import {
  chartAccentTransition,
  chartDraw,
  chartStaggerStep,
} from "./chart-motion";

export const scoreRadarChartVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[360px]",
      md: "max-w-[500px]",
      lg: "max-w-[640px]",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "md" },
});

export type ScoreRadarDatum = {
  label: string;
  value: number;
};

export type ScoreRadarChartProps = ComponentProps<"div"> &
  VariantProps<typeof scoreRadarChartVariants> & {
    data?: ScoreRadarDatum[];
    comparison?: ScoreRadarDatum[];
    title?: ReactNode;
    description?: ReactNode;
    tone?: string;
    comparisonTone?: string;
    maxValue?: number;
    rings?: number;
    animated?: boolean;
    showTooltip?: boolean;
    showLabels?: boolean;
    showRingValues?: boolean;
    motionDelay?: number;
  };

const defaultData: ScoreRadarDatum[] = [
  { label: "Performance", value: 92 },
  { label: "SEO", value: 98 },
  { label: "Best Practices", value: 91 },
  { label: "Accessibility", value: 87 },
];

function resolveTone(tone: string) {
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

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildPolygon(
  data: ScoreRadarDatum[],
  cx: number,
  cy: number,
  maxR: number,
  maxValue: number,
): string {
  const n = data.length;
  return `${data
    .map((d, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const r = (clamp(d.value, 0, maxValue) / maxValue) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, angle);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ")} Z`;
}

function buildGridPolygon(
  n: number,
  cx: number,
  cy: number,
  r: number,
): string {
  return `${Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const { x, y } = polarToCartesian(cx, cy, r, angle);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ")} Z`;
}

export function ScoreRadarChart({
  className,
  size,
  data = defaultData,
  comparison,
  title = "Score Radar",
  description = "Multi-axis quality score overview",
  tone = "chart-2",
  comparisonTone = "muted-foreground",
  maxValue = 100,
  rings = 5,
  animated = true,
  showTooltip = true,
  showLabels = true,
  showRingValues = false,
  motionDelay = 0,
  ...props
}: ScoreRadarChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const motionEnabled = animated && !shouldReduceMotion;
  const accent = resolveTone(tone);
  const n = data.length;
  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, n);

  // SVG layout
  const viewBoxWidth = 400;
  const viewBoxHeight = 380;
  const cx = 200;
  const cy = 188;
  const maxR = 128;
  const labelR = maxR + 24;
  const ringRadii = Array.from(
    { length: rings },
    (_, ring) => ((ring + 1) / rings) * maxR,
  );

  const polygon = useMemo(
    () => buildPolygon(data, cx, cy, maxR, maxValue),
    [data, maxValue],
  );

  const comparisonPolygon = useMemo(
    () =>
      comparison ? buildPolygon(comparison, cx, cy, maxR, maxValue) : null,
    [comparison, maxValue],
  );

  const vertices = useMemo(() => {
    return data.map((d, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const vr = (clamp(d.value, 0, maxValue) / maxValue) * maxR;
      const { x: vx, y: vy } = polarToCartesian(cx, cy, vr, angle);
      const { x: lx, y: ly } = polarToCartesian(cx, cy, labelR, angle);
      const { x: ax, y: ay } = polarToCartesian(cx, cy, maxR, angle);
      // Determine text anchor based on angle
      const cosAngle = Math.cos(angle);
      const textAnchor: "middle" | "start" | "end" =
        Math.abs(cosAngle) < 0.18 ? "middle" : cosAngle > 0 ? "start" : "end";
      const dy = Math.sin(angle) < -0.12 ? -4 : Math.sin(angle) > 0.12 ? 12 : 4;
      return { ...d, i, angle, vx, vy, lx, ly, ax, ay, textAnchor, dy };
    });
  }, [data, n, maxValue, labelR]);

  const activeVertex = activeIndex !== null ? vertices[activeIndex] : null;

  const tooltipWidth = 152;
  const tooltipHeight = 54;
  const tooltipX = activeVertex
    ? clamp(
        activeVertex.vx - tooltipWidth / 2,
        4,
        viewBoxWidth - tooltipWidth - 4,
      )
    : 0;
  const tooltipY = activeVertex
    ? clamp(
        activeVertex.vy - tooltipHeight - 18,
        4,
        viewBoxHeight - tooltipHeight - 4,
      )
    : 0;

  return (
    <div
      data-slot="score-radar-chart"
      className={twMerge(scoreRadarChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="score-radar-chart-header" className="mb-3">
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
        data-slot="score-radar-chart-plot"
        className="overflow-hidden"
        style={{ color: accent }}
      >
        {!motionEnabled || hasEnteredView ? (
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full"
            role="img"
            aria-labelledby={`${id}-title`}
          >
            <title id={`${id}-title`}>{String(title)}</title>
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0.06"
                />
              </linearGradient>
            </defs>

            {/* Grid rings */}
            {ringRadii.map((r) => {
              const gridPoly = buildGridPolygon(n, cx, cy, r);
              const isOuter = r === maxR;
              return (
                <path
                  key={`ring-${r}`}
                  d={gridPoly}
                  fill={isOuter ? "var(--muted)" : "none"}
                  fillOpacity={isOuter ? 0.08 : 0}
                  stroke="var(--border)"
                  strokeWidth="1"
                  opacity={isOuter ? 0.7 : 0.38}
                />
              );
            })}

            {/* Axis spokes */}
            {vertices.map((v) => (
              <line
                key={`spoke-${v.i}`}
                x1={cx}
                y1={cy}
                x2={v.ax}
                y2={v.ay}
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.45"
              />
            ))}

            {/* Ring value labels */}
            {showRingValues
              ? ringRadii.map((r) => {
                  const val = Math.round((r / maxR) * maxValue);
                  return (
                    <text
                      key={`rv-${r}`}
                      x={cx + 3}
                      y={cy - r + 4}
                      fill="var(--muted-foreground)"
                      fillOpacity="0.55"
                      className="text-[9px] font-medium"
                    >
                      {val}
                    </text>
                  );
                })
              : null}

            {/* Comparison polygon */}
            {comparisonPolygon ? (
              <path
                d={comparisonPolygon}
                fill={resolveTone(comparisonTone)}
                fillOpacity="0.07"
                stroke={resolveTone(comparisonTone)}
                strokeWidth="1.5"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Value polygon fill */}
            <motion.path
              d={polygon}
              fill={`url(#${id}-fill)`}
              initial={motionEnabled ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...chartDraw(0.7), delay: motionDelay }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Value polygon stroke */}
            <motion.path
              d={polygon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={motionEnabled ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ ...chartDraw(1), delay: motionDelay + 0.08 }}
            />

            {/* Axis labels */}
            {showLabels
              ? vertices.map((v) => (
                  <text
                    key={`label-${v.i}`}
                    x={v.lx}
                    y={v.ly + v.dy}
                    textAnchor={v.textAnchor}
                    fill="var(--muted-foreground)"
                    className="text-[11px] font-medium"
                  >
                    {v.label}
                  </text>
                ))
              : null}

            {/* Vertex dots */}
            {vertices.map((v) => {
              const isActive = activeIndex === v.i;
              return (
                <motion.g
                  key={`vertex-${v.i}`}
                  data-slot="score-radar-chart-vertex"
                  tabIndex={0}
                  role="button"
                  aria-label={`${v.label}: ${v.value}`}
                  {...getItemProps(v.i)}
                  className="outline-none"
                >
                  {/* Pulse ring on hover */}
                  {isActive ? (
                    <motion.circle
                      cx={v.vx}
                      cy={v.vy}
                      r="13"
                      fill="currentColor"
                      fillOpacity="0.12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={chartAccentTransition}
                      style={{ transformOrigin: `${v.vx}px ${v.vy}px` }}
                    />
                  ) : null}

                  {/* Vertex dot */}
                  <motion.circle
                    cx={v.vx}
                    cy={v.vy}
                    r={isActive ? 6.5 : 4.5}
                    fill="currentColor"
                    stroke="var(--background)"
                    strokeWidth="2"
                    initial={motionEnabled ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      ...spring.moderate,
                      delay: motionDelay + 0.55 + v.i * chartStaggerStep,
                    }}
                    style={{ transformOrigin: `${v.vx}px ${v.vy}px` }}
                  />

                  {/* Value label near dot when active */}
                  {isActive ? (
                    <motion.text
                      x={v.vx}
                      y={v.vy - 12}
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[11px] font-semibold tabular-nums"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={chartAccentTransition}
                    >
                      {v.value}
                    </motion.text>
                  ) : null}
                </motion.g>
              );
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && activeVertex ? (
                <motion.g
                  data-slot="score-radar-chart-tooltip"
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
                  transition={spring.fast}
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
                    y="20"
                    fill="var(--popover-foreground)"
                    className="text-[11.5px] font-semibold"
                  >
                    {activeVertex.label}
                  </text>
                  <circle cx="14" cy="38" r="4" fill="currentColor" />
                  <text
                    x="25"
                    y="42"
                    fill="var(--muted-foreground)"
                    className="text-[10.5px] font-medium"
                  >
                    Score
                  </text>
                  <text
                    x={tooltipWidth - 12}
                    y="42"
                    textAnchor="end"
                    fill="var(--popover-foreground)"
                    className="text-[11px] font-semibold tabular-nums"
                  >
                    {activeVertex.value}
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
