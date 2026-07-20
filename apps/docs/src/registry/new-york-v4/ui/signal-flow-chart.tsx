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

export const signalFlowChartVariants = tv({
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

export type SignalFlowDatum = {
  label: string;
  value: number;
  tone?: string;
  hint?: string;
};

export type SignalFlowChartProps = ComponentProps<"div"> &
  VariantProps<typeof signalFlowChartVariants> & {
    data?: SignalFlowDatum[];
    title?: ReactNode;
    description?: ReactNode;
    metricLabel?: ReactNode;
    valueFormatter?: (value: number) => ReactNode;
    max?: number;
    height?: number;
    animated?: boolean;
    showParticles?: boolean;
    showTooltip?: boolean;
    showValues?: boolean;
    motionDuration?: number;
    motionDelay?: number;
    loading?: boolean;
    emptyState?: ReactNode;
    onActiveChange?: (item: SignalFlowDatum, index: number) => void;
  };

const defaultData: SignalFlowDatum[] = [
  { label: "API Gateway", value: 92, hint: "Edge ingress" },
  { label: "Auth Service", value: 58, tone: "chart-4", hint: "Token mint" },
  { label: "Media CDN", value: 76, hint: "Asset stream" },
  { label: "Webhooks", value: 34, tone: "destructive", hint: "Outbound" },
  { label: "Analytics", value: 61, hint: "Event sink" },
];

const fallbackTones = [
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--destructive)",
  "var(--foreground)",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getTextValue(value: number, formatter?: (value: number) => ReactNode) {
  const formatted = formatter?.(value) ?? formatPercent(value);

  if (typeof formatted === "number" || typeof formatted === "string") {
    return String(formatted);
  }

  return formatPercent(value);
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

// Cubic-bezier point used to place the sink node at the fill fraction.
function cubicPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
}

function ChartSkeleton({ height }: { height: number }) {
  const rows = ["a", "b", "c", "d", "e"];

  return (
    <div
      data-slot="signal-flow-chart-skeleton"
      className="overflow-hidden rounded-xl border border-border/60 bg-card p-5"
      style={{ height }}
    >
      <div className="flex h-full flex-col justify-between gap-3 py-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="h-2.5 w-20 animate-pulse rounded bg-muted" />
            <span className="h-2.5 flex-1 animate-pulse rounded-full bg-muted" />
            <span className="h-2.5 w-10 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({ children }: { children?: ReactNode }) {
  return (
    <div
      data-slot="signal-flow-chart-empty"
      className="grid min-h-56 place-items-center rounded-xl border border-dashed border-border/70 bg-card px-6 text-center"
    >
      <div className="max-w-60">
        <div className="mx-auto mb-4 flex h-12 w-20 flex-col justify-center gap-1.5 rounded-xl border border-border bg-muted px-2.5">
          <span className="h-1.5 w-full rounded-full bg-muted-foreground/45" />
          <span className="h-1.5 w-2/3 rounded-full bg-muted-foreground/35" />
          <span className="h-1.5 w-5/6 rounded-full bg-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-foreground">No channels</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {children ?? "Provide channel throughput to render this chart."}
        </p>
      </div>
    </div>
  );
}

export function SignalFlowChart({
  className,
  size,
  data = defaultData,
  title = "Signal Flow",
  description = "Live channel throughput",
  metricLabel = "Throughput",
  valueFormatter,
  max = 100,
  height = 300,
  animated = true,
  showParticles = true,
  showTooltip = true,
  showValues = true,
  motionDuration = 0.7,
  motionDelay = 0,
  loading = false,
  emptyState,
  onActiveChange,
  ...props
}: SignalFlowChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const safeMax = Math.max(1, max);

  const normalizedData = useMemo(
    () =>
      data
        .filter((item) => Number.isFinite(item.value))
        .map((item, index) => ({
          ...item,
          value: clamp(item.value, 0, safeMax),
          color: resolveTone(item.tone, index),
        })),
    [data, safeMax],
  );

  const { activeIndex, getItemProps, hasEnteredView, interactionProps } =
    useChartInteraction(id, normalizedData.length);
  const activeItem =
    activeIndex === null ? null : (normalizedData[activeIndex] ?? null);

  useEffect(() => {
    if (activeItem && activeIndex !== null) {
      onActiveChange?.(activeItem, activeIndex);
    }
  }, [activeIndex, activeItem, onActiveChange]);

  if (loading) {
    return (
      <div
        data-slot="signal-flow-chart"
        className={twMerge(signalFlowChartVariants({ size }), className)}
        {...props}
      >
        <ChartSkeleton height={height} />
      </div>
    );
  }

  if (!normalizedData.length) {
    return (
      <div
        data-slot="signal-flow-chart"
        className={twMerge(signalFlowChartVariants({ size }), className)}
        {...props}
      >
        <ChartEmpty>{emptyState}</ChartEmpty>
      </div>
    );
  }

  const motionEnabled = animated && !shouldReduceMotion;
  const particlesEnabled = motionEnabled && showParticles;

  const viewBoxWidth = 720;
  const topPad = 34;
  const bottomPad = 30;
  const laneGap = 54;
  const itemCount = normalizedData.length;
  const viewBoxHeight = topPad + (itemCount - 1) * laneGap + bottomPad;

  const railX = 150;
  const cableEndX = 558;
  const valueX = 700;
  const cableLength = cableEndX - railX;

  const lanes = normalizedData.map((item, index) => {
    const baseY = topPad + index * laneGap;
    const fraction = clamp(item.value / safeMax, 0, 1);
    const bump = index % 2 === 0 ? 9 : -9;

    const p0x = railX;
    const p1x = railX + cableLength * 0.32;
    const p2x = railX + cableLength * 0.68;
    const p3x = cableEndX;
    const p0y = baseY;
    const p1y = baseY + bump;
    const p2y = baseY - bump;
    const p3y = baseY;

    const trackPath = `M ${p0x} ${p0y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${p3x} ${p3y}`;

    // Visible fill keeps a small floor so low channels still read as live.
    const fillFraction = Math.max(fraction, 0.08);
    const tipX = cubicPoint(fillFraction, p0x, p1x, p2x, p3x);
    const tipY = cubicPoint(fillFraction, p0y, p1y, p2y, p3y);

    const particleCount = 2 + Math.round(fraction * 3);
    const particleDuration = 0.72 - fraction * 0.18;

    return {
      ...item,
      index,
      baseY,
      fraction,
      fillFraction,
      trackPath,
      tipX,
      tipY,
      particleCount,
      particleDuration,
      formattedValue: getTextValue(item.value, valueFormatter),
    };
  });

  const railTop = lanes[0].baseY;
  const railBottom = lanes[lanes.length - 1].baseY;
  const active = activeIndex === null ? null : (lanes[activeIndex] ?? null);

  const tooltipWidth = 158;
  const tooltipHeight = 58;
  const tooltipX = active
    ? clamp(
        active.tipX - tooltipWidth / 2,
        10,
        viewBoxWidth - tooltipWidth - 10,
      )
    : 0;
  const tooltipY = active
    ? clamp(active.baseY - tooltipHeight - 18, 6, viewBoxHeight)
    : 0;
  const anchorX = active
    ? clamp(active.tipX - tooltipX, 16, tooltipWidth - 16)
    : tooltipWidth / 2;

  return (
    <div
      data-slot="signal-flow-chart"
      className={twMerge(signalFlowChartVariants({ size }), className)}
      {...interactionProps}
      {...props}
    >
      <div data-slot="signal-flow-chart-header" className="mb-3">
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
        data-slot="signal-flow-chart-plot"
        className="overflow-hidden"
        style={{ height }}
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
              Signal flow chart with {itemCount} channels. Use pointer, touch,
              or arrow keys to inspect each channel.
            </desc>
            <defs>
              <filter id={`${id}-tooltip-shadow`}>
                <feDropShadow
                  dx="0"
                  dy="2"
                  floodColor="var(--foreground)"
                  floodOpacity="0.12"
                  stdDeviation="3"
                />
              </filter>
            </defs>

            {/* Source bus rail */}
            <line
              x1={railX}
              x2={railX}
              y1={railTop - 16}
              y2={railBottom + 16}
              stroke="var(--border)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1={cableEndX}
              x2={cableEndX}
              y1={railTop - 10}
              y2={railBottom + 10}
              stroke="var(--border)"
              strokeDasharray="3 7"
              strokeLinecap="round"
              opacity="0.5"
            />

            {lanes.map((lane) => {
              const isActive = activeIndex === lane.index;
              const laneId = `${id}-lane-${lane.index}`;
              const dimmed = activeIndex !== null && !isActive;

              return (
                <motion.g
                  key={lane.label}
                  data-slot="signal-flow-chart-lane"
                  tabIndex={0}
                  role="button"
                  aria-label={`${lane.label}: ${lane.formattedValue}`}
                  {...getItemProps(lane.index)}
                  animate={{ opacity: dimmed ? 0.58 : 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ color: lane.color }}
                  className="cursor-pointer outline-none focus-visible:[&_[data-fill]]:stroke-ring focus-visible:[&_[data-fill]]:stroke-[7]"
                >
                  {/* Per-lane gradient keeps currentColor bound to the lane tone */}
                  <defs>
                    <linearGradient
                      id={`${laneId}-fill`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.18"
                      />
                      <stop
                        offset="55%"
                        stopColor="currentColor"
                        stopOpacity="0.7"
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Hit area */}
                  <rect
                    x={railX - 14}
                    y={lane.baseY - laneGap / 2 + 4}
                    width={valueX - railX + 24}
                    height={laneGap - 8}
                    fill="transparent"
                  />

                  {/* Track */}
                  <path
                    id={`${laneId}-track`}
                    d={lane.trackPath}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                  <path
                    d={lane.trackPath}
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="1 9"
                    opacity="0.6"
                  />

                  {/* Animated fill up to throughput */}
                  <motion.path
                    data-fill=""
                    d={lane.trackPath}
                    fill="none"
                    stroke={`url(#${laneId}-fill)`}
                    strokeWidth={isActive ? 6 : 5}
                    strokeLinecap="round"
                    initial={
                      motionEnabled ? { pathLength: 0, opacity: 0 } : false
                    }
                    animate={{
                      pathLength: lane.fillFraction,
                      opacity: 1,
                    }}
                    transition={{
                      pathLength: {
                        duration: motionDuration,
                        ease: [0.16, 1, 0.3, 1],
                        delay: motionDelay + lane.index * 0.08,
                      },
                      opacity: { duration: 0.3, delay: motionDelay },
                      strokeWidth: { duration: 0.25 },
                    }}
                  />

                  {/* Flowing particles */}
                  {particlesEnabled
                    ? Array.from({ length: lane.particleCount }).map(
                        (_, particleIndex) => {
                          const spacing =
                            (lane.particleDuration / lane.particleCount) *
                            particleIndex;

                          return (
                            <circle
                              // biome-ignore lint/suspicious/noArrayIndexKey: particle slots are stable per lane
                              key={particleIndex}
                              r={isActive ? 3 : 2.4}
                              fill="currentColor"
                              opacity={isActive ? 0.95 : 0.7}
                            >
                              <animateMotion
                                dur={`${lane.particleDuration}s`}
                                begin={`${(motionDelay + spacing).toFixed(2)}s`}
                                repeatCount="1"
                                keyPoints={`0;${lane.fillFraction.toFixed(3)}`}
                                keyTimes="0;1"
                                calcMode="linear"
                              >
                                <mpath
                                  href={`#${laneId}-track`}
                                  xlinkHref={`#${laneId}-track`}
                                />
                              </animateMotion>
                              <animate
                                attributeName="opacity"
                                values={
                                  isActive ? "0;0.95;0.95;0" : "0;0.7;0.7;0"
                                }
                                keyTimes="0;0.12;0.85;1"
                                dur={`${lane.particleDuration}s`}
                                begin={`${(motionDelay + spacing).toFixed(2)}s`}
                                repeatCount="1"
                              />
                            </circle>
                          );
                        },
                      )
                    : null}

                  {/* Source node on the rail */}
                  <circle
                    cx={railX}
                    cy={lane.baseY}
                    r="4.5"
                    fill="var(--card)"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />

                  {/* Sink node at the fill tip */}
                  <motion.g
                    initial={motionEnabled ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay:
                        motionDelay + motionDuration * 0.7 + lane.index * 0.08,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ transformOrigin: `${lane.tipX}px ${lane.tipY}px` }}
                  >
                    <motion.circle
                      cx={lane.tipX}
                      cy={lane.tipY}
                      fill="currentColor"
                      animate={{
                        r: isActive ? 8 : 5,
                        opacity: isActive ? 0.14 : 0,
                      }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                    <circle
                      cx={lane.tipX}
                      cy={lane.tipY}
                      r="4"
                      fill="currentColor"
                    />
                    <circle
                      cx={lane.tipX}
                      cy={lane.tipY}
                      r="1.6"
                      fill="var(--card)"
                    />
                  </motion.g>

                  {/* Channel label */}
                  <text
                    x={railX - 16}
                    y={lane.baseY + 4}
                    textAnchor="end"
                    fill={
                      isActive ? "var(--foreground)" : "var(--muted-foreground)"
                    }
                    className="text-[13px] font-medium"
                  >
                    {lane.label}
                  </text>

                  {/* Value readout */}
                  {showValues ? (
                    <motion.text
                      x={valueX}
                      y={lane.baseY + 4}
                      textAnchor="end"
                      fill={
                        isActive
                          ? "var(--foreground)"
                          : "var(--muted-foreground)"
                      }
                      className="text-[13px] font-semibold tabular-nums"
                      initial={
                        motionEnabled ? { opacity: 0, x: valueX + 8 } : false
                      }
                      animate={{ opacity: isActive ? 1 : 0.85, x: valueX }}
                      transition={{
                        delay: motionDelay + 0.2 + lane.index * 0.07,
                        duration: 0.3,
                      }}
                    >
                      {lane.formattedValue}
                    </motion.text>
                  ) : null}
                </motion.g>
              );
            })}

            <AnimatePresence>
              {showTooltip && active ? (
                <motion.g
                  data-slot="signal-flow-chart-tooltip"
                  pointerEvents="none"
                  initial={
                    motionEnabled
                      ? {
                          opacity: 0,
                          x: tooltipX,
                          y: tooltipY + 8,
                          scale: 0.98,
                        }
                      : false
                  }
                  animate={{ opacity: 1, x: tooltipX, y: tooltipY, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: tooltipX,
                    y: tooltipY + 6,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <rect
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="14"
                    fill="var(--popover)"
                    stroke="var(--border)"
                    filter={`url(#${id}-tooltip-shadow)`}
                  />
                  <path
                    d={`M ${anchorX - 7} ${tooltipHeight - 1} L ${anchorX} ${
                      tooltipHeight + 8
                    } L ${anchorX + 7} ${tooltipHeight - 1} Z`}
                    fill="var(--popover)"
                    stroke="var(--border)"
                    strokeLinejoin="round"
                  />
                  <text
                    x="15"
                    y="23"
                    fill="var(--popover-foreground)"
                    className="text-[13px] font-semibold"
                  >
                    {active.label}
                  </text>
                  <circle cx="19" cy="43" r="4.5" fill={active.color} />
                  <text
                    x="32"
                    y="47"
                    fill="var(--muted-foreground)"
                    className="text-[12px] font-medium"
                  >
                    {active.hint ?? metricLabel}
                  </text>
                  <text
                    x={tooltipWidth - 15}
                    y="47"
                    textAnchor="end"
                    fill="var(--popover-foreground)"
                    className="text-[13px] font-semibold tabular-nums"
                  >
                    {active.formattedValue}
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
