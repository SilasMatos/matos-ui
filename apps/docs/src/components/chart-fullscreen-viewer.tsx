"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Code2, Maximize2, RefreshCw } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { type ChartId, getChartById } from "@/lib/charts";
import { cn } from "@/lib/utils";
import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart";
import { InteractiveBarChart } from "@/registry/new-york-v4/ui/interactive-bar-chart";
import { RadialMetricChart } from "@/registry/new-york-v4/ui/radial-metric-chart";
import { SparklineCard } from "@/registry/new-york-v4/ui/sparkline-card";

type ChartFullscreenViewerProps = ComponentProps<"main"> & {
  chartId: ChartId;
};

const areaData = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 56 },
  { month: "Mar", value: 51 },
  { month: "Apr", value: 78 },
  { month: "May", value: 72 },
  { month: "Jun", value: 91 },
  { month: "Jul", value: 86 },
  { month: "Aug", value: 104 },
  { month: "Sep", value: 118 },
  { month: "Oct", value: 132 },
];

const barData = [
  { label: "Mon", value: 54 },
  { label: "Tue", value: 78 },
  { label: "Wed", value: 66 },
  { label: "Thu", value: 102 },
  { label: "Fri", value: 88 },
  { label: "Sat", value: 124 },
  { label: "Sun", value: 96 },
];

const sparklineData = [
  { label: "01", value: 28 },
  { label: "02", value: 34 },
  { label: "03", value: 31 },
  { label: "04", value: 48 },
  { label: "05", value: 42 },
  { label: "06", value: 58 },
  { label: "07", value: 64 },
  { label: "08", value: 72 },
  { label: "09", value: 84 },
];

export function ChartFullscreenViewer({
  chartId,
  className,
  ...props
}: ChartFullscreenViewerProps) {
  const shouldReduceMotion = useReducedMotion();
  const chart = getChartById(chartId);
  const [renderKey, setRenderKey] = useState(0);

  const preview = useMemo(() => renderChartPreview(chartId), [chartId]);

  if (!chart) {
    return null;
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void document.documentElement.requestFullscreen?.();
  }

  async function copyChartId() {
    await navigator.clipboard?.writeText(chartId);
  }

  return (
    <main
      data-slot="chart-fullscreen-viewer"
      className={cn(
        "fixed inset-0 z-[80] min-h-svh overflow-y-auto bg-background text-foreground",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_center,color-mix(in_oklab,var(--muted)_28%,transparent)_0,transparent_42%)]"
      />

      <div className="relative z-10 grid min-h-svh gap-2 p-2 lg:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
        <section
          data-slot="chart-fullscreen-docs"
          className="flex min-h-[calc(100svh-1rem)] flex-col px-5 py-6 sm:px-8 lg:px-10"
        >
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link
              href="/charts"
              aria-label="Back to Charts"
              className="inline-flex items-center gap-2 rounded-lg outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Charts
            </Link>
            <span aria-hidden="true">.</span>
            <span>{chart.category}</span>
            <span aria-hidden="true">.</span>
            <span className="truncate text-foreground/80">{chart.name}</span>
          </div>

          <div className="flex flex-1 flex-col justify-center py-16 lg:py-12">
            <div className="max-w-[760px] space-y-9">
              <div className="space-y-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {chart.category} chart
                </p>
                <div className="space-y-4">
                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {chart.name}
                  </h1>
                  <p className="max-w-3xl text-balance text-lg font-medium leading-8 text-foreground/85">
                    {getChartDocumentation(chartId).summary}
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    {getChartDocumentation(chartId).details}
                  </p>
                </div>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <DocsBlock title="Dependencies">
                  <div className="flex flex-wrap gap-2">
                    {getChartDependencies(chartId).map((dependency) => (
                      <DependencyPill key={dependency}>
                        {dependency}
                      </DependencyPill>
                    ))}
                  </div>
                </DocsBlock>

                <DocsBlock title="Interaction type">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {getChartDocumentation(chartId).interaction}
                  </p>
                </DocsBlock>
              </div>

              <DocsBlock title="Usage">
                <div className="rounded-2xl border border-border bg-card/65 p-3 shadow-sm">
                  <code className="block overflow-x-auto whitespace-pre text-xs leading-6 text-muted-foreground">
                    {getUsageSnippet(chartId)}
                  </code>
                </div>
              </DocsBlock>
            </div>
          </div>
        </section>

        <section
          data-slot="chart-fullscreen-preview-panel"
          aria-label={`${chart.name} fullscreen preview`}
          className="relative min-h-[70svh] overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm lg:min-h-[calc(100svh-1rem)]"
        >
          <div className="absolute right-4 top-4 z-20">
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-card/75 p-1 shadow-sm backdrop-blur">
              <ControlButton label="Fullscreen" onClick={toggleFullscreen}>
                <Maximize2 className="size-4" aria-hidden="true" />
              </ControlButton>
              <ControlButton
                label="Replay animation"
                onClick={() => setRenderKey((currentKey) => currentKey + 1)}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
              </ControlButton>
              <ControlButton label="Copy chart id" onClick={copyChartId}>
                <Code2 className="size-4" aria-hidden="true" />
              </ControlButton>
            </div>
          </div>

          <PreviewPatternBackground />

          <div
            data-slot="chart-fullscreen-stage"
            className="relative z-10 grid min-h-[70svh] place-items-center px-6 py-24 lg:min-h-[calc(100svh-1rem)]"
          >
            <motion.div
              key={`${chart.id}-${renderKey}`}
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex w-full origin-center flex-col items-center justify-center"
            >
              {preview}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

type ChartDocumentation = {
  summary: string;
  details: string;
  interaction: string;
};

const chartDocumentation: Record<ChartId, ChartDocumentation> = {
  "animated-area-chart": {
    summary:
      "A theme-aware area chart built for executive dashboard surfaces and animated trend storytelling.",
    details:
      "The chart uses Recharts for scales and tooltip lifecycle, then layers custom SVG masks, gradients, active dots and stroke drawing to make the path feel crafted instead of generic.",
    interaction:
      "Hover or focus the path area to reveal the custom cursor, tooltip and highlighted point.",
  },
  "interactive-bar-chart": {
    summary:
      "A responsive bar chart with focusable bars, animated SVG shapes and inline value labels.",
    details:
      "Each bar is a custom SVG shape with theme colors, internal markers, active state rings and keyboard-friendly focus styling for dense analytics views.",
    interaction:
      "Hover or tab through bars to inspect each value without leaving the preview surface.",
  },
  "allocation-performance-chart": {
    summary:
      "An allocation dashboard card with textured asset tracks and bold fill states for portfolio composition.",
    details:
      "The chart is built as custom SVG: striped track patterns, animated column fills, rounded mask-like bars and per-asset labels inspired by premium finance interfaces.",
    interaction:
      "Replay the fill animation to scan allocation changes across Bonds, Stocks, ETFs and Crypto.",
  },
  "radial-metric-chart": {
    summary:
      "A compact radial metric for progress, health and completion states in modern dashboards.",
    details:
      "The radial preview combines Recharts radial layout with a custom SVG ring overlay, dash reveal animation and an active endpoint marker.",
    interaction:
      "Hover the ring to inspect the current metric, then replay the animation from the control bar.",
  },
  "sparkline-card": {
    summary:
      "A small metric card with a dense sparkline, trend badge and animated masked area.",
    details:
      "The card is designed for dashboard grids where every pixel matters: compact value, trend context, subtle tooltip and a responsive SVG path.",
    interaction:
      "Hover the sparkline to reveal a tooltip cursor and active dot without expanding the card.",
  },
  "donut-progress-chart": {
    summary:
      "A segmented donut preview for quota, completion and distribution states.",
    details:
      "The docs-only preview uses SVG stroke dash segments, rounded caps and a subtle glow to separate progress bands while staying theme-aware.",
    interaction:
      "Use the replay control to redraw the segmented arcs and inspect the centered progress label.",
  },
  "risk-score-gauge": {
    summary:
      "A semi-radial risk meter with a large score, striped remainder arc and glowing stability marker.",
    details:
      "The gauge uses handcrafted SVG arcs, stroke-dash drawing, gradient progress, diagonal pattern fills and marker rings to match a refined risk analytics card.",
    interaction:
      "Replay the arc reveal to inspect the current score and stability marker position.",
  },
  "stacked-revenue-chart": {
    summary:
      "A layered revenue chart for comparing multiple revenue streams over time.",
    details:
      "The SVG preview reveals stacked bars with clipPath animation, themed segments and a subtle pattern layer for secondary data.",
    interaction:
      "Replay the reveal animation or adjust scale and layout from the preview options.",
  },
  "comparison-chart": {
    summary:
      "A dual-series comparison chart with active rings, dashed secondary paths and a floating delta.",
    details:
      "The preview uses two handcrafted SVG paths, mask reveal and a floating label to make comparisons feel clearer and more intentional.",
    interaction:
      "Replay the draw animation to compare the primary path against the dashed benchmark.",
  },
  "realtime-activity-chart": {
    summary:
      "A streaming activity chart with pulse markers and a live signal treatment.",
    details:
      "The docs-only SVG uses a dotted pattern, animated path length and repeated pulse rings to communicate realtime movement.",
    interaction:
      "Watch the internal pulse markers loop, or replay the path drawing from the toolbar.",
  },
};

function getChartDocumentation(chartId: ChartId) {
  return chartDocumentation[chartId];
}

function getChartDependencies(chartId: ChartId) {
  if (chartId === "sparkline-card") {
    return [
      "recharts",
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ];
  }

  if (
    chartId === "animated-area-chart" ||
    chartId === "interactive-bar-chart" ||
    chartId === "radial-metric-chart"
  ) {
    return ["recharts", "framer-motion", "tailwind-merge", "tailwind-variants"];
  }

  return ["framer-motion", "recharts", "theme tokens"];
}

function getUsageSnippet(chartId: ChartId) {
  const snippets: Record<ChartId, string> = {
    "animated-area-chart": `import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart"

<AnimatedAreaChart data={data} />`,
    "interactive-bar-chart": `import { InteractiveBarChart } from "@/registry/new-york-v4/ui/interactive-bar-chart"

<InteractiveBarChart data={data} />`,
    "allocation-performance-chart": `<AllocationPerformanceChart data={allocations} />
// Docs-only showcase preview`,
    "radial-metric-chart": `import { RadialMetricChart } from "@/registry/new-york-v4/ui/radial-metric-chart"

<RadialMetricChart value={84} />`,
    "sparkline-card": `import { SparklineCard } from "@/registry/new-york-v4/ui/sparkline-card"

<SparklineCard data={data} value={84.2} />`,
    "donut-progress-chart": `<DonutProgressChart value={84} />
// Docs-only showcase preview`,
    "risk-score-gauge": `<RiskScoreGauge value={72} max={100} />
// Docs-only showcase preview`,
    "stacked-revenue-chart": `<StackedRevenueChart data={revenue} />
// Docs-only showcase preview`,
    "comparison-chart": `<ComparisonChart primary={current} secondary={previous} />
// Docs-only showcase preview`,
    "realtime-activity-chart": `<RealtimeActivityChart stream={events} />
// Docs-only showcase preview`,
  };

  return snippets[chartId];
}

function DocsBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section data-slot="chart-fullscreen-docs-block" className="space-y-3">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DependencyPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm">
      {children}
    </span>
  );
}

function PreviewPatternBackground() {
  return (
    <svg
      data-slot="chart-fullscreen-pattern-background"
      className="pointer-events-none absolute inset-0 size-full text-foreground"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="chart-preview-dot-pattern"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <rect width="48" height="48" fill="var(--card)" />
          <g opacity="0.14">
            <path d="M24 23H23V24H24V23Z" fill="currentColor" />
            <path d="M24 47H23V48H24V47Z" fill="currentColor" />
            <path d="M47 23H48V24H47V23Z" fill="currentColor" />
            <path d="M48 47H47V48H48V47Z" fill="currentColor" />
            <path d="M12 11H11V12H12V11Z" fill="currentColor" />
            <path d="M12 35H11V36H12V35Z" fill="currentColor" />
            <path d="M35 11H36V12H35V11Z" fill="currentColor" />
            <path d="M36 35H35V36H36V35Z" fill="currentColor" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chart-preview-dot-pattern)" />
    </svg>
  );
}

function ControlButton({
  label,
  className,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-xl text-muted-foreground outline-none transition-colors",
        "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

function renderChartPreview(chartId: ChartId) {
  switch (chartId) {
    case "animated-area-chart":
      return (
        <AnimatedAreaChart
          size="full"
          data={areaData}
          title="Revenue signal"
          description="Masked path, active cursor and custom SVG dots"
          valueFormatter={(value) => `$${Math.round(value)}k`}
          height={430}
          className="w-full max-w-[760px]"
        />
      );
    case "interactive-bar-chart":
      return (
        <InteractiveBarChart
          size="full"
          data={barData}
          title="Weekly activity"
          description="Focusable bars with animated internal SVG marks"
          valueFormatter={(value) => `${Math.round(value)}k`}
          height={430}
          className="w-full max-w-[740px]"
        />
      );
    case "allocation-performance-chart":
      return <AllocationPerformanceFullPreview />;
    case "radial-metric-chart":
      return (
        <RadialMetricChart
          size="full"
          value={84}
          title="Deployment health"
          description="Radial progress with dash reveal and endpoint"
          label="Ready"
          height={430}
          className="w-full max-w-[460px]"
        />
      );
    case "sparkline-card":
      return (
        <SparklineCard
          size="full"
          data={sparklineData}
          label="Conversion"
          value={84.2}
          trend={18.6}
          trendLabel="vs last release cycle"
          height={170}
          className="w-full max-w-[520px]"
        />
      );
    case "donut-progress-chart":
      return <DonutProgressFullPreview />;
    case "risk-score-gauge":
      return <RiskScoreGaugeFullPreview />;
    case "stacked-revenue-chart":
      return <StackedRevenueFullPreview />;
    case "comparison-chart":
      return <ComparisonFullPreview />;
    case "realtime-activity-chart":
      return <RealtimeActivityFullPreview />;
  }
}

function FullPreviewCard({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div
      data-slot="chart-fullscreen-preview-card"
      role="img"
      aria-label={label}
      className={cn(
        "not-prose w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-secondary p-2 text-foreground shadow-sm",
        className,
      )}
    >
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card p-4">
        {children}
      </div>
    </div>
  );
}

function AllocationPerformanceFullPreview() {
  const allocations = [
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
    <FullPreviewCard
      label="Allocation performance chart fullscreen preview"
      className="max-w-[780px]"
    >
      <svg viewBox="0 0 780 360" className="h-auto w-full" aria-hidden="true">
        <defs>
          <pattern
            id="allocation-full-stripes"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              x2="0"
              y1="0"
              y2="8"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              opacity="0.22"
            />
          </pattern>
          <linearGradient
            id="allocation-full-panel"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--card)" />
            <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <rect
          x="20"
          y="26"
          width="740"
          height="306"
          rx="32"
          fill="url(#allocation-full-panel)"
          className="stroke-border"
        />
        <text
          x="52"
          y="76"
          className="fill-muted-foreground text-base font-semibold"
        >
          Allocation Performance
        </text>
        <g transform="translate(560 50)">
          <rect
            width="132"
            height="48"
            rx="24"
            className="fill-muted stroke-border"
            opacity="0.76"
          />
          <text x="24" y="30" className="fill-foreground text-sm font-medium">
            Asset class
          </text>
          <path
            d="M102 20 L108 26 L114 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          />
        </g>
        <g transform="translate(704 50)">
          <circle cx="24" cy="24" r="24" className="fill-muted stroke-border" />
          <path
            d="M16 30V20M24 30V14M32 30V24M14 30H34"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
          />
        </g>
        {allocations.map((allocation, index) => {
          const width = 154;
          const x = 52 + index * 170;
          const trackY = 118;
          const trackHeight = 176;
          const fillHeight = Math.max(
            (trackHeight * allocation.value) / 100,
            34,
          );
          const fillY = trackY + trackHeight - fillHeight;
          const labelInside = fillHeight > 44;

          return (
            <motion.g
              key={allocation.id}
              whileHover={{ y: -4, scale: 1.012 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                transformOrigin: `${x + width / 2}px ${trackY + trackHeight}px`,
              }}
            >
              <rect
                x={x}
                y={trackY}
                width={width}
                height={trackHeight}
                rx="12"
                fill="url(#allocation-full-stripes)"
              />
              <motion.rect
                x={x}
                y={fillY}
                width={width}
                height={fillHeight}
                rx="12"
                fill="currentColor"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.58,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  color: allocation.color,
                  transformOrigin: `${x + width / 2}px ${trackY + trackHeight}px`,
                }}
              />
              <motion.rect
                x={x + 14}
                y={fillY + 12}
                width={width - 28}
                height="1.5"
                rx="1"
                fill="var(--background)"
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: labelInside ? 0.34 : 0,
                  width: width - 28,
                }}
                transition={{ delay: 0.34 + index * 0.08, duration: 0.38 }}
              />
              <motion.text
                x={x + 16}
                y={labelInside ? fillY + 31 : fillY - 10}
                className="text-base font-semibold"
                fill={labelInside ? allocation.labelColor : "var(--foreground)"}
                initial={{ y: fillY + 14, opacity: 0 }}
                animate={{
                  y: labelInside ? fillY + 31 : fillY - 10,
                  opacity: 1,
                }}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.34 }}
              >
                {allocation.value}%
              </motion.text>
              <text
                x={x + width / 2}
                y="318"
                textAnchor="middle"
                className="fill-muted-foreground text-sm font-medium"
              >
                {allocation.label}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </FullPreviewCard>
  );
}

function RiskScoreGaugeFullPreview() {
  const remainderPath = "M66 254 A164 164 0 0 1 394 254";
  const progressPath = "M66 254 A164 164 0 0 1 272 104";

  return (
    <FullPreviewCard
      label="Risk score gauge fullscreen preview"
      className="max-w-[520px]"
    >
      <svg viewBox="0 0 460 340" className="h-auto w-full" aria-hidden="true">
        <defs>
          <pattern
            id="risk-full-stripes"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              x2="0"
              y1="0"
              y2="10"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-muted-foreground"
              opacity="0.2"
            />
          </pattern>
          <linearGradient id="risk-full-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--muted-foreground)" />
            <stop offset="45%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
          <filter id="risk-full-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="24"
          y="24"
          width="412"
          height="292"
          rx="34"
          className="fill-card stroke-border"
        />
        <text
          x="60"
          y="78"
          className="fill-muted-foreground text-base font-semibold"
        >
          Risk Score
        </text>
        <text x="60" y="128" className="fill-foreground text-5xl font-semibold">
          72
        </text>
        <text
          x="128"
          y="128"
          className="fill-muted-foreground text-3xl font-medium"
        >
          /100
        </text>
        <path
          d={remainderPath}
          fill="none"
          stroke="url(#risk-full-stripes)"
          strokeWidth="48"
          strokeLinecap="round"
        />
        <motion.path
          d={progressPath}
          fill="none"
          stroke="url(#risk-full-gradient)"
          strokeWidth="48"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        />
        <circle
          cx="66"
          cy="254"
          r="12"
          fill="var(--card)"
          stroke="var(--muted-foreground)"
          strokeOpacity="0.32"
          strokeWidth="12"
        />
        <line
          x1="272"
          x2="272"
          y1="118"
          y2="224"
          className="stroke-muted-foreground"
          strokeWidth="2"
          opacity="0.22"
        />
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.66, duration: 0.28, ease: "easeOut" }}
          style={{ transformOrigin: "272px 104px" }}
          filter="url(#risk-full-glow)"
        >
          <motion.circle
            cx="272"
            cy="104"
            r="31"
            className="fill-chart-2"
            animate={{ opacity: [0.2, 0.36, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle
            cx="272"
            cy="104"
            r="15"
            fill="var(--background)"
            stroke="var(--chart-2)"
            strokeWidth="2"
          />
        </motion.g>
        <motion.text
          x="230"
          y="292"
          textAnchor="middle"
          className="fill-muted-foreground text-base font-medium"
          initial={{ opacity: 0, y: 302 }}
          animate={{ opacity: 1, y: 292 }}
          transition={{ delay: 0.48, duration: 0.36 }}
        >
          Stability improved by +4%
        </motion.text>
      </svg>
    </FullPreviewCard>
  );
}

function DonutProgressFullPreview() {
  const segments = [
    { length: 126, offset: 0, className: "text-chart-2" },
    { length: 92, offset: 148, className: "text-chart-1" },
    { length: 56, offset: 264, className: "text-chart-4" },
  ];

  return (
    <FullPreviewCard
      label="Donut progress chart fullscreen preview"
      className="max-w-[460px]"
    >
      <svg viewBox="0 0 360 340" className="size-full" aria-hidden="true">
        <defs>
          <filter id="donut-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="180"
          cy="160"
          r="92"
          fill="none"
          stroke="currentColor"
          strokeWidth="24"
          className="text-muted"
        />
        {segments.map((segment, index) => (
          <motion.circle
            key={segment.offset}
            cx="180"
            cy="160"
            r="92"
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            strokeLinecap="round"
            className={segment.className}
            strokeDasharray={`${segment.length} 578`}
            initial={{ strokeDashoffset: 578, opacity: 0 }}
            animate={{ strokeDashoffset: -segment.offset, opacity: 0.95 }}
            transition={{
              delay: index * 0.1,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            transform="rotate(-90 180 160)"
            filter={index === 0 ? "url(#donut-glow)" : undefined}
          />
        ))}
        <text
          x="180"
          y="154"
          textAnchor="middle"
          className="fill-muted-foreground text-sm font-medium"
        >
          Progress
        </text>
        <text
          x="180"
          y="192"
          textAnchor="middle"
          className="fill-foreground text-5xl font-semibold"
        >
          84%
        </text>
      </svg>
    </FullPreviewCard>
  );
}

function StackedRevenueFullPreview() {
  const stacks = [
    {
      id: "jan",
      values: [
        { id: "jan-subscription", height: 74 },
        { id: "jan-services", height: 44 },
        { id: "jan-marketplace", height: 32 },
      ],
    },
    {
      id: "feb",
      values: [
        { id: "feb-subscription", height: 92 },
        { id: "feb-services", height: 56 },
        { id: "feb-marketplace", height: 38 },
      ],
    },
    {
      id: "mar",
      values: [
        { id: "mar-subscription", height: 84 },
        { id: "mar-services", height: 64 },
        { id: "mar-marketplace", height: 46 },
      ],
    },
    {
      id: "apr",
      values: [
        { id: "apr-subscription", height: 112 },
        { id: "apr-services", height: 68 },
        { id: "apr-marketplace", height: 52 },
      ],
    },
    {
      id: "may",
      values: [
        { id: "may-subscription", height: 124 },
        { id: "may-services", height: 76 },
        { id: "may-marketplace", height: 58 },
      ],
    },
    {
      id: "jun",
      values: [
        { id: "jun-subscription", height: 106 },
        { id: "jun-services", height: 72 },
        { id: "jun-marketplace", height: 48 },
      ],
    },
  ];

  return (
    <FullPreviewCard label="Stacked revenue chart fullscreen preview">
      <svg
        viewBox="0 0 720 420"
        className="h-[420px] w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="revenue-pattern"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 L10 0"
              stroke="currentColor"
              strokeWidth="1"
              className="text-background"
              opacity="0.5"
            />
          </pattern>
          <clipPath id="revenue-reveal">
            <motion.rect
              x="0"
              y="0"
              width="720"
              height="420"
              initial={{ width: 0 }}
              animate={{ width: 720 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </clipPath>
        </defs>
        {[70, 140, 210, 280, 350].map((y) => (
          <line
            key={y}
            x1="64"
            x2="656"
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeDasharray="2 10"
            className="text-border"
          />
        ))}
        <g clipPath="url(#revenue-reveal)">
          {stacks.map((stack, index) => {
            const x = 100 + index * 88;
            let cursor = 350;

            return (
              <g key={stack.id}>
                {stack.values.map((part, partIndex) => {
                  cursor -= part.height;
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
                      width="48"
                      height={part.height}
                      rx={partIndex === 0 ? 14 : 7}
                      fill={
                        partIndex === 2
                          ? "url(#revenue-pattern)"
                          : "currentColor"
                      }
                      className={className}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 0.9, y: 0 }}
                      transition={{
                        delay: index * 0.05 + partIndex * 0.04,
                        duration: 0.34,
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </FullPreviewCard>
  );
}

function ComparisonFullPreview() {
  return (
    <FullPreviewCard label="Comparison chart fullscreen preview">
      <svg
        viewBox="0 0 720 420"
        className="h-[420px] w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="comparison-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <mask id="comparison-mask">
            <motion.rect
              x="0"
              y="0"
              width="720"
              height="420"
              fill="white"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "left center" }}
            />
          </mask>
        </defs>
        <path
          d="M70 318 C142 246 188 268 248 206 C306 146 354 204 420 134 C488 62 548 104 654 74 L654 360 L70 360 Z"
          fill="url(#comparison-area)"
          className="text-chart-2"
          mask="url(#comparison-mask)"
        />
        <motion.path
          d="M70 318 C142 246 188 268 248 206 C306 146 354 204 420 134 C488 62 548 104 654 74"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-chart-2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M70 344 C136 310 190 190 254 246 C318 304 360 210 430 192 C506 172 562 196 654 138"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="12 12"
          className="text-chart-1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <circle
            cx="420"
            cy="134"
            r="16"
            fill="currentColor"
            className="text-chart-2"
            opacity="0.16"
          />
          <circle
            cx="420"
            cy="134"
            r="6"
            fill="currentColor"
            className="text-chart-2"
          />
          <rect
            x="438"
            y="102"
            width="74"
            height="30"
            rx="15"
            className="fill-background stroke-border"
          />
          <text
            x="475"
            y="122"
            textAnchor="middle"
            className="fill-foreground text-xs font-semibold"
          >
            +18%
          </text>
        </motion.g>
      </svg>
    </FullPreviewCard>
  );
}

function RealtimeActivityFullPreview() {
  const points = [
    { x: 86, y: 296 },
    { x: 162, y: 172 },
    { x: 244, y: 226 },
    { x: 338, y: 118 },
    { x: 452, y: 178 },
    { x: 566, y: 90 },
    { x: 646, y: 202 },
  ];

  return (
    <FullPreviewCard label="Realtime activity chart fullscreen preview">
      <svg
        viewBox="0 0 720 420"
        className="h-[420px] w-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="activity-grid"
            width="28"
            height="28"
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
        <rect
          x="48"
          y="48"
          width="624"
          height="324"
          rx="24"
          fill="url(#activity-grid)"
          opacity="0.42"
        />
        <motion.path
          d="M70 318 C116 318 114 126 162 172 C210 218 204 252 244 226 C296 194 286 80 338 118 C396 160 392 224 452 178 C510 132 508 70 566 90 C622 110 612 246 650 202"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {points.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="7"
              fill="currentColor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.22 + index * 0.07, duration: 0.2 }}
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ r: 7, opacity: 0.32 }}
              animate={{ r: [7, 24, 7], opacity: [0.3, 0, 0.3] }}
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
    </FullPreviewCard>
  );
}
