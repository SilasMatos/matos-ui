"use client";

import { RadialMetricChart } from "@/registry/new-york-v4/ui/radial-metric-chart";

export default function RadialMetricChartDemo() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-4">
      <RadialMetricChart
        value={84}
        title="Deployment health"
        description="Release readiness"
        label="Ready"
      />
      <RadialMetricChart
        value={62}
        title="Capacity"
        description="Current utilization"
        label="Used"
        valueFormatter={(value) => `${Math.round(value)}%`}
      />
    </div>
  );
}
