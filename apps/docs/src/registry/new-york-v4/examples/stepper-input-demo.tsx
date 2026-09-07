"use client";

import { useState } from "react";

import { StepperInput } from "@/registry/new-york-v4/ui/stepper-input";

export default function StepperInputDemo() {
  const [qty, setQty] = useState(2);

  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-6 py-6">
      <div className="flex flex-col items-center gap-1">
        <StepperInput
          value={qty}
          onValueChange={setQty}
          min={1}
          max={10}
          aria-label="Quantity"
        />
        <span className="text-xs text-muted-foreground">
          1–10, hold to repeat
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <StepperInput
          defaultValue={12}
          step={0.5}
          min={0}
          size="sm"
          formatValue={(n) => `$${n.toFixed(2)}`}
          aria-label="Price"
        />
        <span className="text-xs text-muted-foreground">
          step 0.5, currency
        </span>
      </div>
    </div>
  );
}
