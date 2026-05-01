"use client";

import {
  KineticCard,
  KineticCardContent,
  KineticCardFooter,
  KineticCardHeader,
} from "@/registry/new-york-v4/ui/kinetic-card";

const signals = [
  { label: "Latency", value: "24ms" },
  { label: "Sync", value: "98%" },
  { label: "Load", value: "1.2k" },
];

export default function KineticCardDemo() {
  return (
    <div className="flex w-full items-center justify-center p-2">
      <KineticCard badge="Live" size="lg" tone="accent">
        <KineticCardHeader>
          <div className="space-y-1 pr-14">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Signal layer
            </p>
            <h3 className="text-xl font-semibold tracking-tight">
              Adaptive orchestration
            </h3>
          </div>
        </KineticCardHeader>

        <KineticCardContent>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            A kinetic surface for product cards, status panels, and feature
            highlights that need motion without losing clarity.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {signals.map((signal) => (
              <div
                className="rounded-xl border border-border bg-background/70 p-3 shadow-xs backdrop-blur"
                key={signal.label}
              >
                <p className="text-[11px] font-medium text-muted-foreground">
                  {signal.label}
                </p>
                <p className="mt-1 text-sm font-semibold">{signal.value}</p>
              </div>
            ))}
          </div>
        </KineticCardContent>

        <KineticCardFooter>
          <span className="text-xs text-muted-foreground">
            Animated with theme-aware beams
          </span>
          <span className="size-2 rounded-full bg-chart-2 shadow-[0_0_0_4px_color-mix(in_oklch,var(--chart-2)_18%,transparent)]" />
        </KineticCardFooter>
      </KineticCard>
    </div>
  );
}
