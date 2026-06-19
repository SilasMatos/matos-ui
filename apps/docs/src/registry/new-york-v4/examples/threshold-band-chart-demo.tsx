"use client";

import { ThresholdBandChart } from "@/registry/new-york-v4/ui/threshold-band-chart";

export default function ThresholdBandChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <ThresholdBandChart
        title="LCP Score"
        description="Largest Contentful Paint — measures perceived load speed"
        bands={[
          { label: "Good", max: 2500, tone: "chart-2" },
          {
            label: "Needs improvement",
            max: 4000,
            tone: "oklch(0.75 0.16 70)",
          },
          { label: "Poor", tone: "destructive" },
        ]}
        value={2800}
        unit="ms"
      />
    </div>
  );
}
