"use client";

import { AllocationPerformanceChart } from "@/registry/new-york-v4/ui/allocation-performance-chart";

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

export default function AllocationPerformanceChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <AllocationPerformanceChart
        size="lg"
        data={allocationData}
        title="Allocation Performance"
        description="Hover or select an asset class to inspect allocation"
        height={300}
      />
    </div>
  );
}
