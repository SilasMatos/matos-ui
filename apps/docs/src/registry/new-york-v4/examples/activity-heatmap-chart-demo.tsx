"use client";

import { ActivityHeatmapChart } from "@/registry/new-york-v4/ui/activity-heatmap-chart";

export default function ActivityHeatmapChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <ActivityHeatmapChart
        title="Contribution Activity"
        description="Daily commits over the last 18 weeks"
        monthLabels={["Jan", "Feb", "Mar", "Apr"]}
        valueFormatter={(value) => `${value} contributions`}
      />
    </div>
  );
}
