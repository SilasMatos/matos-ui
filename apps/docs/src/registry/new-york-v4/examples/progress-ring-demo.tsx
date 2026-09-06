"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import { ProgressRing } from "@/registry/new-york-v4/ui/progress-ring";

const PRESETS = [
  { label: "Storage", value: 41, tier: "moderate" as const },
  { label: "Coverage", value: 78, tier: "slow" as const },
  { label: "Onboarding", value: 100, tier: "playful" as const },
];

export default function ProgressRingDemo() {
  const [value, setValue] = useState(64);
  const step = (delta: number) =>
    setValue((v) => Math.max(0, Math.min(100, v + delta)));

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-6 py-8">
      <Elevated
        offset={1}
        className="flex w-full flex-col items-center gap-4 rounded-2xl p-6"
      >
        <ProgressRing size="lg" value={value} aria-label="Monthly usage" />

        <div className="flex items-center gap-1.5">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => step(-8)}
            aria-label="Decrease"
          >
            <Minus />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => step(8)}
            aria-label="Increase"
          >
            <Plus />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setValue(0)}
            aria-label="Reset"
          >
            <RotateCcw />
          </Button>
        </div>
      </Elevated>

      <div className="flex w-full items-start justify-around gap-3">
        {PRESETS.map((preset) => (
          <div key={preset.label} className="flex flex-col items-center gap-2">
            <ProgressRing
              size="md"
              value={preset.value}
              tier={preset.tier}
              aria-label={preset.label}
            />
            <span className="text-muted-foreground text-xs">
              {preset.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
