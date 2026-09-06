"use client";

import { useState } from "react";

import {
  HoopShot,
  type HoopShotLabels,
} from "@/registry/new-york-v4/ui/hoop-shot";

const labels: HoopShotLabels = {
  title: "Range session",
  reset: "Reset session",
  shoot: "Shoot",
  points: "Pts",
  made: "FG",
  streak: "Streak",
  swish: "All net.",
  rimOut: "Front rim.",
  onFire: "On fire",
};

export default function HoopShotDemo() {
  const [playful, setPlayful] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <label className="flex items-center gap-2 self-end text-muted-foreground text-xs">
        <input
          type="checkbox"
          checked={playful}
          onChange={(event) => setPlayful(event.target.checked)}
          className="size-3.5 accent-primary"
        />
        Playful motion
      </label>
      <HoopShot labels={labels} playful={playful} />
    </div>
  );
}
