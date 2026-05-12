"use client";

import { useState } from "react";
import {
  ProcessTimelineEngine,
  type ProcessTimelineItem,
} from "@/registry/new-york-v4/ui/process-timeline-engine";

const timelineItems: ProcessTimelineItem[] = [
  {
    id: "profit-8k",
    title: "$8,000",
    description: "Profit Target",
    status: "complete",
    progress: 100,
    result: "$8,000",
    target: "$8,000",
    badge: "Passed",
  },
];

export default function ProcessTimelineEngineDemo() {
  const [activeId, setActiveId] = useState("profit-10k");

  return (
    <div className="flex w-full justify-center p-4">
      <ProcessTimelineEngine
        items={timelineItems}
        activeId={activeId}
        onItemSelect={(item) => setActiveId(item.id)}
      />
    </div>
  );
}
