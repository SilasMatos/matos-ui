"use client";

import { Layers } from "lucide-react";
import { ElasticPanel } from "@/registry/new-york-v4/ui/elastic-panel";

export default function ElasticPanelDemo() {
  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3 py-6">
      <ElasticPanel
        title="What is spring physics?"
        icon={<Layers className="size-4" aria-hidden="true" />}
        defaultOpen
      >
        Height animates with a real spring — it eases in with a subtle overshoot
        instead of a fixed duration, so opening and closing feel physical.
      </ElasticPanel>

      <ElasticPanel title="Can I tune the feel?">
        Yes. Adjust{" "}
        <span className="font-medium text-foreground">stiffness</span> and{" "}
        <span className="font-medium text-foreground">damping</span> to make it
        snappier or bouncier.
      </ElasticPanel>
    </div>
  );
}
