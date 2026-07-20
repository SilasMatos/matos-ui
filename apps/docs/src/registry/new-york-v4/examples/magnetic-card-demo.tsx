"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { MagneticCard } from "@/registry/new-york-v4/ui/magnetic-card";

export default function MagneticCardDemo() {
  return (
    <div className="flex w-full items-center justify-center py-6">
      <MagneticCard>
        <div className="flex items-center justify-between">
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <ArrowUpRight
            className="size-5 text-muted-foreground transition-colors group-hover:text-foreground"
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight">
          Magnetic Surface
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Move your cursor across the card. It follows with spring physics and a
          soft parallax tilt.
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-chart-2" />
          Spring · stiffness 220
        </div>
      </MagneticCard>
    </div>
  );
}
