"use client";

import { InteractiveBarChart } from "@/registry/new-york-v4/ui/interactive-bar-chart";

const activityData = [
  { label: "Mon", value: 38 },
  { label: "Tue", value: 55 },
  { label: "Wed", value: 42 },
  { label: "Thu", value: 71 },
  { label: "Fri", value: 64 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 76 },
];

export default function InteractiveBarChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <InteractiveBarChart
        size="lg"
        data={activityData}
        title="Weekly activity"
        description="Hover or focus bars to inspect values"
        valueFormatter={(value) => `${Math.round(value)}k`}
        height={300}
      />
    </div>
  );
}
