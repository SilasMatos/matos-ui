"use client";

import { PerformanceWaterfallChart } from "@/registry/new-york-v4/ui/performance-waterfall-chart";

export default function PerformanceWaterfallChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <PerformanceWaterfallChart
        title="Page Load Waterfall"
        description="Network resource timing breakdown for dashboard.example.com"
        markerLabel="LCP"
        markerAt={256}
      />
    </div>
  );
}
