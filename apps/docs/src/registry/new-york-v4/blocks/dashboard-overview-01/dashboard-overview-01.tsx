"use client";

import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  GitCommitHorizontal,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import { MetricCard } from "@/registry/new-york-v4/ui/metric-card";

const ranges = ["7 days", "30 days", "90 days"] as const;

type Range = (typeof ranges)[number];

const metricsByRange: Record<
  Range,
  {
    revenue: number;
    customers: number;
    conversion: number;
    revenueTrend: number;
    customerTrend: number;
    conversionTrend: number;
    revenueSparkline: number[];
    customerSparkline: number[];
    conversionSparkline: number[];
  }
> = {
  "7 days": {
    revenue: 18420,
    customers: 1284,
    conversion: 7.8,
    revenueTrend: 12.5,
    customerTrend: 8.2,
    conversionTrend: 1.4,
    revenueSparkline: [18, 22, 20, 28, 25, 31, 36],
    customerSparkline: [22, 24, 23, 27, 29, 28, 32],
    conversionSparkline: [16, 18, 17, 21, 20, 23, 25],
  },
  "30 days": {
    revenue: 74290,
    customers: 4938,
    conversion: 7.2,
    revenueTrend: 9.8,
    customerTrend: 6.4,
    conversionTrend: 0.8,
    revenueSparkline: [17, 20, 23, 21, 28, 30, 34],
    customerSparkline: [19, 21, 24, 25, 27, 30, 31],
    conversionSparkline: [18, 19, 18, 20, 22, 21, 23],
  },
  "90 days": {
    revenue: 219860,
    customers: 14218,
    conversion: 6.9,
    revenueTrend: 18.6,
    customerTrend: 14.2,
    conversionTrend: -0.3,
    revenueSparkline: [14, 17, 20, 19, 25, 29, 38],
    customerSparkline: [16, 18, 20, 23, 26, 29, 34],
    conversionSparkline: [24, 23, 22, 23, 21, 22, 21],
  },
};

type DashboardActivityItem = {
  id: string;
  title: ReactNode;
  description: ReactNode;
  time: ReactNode;
  badge?: ReactNode;
  checks?: ReactNode;
  actor?: {
    name: string;
    initials?: string;
  };
  icon: ReactNode;
  tone?: "neutral" | "info" | "success" | "violet";
  unread?: boolean;
};

const activityItems: DashboardActivityItem[] = [
  {
    id: "deployment",
    title: "Production deployment completed",
    description: "Release v2.8.0 is live across all regions.",
    time: "4 min ago",
    badge: "Production",
    checks: "12 checks",
    icon: <CheckCircle2 />,
    tone: "success",
    unread: true,
  },
  {
    id: "customer",
    title: "New enterprise workspace",
    description: "Northstar Labs invited 24 team members.",
    time: "38 min ago",
    badge: "Growth",
    icon: <Sparkles />,
    tone: "violet",
  },
  {
    id: "commit",
    title: "Billing workflow updated",
    description: "Marina merged 6 commits into main.",
    time: "2 h ago",
    actor: { name: "Marina Costa", initials: "MC" },
    icon: <GitCommitHorizontal />,
    tone: "neutral",
  },
  {
    id: "incident",
    title: "API latency returned to normal",
    description: "The elevated p95 latency alert was resolved.",
    time: "5 h ago",
    badge: "Resolved",
    icon: <Radio />,
    tone: "info",
  },
];

const activityToneStyles = {
  neutral: {
    icon: "border-border/70 bg-muted text-muted-foreground",
    badge: "border-border/70 bg-secondary text-muted-foreground",
  },
  info: {
    icon: "border-border/70 bg-secondary text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
  },
  success: {
    icon: "border-primary/20 bg-primary/10 text-foreground",
    badge: "border-primary/15 bg-primary/5 text-foreground",
  },
  violet: {
    icon: "border-border/70 bg-secondary text-muted-foreground",
    badge: "border-border/70 bg-muted text-muted-foreground",
  },
} as const;

export function DashboardOverview01() {
  const [range, setRange] = useState<Range>("7 days");
  const metrics = metricsByRange[range];

  return (
    <div
      data-slot="dashboard-overview-01"
      className="@container/dashboard w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground"
    >
      <div className="mx-auto flex min-h-[34rem] w-full max-w-6xl flex-col gap-5 p-4 @2xl/dashboard:p-6">
        <header className="flex flex-col gap-4 @xl/dashboard:flex-row @xl/dashboard:items-end @xl/dashboard:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="soft" size="sm">
                Overview
              </Badge>
              <span className="text-xs text-muted-foreground">
                Friday, July 24
              </span>
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight @2xl/dashboard:text-3xl">
              Good morning, Marina
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Here is what changed across your workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-11 flex-1 @sm/dashboard:h-9 @sm/dashboard:flex-none"
            >
              <ArrowDownToLine aria-hidden="true" />
              Export
            </Button>
            <Button className="h-11 flex-1 @sm/dashboard:h-9 @sm/dashboard:flex-none">
              <Plus aria-hidden="true" />
              New report
            </Button>
          </div>
        </header>

        <fieldset className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/45 p-1 @sm/dashboard:w-fit">
          <legend className="sr-only">Dashboard date range</legend>
          {ranges.map((option) => {
            const active = option === range;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setRange(option)}
                className={[
                  "min-h-11 flex-1 shrink-0 rounded-lg px-3 text-xs font-medium outline-none transition-colors @sm/dashboard:min-h-8 @sm/dashboard:flex-none",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border border-border bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </fieldset>

        <section
          aria-label="Key metrics"
          className="grid gap-3 @xl/dashboard:grid-cols-3"
        >
          <MetricCard
            key={`revenue-${range}`}
            size={undefined}
            label="Net revenue"
            value={metrics.revenue}
            prefix="$"
            trend={{ value: metrics.revenueTrend, label: "vs prior" }}
            sparkline={metrics.revenueSparkline}
          />
          <MetricCard
            key={`customers-${range}`}
            size={undefined}
            label="Active customers"
            value={metrics.customers}
            trend={{ value: metrics.customerTrend }}
            sparkline={metrics.customerSparkline}
          />
          <MetricCard
            key={`conversion-${range}`}
            size={undefined}
            label="Conversion rate"
            value={metrics.conversion}
            suffix="%"
            decimals={1}
            trend={{ value: metrics.conversionTrend }}
            sparkline={metrics.conversionSparkline}
          />
        </section>

        <section aria-label="Recent workspace activity" className="min-w-0">
          <RecentActivity items={activityItems} />
        </section>
      </div>
    </div>
  );
}

function RecentActivity({ items }: { items: DashboardActivityItem[] }) {
  return (
    <Elevated
      offset={2}
      data-slot="dashboard-recent-activity"
      className="not-prose w-full overflow-hidden rounded-2xl p-2.5 text-foreground sm:p-3"
    >
      <div className="flex items-start justify-between gap-3 border-border/60 border-b px-3 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold leading-none text-foreground">
            Recent activity
          </h2>
          <p className="mt-1 text-muted-foreground text-xs leading-4">
            Updates from your team and connected services.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-secondary px-2 text-muted-foreground text-xs font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>View all</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <ol className="space-y-0.5 p-1">
        {items.map((item, index) => (
          <RecentActivityRow
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ol>
    </Elevated>
  );
}

function RecentActivityRow({
  item,
  isLast,
}: {
  item: DashboardActivityItem;
  isLast: boolean;
}) {
  const tone = activityToneStyles[item.tone ?? "neutral"];

  return (
    <li className="group relative grid grid-cols-[1.75rem_minmax(0,1fr)_1.5rem] gap-2.5 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted/35 focus-within:bg-muted/35">
      <div className="relative flex justify-center pt-0.5">
        {!isLast ? (
          <span
            aria-hidden="true"
            className="absolute top-8 bottom-[-1rem] w-px bg-border"
          />
        ) : null}

        <span
          className={[
            "relative z-10 flex size-7 items-center justify-center rounded-full border shadow-xs",
            "[&_svg]:size-3.5 [&_svg]:shrink-0",
            tone.icon,
          ].join(" ")}
        >
          {item.unread ? (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 size-2 rounded-full border border-card bg-primary"
            />
          ) : null}
          <span aria-hidden="true" className="flex items-center justify-center">
            {item.icon}
          </span>
        </span>
      </div>

      <div className="min-w-0 pt-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 truncate text-[13px] font-medium leading-5 text-foreground">
            {item.title}
          </p>
          {item.badge ? (
            <span
              className={[
                "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none",
                "transition-colors group-hover:border-border group-hover:bg-muted group-hover:text-foreground",
                tone.badge,
              ].join(" ")}
            >
              {item.badge}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs leading-5">
          {item.description}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {item.actor ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-[9px] font-medium text-muted-foreground">
                {item.actor.initials ?? item.actor.name.slice(0, 2)}
              </span>
              <span className="truncate">{item.actor.name}</span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3" aria-hidden="true" />
            <span>{item.time}</span>
          </span>
          {item.checks ? (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              <span>{item.checks}</span>
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        aria-label="Open activity details"
        className="-translate-x-1 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-[background-color,color,opacity,transform] hover:bg-secondary hover:text-foreground group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}
