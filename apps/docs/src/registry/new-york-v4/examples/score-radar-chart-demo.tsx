"use client";

import { ScoreRadarChart } from "@/registry/new-york-v4/ui/score-radar-chart";

export default function ScoreRadarChartDemo() {
  return (
    <div className="flex w-full justify-center">
      <ScoreRadarChart
        title="Lighthouse Audit"
        description="Core Web Vitals and audit scores for homepage"
        data={[
          { label: "Performance", value: 92 },
          { label: "SEO", value: 98 },
          { label: "Best Practices", value: 91 },
          { label: "Accessibility", value: 87 },
        ]}
        showRingValues
      />
    </div>
  );
}
