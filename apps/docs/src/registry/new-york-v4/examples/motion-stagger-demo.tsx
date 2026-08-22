"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  liftVariants,
  type StaggerTierName,
  stagger,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const TIERS: StaggerTierName[] = ["fast", "moderate", "slow", "playful"];

const ITEMS = [
  { title: "Build passed", meta: "2s ago" },
  { title: "Preview deployed", meta: "4s ago" },
  { title: "Migrations applied", meta: "9s ago" },
  { title: "Cache warmed", meta: "12s ago" },
  { title: "Release tagged", meta: "20s ago" },
];

// The rows sit one step above their substrate, so they borrow the entrance the
// elevation ladder already implies rather than inventing a y/scale pair here.
const itemVariants = liftVariants(1);

export default function MotionStaggerDemo() {
  const reduced = useReducedMotion() ?? false;
  const [tier, setTier] = useState<StaggerTierName>("moderate");
  // Bumping this remounts the list, which is what replays the entrance:
  // `initial`/`animate` only run once per mounted subtree.
  const [runId, setRunId] = useState(0);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {TIERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setTier(name);
                setRunId((id) => id + 1);
              }}
              data-active={name === tier}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px] text-muted-foreground",
                "transition-colors hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRunId((id) => id + 1)}
        >
          <RotateCcw aria-hidden="true" />
          Replay
        </Button>
      </div>

      <Elevated offset={1} className="rounded-2xl p-3">
        <motion.ul
          key={runId}
          className="space-y-2"
          // Reduced motion drops the variant labels too, not just the
          // variants: `initial="hidden"` with no variants to resolve it
          // against leaves framer animating from an undefined opacity.
          variants={reduced ? undefined : staggerContainer(tier)}
          initial={reduced ? false : "hidden"}
          animate={reduced ? false : "visible"}
        >
          {ITEMS.map((item) => (
            <motion.li
              key={item.title}
              variants={reduced ? undefined : itemVariants}
            >
              <Elevated
                offset={1}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
              >
                <span className="text-foreground text-xs">{item.title}</span>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {item.meta}
                </span>
              </Elevated>
            </motion.li>
          ))}
        </motion.ul>
      </Elevated>

      <p className="text-center font-mono text-[11px] text-muted-foreground tabular-nums">
        staggerChildren: {stagger[tier]}s
      </p>
    </div>
  );
}
