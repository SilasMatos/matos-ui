"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Activity,
  BarChart3,
  CircleDot,
  Gauge,
  Layers3,
  LineChart,
  Radio,
  Scale,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  type ChartCategory,
  type ChartId,
  chartCategories,
  chartCollection,
} from "@/lib/charts";
import { cn } from "@/lib/utils";
import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart";

type ChartCard = (typeof chartCollection)[number] & {
  href: `/charts/${ChartId}`;
  preview: ReactNode;
};

const featuredData = [
  { month: "Jan", value: 44 },
  { month: "Feb", value: 51 },
  { month: "Mar", value: 48 },
  { month: "Apr", value: 68 },
  { month: "May", value: 74 },
  { month: "Jun", value: 71 },
  { month: "Jul", value: 86 },
  { month: "Aug", value: 94 },
  { month: "Sep", value: 102 },
  { month: "Oct", value: 118 },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};

function usePreviewReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 320);
    return () => window.clearTimeout(timer);
  }, []);

  return ready;
}

const chartPreviews: Record<ChartId, ReactNode> = {
  "animated-area-chart": <MiniAreaPreview />,
  "interactive-bar-chart": <MiniBarPreview />,
  "allocation-performance-chart": <AllocationPerformancePreview compact />,
  "radial-metric-chart": <MiniRadialPreview />,
  "sparkline-card": <MiniSparklinePreview />,
  "donut-progress-chart": <DonutProgressPreview />,
  "risk-score-gauge": <RiskScoreGaugePreview compact />,
  "stacked-revenue-chart": <StackedRevenuePreview />,
  "comparison-chart": <ComparisonPreview />,
  "realtime-activity-chart": <RealtimeActivityPreview />,
};

export function ChartsShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const previewReady = usePreviewReady();
  const [activeCategory, setActiveCategory] = useState<ChartCategory>("All");

  const charts = useMemo<ChartCard[]>(
    () =>
      chartCollection.map((chart) => ({
        ...chart,
        href: `/charts/${chart.id}`,
        preview: chartPreviews[chart.id],
      })),
    [],
  );

  const filteredCharts =
    activeCategory === "All"
      ? charts
      : charts.filter((chart) => chart.category === activeCategory);

  return (
    <section className="not-prose mt-8 space-y-10">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Dashboard primitives
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Charts
            </h1>
            <p className="mt-4 max-w-xl text-balance text-base leading-7 text-muted-foreground">
              Animated, composable and theme-aware charts for modern dashboards.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <MetricPill label="SVG-first" value="10" />
            <MetricPill label="Registry" value="4" />
            <MetricPill label="Themes" value="2" />
          </div>
        </div>

        <AnimatedAreaChart
          size="full"
          data={featuredData}
          title="Revenue signal"
          description="Theme-aware path, mask reveal, SVG grid and animated tooltip"
          valueFormatter={(value) => `$${Math.round(value)}k`}
          height={360}
          showDots
          highlightActivePoint
        />
      </motion.div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-border border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Registry
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              Chart Components
            </h2>
          </div>

          <div
            data-slot="charts-filter"
            role="tablist"
            aria-label="Filter chart components"
            className="relative flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/45 p-1"
          >
            {chartCategories.map((category) => {
              const active = category === activeCategory;

              return (
                <motion.button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(category)}
                  whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  className={cn(
                    "relative min-h-8 shrink-0 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="charts-filter-indicator"
                      className="absolute inset-0 rounded-lg border border-border bg-card"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        mass: 0.8,
                      }}
                    />
                  ) : null}
                  <span className="relative z-10">{category}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCharts.map((chart, index) => (
              <ChartRegistryCard
                key={chart.id}
                chart={chart}
                index={index}
                previewReady={previewReady}
                reducedMotion={Boolean(shouldReduceMotion)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredCharts.length === 0 ? <ChartsEmptyState /> : null}
      </div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-lg font-semibold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-widest">{label}</p>
    </div>
  );
}

function ChartRegistryCard({
  chart,
  index,
  previewReady,
  reducedMotion,
}: {
  chart: ChartCard;
  index: number;
  previewReady: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.article
      data-slot="charts-card"
      layout
      variants={reducedMotion ? undefined : cardVariants}
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      exit={reducedMotion ? undefined : "exit"}
      transition={{
        layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        delay: reducedMotion ? 0 : index * 0.035,
      }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -3,
              scale: 1.01,
              transition: { duration: 0.18, ease: "easeOut" },
            }
      }
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-secondary p-2 shadow-sm",
        "transition-colors duration-200 hover:border-ring/45",
      )}
    >
      <Link
        href={chart.href}
        aria-label={`Open ${chart.name} fullscreen preview`}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="relative h-40 overflow-hidden border-border/60 border-b bg-muted/25">
            {previewReady ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {chart.preview}
              </motion.div>
            ) : (
              <PreviewSkeleton />
            )}
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {chart.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {chart.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border/70 bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                {chart.badge}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                {chart.installable ? (
                  <>
                    <CircleDot
                      className="size-3 text-chart-2"
                      aria-hidden="true"
                    />
                    Registry item
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" aria-hidden="true" />
                    Showcase preview
                  </>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                Open fullscreen
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function PreviewSkeleton() {
  return (
    <div className="absolute inset-0 p-4">
      <div className="h-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function ChartsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"
    >
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
          <BarChart3 className="size-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          No charts found
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This category has no chart previews yet.
        </p>
      </div>
    </motion.div>
  );
}

function MiniAreaPreview() {
  return (
    <PreviewFrame icon={<LineChart className="size-3.5" />} label="Area">
      <svg
        viewBox="0 0 320 160"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mini-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.26" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <clipPath id="mini-area-clip">
            <motion.rect
              x="0"
              y="0"
              width="320"
              height="160"
              initial={{ width: 0 }}
              animate={{ width: 320 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </clipPath>
        </defs>
        <path
          d="M22 124 C60 104 70 82 104 92 C138 102 146 46 182 56 C220 66 228 34 264 48 C286 56 298 42 310 30 L310 150 L22 150 Z"
          fill="url(#mini-area-gradient)"
          clipPath="url(#mini-area-clip)"
        />
        <motion.path
          d="M22 124 C60 104 70 82 104 92 C138 102 146 46 182 56 C220 66 228 34 264 48 C286 56 298 42 310 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <ActivePoint cx={264} cy={48} />
      </svg>
    </PreviewFrame>
  );
}

function MiniBarPreview() {
  const bars = [
    { id: "mon", value: 42 },
    { id: "tue", value: 74 },
    { id: "wed", value: 56 },
    { id: "thu", value: 96 },
    { id: "fri", value: 68 },
    { id: "sat", value: 112 },
    { id: "sun", value: 86 },
  ];

  return (
    <PreviewFrame icon={<BarChart3 className="size-3.5" />} label="Bar">
      <svg
        viewBox="0 0 320 160"
        className="size-full text-chart-1"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mini-bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.58" />
          </linearGradient>
        </defs>
        {bars.map((bar, index) => {
          const height = bar.value;
          const x = 36 + index * 38;
          const y = 134 - height;

          return (
            <motion.g
              key={bar.id}
              className={index % 2 ? "text-chart-2" : "text-chart-1"}
              initial={{ opacity: 0, scaleY: 0.55 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{
                delay: index * 0.045,
                duration: 0.48,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${x + 10}px 134px` }}
            >
              <rect
                x={x}
                y={y}
                width="20"
                height={height}
                rx="8"
                fill="url(#mini-bar-gradient)"
              />
              <line
                x1={x + 5}
                x2={x + 15}
                y1={y + 18}
                y2={y + 18}
                stroke="currentColor"
                strokeLinecap="round"
                strokeDasharray="1 4"
                opacity="0.5"
              />
            </motion.g>
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function MiniRadialPreview() {
  return (
    <PreviewFrame icon={<Gauge className="size-3.5" />} label="Radial">
      <svg
        viewBox="0 0 180 160"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mini-radial-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--chart-1)" />
          </linearGradient>
        </defs>
        <circle
          cx="90"
          cy="80"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-border"
          opacity="0.7"
        />
        <motion.circle
          cx="90"
          cy="80"
          r="52"
          fill="none"
          stroke="url(#mini-radial-gradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="327"
          initial={{ strokeDashoffset: 327 }}
          animate={{ strokeDashoffset: 72 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 90 80)"
        />
        <text
          x="90"
          y="85"
          textAnchor="middle"
          className="fill-foreground text-xl font-semibold"
        >
          78%
        </text>
      </svg>
    </PreviewFrame>
  );
}

function AllocationPerformancePreview({
  compact = false,
}: {
  compact?: boolean;
}) {
  const bars = [
    {
      id: "bonds",
      label: "Bonds",
      value: 45,
      color: "color-mix(in oklab, var(--destructive) 82%, var(--chart-1) 18%)",
      labelColor: "var(--primary-foreground)",
    },
    {
      id: "stocks",
      label: "Stocks",
      value: 85,
      color: "var(--chart-3)",
      labelColor: "var(--foreground)",
    },
    {
      id: "etfs",
      label: "ETFs",
      value: 48,
      color: "color-mix(in oklab, var(--background) 92%, var(--foreground) 8%)",
      labelColor: "var(--foreground)",
    },
    {
      id: "crypto",
      label: "Crypto",
      value: 14,
      color:
        "color-mix(in oklab, var(--muted-foreground) 58%, var(--background) 42%)",
      labelColor: "var(--foreground)",
    },
  ];

  return (
    <PreviewFrame icon={<BarChart3 className="size-3.5" />} label="Allocation">
      <svg viewBox="0 0 360 180" className="size-full" aria-hidden="true">
        <defs>
          <pattern
            id="allocation-mini-stripes"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              x2="0"
              y1="0"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              opacity="0.24"
            />
          </pattern>
          <clipPath id="allocation-mini-reveal">
            <motion.rect
              x="0"
              y="0"
              width="360"
              height="180"
              initial={compact ? { width: 0 } : false}
              animate={{ width: 360 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            />
          </clipPath>
        </defs>
        <rect
          x="16"
          y="14"
          width="328"
          height="146"
          rx="20"
          className="fill-card stroke-border"
        />
        <g clipPath="url(#allocation-mini-reveal)">
          {bars.map((bar, index) => {
            const width = 68;
            const x = 34 + index * 78;
            const trackY = 48;
            const trackHeight = 90;
            const fillHeight = Math.max((trackHeight * bar.value) / 100, 18);
            const fillY = trackY + trackHeight - fillHeight;
            const labelInside = fillHeight > 28;

            return (
              <motion.g
                key={bar.id}
                whileHover={{ y: -2, scale: 1.015 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ transformOrigin: `${x + width / 2}px ${trackY}px` }}
              >
                <rect
                  x={x}
                  y={trackY}
                  width={width}
                  height={trackHeight}
                  rx="8"
                  fill="url(#allocation-mini-stripes)"
                />
                <motion.rect
                  x={x}
                  y={fillY}
                  width={width}
                  height={fillHeight}
                  rx="8"
                  fill="currentColor"
                  initial={compact ? { scaleY: 0, opacity: 0 } : false}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.07,
                    duration: 0.48,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    color: bar.color,
                    transformOrigin: `${x + width / 2}px ${trackY + trackHeight}px`,
                  }}
                />
                <motion.rect
                  x={x + 8}
                  y={fillY + 8}
                  width={width - 16}
                  height="1"
                  rx="1"
                  fill="var(--background)"
                  opacity={labelInside ? 0.36 : 0}
                  initial={compact ? { opacity: 0, width: 0 } : false}
                  animate={{
                    opacity: labelInside ? 0.36 : 0,
                    width: width - 16,
                  }}
                  transition={{ delay: 0.32 + index * 0.08, duration: 0.36 }}
                />
                <motion.text
                  x={x + 10}
                  y={labelInside ? fillY + 22 : fillY - 7}
                  className="text-[11px] font-semibold"
                  fill={labelInside ? bar.labelColor : "var(--foreground)"}
                  initial={compact ? { y: fillY + 8, opacity: 0 } : false}
                  animate={{
                    y: labelInside ? fillY + 22 : fillY - 7,
                    opacity: 1,
                  }}
                  transition={{ delay: 0.18 + index * 0.08, duration: 0.32 }}
                >
                  {bar.value}%
                </motion.text>
                <text
                  x={x + width / 2}
                  y="154"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {bar.label}
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </PreviewFrame>
  );
}

function RiskScoreGaugePreview({ compact = false }: { compact?: boolean }) {
  const path = "M82 140 A98 98 0 0 1 278 140";
  const progressPath = "M82 140 A98 98 0 0 1 222 52";

  return (
    <PreviewFrame icon={<Gauge className="size-3.5" />} label="Risk">
      <svg
        viewBox="0 0 360 180"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="risk-mini-stripes"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              x2="0"
              y1="0"
              y2="7"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              opacity="0.22"
            />
          </pattern>
          <linearGradient id="risk-mini-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop
              offset="0%"
              stopColor="var(--muted-foreground)"
              stopOpacity="0.7"
            />
            <stop offset="46%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <rect
          x="24"
          y="18"
          width="312"
          height="144"
          rx="24"
          className="fill-card stroke-border"
        />
        <text
          x="48"
          y="52"
          className="fill-muted-foreground text-[13px] font-medium"
        >
          Risk Score
        </text>
        <text
          x="48"
          y="86"
          className="fill-foreground text-[32px] font-semibold"
        >
          72
        </text>
        <text
          x="96"
          y="86"
          className="fill-muted-foreground text-[18px] font-medium"
        >
          /100
        </text>
        <g transform="translate(0 10)">
          <path
            d={path}
            fill="none"
            stroke="url(#risk-mini-stripes)"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <motion.path
            d={progressPath}
            fill="none"
            stroke="url(#risk-mini-gradient)"
            strokeWidth="28"
            strokeLinecap="round"
            initial={compact ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
          />
          <circle
            cx="82"
            cy="140"
            r="8"
            fill="var(--card)"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.32"
            strokeWidth="8"
          />
          <line
            x1="222"
            x2="222"
            y1="58"
            y2="126"
            className="stroke-muted-foreground"
            strokeWidth="1.5"
            opacity="0.2"
          />
          <motion.g
            initial={compact ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.58, duration: 0.22, ease: "easeOut" }}
            style={{ transformOrigin: "222px 52px" }}
          >
            <motion.circle
              cx="222"
              cy="52"
              r="21"
              className="fill-chart-2"
              animate={
                compact ? { opacity: [0.22, 0.38, 0.22] } : { opacity: 0.3 }
              }
              transition={{
                duration: 2,
                repeat: compact ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
            <circle
              cx="222"
              cy="52"
              r="10"
              fill="var(--background)"
              stroke="var(--chart-2)"
              strokeWidth="2"
            />
          </motion.g>
        </g>
        <text
          x="180"
          y="150"
          textAnchor="middle"
          className="fill-muted-foreground text-[12px] font-medium"
        >
          Stability improved by +4%
        </text>
      </svg>
    </PreviewFrame>
  );
}

function MiniSparklinePreview() {
  return (
    <PreviewFrame icon={<Activity className="size-3.5" />} label="Spark">
      <svg
        viewBox="0 0 320 160"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mini-spark-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text
          x="30"
          y="46"
          className="fill-muted-foreground text-[13px] font-medium"
        >
          Conversion
        </text>
        <text
          x="30"
          y="78"
          className="fill-foreground text-[28px] font-semibold"
        >
          52.4%
        </text>
        <path
          d="M30 122 C64 104 78 128 108 98 C142 64 154 110 188 86 C222 62 242 70 292 42 L292 146 L30 146 Z"
          fill="url(#mini-spark-gradient)"
        />
        <motion.path
          d="M30 122 C64 104 78 128 108 98 C142 64 154 110 188 86 C222 62 242 70 292 42"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </PreviewFrame>
  );
}

function DonutProgressPreview() {
  const segments = [
    { offset: 0, length: 88, className: "text-chart-2" },
    { offset: 104, length: 62, className: "text-chart-1" },
    { offset: 182, length: 42, className: "text-chart-4" },
  ];

  return (
    <PreviewFrame icon={<CircleDot className="size-3.5" />} label="Donut">
      <svg viewBox="0 0 180 160" className="size-full" aria-hidden="true">
        <circle
          cx="90"
          cy="80"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
          className="text-border"
        />
        {segments.map((segment, index) => (
          <motion.circle
            key={segment.offset}
            cx="90"
            cy="80"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className={segment.className}
            strokeDasharray={`${segment.length} 327`}
            initial={{ strokeDashoffset: 327 }}
            animate={{ strokeDashoffset: -segment.offset }}
            transition={{
              delay: index * 0.09,
              duration: 0.78,
              ease: [0.16, 1, 0.3, 1],
            }}
            transform="rotate(-90 90 80)"
          />
        ))}
        <text
          x="90"
          y="86"
          textAnchor="middle"
          className="fill-foreground text-xl font-semibold"
        >
          84%
        </text>
      </svg>
    </PreviewFrame>
  );
}

function StackedRevenuePreview() {
  const stacks = [
    {
      id: "jan",
      values: [
        { id: "jan-subscription", height: 34 },
        { id: "jan-services", height: 26 },
        { id: "jan-marketplace", height: 18 },
      ],
    },
    {
      id: "feb",
      values: [
        { id: "feb-subscription", height: 44 },
        { id: "feb-services", height: 32 },
        { id: "feb-marketplace", height: 24 },
      ],
    },
    {
      id: "mar",
      values: [
        { id: "mar-subscription", height: 38 },
        { id: "mar-services", height: 38 },
        { id: "mar-marketplace", height: 28 },
      ],
    },
    {
      id: "apr",
      values: [
        { id: "apr-subscription", height: 58 },
        { id: "apr-services", height: 36 },
        { id: "apr-marketplace", height: 30 },
      ],
    },
    {
      id: "may",
      values: [
        { id: "may-subscription", height: 64 },
        { id: "may-services", height: 42 },
        { id: "may-marketplace", height: 34 },
      ],
    },
  ];

  return (
    <PreviewFrame icon={<Layers3 className="size-3.5" />} label="Revenue">
      <svg viewBox="0 0 320 160" className="size-full" aria-hidden="true">
        <defs>
          <pattern
            id="stacked-pattern"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 8 L8 0"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-background"
              opacity="0.5"
            />
          </pattern>
        </defs>
        {stacks.map((stack, index) => {
          const x = 52 + index * 46;
          let cursor = 130;

          return (
            <g key={stack.id}>
              {stack.values.map((part, partIndex) => {
                const height = part.height;
                cursor -= height;
                const className =
                  partIndex === 0
                    ? "text-chart-2"
                    : partIndex === 1
                      ? "text-chart-1"
                      : "text-chart-4";

                return (
                  <motion.rect
                    key={part.id}
                    x={x}
                    y={cursor}
                    width="28"
                    height={height}
                    rx={partIndex === 0 ? 8 : 4}
                    fill="currentColor"
                    className={className}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.88, y: 0 }}
                    transition={{
                      delay: index * 0.04 + partIndex * 0.04,
                      duration: 0.34,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function ComparisonPreview() {
  return (
    <PreviewFrame icon={<Scale className="size-3.5" />} label="Compare">
      <svg viewBox="0 0 320 160" className="size-full" aria-hidden="true">
        <motion.path
          d="M28 112 C62 86 92 96 126 72 C158 50 184 74 216 48 C246 24 272 42 300 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-chart-2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M28 130 C68 116 88 82 126 100 C164 118 184 86 218 76 C252 66 272 70 300 56"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 8"
          className="text-chart-1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <ActivePoint cx={216} cy={48} />
        <FloatingLabel x={222} y={26} label="+18%" />
      </svg>
    </PreviewFrame>
  );
}

function RealtimeActivityPreview() {
  const pulses = [
    { x: 40, y: 102 },
    { x: 84, y: 72 },
    { x: 128, y: 88 },
    { x: 172, y: 46 },
    { x: 216, y: 66 },
    { x: 260, y: 36 },
  ];

  return (
    <PreviewFrame icon={<Radio className="size-3.5" />} label="Realtime">
      <svg
        viewBox="0 0 320 160"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <motion.path
          d="M24 118 C52 118 56 56 84 72 C112 88 108 96 128 88 C152 78 144 36 172 46 C198 56 190 82 216 66 C244 50 238 34 260 36 C284 38 286 92 306 74"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {pulses.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18 + index * 0.08, duration: 0.2 }}
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ r: 4, opacity: 0.3 }}
              animate={{ r: [4, 13, 4], opacity: [0.25, 0, 0.25] }}
              transition={{
                delay: index * 0.1,
                duration: 1.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </g>
        ))}
      </svg>
    </PreviewFrame>
  );
}

function PreviewFrame({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full bg-background">
      <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
        <span className="[&_svg]:size-3.5" aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <div className="absolute inset-0 p-4 pt-8">{children}</div>
    </div>
  );
}

function ActivePoint({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="text-chart-2">
      <motion.circle
        cx={cx}
        cy={cy}
        r="12"
        fill="currentColor"
        opacity="0.14"
        animate={{ r: [8, 14, 8], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
      />
      <circle cx={cx} cy={cy} r="4" fill="currentColor" />
      <circle
        cx={cx}
        cy={cy}
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </g>
  );
}

function FloatingLabel({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.2 }}
    >
      <rect
        x={x}
        y={y}
        width="50"
        height="24"
        rx="12"
        className="fill-background stroke-border"
      />
      <text
        x={x + 25}
        y={y + 16}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {label}
      </text>
    </motion.g>
  );
}
