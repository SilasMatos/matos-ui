"use client";

import { MetricCard } from "@/registry/new-york-v4/ui/metric-card";

const revenueData = [
  2400, 1398, 3200, 2780, 1890, 2390, 3490, 4000, 3200, 2800, 3600, 4200,
];

const usersData = [120, 180, 150, 220, 280, 240, 310, 350, 420, 380, 460, 520];

const conversionData = [
  2.1, 2.4, 1.8, 3.2, 2.8, 3.1, 3.5, 2.9, 3.8, 4.1, 3.6, 4.2,
];

export default function MetricCardDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      <MetricCard
        label="Monthly Revenue"
        value={42850}
        prefix="$"
        trend={{ value: 12, label: "vs last month" }}
        sparkline={revenueData}
        footer={
          <span className="text-xs text-muted-foreground/80">
            Updated just now
          </span>
        }
      />

      <MetricCard
        label="Active Users"
        value={1284}
        trend={{ value: 24 }}
        sparkline={usersData}
        footer={
          <span className="text-xs text-muted-foreground/80">Last 30 days</span>
        }
      />

      <MetricCard
        label="Conversion Rate"
        value={4.2}
        suffix="%"
        decimals={1}
        trend={{ value: -2, label: "vs last week" }}
        sparkline={conversionData}
        footer={
          <span className="text-xs text-muted-foreground/80">
            Weekly average
          </span>
        }
      />
    </div>
  );
}
