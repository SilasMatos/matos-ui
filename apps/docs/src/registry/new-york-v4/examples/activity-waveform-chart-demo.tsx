"use client";

import { ActivityWaveformChart } from "@/registry/new-york-v4/ui/activity-waveform-chart";

export default function ActivityWaveformChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <ActivityWaveformChart
        title="Sales activity"
        valueCaption="This week you spent"
        value="−$3,245.00"
        startLabel="Mon"
        endLabel="Sun"
        segments={[
          { label: "Credit card", value: 83, tone: "chart-2" },
          { label: "Cash", value: 17, tone: "chart-4" },
        ]}
        valueFormatter={(value) => `$${value.toLocaleString("en-US")}`}
      />
    </div>
  );
}
