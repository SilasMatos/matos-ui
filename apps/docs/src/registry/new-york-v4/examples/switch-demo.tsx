"use client";

import { Switch } from "@/registry/new-york-v4/ui/switch";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Surface modes
          </p>
          <h3 className="text-sm font-medium">Modern toggle states</h3>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Switch defaultChecked aria-label="Enable sync" />
          <Switch shape="rectangle" defaultChecked aria-label="Enable review" />
          <Switch
            shape="rectangle"
            variant="outline"
            defaultChecked
            aria-label="Enable outline mode"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Rich content
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Switch content="icon" defaultChecked aria-label="Enable alerts" />
          <Switch content="icon" aria-label="Disable alerts" />
          <Switch content="label" defaultChecked aria-label="Enable workflow" />
          <Switch content="label" aria-label="Disable workflow" />
        </div>
      </section>
    </div>
  );
}
