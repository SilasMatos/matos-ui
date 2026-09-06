"use client";

import { useState } from "react";

import {
  RallyCourt,
  type RallyCourtLabels,
} from "@/registry/new-york-v4/ui/rally-court";

const labels: RallyCourtLabels = {
  title: "Match on serve",
  reset: "Reset match",
  you: "You",
  opponent: "Opponent",
  serving: "Serving",
  pointYou: "Point — you",
  pointOpponent: "Point — opponent",
  inRally: "Rally in play",
  deuce: "Deuce",
  advantage: "Advantage, {player}",
  gameWon: "Game, {player}",
  setWon: "Set, {player}",
  matchWon: "Match, {player}",
};

export default function RallyCourtDemo() {
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
      <RallyCourt labels={labels} playful={playful} />
    </div>
  );
}
