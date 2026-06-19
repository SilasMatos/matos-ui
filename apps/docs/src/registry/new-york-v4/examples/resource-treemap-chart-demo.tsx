"use client";

import { ResourceTreemapChart } from "@/registry/new-york-v4/ui/resource-treemap-chart";

export default function ResourceTreemapChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <ResourceTreemapChart
        title="Page Weight Breakdown"
        description="Total transferred bytes by resource category"
        data={[
          { label: "JavaScript", value: 420, unit: "KB", tone: "chart-1" },
          { label: "Images", value: 248, unit: "KB", tone: "chart-2" },
          { label: "CSS", value: 112, unit: "KB", tone: "chart-4" },
          { label: "Fonts", value: 68, unit: "KB", tone: "chart-3" },
          { label: "Other", value: 32, unit: "KB", tone: "muted-foreground" },
        ]}
      />
    </div>
  );
}
