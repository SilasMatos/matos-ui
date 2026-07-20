"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ComponentProps, type ReactNode, useId, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";
import { useChartInteraction } from "./chart-interaction";

export const impactPriorityMatrixVariants = tv({
  base: "not-prose w-full text-foreground",
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[560px]",
      lg: "max-w-[720px]",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "md" },
});

export type ImpactPriorityItem = {
  label: string;
  effort: number;
  impact: number;
  description?: string;
  tone?: string;
};

export type ImpactPriorityMatrixProps = ComponentProps<"div"> &
  VariantProps<typeof impactPriorityMatrixVariants> & {
    data?: ImpactPriorityItem[];
    title?: ReactNode;
    description?: ReactNode;
    effortLabel?: string;
    impactLabel?: string;
    quadrantLabels?: [string, string, string, string];
    animated?: boolean;
    showTooltip?: boolean;
    height?: number;
    motionDelay?: number;
  };

const defaultData: ImpactPriorityItem[] = [
  {
    label: "Optimize images",
    effort: 20,
    impact: 88,
    description: "Compress and lazy-load images",
    tone: "chart-2",
  },
  {
    label: "Reduce JS",
    effort: 55,
    impact: 82,
    description: "Code-split and tree-shake bundle",
    tone: "chart-2",
  },
  {
    label: "Swap font",
    effort: 18,
    impact: 42,
    description: "Use system font stack",
    tone: "chart-4",
  },
  {
    label: "Remove scripts",
    effort: 78,
    impact: 90,
    description: "Eliminate blocking third-party",
    tone: "chart-3",
  },
  {
    label: "Add CDN",
    effort: 64,
    impact: 35,
    description: "Route assets through edge CDN",
    tone: "destructive",
  },
  {
    label: "Enable cache",
    effort: 22,
    impact: 58,
    description: "Set long-lived cache headers",
    tone: "chart-2",
  },
];

const fallbackTones = [
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-1)",
  "var(--destructive)",
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

export function ImpactPriorityMatrix({
  className,
  size,
  data = defaultData,
  title = "Impact Priority Matrix",
  description = "Prioritize improvements by effort and impact",
  effortLabel = "Effort",
  impactLabel = "Impact",
  quadrantLabels = ["Quick Wins", "Strategic", "Low Priority", "Expensive"],
  animated = true,
  showTooltip = true,
  height = 360,
  motionDelay = 0,
  ...props
}: ImpactPriorityMatrixProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const motionEnabled = animated && !shouldReduceMotion;
  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, data.length);

  // Layout
  const viewBoxWidth = 500;
  const viewBoxHeight = 440;
  const gridX = 54;
  const gridY = 34;
  const gridW = 416;
  const gridH = 348;
  const midX = gridX + gridW / 2;
  const midY = gridY + gridH / 2;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        i,
        px: gridX + (clamp(d.effort, 0, 100) / 100) * gridW,
        py: gridY + (1 - clamp(d.impact, 0, 100) / 100) * gridH,
        color: resolveTone(d.tone, i),
      })),
    [data],
  );

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  const tooltipWidth = 196;
  const tooltipHeight = 66;
  const tooltipX = activePoint
    ? clamp(
        activePoint.px - tooltipWidth / 2,
        gridX,
        gridX + gridW - tooltipWidth,
      )
    : 0;
  const tooltipY = activePoint
    ? clamp(
        activePoint.py - tooltipHeight - 16,
        gridY,
        gridY + gridH - tooltipHeight,
      )
    : 0;

  const quadrantConfigs = [
    {
      id: "quick-wins",
      x: gridX,
      y: gridY,
      w: gridW / 2,
      h: gridH / 2,
      label: quadrantLabels[0],
      labelX: gridX + 14,
      labelY: gridY + 18,
      tone: "var(--chart-2)",
    },
    {
      id: "strategic",
      x: midX,
      y: gridY,
      w: gridW / 2,
      h: gridH / 2,
      label: quadrantLabels[1],
      labelX: gridX + gridW - 14,
      labelY: gridY + 18,
      tone: "var(--chart-3)",
    },
    {
      id: "low-priority",
      x: gridX,
      y: midY,
      w: gridW / 2,
      h: gridH / 2,
      label: quadrantLabels[2],
      labelX: gridX + 14,
      labelY: gridY + gridH - 10,
      tone: "var(--muted-foreground)",
    },
    {
      id: "expensive",
      x: midX,
      y: midY,
      w: gridW / 2,
      h: gridH / 2,
      label: quadrantLabels[3],
      labelX: gridX + gridW - 14,
      labelY: gridY + gridH - 10,
      tone: "var(--destructive)",
    },
  ] as const;

  return (
    <div
      data-slot="impact-priority-matrix"
      className={twMerge(impactPriorityMatrixVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="impact-priority-matrix-header" className="mb-3">
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
        data-slot="impact-priority-matrix-plot"
        className="overflow-hidden"
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
            {/* Quadrant backgrounds */}
            {quadrantConfigs.map((q) => (
              <rect
                key={q.id}
                x={q.x}
                y={q.y}
                width={q.w}
                height={q.h}
                fill={q.tone}
                fillOpacity="0.035"
              />
            ))}

            {/* Grid border */}
            <rect
              x={gridX}
              y={gridY}
              width={gridW}
              height={gridH}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Axis dividers */}
            <line
              x1={midX}
              x2={midX}
              y1={gridY}
              y2={gridY + gridH}
              stroke="var(--border)"
              strokeWidth="1.5"
              strokeDasharray="5 6"
              opacity="0.6"
            />
            <line
              x1={gridX}
              x2={gridX + gridW}
              y1={midY}
              y2={midY}
              stroke="var(--border)"
              strokeWidth="1.5"
              strokeDasharray="5 6"
              opacity="0.6"
            />

            {/* Quadrant labels */}
            {quadrantConfigs.map((q, qi) => (
              <text
                key={`qlabel-${q.id}`}
                x={q.labelX}
                y={q.labelY}
                textAnchor={qi % 2 === 0 ? "start" : "end"}
                fill={q.tone}
                fillOpacity="0.6"
                className="text-[10.5px] font-semibold uppercase tracking-wider"
              >
                {q.label}
              </text>
            ))}

            {/* Axis labels */}
            <text
              x={midX}
              y={gridY + gridH + 22}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              className="text-[11px] font-medium"
            >
              {effortLabel} →
            </text>
            <text
              x={gridX - 10}
              y={midY}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              className="text-[11px] font-medium"
              transform={`rotate(-90, ${gridX - 10}, ${midY})`}
            >
              {impactLabel} →
            </text>

            {/* Low/High axis labels */}
            <text
              x={gridX}
              y={gridY + gridH + 22}
              textAnchor="start"
              fill="var(--muted-foreground)"
              fillOpacity="0.6"
              className="text-[10px] font-medium"
            >
              Low
            </text>
            <text
              x={gridX + gridW}
              y={gridY + gridH + 22}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fillOpacity="0.6"
              className="text-[10px] font-medium"
            >
              High
            </text>
            <text
              x={gridX - 36}
              y={gridY + gridH}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fillOpacity="0.6"
              className="text-[10px] font-medium"
            >
              Low
            </text>
            <text
              x={gridX - 36}
              y={gridY + 4}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fillOpacity="0.6"
              className="text-[10px] font-medium"
            >
              High
            </text>

            {/* Points */}
            {points.map((p) => {
              const isActive = activeIndex === p.i;
              return (
                <motion.g
                  key={`point-${p.i}`}
                  data-slot="impact-priority-matrix-point"
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: effort ${p.effort}, impact ${p.impact}`}
                  {...getItemProps(p.i)}
                  className="outline-none"
                  style={{ color: p.color }}
                >
                  {/* Glow ring */}
                  {isActive ? (
                    <motion.circle
                      cx={p.px}
                      cy={p.py}
                      r="16"
                      fill="currentColor"
                      fillOpacity="0.12"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      style={{ transformOrigin: `${p.px}px ${p.py}px` }}
                    />
                  ) : null}

                  {/* Outer ring */}
                  <motion.circle
                    cx={p.px}
                    cy={p.py}
                    r={isActive ? 11 : 9}
                    fill="currentColor"
                    fillOpacity={isActive ? 0.2 : 0.12}
                    stroke="currentColor"
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeOpacity={isActive ? 0.7 : 0.35}
                    initial={motionEnabled ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: motionDelay + 0.12 + p.i * 0.07,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                    style={{ transformOrigin: `${p.px}px ${p.py}px` }}
                  />

                  {/* Core dot */}
                  <motion.circle
                    cx={p.px}
                    cy={p.py}
                    r={isActive ? 6 : 5}
                    fill="currentColor"
                    initial={motionEnabled ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: motionDelay + 0.2 + p.i * 0.07,
                      type: "spring",
                      stiffness: 300,
                      damping: 16,
                    }}
                    style={{ transformOrigin: `${p.px}px ${p.py}px` }}
                  />

                  {/* Point label */}
                  <motion.text
                    x={p.px}
                    y={p.py - 14}
                    textAnchor="middle"
                    fill="var(--foreground)"
                    fillOpacity={isActive ? 1 : 0}
                    className="text-[10.5px] font-semibold"
                    animate={{ fillOpacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {p.label}
                  </motion.text>
                </motion.g>
              );
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && activePoint ? (
                <motion.g
                  data-slot="impact-priority-matrix-tooltip"
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
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="12"
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
                  {activePoint.description ? (
                    <text
                      x="14"
                      y="38"
                      fill="var(--muted-foreground)"
                      className="text-[10.5px] font-medium"
                    >
                      {activePoint.description}
                    </text>
                  ) : null}
                  <text
                    x="14"
                    y="55"
                    fill="var(--muted-foreground)"
                    className="text-[10px] font-medium"
                  >
                    Effort {activePoint.effort} · Impact {activePoint.impact}
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
