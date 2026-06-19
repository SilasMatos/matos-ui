"use client";

import { AnimatedAreaChart } from "@/registry/new-york-v4/ui/animated-area-chart";

const revenueData = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 53 },
  { month: "Apr", value: 49 },
  { month: "May", value: 68 },
  { month: "Jun", value: 74 },
  { month: "Jul", value: 69 },
  { month: "Aug", value: 86 },
  { month: "Sep", value: 91 },
];

export default function AnimatedAreaChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <AnimatedAreaChart
        size="lg"
        data={revenueData}
        title="Revenue velocity"
        description="Monthly recurring revenue trend"
        valueFormatter={(value) => `$${value.toFixed(1)}k`}
        height={300}
      />
    </div>
  );
}
