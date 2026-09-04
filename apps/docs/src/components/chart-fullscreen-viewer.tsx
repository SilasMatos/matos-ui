"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Maximize2, Moon, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "@/i18n/navigation";
import { type ChartId, getChartById } from "@/lib/charts";
import { cn } from "@/lib/utils";
import { ActivityHeatmapChart } from "@/registry/new-york-v4/ui/activity-heatmap-chart";
import { ActivityWaveformChart } from "@/registry/new-york-v4/ui/activity-waveform-chart";
import { AllocationPerformanceChart } from "@/registry/new-york-v4/ui/allocation-performance-chart";
import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart";
import { BubbleChart } from "@/registry/new-york-v4/ui/bubble-chart";
import { CandlestickChart } from "@/registry/new-york-v4/ui/candlestick-chart";
import { ImpactPriorityMatrix } from "@/registry/new-york-v4/ui/impact-priority-matrix";
import { PerformanceWaterfallChart } from "@/registry/new-york-v4/ui/performance-waterfall-chart";
import { ResourceTreemapChart } from "@/registry/new-york-v4/ui/resource-treemap-chart";
import { ScoreRadarChart } from "@/registry/new-york-v4/ui/score-radar-chart";
import { SignalFlowChart } from "@/registry/new-york-v4/ui/signal-flow-chart";
import { SparklineCard } from "@/registry/new-york-v4/ui/sparkline-card";
import { ThresholdBandChart } from "@/registry/new-york-v4/ui/threshold-band-chart";

type ChartFullscreenViewerProps = ComponentProps<"main"> & {
  chartId: ChartId;
};

function AnimatedCounterText({
  value,
  duration = 1200,
  reducedMotion,
  ...props
}: ComponentProps<"text"> & {
  value: number;
  duration?: number;
  reducedMotion?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;

    function update(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      }
    }

    frame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frame);
  }, [duration, reducedMotion, value]);

  return <text {...props}>{displayValue}</text>;
}

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

const allocationData = [
  { label: "Bonds", value: 45, tone: "destructive" },
  { label: "Stocks", value: 85, tone: "chart-4" },
  {
    label: "ETFs",
    value: 48,
    tone: "color-mix(in oklab, var(--foreground) 18%, var(--background) 82%)",
  },
  {
    label: "Crypto",
    value: 14,
    tone: "color-mix(in oklab, var(--muted-foreground) 44%, var(--background) 56%)",
  },
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

const signalFlowData = [
  { label: "API Gateway", value: 92, hint: "Edge ingress" },
  { label: "Auth Service", value: 58, tone: "chart-4", hint: "Token mint" },
  { label: "Media CDN", value: 76, hint: "Asset stream" },
  { label: "Webhooks", value: 34, tone: "destructive", hint: "Outbound" },
  { label: "Analytics", value: 61, hint: "Event sink" },
];

export function ChartFullscreenViewer({
  chartId,
  className,
  ...props
}: ChartFullscreenViewerProps) {
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme, setTheme } = useTheme();
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

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
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
              <ControlButton label="Toggle theme" onClick={toggleTheme}>
                {resolvedTheme === "dark" ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
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
      "Hover or focus to explore, then click or tap a point to pin its tooltip until Escape or an outside press.",
  },
  "allocation-performance-chart": {
    summary:
      "An allocation dashboard card with textured asset tracks and bold fill states for portfolio composition.",
    details:
      "The chart is built as custom SVG: striped track patterns, animated column fills, rounded mask-like bars and per-asset labels inspired by premium finance interfaces.",
    interaction:
      "Hover or focus a bar to compare values; click or tap to pin the selection and its tooltip.",
  },
  "sparkline-card": {
    summary:
      "A small metric card with a dense sparkline, trend badge and animated masked area.",
    details:
      "The card is designed for dashboard grids where every pixel matters: compact value, trend context, subtle tooltip and a responsive SVG path.",
    interaction:
      "Hover to explore the sparkline, then click or tap a point to pin its compact tooltip.",
  },
  "signal-flow-chart": {
    summary:
      "A live throughput board where curved channel cables carry flowing particles from a source bus to value-scaled sinks.",
    details:
      "The chart is built from handcrafted SVG: bezier cables, a gradient fill that draws to each channel's throughput, one-pass particles and a focus-aware tooltip.",
    interaction:
      "Hover, focus, tap or select a channel to spotlight its cable and reveal the throughput tooltip.",
  },
  "activity-heatmap-chart": {
    summary:
      "A calendar-style activity grid that reveals in a diagonal wave, with clear intensity levels and an intent-driven tooltip.",
    details:
      "Every cell is an SVG square whose fill intensity maps to its value. The grid cascades in once along the diagonal, and every cell is keyboard focusable with an accessible label.",
    interaction:
      "Hover, focus, tap or select any day to reveal its value and intensity in the tooltip.",
  },
  "candlestick-chart": {
    summary:
      "An OHLC candlestick chart with bullish and bearish tones, growing candle bodies and an interactive price tooltip.",
    details:
      "Each candle is handcrafted SVG: a wick line and a body rect that grow from their center, colored by direction. Hovering or focusing a candle dims the rest and reveals open, high, low and close.",
    interaction:
      "Hover or focus a candle to inspect it; click or tap to pin its full OHLC values.",
  },
  "bubble-chart": {
    summary:
      "A weighted bubble chart with radial gradient fills, spring scale-in and interactive values.",
    details:
      "Bubbles are sized by value and placed from explicit coordinates or a deterministic spiral. Each uses its own radial gradient, scales in once and exposes an accessible label.",
    interaction:
      "Hover or focus a bubble to inspect it; click or tap to pin its label and value.",
  },
  "activity-waveform-chart": {
    summary:
      "A dense spending waveform with a metric header, hover tooltip and a split ratio bar with legend.",
    details:
      "Dozens of thin SVG bars grow from the baseline in a left-to-right wave, while a segmented ratio bar breaks down the total without leaving a value floating by default.",
    interaction:
      "Hover or focus any bar to read its value; click or tap to pin it while comparing the split.",
  },
  "performance-waterfall-chart": {
    summary:
      "A Gantt-style network timeline that reveals each resource step as a bar growing from its start offset.",
    details:
      "Bars animate through per-step clip-paths so the reveal tracks the true start time. A subtle vertical marker indicates a performance milestone (e.g. LCP), while time-axis ticks anchor the timeline.",
    interaction:
      "Hover or focus any bar to compare timing; click or tap to pin start, duration, end and step details.",
  },
  "threshold-band-chart": {
    summary:
      "A horizontal quality-band ruler that translates a raw metric into a Good / Needs improvement / Poor verdict at a glance.",
    details:
      "Bands reveal with staggered clip-path animation, a diamond marker slides to the current value with a spring ease and the active band lifts its opacity to draw the eye. Hover any band to see its full range.",
    interaction:
      "Hover or focus a band to inspect its range; click or tap to keep the comparison selected.",
  },
  "impact-priority-matrix": {
    summary:
      "A 2×2 effort–impact matrix for prioritising tasks, with spring-animated dots and quadrant context labels.",
    details:
      "Points spring into position with staggered delays, quadrant backgrounds reinforce meaning and the active point gains a restrained focus ring.",
    interaction:
      "Hover or focus any dot to see its label, description and effort–impact values.",
  },
  "resource-treemap-chart": {
    summary:
      "A proportional block layout that maps resource weight to tile area using a binary-split algorithm.",
    details:
      "Tiles are computed with a recursive binary split, each gets a unique radial gradient fill, they scale in with spring animations from their tile center and a percentage badge marks the dominant category.",
    interaction:
      "Hover or focus any tile to inspect it; click or tap to pin its size and share percentage.",
  },
  "score-radar-chart": {
    summary:
      "A multi-axis radar polygon that draws axis by axis and fills in from the center, ideal for audit score dashboards.",
    details:
      "The polygon stroke uses framer-motion pathLength to draw around the axes; the fill fades in from the center. Each vertex enters sequentially, and a comparison polygon can be added for before/after views.",
    interaction:
      "Hover, focus, tap or select a vertex to reveal the axis label and score in a tooltip.",
  },
  "risk-score-gauge": {
    summary:
      "A semi-radial risk meter with a large score, striped remainder arc and glowing stability marker.",
    details:
      "The gauge uses handcrafted SVG arcs, stroke-dash drawing, gradient progress, diagonal pattern fills and marker rings to match a refined risk analytics card.",
    interaction:
      "Replay the arc reveal to inspect the current score and stability marker position.",
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

  if (chartId === "animated-area-chart") {
    return ["recharts", "framer-motion", "tailwind-merge", "tailwind-variants"];
  }

  if (chartId === "allocation-performance-chart") {
    return [
      "framer-motion",
      "lucide-react",
      "tailwind-merge",
      "tailwind-variants",
    ];
  }

  if (
    chartId === "signal-flow-chart" ||
    chartId === "activity-heatmap-chart" ||
    chartId === "candlestick-chart" ||
    chartId === "bubble-chart" ||
    chartId === "activity-waveform-chart" ||
    chartId === "performance-waterfall-chart" ||
    chartId === "threshold-band-chart" ||
    chartId === "impact-priority-matrix" ||
    chartId === "resource-treemap-chart" ||
    chartId === "score-radar-chart"
  ) {
    return ["framer-motion", "tailwind-merge", "tailwind-variants"];
  }

  return ["framer-motion", "recharts", "theme tokens"];
}

function getUsageSnippet(chartId: ChartId) {
  const snippets: Record<ChartId, string> = {
    "animated-area-chart": `import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart"

<AnimatedAreaChart data={data} />`,
    "allocation-performance-chart": `import { AllocationPerformanceChart } from "@/registry/new-york-v4/ui/allocation-performance-chart"

<AllocationPerformanceChart data={allocations} />`,
    "sparkline-card": `import { SparklineCard } from "@/registry/new-york-v4/ui/sparkline-card"

<SparklineCard data={data} value={84.2} />`,
    "signal-flow-chart": `import { SignalFlowChart } from "@/registry/new-york-v4/ui/signal-flow-chart"

<SignalFlowChart data={channels} />`,
    "activity-heatmap-chart": `import { ActivityHeatmapChart } from "@/registry/new-york-v4/ui/activity-heatmap-chart"

<ActivityHeatmapChart data={days} />`,
    "candlestick-chart": `import { CandlestickChart } from "@/registry/new-york-v4/ui/candlestick-chart"

<CandlestickChart data={ohlc} />`,
    "bubble-chart": `import { BubbleChart } from "@/registry/new-york-v4/ui/bubble-chart"

<BubbleChart data={segments} />`,
    "activity-waveform-chart": `import { ActivityWaveformChart } from "@/registry/new-york-v4/ui/activity-waveform-chart"

<ActivityWaveformChart data={samples} value="−$3,245.00" />`,
    "performance-waterfall-chart": `import { PerformanceWaterfallChart } from "@/registry/new-york-v4/ui/performance-waterfall-chart"

<PerformanceWaterfallChart data={steps} markerLabel="LCP" markerAt={256} />`,
    "threshold-band-chart": `import { ThresholdBandChart } from "@/registry/new-york-v4/ui/threshold-band-chart"

<ThresholdBandChart bands={bands} value={2800} unit="ms" />`,
    "impact-priority-matrix": `import { ImpactPriorityMatrix } from "@/registry/new-york-v4/ui/impact-priority-matrix"

<ImpactPriorityMatrix data={items} />`,
    "resource-treemap-chart": `import { ResourceTreemapChart } from "@/registry/new-york-v4/ui/resource-treemap-chart"

<ResourceTreemapChart data={resources} />`,
    "score-radar-chart": `import { ScoreRadarChart } from "@/registry/new-york-v4/ui/score-radar-chart"

<ScoreRadarChart data={scores} showRingValues />`,
    "risk-score-gauge": `<RiskScoreGauge value={72} max={100} />
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
    case "allocation-performance-chart":
      return (
        <AllocationPerformanceChart
          size="full"
          data={allocationData}
          title="Allocation Performance"
          description="Textured allocation tracks with active marker and tooltip"
          height={360}
          className="w-full max-w-[760px]"
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
    case "signal-flow-chart":
      return (
        <SignalFlowChart
          size="full"
          data={signalFlowData}
          title="Signal Flow"
          description="Live throughput across service channels with flowing particles"
          height={360}
          className="w-full max-w-[760px]"
        />
      );
    case "activity-heatmap-chart":
      return (
        <ActivityHeatmapChart
          size="full"
          title="Contribution Activity"
          description="Daily engagement across the last 18 weeks"
          monthLabels={["Jan", "Feb", "Mar", "Apr"]}
          valueFormatter={(value) => `${value} contributions`}
          className="w-full max-w-[680px]"
        />
      );
    case "candlestick-chart":
      return (
        <CandlestickChart
          size="full"
          title="Sales Report"
          description="Open-high-low-close price action over 16 sessions"
          valueFormatter={(value) => `$${value.toFixed(0)}`}
          height={360}
          className="w-full max-w-[760px]"
        />
      );
    case "bubble-chart":
      return (
        <BubbleChart
          size="full"
          title="Sales Report"
          description="Revenue weight by device segment"
          valueFormatter={(value) => value.toLocaleString("en-US")}
          height={400}
          className="w-full max-w-[560px]"
        />
      );
    case "activity-waveform-chart":
      return (
        <ActivityWaveformChart
          size="full"
          title="Sales activity"
          valueCaption="This week you spent"
          value="−$3,245.00"
          height={200}
          valueFormatter={(value) => `$${value.toLocaleString("en-US")}`}
          className="w-full max-w-[620px]"
        />
      );
    case "performance-waterfall-chart":
      return (
        <PerformanceWaterfallChart
          size="full"
          title="Page Load Waterfall"
          description="Network resource timing breakdown for dashboard.example.com"
          markerLabel="LCP"
          markerAt={256}
          height={320}
          className="w-full max-w-[760px]"
        />
      );
    case "threshold-band-chart":
      return (
        <ThresholdBandChart
          size="full"
          title="LCP Score"
          description="Largest Contentful Paint — measures perceived load speed"
          bands={[
            { label: "Good", max: 2500, tone: "chart-2" },
            {
              label: "Needs improvement",
              max: 4000,
              tone: "chart-4",
            },
            { label: "Poor", tone: "destructive" },
          ]}
          value={2800}
          unit="ms"
          className="w-full max-w-[560px]"
        />
      );
    case "impact-priority-matrix":
      return (
        <ImpactPriorityMatrix
          size="full"
          title="Optimization Opportunities"
          description="Web performance improvements ranked by effort vs impact"
          height={400}
          className="w-full max-w-150"
        />
      );
    case "resource-treemap-chart":
      return (
        <ResourceTreemapChart
          size="full"
          title="Page Weight Breakdown"
          description="Total transferred bytes by resource category"
          data={[
            { label: "JavaScript", value: 420, unit: "KB", tone: "chart-1" },
            { label: "Images", value: 248, unit: "KB", tone: "chart-2" },
            { label: "CSS", value: 112, unit: "KB", tone: "chart-4" },
            { label: "Fonts", value: 68, unit: "KB", tone: "chart-3" },
            { label: "Other", value: 32, unit: "KB", tone: "muted-foreground" },
          ]}
          height={360}
          className="w-full max-w-160"
        />
      );
    case "score-radar-chart":
      return (
        <ScoreRadarChart
          size="full"
          title="Lighthouse Audit"
          description="Core Web Vitals and audit scores for homepage"
          data={[
            { label: "Performance", value: 92 },
            { label: "SEO", value: 98 },
            { label: "Best Practices", value: 91 },
            { label: "Accessibility", value: 87 },
          ]}
          showRingValues
          className="w-full max-w-120"
        />
      );
    case "risk-score-gauge":
      return <RiskScoreGaugeFullPreview />;
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

// biome-ignore lint/correctness/noUnusedVariables: kept temporarily while the registry chart replaces this preview.
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
  ] as const;
  const [activeAllocationId, setActiveAllocationId] = useState("stocks");
  const activeAllocation =
    allocations.find((allocation) => allocation.id === activeAllocationId) ??
    allocations[1];
  const activeIndex = Math.max(
    0,
    allocations.findIndex(
      (allocation) => allocation.id === activeAllocation.id,
    ),
  );
  const activeX = 52 + activeIndex * 170;
  const tooltipWidth = 168;
  const tooltipX = Math.min(568, Math.max(44, activeX - 18));
  const tooltipY = 82;

  return (
    <FullPreviewCard
      label="Allocation performance chart fullscreen preview"
      className="max-w-[780px]"
    >
      <svg viewBox="0 0 780 360" className="h-auto w-full" aria-hidden="true">
        <defs>
          <filter id="allocation-full-tooltip-shadow">
            <feDropShadow
              dx="0"
              dy="2"
              floodColor="var(--foreground)"
              floodOpacity="0.12"
              stdDeviation="3"
            />
          </filter>
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
              onPointerEnter={() => setActiveAllocationId(allocation.id)}
              whileHover={{ y: -1.2, scale: 1.004 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              style={{
                transformOrigin: `${x + width / 2}px ${trackY + trackHeight}px`,
              }}
            >
              <motion.rect
                x={x}
                y={trackY}
                width={width}
                height={trackHeight}
                rx="12"
                fill="url(#allocation-full-stripes)"
                animate={{
                  opacity: activeAllocation.id === allocation.id ? 1 : 0.7,
                }}
                transition={{ duration: 0.34, ease: "easeOut" }}
              />
              <motion.rect
                x={x}
                y={fillY}
                width={width}
                height={fillHeight}
                rx="12"
                fill="currentColor"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: 1,
                  opacity: activeAllocation.id === allocation.id ? 1 : 0.84,
                }}
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
        <AnimatePresence mode="wait">
          <motion.g
            key={activeAllocation.id}
            pointerEvents="none"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height="70"
              rx="14"
              fill="var(--popover)"
              stroke="var(--border)"
              filter="url(#allocation-full-tooltip-shadow)"
            />
            <text
              x={tooltipX + 18}
              y={tooltipY + 27}
              fill="var(--popover-foreground)"
              className="text-sm font-semibold"
            >
              {activeAllocation.label}
            </text>
            <circle
              cx={tooltipX + 22}
              cy={tooltipY + 50}
              r="5.5"
              fill={activeAllocation.color}
            />
            <text
              x={tooltipX + 38}
              y={tooltipY + 55}
              fill="var(--muted-foreground)"
              className="text-sm font-medium"
            >
              Allocation
            </text>
            <text
              x={tooltipX + tooltipWidth - 16}
              y={tooltipY + 55}
              textAnchor="end"
              fill="var(--popover-foreground)"
              className="text-sm font-semibold"
            >
              {activeAllocation.value}%
            </text>
          </motion.g>
        </AnimatePresence>
      </svg>
    </FullPreviewCard>
  );
}

function RiskScoreGaugeFullPreview() {
  const accent = "var(--chart-4)";
  const remainderPath = "M112 256 A138 138 0 0 1 388 256";
  const progressPath = "M112 256 A138 138 0 0 1 338 150";
  const markerX = 338;
  const markerY = 150;
  const [tooltipHovered, setTooltipHovered] = useState(false);
  const [tooltipSelected, setTooltipSelected] = useState(false);
  const tooltipVisible = tooltipHovered || tooltipSelected;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-slot="risk-score-gauge-full-preview"
      role="img"
      aria-label="Risk score gauge fullscreen preview"
      className="not-prose w-full max-w-[540px] text-foreground"
    >
      <svg viewBox="0 0 500 320" className="h-auto w-full" aria-hidden="true">
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
            <stop offset="42%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="14"
          width="480"
          height="292"
          rx="30"
          className="fill-card stroke-border"
        />

        <motion.g
          tabIndex={0}
          role="button"
          aria-label="Inspect risk score"
          onPointerEnter={() => setTooltipHovered(true)}
          onPointerLeave={() => setTooltipHovered(false)}
          onClick={() => setTooltipSelected((selected) => !selected)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTooltipSelected((selected) => !selected);
            }
          }}
        >
          <motion.path
            d={remainderPath}
            fill="none"
            stroke="url(#risk-full-stripes)"
            strokeWidth="42"
            strokeLinecap="round"
            initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.path
            id="risk-full-progress"
            d={progressPath}
            fill="none"
            stroke="url(#risk-full-gradient)"
            strokeWidth="42"
            strokeLinecap="round"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <circle
            cx="112"
            cy="256"
            r="10"
            fill="var(--card)"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.32"
            strokeWidth="10"
          />

          {shouldReduceMotion ? (
            <g>
              <circle
                cx={markerX}
                cy={markerY}
                r="27"
                fill={accent}
                opacity="0.28"
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="13"
                fill="var(--background)"
                stroke={accent}
                strokeWidth="2"
              />
              <circle cx={markerX} cy={markerY} r="4" fill={accent} />
            </g>
          ) : (
            <g>
              <animateMotion
                dur="1.5s"
                begin="0s"
                fill="freeze"
                rotate="0"
                calcMode="spline"
                keyTimes="0;1"
                keyPoints="0;1"
                keySplines="0.16 1 0.3 1"
              >
                <mpath
                  href="#risk-full-progress"
                  xlinkHref="#risk-full-progress"
                />
              </animateMotion>
              <circle cx="0" cy="0" r="27" fill={accent} opacity="0">
                <animate
                  attributeName="opacity"
                  values="0.18;0.34;0.18"
                  begin="1.6s"
                  dur="2.4s"
                  repeatCount="1"
                />
              </circle>
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="var(--background)"
                stroke={accent}
                strokeWidth="2"
              />
              <circle cx="0" cy="0" r="4" fill={accent} />
            </g>
          )}
        </motion.g>

        {/* Centered value inside the gauge, clear of the arc band */}
        <text
          x="250"
          y="184"
          textAnchor="middle"
          className="fill-muted-foreground text-base font-semibold"
        >
          Risk Score
        </text>
        <AnimatedCounterText
          x="250"
          y="244"
          textAnchor="middle"
          value={72}
          duration={1500}
          reducedMotion={Boolean(shouldReduceMotion)}
          className="fill-foreground text-6xl font-semibold"
        />
        <text
          x="250"
          y="272"
          textAnchor="middle"
          className="fill-muted-foreground text-sm font-medium"
        >
          out of 100
        </text>

        <AnimatePresence>
          {tooltipVisible ? (
            <motion.g
              pointerEvents="none"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect
                x="314"
                y="60"
                width="158"
                height="66"
                rx="14"
                fill="var(--popover)"
                stroke="var(--border)"
              />
              <text
                x="334"
                y="88"
                fill="var(--popover-foreground)"
                className="text-sm font-semibold"
              >
                Risk Score
              </text>
              <circle cx="336" cy="110" r="5.5" fill={accent} />
              <text
                x="352"
                y="115"
                fill="var(--muted-foreground)"
                className="text-sm font-medium"
              >
                Stability
              </text>
              <text
                x="456"
                y="115"
                textAnchor="end"
                fill="var(--popover-foreground)"
                className="text-xs font-semibold"
              >
                72/100
              </text>
            </motion.g>
          ) : null}
        </AnimatePresence>
        <motion.text
          x="250"
          y="292"
          textAnchor="middle"
          className="fill-muted-foreground text-base font-medium"
          initial={{ opacity: 0, y: 302 }}
          animate={{ opacity: 1, y: 292 }}
          transition={{ delay: 0.6, duration: 0.36 }}
        >
          Stability improved by +4%
        </motion.text>
      </svg>
    </div>
  );
}
