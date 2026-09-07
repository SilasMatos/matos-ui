"use client";

import { useState } from "react";

import { Rating } from "@/registry/new-york-v4/ui/rating";

export default function RatingDemo() {
  const [value, setValue] = useState(3);

  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-6 py-6">
      <Rating value={value} onValueChange={setValue} showValue />

      <div className="flex flex-col items-center gap-1">
        <Rating defaultValue={3.5} allowHalf aria-label="Half steps" />
        <span className="text-xs text-muted-foreground">half steps</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Rating value={4} readOnly size="sm" aria-label="Read only" />
        <span className="text-xs text-muted-foreground">read only</span>
      </div>
    </div>
  );
}
