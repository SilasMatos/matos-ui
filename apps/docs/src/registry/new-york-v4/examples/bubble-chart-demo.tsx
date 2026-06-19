"use client";

import { BubbleChart } from "@/registry/new-york-v4/ui/bubble-chart";

const segments = [
  { label: "Mobile", value: 54.621, tone: "chart-1", x: 33, y: 62 },
  { label: "Desktop", value: 43.401, tone: "foreground", x: 66, y: 58 },
  { label: "Tablet", value: 24.331, tone: "chart-4", x: 38, y: 30 },
  { label: "Watch", value: 12.4, tone: "chart-2", x: 64, y: 28 },
  { label: "TV", value: 8.9, tone: "chart-3", x: 82, y: 76 },
];

export default function BubbleChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <BubbleChart
        title="Sales Report"
        description="Revenue weight by device segment"
        data={segments}
        valueFormatter={(value) => value.toLocaleString("en-US")}
      />
    </div>
  );
}
