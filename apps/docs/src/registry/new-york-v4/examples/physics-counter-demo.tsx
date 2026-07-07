"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { PhysicsCounter } from "@/registry/new-york-v4/ui/physics-counter";

export default function PhysicsCounterDemo() {
  const [value, setValue] = useState(1240);

  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-5 py-8">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Monthly revenue
        </p>
        <PhysicsCounter
          value={value}
          prefix="$"
          className="mt-2 text-foreground"
        />
      </div>

      <button
        type="button"
        onClick={() => setValue(Math.round(500 + Math.random() * 9000))}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Randomize
      </button>
    </div>
  );
}
