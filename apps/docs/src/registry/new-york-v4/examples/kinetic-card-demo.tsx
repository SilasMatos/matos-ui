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
];

export default function KineticCardDemo() {
  return (
    <div className="flex w-full items-center justify-center">
      <KineticCard className="max-w-[360px]" badge="Live" tone="primary">
        <KineticCardHeader>
          <div className="space-y-1 pr-16">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Signal
            </p>
            <h3 className="text-base font-semibold leading-5">
              Adaptive queue
            </h3>
          </div>
        </KineticCardHeader>

        <KineticCardContent>
          <p className="text-muted-foreground text-xs leading-5">
            Compact motion surface for live SaaS state without turning into a
            feature block.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {signals.map((signal) => (
              <div
                className="rounded-lg border border-border/70 bg-secondary px-2.5 py-2"
                key={signal.label}
              >
                <p className="text-[10px] font-medium text-muted-foreground">
                  {signal.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{signal.value}</p>
              </div>
            ))}
          </div>
        </KineticCardContent>

        <KineticCardFooter>
          <span className="text-xs text-muted-foreground">
            Updated just now
          </span>
          <span className="size-2 rounded-full bg-primary" />
        </KineticCardFooter>
      </KineticCard>
    </div>
  );
}
