"use client";

import { useState } from "react";
import { SpringSlider } from "@/registry/new-york-v4/ui/spring-slider";

export default function SpringSliderDemo() {
  const [value, setValue] = useState(40);

  return (
    <div className="mx-auto w-full max-w-[320px] space-y-4 py-8">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Volume
        </span>
        <span className="text-sm font-semibold tabular-nums">{value}%</span>
      </div>
      <SpringSlider value={value} onValueChange={setValue} />
    </div>
  );
}
