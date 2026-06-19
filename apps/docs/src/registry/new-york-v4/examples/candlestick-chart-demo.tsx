"use client";

import { CandlestickChart } from "@/registry/new-york-v4/ui/candlestick-chart";

export default function CandlestickChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <CandlestickChart
        title="Sales Report"
        description="Daily price action over 16 sessions"
        valueFormatter={(value) => `$${value.toFixed(0)}`}
      />
    </div>
  );
}
