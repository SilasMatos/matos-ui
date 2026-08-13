"use client";

import {
  ArrowDownToLine,
  CheckCircle2,
  GitCommitHorizontal,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/registry/new-york-v4/ui/activity-feed";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
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

const activityItems: ActivityFeedItem[] = [
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
          <ActivityFeed
            items={activityItems}
            title="Recent activity"
            description="Updates from your team and connected services."
            showAction
            actionLabel="View all"
            compact
          />
        </section>
      </div>
    </div>
  );
}
