"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Activity,
  AlignLeft,
  ArrowRight,
  ArrowUpRight,
  AudioWaveform,
  BarChart3,
  Circle as BubbleIcon,
  CandlestickChart as CandlestickIcon,
  Gauge,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  Network,
  Radar,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "@/i18n/navigation";
import { type ChartId, chartCollection } from "@/lib/charts";
import { cn } from "@/lib/utils";

type ChartCard = (typeof chartCollection)[number] & {
  href: `/charts/${ChartId}`;
  preview: ReactNode;
};

function AnimatedCounterText({
  value,
  duration = 900,
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
  "allocation-performance-chart": <AllocationPerformancePreview compact />,
  "sparkline-card": <MiniSparklinePreview />,
  "signal-flow-chart": <MiniSignalFlowPreview />,
  "activity-heatmap-chart": <MiniActivityHeatmapPreview />,
  "candlestick-chart": <MiniCandlestickPreview />,
  "bubble-chart": <MiniBubblePreview />,
  "activity-waveform-chart": <MiniWaveformPreview />,
  "performance-waterfall-chart": <MiniWaterfallPreview />,
  "threshold-band-chart": <MiniThresholdBandPreview />,
  "impact-priority-matrix": <MiniMatrixPreview />,
  "resource-treemap-chart": <MiniTreemapPreview />,
  "score-radar-chart": <MiniRadarPreview />,
  "risk-score-gauge": <RiskScoreGaugePreview compact />,
};

const heroSignalPath =
  "M-48 326 C110 286 168 252 286 272 C410 294 442 198 568 218 C692 238 720 154 842 176 C988 202 1034 158 1248 132";

const heroDataPoints = [
  { id: "p-1", cx: 128, cy: 282, r: 4, delay: 0.1 },
  { id: "p-2", cx: 378, cy: 274, r: 3.5, delay: 0.18 },
  { id: "p-3", cx: 568, cy: 218, r: 4.5, delay: 0.26 },
  { id: "p-4", cx: 842, cy: 176, r: 4, delay: 0.34 },
  { id: "p-5", cx: 1042, cy: 156, r: 3.5, delay: 0.42 },
] as const;

const heroMiniChartBars = [
  { id: "b-1", height: 34, delay: 0.08 },
  { id: "b-2", height: 58, delay: 0.13 },
  { id: "b-3", height: 82, delay: 0.18 },
  { id: "b-4", height: 52, delay: 0.23 },
  { id: "b-5", height: 96, delay: 0.28 },
  { id: "b-6", height: 68, delay: 0.33 },
] as const;

export function ChartsShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const previewReady = usePreviewReady();

  const charts = useMemo<ChartCard[]>(
    () =>
      chartCollection.map((chart) => ({
        ...chart,
        href: `/charts/${chart.id}`,
        preview: chartPreviews[chart.id],
      })),
    [],
  );

  return (
    <section className="not-prose space-y-10">
      <ChartsHero reducedMotion={Boolean(shouldReduceMotion)} />

      <div className="space-y-5">
        <div
          id="chart-components"
          className="scroll-mt-24 border-border border-b pb-4"
        >
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Registry
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-foreground">
            Chart Components
          </h2>
        </div>

        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {charts.map((chart, index) => (
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
      </div>
    </section>
  );
}

function ChartsHero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative isolate -mx-4 overflow-hidden border-border/60 border-b bg-background px-4 py-20 text-center text-foreground sm:-mx-6 sm:px-8 sm:py-24 lg:py-28",
        "[--charts-hero-glow:color-mix(in_oklab,var(--primary)_14%,transparent)] [--charts-hero-grid:color-mix(in_oklab,var(--border)_58%,transparent)]",
        "[--charts-hero-line:color-mix(in_oklab,var(--primary)_72%,var(--foreground)_28%)] [--charts-hero-line-soft:color-mix(in_oklab,var(--muted-foreground)_42%,transparent)]",
        "[--charts-hero-surface:color-mix(in_oklab,var(--card)_78%,transparent)] [--charts-hero-veil:color-mix(in_oklab,var(--background)_86%,transparent)]",
      )}
    >
      <ChartsHeroBackground reducedMotion={reducedMotion} />
      <HeroMiniChartCard reducedMotion={reducedMotion} />

      <div className="relative z-20 mx-auto flex min-h-[360px] w-full max-w-4xl flex-col items-center justify-center py-2 sm:min-h-[390px]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : 0.06,
            duration: reducedMotion ? 0 : 0.32,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-6 inline-flex min-h-8 items-center rounded-full border border-border/70 bg-card/70 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-[0_1px_0_color-mix(in_oklab,var(--border)_55%,transparent)] backdrop-blur-md"
        >
          Matos UI{" "}
          <span className="mx-1.5 text-muted-foreground/60">{"\u00B7"}</span>{" "}
          Charts
        </motion.div>

        <motion.h1
          initial={
            reducedMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: reducedMotion ? 0 : 0.12,
            duration: reducedMotion ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full max-w-[11ch] text-balance text-[3rem] font-semibold leading-[0.96] tracking-normal text-foreground sm:max-w-none sm:text-7xl sm:leading-[0.95] lg:text-[5.5rem]"
        >
          Ready-to-go <span className="block sm:inline">Charts</span>
        </motion.h1>

        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : 0.2,
            duration: reducedMotion ? 0 : 0.38,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-6 w-full max-w-[19.5rem] px-1 text-base leading-7 text-muted-foreground sm:max-w-2xl sm:text-lg sm:leading-8"
        >
          Beautiful open-source chart blocks for dashboards and analytics. Copy
          and paste into your apps. Works with any React framework.
        </motion.p>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : 0.26,
            duration: reducedMotion ? 0 : 0.34,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.a
            href="#chart-components"
            whileHover={reducedMotion ? undefined : "hover"}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_20px_52px_-24px_color-mix(in_oklab,var(--primary)_70%,transparent)] outline-none transition-[background-color,box-shadow] duration-200 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse Charts
            <motion.span
              variants={{ hover: { x: 3 } }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="inline-flex"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </motion.span>
          </motion.a>

          <motion.a
            href="#chart-components"
            whileHover={reducedMotion ? undefined : { y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border/70 bg-card/50 px-5 text-sm font-medium text-foreground outline-none backdrop-blur-md transition-[background-color,border-color] duration-200 hover:border-border hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
            Explore components
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ChartsHeroBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--charts-hero-glow),transparent_62%)] opacity-90" />

      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(var(--charts-hero-grid) 1px, transparent 1px), linear-gradient(90deg, var(--charts-hero-grid) 1px, transparent 1px)",
          backgroundPosition: "center",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 14%, black 72%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 14%, black 72%, transparent)",
        }}
      />

      <svg
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full opacity-90"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="charts-hero-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
            <stop
              offset="58%"
              stopColor="var(--foreground)"
              stopOpacity="0.05"
            />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="charts-hero-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
            <stop offset="48%" stopColor="var(--primary)" stopOpacity="0.52" />
            <stop
              offset="100%"
              stopColor="var(--muted-foreground)"
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>

        <motion.path
          d={`${heroSignalPath} L1248 470 L-48 470 Z`}
          fill="url(#charts-hero-area)"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 0.86 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        <motion.path
          d={heroSignalPath}
          fill="none"
          stroke="url(#charts-hero-stroke)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.92 }}
          transition={{
            duration: reducedMotion ? 0 : 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {heroDataPoints.map((point) => (
          <HeroDataPoint
            key={point.id}
            point={point}
            reducedMotion={reducedMotion}
          />
        ))}

        <motion.g
          className="hidden md:block"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 0.78, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : 0.42,
            duration: reducedMotion ? 0 : 0.32,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <line
            x1="566"
            x2="510"
            y1="218"
            y2="186"
            stroke="var(--charts-hero-line-soft)"
            strokeOpacity="0.55"
          />
          <rect
            x="424"
            y="158"
            width="104"
            height="34"
            rx="8"
            fill="var(--charts-hero-surface)"
            stroke="var(--border)"
            strokeOpacity="0.5"
          />
          <text
            x="476"
            y="179"
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize="12"
            fontWeight="500"
          >
            p95 182ms
          </text>
        </motion.g>
      </svg>

      <div
        className="absolute inset-y-10 left-1/2 w-[min(820px,96%)] -translate-x-1/2 bg-background/70 blur-3xl dark:bg-background/72"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background via-background/85 to-transparent"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-background via-background/90 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

function HeroDataPoint({
  point,
  reducedMotion,
}: {
  point: (typeof heroDataPoints)[number];
  reducedMotion: boolean;
}) {
  return (
    <g className="hidden sm:block">
      <motion.circle
        cx={point.cx}
        cy={point.cy}
        r={point.r * 3}
        fill="var(--primary)"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
        animate={
          reducedMotion
            ? { opacity: 0.08, scale: 1 }
            : { opacity: [0.04, 0.12, 0.04], scale: [0.75, 1.2, 0.75] }
        }
        transition={{
          delay: reducedMotion ? 0 : point.delay,
          duration: 3.2,
          repeat: reducedMotion ? 0 : Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: `${point.cx}px ${point.cy}px` }}
      />
      <motion.circle
        cx={point.cx}
        cy={point.cy}
        r={point.r}
        fill="var(--primary)"
        stroke="var(--background)"
        strokeWidth="2"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.72 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{
          delay: reducedMotion ? 0 : point.delay,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformOrigin: `${point.cx}px ${point.cy}px` }}
      />
    </g>
  );
}

function HeroMiniChartCard({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      transition={{
        delay: reducedMotion ? 0 : 0.36,
        duration: reducedMotion ? 0 : 0.42,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="pointer-events-auto absolute top-[56%] right-[-3.5rem] z-10 hidden w-56 -translate-y-1/2 rounded-lg border border-border/60 bg-card/70 p-3 text-left shadow-[0_24px_80px_-32px_color-mix(in_oklab,var(--foreground)_50%,transparent)] backdrop-blur-xl transition-colors duration-200 hover:border-border/80 xl:block"
    >
      <div className="flex items-center justify-between gap-3 border-border/60 border-b pb-3">
        <div>
          <p className="text-xs font-medium text-foreground">Query volume</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Last 6 releases
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/55 px-2 py-1 text-[10px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          Live
        </span>
      </div>

      <div className="mt-4 flex h-28 items-end gap-2 rounded-lg border border-border/50 bg-background/50 px-3 pb-3 pt-4">
        {heroMiniChartBars.map((bar, index) => (
          <motion.span
            key={bar.id}
            className={cn(
              "block w-full rounded-t-md",
              index === 4 ? "bg-primary" : "bg-muted-foreground/30",
            )}
            style={{
              height: bar.height,
              transformOrigin: "bottom",
            }}
            initial={reducedMotion ? false : { scaleY: 0.18, opacity: 0 }}
            animate={{ scaleY: 1, opacity: index === 4 ? 0.78 : 0.34 }}
            transition={{
              delay: reducedMotion ? 0 : bar.delay,
              duration: reducedMotion ? 0 : 0.42,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </div>
    </motion.div>
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
  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reducedMotion) {
      return;
    }

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--charts-mx", `${event.clientX - rect.left}px`);
    target.style.setProperty("--charts-my", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.article
      data-slot="charts-card"
      layout
      onPointerMove={handlePointerMove}
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
              y: -5,
              transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-secondary p-2 shadow-sm",
        "transition-[border-color,box-shadow] duration-300 hover:border-ring/40",
        "hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--foreground)_42%,transparent)]",
      )}
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--charts-mx, 50%) var(--charts-my, 0%), color-mix(in oklab, var(--ring) 22%, transparent), transparent 72%)",
        }}
      />

      <Link
        href={chart.href}
        aria-label={`Open ${chart.name} fullscreen preview`}
        className="relative z-10 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="relative h-40 overflow-hidden border-border/60 border-b bg-muted/25">
            {previewReady ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute inset-0 origin-center",
                  reducedMotion
                    ? ""
                    : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]",
                )}
              >
                {chart.preview}
              </motion.div>
            ) : (
              <PreviewSkeleton />
            )}

            {/* Depth fade + top sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/80 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:linear-gradient(120deg,transparent_40%,color-mix(in_oklab,var(--foreground)_8%,transparent)_50%,transparent_60%)]"
            />
          </div>

          <div className="space-y-4 p-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {chart.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {chart.description}
              </p>
            </div>

            <span
              data-slot="charts-card-cta"
              className={cn(
                "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-3 py-2 text-xs font-medium text-foreground shadow-sm",
                "transition-colors duration-300 group-hover:border-ring/45 group-hover:bg-muted",
              )}
            >
              Open fullscreen
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
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
    },
    {
      id: "stocks",
      label: "Stocks",
      value: 85,
      color: "var(--chart-3)",
    },
    {
      id: "etfs",
      label: "ETFs",
      value: 48,
      color: "color-mix(in oklab, var(--background) 92%, var(--foreground) 8%)",
    },
    {
      id: "crypto",
      label: "Crypto",
      value: 14,
      color:
        "color-mix(in oklab, var(--muted-foreground) 58%, var(--background) 42%)",
    },
  ] as const;
  const [activeBarId, setActiveBarId] = useState("stocks");
  const activeBar = bars.find((bar) => bar.id === activeBarId) ?? bars[1];
  const activeIndex = Math.max(
    0,
    bars.findIndex((bar) => bar.id === activeBar.id),
  );
  const activeX = 34 + activeIndex * 78;
  const tooltipWidth = 126;
  const tooltipX = Math.min(218, Math.max(24, activeX - 14));
  const tooltipY = 24;

  return (
    <PreviewFrame icon={<BarChart3 className="size-3.5" />} label="Allocation">
      <svg viewBox="0 0 360 180" className="size-full" aria-hidden="true">
        <defs>
          <filter id="allocation-mini-tooltip-shadow">
            <feDropShadow
              dx="0"
              dy="10"
              floodColor="var(--foreground)"
              floodOpacity="0.14"
              stdDeviation="10"
            />
          </filter>
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

            return (
              <motion.g
                key={bar.id}
                onPointerEnter={() => setActiveBarId(bar.id)}
                whileHover={{ y: -0.8, scale: 1.004 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `${x + width / 2}px ${trackY}px` }}
              >
                <motion.rect
                  x={x}
                  y={trackY}
                  width={width}
                  height={trackHeight}
                  rx="8"
                  fill="url(#allocation-mini-stripes)"
                  animate={{
                    opacity: activeBar.id === bar.id ? 1 : 0.72,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                <motion.rect
                  x={x}
                  y={fillY}
                  width={width}
                  height={fillHeight}
                  rx="8"
                  fill="currentColor"
                  initial={compact ? { scaleY: 0, opacity: 0 } : false}
                  animate={{
                    scaleY: 1,
                    opacity: activeBar.id === bar.id ? 1 : 0.84,
                  }}
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
        <AnimatePresence mode="wait">
          <motion.g
            key={activeBar.id}
            pointerEvents="none"
            initial={compact ? { opacity: 0, y: 6, scale: 0.98 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height="58"
              rx="10"
              fill="var(--popover)"
              stroke="var(--border)"
              filter="url(#allocation-mini-tooltip-shadow)"
            />
            <text
              x={tooltipX + 13}
              y={tooltipY + 22}
              fill="var(--popover-foreground)"
              className="text-[11px] font-semibold"
            >
              {activeBar.label}
            </text>
            <circle
              cx={tooltipX + 16}
              cy={tooltipY + 40}
              r="4.5"
              fill={activeBar.color}
            />
            <text
              x={tooltipX + 28}
              y={tooltipY + 44}
              fill="var(--muted-foreground)"
              className="text-[11px] font-medium"
            >
              Allocation
            </text>
            <text
              x={tooltipX + tooltipWidth - 12}
              y={tooltipY + 44}
              textAnchor="end"
              fill="var(--popover-foreground)"
              className="text-[11px] font-semibold"
            >
              {activeBar.value}%
            </text>
          </motion.g>
        </AnimatePresence>
      </svg>
    </PreviewFrame>
  );
}

function RiskScoreGaugePreview({ compact = false }: { compact?: boolean }) {
  const accent = "oklch(0.75 0.16 70)";
  const path = "M98 142 A92 92 0 0 1 282 142";
  const progressPath = "M98 142 A92 92 0 0 1 249 71";
  const markerX = 249;
  const markerY = 71;
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const animate = compact && !shouldReduceMotion;

  return (
    <PreviewFrame icon={<Gauge className="size-3.5" />} label="Risk">
      <svg viewBox="0 0 360 180" className="size-full" aria-hidden="true">
        <defs>
          <filter id="risk-mini-tooltip-shadow">
            <feDropShadow
              dx="0"
              dy="10"
              floodColor="var(--foreground)"
              floodOpacity="0.13"
              stdDeviation="10"
            />
          </filter>
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
            <stop offset="46%" stopColor={accent} />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>

        <g
          transform="translate(0 10)"
          onPointerEnter={() => setTooltipVisible(true)}
          onPointerLeave={() => setTooltipVisible(false)}
        >
          <path
            d={path}
            fill="none"
            stroke="url(#risk-mini-stripes)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <motion.path
            id="risk-mini-progress"
            d={progressPath}
            fill="none"
            stroke="url(#risk-mini-gradient)"
            strokeWidth="24"
            strokeLinecap="round"
            initial={animate ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
          <circle
            cx="98"
            cy="140"
            r="8"
            fill="var(--card)"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.32"
            strokeWidth="8"
          />

          {animate ? (
            <g>
              <animateMotion
                dur="0.95s"
                begin="0s"
                fill="freeze"
                rotate="0"
                calcMode="spline"
                keyTimes="0;1"
                keyPoints="0;1"
                keySplines="0.16 1 0.3 1"
              >
                <mpath
                  href="#risk-mini-progress"
                  xlinkHref="#risk-mini-progress"
                />
              </animateMotion>
              <circle cx="0" cy="0" r="18" fill={accent} opacity="0">
                <animate
                  attributeName="opacity"
                  values="0.2;0.4;0.2"
                  begin="1.05s"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="0"
                cy="0"
                r="9"
                fill="var(--background)"
                stroke={accent}
                strokeWidth="2"
              />
              <circle cx="0" cy="0" r="3" fill={accent} />
            </g>
          ) : (
            <g>
              <circle
                cx={markerX}
                cy={markerY}
                r="18"
                fill={accent}
                opacity="0.3"
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="9"
                fill="var(--background)"
                stroke={accent}
                strokeWidth="2"
              />
              <circle cx={markerX} cy={markerY} r="3" fill={accent} />
            </g>
          )}
        </g>

        {/* Centered value inside the gauge */}
        <text
          x="190"
          y="106"
          textAnchor="middle"
          className="fill-muted-foreground text-[12px] font-medium"
        >
          Risk Score
        </text>
        <AnimatedCounterText
          x="190"
          y="142"
          textAnchor="middle"
          value={72}
          duration={950}
          reducedMotion={Boolean(shouldReduceMotion)}
          className="fill-foreground text-[34px] font-semibold"
        />

        <AnimatePresence>
          {tooltipVisible ? (
            <motion.g
              pointerEvents="none"
              initial={compact ? { opacity: 0, y: 6, scale: 0.98 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect
                x="214"
                y="18"
                width="124"
                height="58"
                rx="10"
                fill="var(--popover)"
                stroke="var(--border)"
                filter="url(#risk-mini-tooltip-shadow)"
              />
              <text
                x="227"
                y="40"
                fill="var(--popover-foreground)"
                className="text-[11px] font-semibold"
              >
                Risk Score
              </text>
              <circle cx="230" cy="58" r="4.5" fill={accent} />
              <text
                x="242"
                y="62"
                fill="var(--muted-foreground)"
                className="text-[11px] font-medium"
              >
                Stability
              </text>
              <text
                x="326"
                y="62"
                textAnchor="end"
                fill="var(--popover-foreground)"
                className="text-[11px] font-semibold"
              >
                72/100
              </text>
            </motion.g>
          ) : null}
        </AnimatePresence>
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

function MiniSignalFlowPreview() {
  const shouldReduceMotion = useReducedMotion();
  const lanes = [
    { id: "gateway", y: 52, fraction: 0.9, color: "var(--chart-2)" },
    { id: "auth", y: 90, fraction: 0.55, color: "var(--chart-4)" },
    { id: "media", y: 128, fraction: 0.72, color: "var(--destructive)" },
  ];
  const railX = 64;
  const cableEndX = 250;

  return (
    <PreviewFrame icon={<Network className="size-3.5" />} label="Flow">
      <svg viewBox="0 0 320 170" className="size-full" aria-hidden="true">
        <line
          x1={railX}
          x2={railX}
          y1="40"
          y2="140"
          stroke="var(--border)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {lanes.map((lane, index) => {
          const bump = index % 2 === 0 ? 7 : -7;
          const length = cableEndX - railX;
          const path = `M ${railX} ${lane.y} C ${railX + length * 0.32} ${
            lane.y + bump
          }, ${railX + length * 0.68} ${lane.y - bump}, ${cableEndX} ${lane.y}`;
          const tipX = railX + length * lane.fraction;
          const trackId = `mini-signal-track-${lane.id}`;

          return (
            <g key={lane.id} style={{ color: lane.color }}>
              <defs>
                <linearGradient
                  id={`${trackId}-fill`}
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
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity="1"
                  />
                </linearGradient>
              </defs>
              <path
                id={trackId}
                d={path}
                fill="none"
                stroke="var(--border)"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.5"
              />
              <motion.path
                d={path}
                fill="none"
                stroke={`url(#${trackId}-fill)`}
                strokeWidth="5"
                strokeLinecap="round"
                initial={shouldReduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: lane.fraction }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
              <circle
                cx={railX}
                cy={lane.y}
                r="4"
                fill="var(--card)"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <circle cx={tipX} cy={lane.y} r="3.5" fill="currentColor" />
              {shouldReduceMotion
                ? null
                : [0, 1, 2].map((particle) => (
                    <circle key={particle} r="2.4" fill="currentColor">
                      <animateMotion
                        dur="3.4s"
                        begin={`-${(particle * 1.13).toFixed(2)}s`}
                        repeatCount="indefinite"
                        keyPoints={`0;${lane.fraction.toFixed(3)}`}
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href={`#${trackId}`} xlinkHref={`#${trackId}`} />
                      </animateMotion>
                    </circle>
                  ))}
            </g>
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function MiniActivityHeatmapPreview() {
  const shouldReduceMotion = useReducedMotion();
  const cols = 11;
  const rows = 7;
  const cell = 13;
  const gap = 3.5;
  const pitch = cell + gap;
  const offsetX = 10;
  const offsetY = 8;
  const opacities = [0.16, 0.34, 0.58, 0.82, 1];

  const cells = [];
  for (let column = 0; column < cols; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const index = column * rows + row;
      const wave = Math.sin(index * 0.7) + Math.cos(index * 0.27);
      const level = Math.max(0, Math.round((wave + 1.6) * 1.4)) % 5;
      cells.push({ column, row, level, index });
    }
  }

  return (
    <PreviewFrame icon={<LayoutGrid className="size-3.5" />} label="Grid">
      <svg
        viewBox="0 0 198 130"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        {cells.map((c) => {
          const empty = c.level === 0;
          return (
            <motion.rect
              key={c.index}
              x={offsetX + c.column * pitch}
              y={offsetY + c.row * pitch}
              width={cell}
              height={cell}
              rx="3"
              fill={empty ? "var(--muted)" : "currentColor"}
              fillOpacity={empty ? 0.5 : opacities[c.level]}
              stroke="var(--border)"
              strokeOpacity="0.4"
              strokeWidth="0.75"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: (c.column + c.row) * 0.02,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                transformOrigin: `${offsetX + c.column * pitch + cell / 2}px ${
                  offsetY + c.row * pitch + cell / 2
                }px`,
              }}
            />
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function MiniCandlestickPreview() {
  const shouldReduceMotion = useReducedMotion();
  const candles = [
    { o: 40, c: 30, h: 26, l: 44 },
    { o: 30, c: 34, h: 27, l: 38 },
    { o: 34, c: 28, h: 25, l: 37 },
    { o: 28, c: 22, h: 19, l: 31 },
    { o: 22, c: 26, h: 18, l: 29 },
    { o: 26, c: 18, h: 15, l: 30 },
    { o: 18, c: 14, h: 11, l: 22 },
    { o: 14, c: 20, h: 10, l: 23 },
    { o: 20, c: 12, h: 9, l: 24 },
    { o: 12, c: 8, h: 6, l: 17 },
  ];
  const slot = 300 / candles.length;
  return (
    <PreviewFrame
      icon={<CandlestickIcon className="size-3.5" />}
      label="Candles"
    >
      <svg viewBox="0 0 320 150" className="size-full" aria-hidden="true">
        {candles.map((candle, index) => {
          const up = candle.c < candle.o;
          const color = up ? "var(--chart-2)" : "var(--destructive)";
          const cx = 14 + slot * (index + 0.5);
          const top = Math.min(candle.o, candle.c) + 12;
          const bodyHeight = Math.max(4, Math.abs(candle.o - candle.c));
          return (
            <motion.g
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview candles
              key={index}
              style={{ color, transformOrigin: `${cx}px ${top + 30}px` }}
              initial={shouldReduceMotion ? false : { scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <line
                x1={cx}
                x2={cx}
                y1={candle.h + 12}
                y2={candle.l + 12}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect
                x={cx - 5}
                y={top}
                width="10"
                height={bodyHeight}
                rx="2"
                fill="currentColor"
              />
            </motion.g>
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function MiniBubblePreview() {
  const shouldReduceMotion = useReducedMotion();
  const bubbles = [
    { cx: 110, cy: 96, r: 38, tone: "var(--chart-1)" },
    { cx: 196, cy: 84, r: 30, tone: "var(--chart-4)" },
    { cx: 138, cy: 44, r: 20, tone: "var(--chart-2)" },
    { cx: 214, cy: 38, r: 14, tone: "var(--chart-3)" },
  ];
  return (
    <PreviewFrame icon={<BubbleIcon className="size-3.5" />} label="Bubble">
      <svg viewBox="0 0 320 150" className="size-full" aria-hidden="true">
        <defs>
          {bubbles.map((bubble, index) => (
            <radialGradient
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview bubbles
              key={index}
              id={`mini-bubble-${index}`}
              cx="38%"
              cy="32%"
              r="75%"
            >
              <stop
                offset="0%"
                stopColor={`color-mix(in oklab, ${bubble.tone} 55%, white)`}
              />
              <stop offset="60%" stopColor={bubble.tone} />
              <stop
                offset="100%"
                stopColor={`color-mix(in oklab, ${bubble.tone} 78%, black)`}
              />
            </radialGradient>
          ))}
        </defs>
        {bubbles.map((bubble, index) => (
          <motion.circle
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview bubbles
            key={index}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill={`url(#mini-bubble-${index})`}
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, y: [0, -5, 0] }
            }
            transition={{
              scale: {
                type: "spring",
                stiffness: 220,
                damping: 18,
                delay: index * 0.08,
              },
              opacity: { duration: 0.3, delay: index * 0.08 },
              y: {
                duration: 4 + index * 0.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
            style={{ transformOrigin: `${bubble.cx}px ${bubble.cy}px` }}
          />
        ))}
      </svg>
    </PreviewFrame>
  );
}

function MiniWaveformPreview() {
  const shouldReduceMotion = useReducedMotion();
  const bars = Array.from({ length: 34 }, (_, index) => {
    const wave =
      Math.sin(index * 0.55) * 0.5 + Math.cos(index * 0.9) * 0.2 + 1.1;
    return Math.round(wave * 34);
  });
  const slot = 300 / bars.length;
  return (
    <PreviewFrame
      icon={<AudioWaveform className="size-3.5" />}
      label="Waveform"
    >
      <svg
        viewBox="0 0 320 150"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        {bars.map((value, index) => {
          const x = 12 + slot * index + slot * 0.2;
          const barHeight = Math.max(4, value);
          return (
            <motion.rect
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview bars
              key={index}
              x={x}
              y={128 - barHeight}
              width={slot * 0.55}
              height={barHeight}
              rx="2"
              fill="currentColor"
              fillOpacity={index === 20 ? 1 : 0.85}
              initial={shouldReduceMotion ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                delay: index * 0.015,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${x}px 128px` }}
            />
          );
        })}
        <line
          x1="12"
          x2="308"
          y1="140"
          y2="140"
          stroke="var(--chart-2)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </PreviewFrame>
  );
}

function MiniWaterfallPreview() {
  const shouldReduceMotion = useReducedMotion();
  const steps = [
    { label: "DNS", start: 0, duration: 28, color: "var(--chart-2)" },
    { label: "TLS", start: 28, duration: 42, color: "var(--chart-4)" },
    { label: "TTFB", start: 70, duration: 186, color: "var(--chart-3)" },
    { label: "HTML", start: 256, duration: 94, color: "var(--chart-2)" },
    { label: "JS", start: 350, duration: 224, color: "var(--chart-1)" },
  ];
  const totalTime = 752;
  const lx = 70;
  const bw = 220;
  const rPitch = 24;
  const topY = 18;
  const barH = 14;

  return (
    <PreviewFrame icon={<AlignLeft className="size-3.5" />} label="Waterfall">
      <svg viewBox="0 0 320 160" className="size-full" aria-hidden="true">
        {steps.map((step, i) => {
          const bx = lx + (step.start / totalTime) * bw;
          const bWidth = Math.max(4, (step.duration / totalTime) * bw);
          const by = topY + i * rPitch;
          return (
            <motion.g
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview steps
              key={i}
              style={{ color: step.color }}
            >
              <rect
                x={lx}
                y={by}
                width={bw}
                height={barH}
                rx={barH / 2}
                fill="var(--muted)"
                fillOpacity="0.4"
              />
              <motion.rect
                x={bx}
                y={by}
                width={bWidth}
                height={barH}
                rx={barH / 2}
                fill="currentColor"
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: i * 0.09,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: `${bx}px ${by}px` }}
              />
              <text
                x={lx - 4}
                y={by + barH / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--muted-foreground)"
                className="text-[9px] font-medium"
              >
                {step.label}
              </text>
            </motion.g>
          );
        })}
        {/* LCP marker */}
        <line
          x1={lx + (256 / totalTime) * bw}
          x2={lx + (256 / totalTime) * bw}
          y1={topY - 4}
          y2={topY + steps.length * rPitch - 6}
          stroke="var(--foreground)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          opacity="0.45"
        />
      </svg>
    </PreviewFrame>
  );
}

function MiniThresholdBandPreview() {
  const shouldReduceMotion = useReducedMotion();
  const bands = [
    { color: "var(--chart-2)", fraction: 0.42 },
    { color: "oklch(0.75 0.16 70)", fraction: 0.25 },
    { color: "var(--destructive)", fraction: 0.33 },
  ];
  const bx = 14;
  const bw = 292;
  const by = 68;
  const bh = 26;
  const value = 0.6;
  const markerX = bx + value * bw;
  let offsetX = 0;

  return (
    <PreviewFrame
      icon={<SlidersHorizontal className="size-3.5" />}
      label="Band"
    >
      <svg viewBox="0 0 320 150" className="size-full" aria-hidden="true">
        {bands.map((band, bi) => {
          const segW = band.fraction * bw;
          const rx = bx + offsetX;
          offsetX += segW;
          return (
            <motion.rect
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview bands
              key={bi}
              x={rx}
              y={by}
              width={segW}
              height={bh}
              rx={bi === 0 ? bh / 2 : 0}
              fill={band.color}
              fillOpacity={bi === 1 ? 0.55 : bi === 2 ? 0.45 : 0.65}
              initial={shouldReduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: bi * 0.12,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${rx}px ${by}px` }}
            />
          );
        })}
        {/* Last band right-rounded end */}
        <rect
          x={bx + bw - 13}
          y={by}
          width={13}
          height={bh}
          rx={bh / 2}
          fill="var(--destructive)"
          fillOpacity="0.45"
        />

        {/* Labels */}
        <text
          x={bx + bands[0].fraction * bw * 0.5}
          y={by - 9}
          textAnchor="middle"
          fill="var(--chart-2)"
          fillOpacity="0.8"
          className="text-[9px] font-semibold"
        >
          Good
        </text>
        <text
          x={bx + (bands[0].fraction + bands[1].fraction * 0.5) * bw}
          y={by - 9}
          textAnchor="middle"
          fill="oklch(0.75 0.16 70)"
          fillOpacity="0.8"
          className="text-[9px] font-semibold"
        >
          Needs work
        </text>
        <text
          x={
            bx +
            (bands[0].fraction + bands[1].fraction + bands[2].fraction * 0.5) *
              bw
          }
          y={by - 9}
          textAnchor="middle"
          fill="var(--destructive)"
          fillOpacity="0.8"
          className="text-[9px] font-semibold"
        >
          Poor
        </text>

        {/* Marker */}
        <motion.g
          initial={shouldReduceMotion ? false : { x: bx }}
          animate={{ x: markerX }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <line
            x1="0"
            x2="0"
            y1={by - 3}
            y2={by + bh + 3}
            stroke="var(--foreground)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <polygon
            points="0,-4 4,0 0,4 -4,0"
            transform={`translate(0 ${by - 6})`}
            fill="var(--foreground)"
          />
          <text
            x="0"
            y={by + bh + 16}
            textAnchor="middle"
            fill="var(--foreground)"
            className="text-[10px] font-semibold"
          >
            2.8s
          </text>
        </motion.g>
      </svg>
    </PreviewFrame>
  );
}

function MiniMatrixPreview() {
  const shouldReduceMotion = useReducedMotion();
  const points = [
    { px: 102, py: 54, color: "var(--chart-2)" },
    { px: 168, py: 46, color: "var(--chart-2)" },
    { px: 96, py: 108, color: "var(--chart-4)" },
    { px: 212, py: 68, color: "var(--chart-3)" },
    { px: 222, py: 118, color: "var(--destructive)" },
    { px: 118, py: 78, color: "var(--chart-2)" },
  ];
  const midX = 160;
  const midY = 90;
  const gridX = 44;
  const gridY = 28;
  const gridW = 232;
  const gridH = 124;

  return (
    <PreviewFrame icon={<Target className="size-3.5" />} label="Matrix">
      <svg viewBox="0 0 320 160" className="size-full" aria-hidden="true">
        {/* Quadrant fills */}
        <rect
          x={gridX}
          y={gridY}
          width={gridW / 2}
          height={gridH / 2}
          fill="var(--chart-2)"
          fillOpacity="0.04"
        />
        <rect
          x={midX}
          y={gridY}
          width={gridW / 2}
          height={gridH / 2}
          fill="var(--chart-3)"
          fillOpacity="0.04"
        />
        <rect
          x={gridX}
          y={midY}
          width={gridW / 2}
          height={gridH / 2}
          fill="var(--muted-foreground)"
          fillOpacity="0.025"
        />
        <rect
          x={midX}
          y={midY}
          width={gridW / 2}
          height={gridH / 2}
          fill="var(--destructive)"
          fillOpacity="0.03"
        />
        {/* Axis lines */}
        <line
          x1={midX}
          x2={midX}
          y1={gridY}
          y2={gridY + gridH}
          stroke="var(--border)"
          strokeDasharray="4 5"
          opacity="0.6"
        />
        <line
          x1={gridX}
          x2={gridX + gridW}
          y1={midY}
          y2={midY}
          stroke="var(--border)"
          strokeDasharray="4 5"
          opacity="0.6"
        />
        <rect
          x={gridX}
          y={gridY}
          width={gridW}
          height={gridH}
          fill="none"
          stroke="var(--border)"
          opacity="0.45"
        />
        {/* Corner labels */}
        <text
          x={gridX + 6}
          y={gridY + 14}
          fill="var(--chart-2)"
          fillOpacity="0.55"
          className="text-[8.5px] font-semibold"
        >
          Quick Wins
        </text>
        <text
          x={gridX + gridW - 6}
          y={gridY + 14}
          textAnchor="end"
          fill="var(--chart-3)"
          fillOpacity="0.55"
          className="text-[8.5px] font-semibold"
        >
          Strategic
        </text>
        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview points
            key={i}
            cx={p.px}
            cy={p.py}
            r="6"
            fill={p.color}
            fillOpacity="0.85"
            stroke="var(--background)"
            strokeWidth="1.5"
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1 + i * 0.07,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            style={{ transformOrigin: `${p.px}px ${p.py}px` }}
          />
        ))}
      </svg>
    </PreviewFrame>
  );
}

function MiniTreemapPreview() {
  const shouldReduceMotion = useReducedMotion();
  const tiles = [
    { x: 0, y: 0, w: 168, h: 130, color: "var(--chart-1)", label: "JS" },
    { x: 168, y: 0, w: 100, h: 76, color: "var(--chart-2)", label: "Img" },
    { x: 168, y: 76, w: 100, h: 54, color: "var(--chart-4)", label: "CSS" },
    { x: 268, y: 0, w: 52, h: 80, color: "var(--chart-3)", label: "" },
    {
      x: 268,
      y: 80,
      w: 52,
      h: 50,
      color: "var(--muted-foreground)",
      label: "",
    },
  ];
  const gap = 2;

  return (
    <PreviewFrame
      icon={<LayoutDashboard className="size-3.5" />}
      label="Treemap"
    >
      <svg viewBox="0 0 320 140" className="size-full" aria-hidden="true">
        <defs>
          {tiles.map((tile, i) => (
            <radialGradient
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview tiles
              key={i}
              id={`mini-treemap-grad-${i}`}
              cx="30%"
              cy="28%"
              r="80%"
            >
              <stop
                offset="0%"
                stopColor={`color-mix(in oklab, ${tile.color} 55%, white)`}
              />
              <stop offset="60%" stopColor={tile.color} />
              <stop
                offset="100%"
                stopColor={`color-mix(in oklab, ${tile.color} 70%, black)`}
              />
            </radialGradient>
          ))}
        </defs>
        {tiles.map((tile, i) => {
          const rx = tile.x + gap / 2;
          const ry = tile.y + gap / 2;
          const rw = tile.w - gap;
          const rh = tile.h - gap;
          const cx = rx + rw / 2;
          const cy = ry + rh / 2;
          return (
            <motion.g
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview tiles
              key={i}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.06,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <rect
                x={rx}
                y={ry}
                width={rw}
                height={rh}
                rx="5"
                fill={`url(#mini-treemap-grad-${i})`}
                fillOpacity="0.9"
              />
              {tile.label ? (
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fill="white"
                  fillOpacity="0.88"
                  className="text-[11px] font-semibold"
                >
                  {tile.label}
                </text>
              ) : null}
            </motion.g>
          );
        })}
      </svg>
    </PreviewFrame>
  );
}

function MiniRadarPreview() {
  const shouldReduceMotion = useReducedMotion();
  const cx = 160;
  const cy = 80;
  const maxR = 60;
  const rings = 4;
  const n = 4;
  const values = [0.92, 0.98, 0.91, 0.87];
  const ringRadii = Array.from(
    { length: rings },
    (_, ring) => ((ring + 1) / rings) * maxR,
  );
  const spokeAngles = Array.from(
    { length: n },
    (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / n,
  );

  function poly(vals: number[], r: number) {
    return `${vals
      .map((v, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
        const radius = typeof v === "number" ? v * r : r;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ")} Z`;
  }

  const gridPoly = (r: number) => poly(Array(n).fill(1), r);

  return (
    <PreviewFrame icon={<Radar className="size-3.5" />} label="Radar">
      <svg
        viewBox="0 0 320 160"
        className="size-full text-chart-2"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mini-radar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* Grid rings */}
        {ringRadii.map((r) => (
          <path
            key={`ring-${r}`}
            d={gridPoly(r)}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity={r === maxR ? 0.6 : 0.35}
          />
        ))}
        {/* Spokes */}
        {spokeAngles.map((angle) => {
          return (
            <line
              key={`spoke-${angle.toFixed(3)}`}
              x1={cx}
              y1={cy}
              x2={cx + maxR * Math.cos(angle)}
              y2={cy + maxR * Math.sin(angle)}
              stroke="var(--border)"
              strokeWidth="1"
              opacity="0.4"
            />
          );
        })}
        {/* Fill */}
        <motion.path
          d={poly(values, maxR)}
          fill="url(#mini-radar-fill)"
          initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Stroke */}
        <motion.path
          d={poly(values, maxR)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Vertex dots */}
        {values.map((v, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
          const vx = cx + v * maxR * Math.cos(angle);
          const vy = cy + v * maxR * Math.sin(angle);
          return (
            <motion.circle
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed preview vertices
              key={i}
              cx={vx}
              cy={vy}
              r="4"
              fill="currentColor"
              stroke="var(--background)"
              strokeWidth="1.5"
              initial={shouldReduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.55 + i * 0.07,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              style={{ transformOrigin: `${vx}px ${vy}px` }}
            />
          );
        })}
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
