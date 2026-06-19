"use client";

import { SparklineCard } from "@/registry/new-york-v4/ui/sparkline-card";

const conversionData = [
  { label: "01", value: 18 },
  { label: "02", value: 24 },
  { label: "03", value: 21 },
  { label: "04", value: 32 },
  { label: "05", value: 28 },
  { label: "06", value: 38 },
  { label: "07", value: 44 },
  { label: "08", value: 41 },
  { label: "09", value: 52 },
];

export default function SparklineCardDemo() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-4">
      <SparklineCard
        data={conversionData}
        label="Conversion"
        suffix="%"
        trend={12.4}
        trendLabel="Improving over the last 9 periods"
      />
      <SparklineCard
        data={conversionData.map((item) => ({
          ...item,
          value: 72 - Number(item.value),
        }))}
        label="Churn risk"
        suffix="%"
        trend={-4.8}
        trendLabel="Lower than last week"
      />
    </div>
  );
}
