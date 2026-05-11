"use client";

import { Code2, PenLine, Rocket, Search } from "lucide-react";
import { useState } from "react";
import {
  ProcessTimelineEngine,
  type ProcessTimelineItem,
} from "@/registry/new-york-v4/ui/process-timeline-engine";

const timelineItems: ProcessTimelineItem[] = [
  {
    id: "discover",
    title: "Discover",
    description: "Research & plan",
    status: "complete",
    icon: <Search className="size-3.5" strokeWidth={2.4} />,
  },
  {
    id: "design",
    title: "Design",
    description: "UX prototype",
    status: "complete",
    icon: <PenLine className="size-3.5" strokeWidth={2.4} />,
  },
  {
    id: "build",
    title: "Build",
    description: "Implement & test",
    status: "active",
    icon: <Code2 className="size-3.5" strokeWidth={2.4} />,
  },
  {
    id: "launch",
    title: "Launch",
    description: "Ship & iterate",
    status: "pending",
    icon: <Rocket className="size-3.5" strokeWidth={2.4} />,
  },
];

export default function ProcessTimelineEngineDemo() {
  const [activeId, setActiveId] = useState("build");

  return (
    <div className="flex w-full justify-center">
      <ProcessTimelineEngine
        items={timelineItems}
        activeId={activeId}
        title="Process timeline"
        subtitle="Simple compact project flow"
        onItemSelect={(item) => setActiveId(item.id)}
      />
    </div>
  );
}
