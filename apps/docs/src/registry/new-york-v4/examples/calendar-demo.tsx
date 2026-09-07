"use client";

import { useState } from "react";

import { Calendar } from "@/registry/new-york-v4/ui/calendar";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export default function CalendarDemo() {
  const [date, setDate] = useState<Date | null>(() => new Date());

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 py-6">
      <Elevated offset={1} className="rounded-xl p-3">
        <Calendar value={date} onValueChange={setDate} />
      </Elevated>
      <p className="text-muted-foreground text-xs tabular-nums">
        {date
          ? date.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "No date selected"}
      </p>
    </div>
  );
}
