"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  motionForOffset,
  type SpringTier,
  type SpringTierName,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const KNOB_SIZE = 28;

const TIERS: {
  name: SpringTierName;
  tier: SpringTier;
  use: string;
}[] = [
  {
    name: "fast",
    tier: spring.fast,
    use: "Toggles, checkboxes, a single-step surface lift.",
  },
  {
    name: "snappy",
    tier: spring.snappy,
    use: "Zero-latency follow — a dragged sheet, a magnetic button, anything tracking the cursor. No bounce, shorter than fast.",
  },
  {
    name: "moderate",
    tier: spring.moderate,
    use: "Dropdowns, tabs, drawers — decelerates into place, no visible overshoot.",
  },
  {
    name: "slow",
    tier: spring.slow,
    use: "Dialogs and sheets, travelling far enough to earn a little overshoot.",
  },
  {
    name: "gentle",
    tier: spring.gentle,
    use: "Ambient, unhurried motion — a backdrop fading up, a section easing in on scroll. Longer and calmer than slow, barely any bounce.",
  },
  {
    name: "morph",
    tier: spring.morph,
    use: "Shape, not distance — a layout animation changing width and height at once. Shown here at the same travel as the rest only so its character is comparable.",
  },
  {
    name: "playful",
    tier: spring.playful,
    use: "A tone, not a speed. Opt in by hand for the one moment worth celebrating.",
  },
];

/**
 * The knob travels in `x` (a composited transform), so the track has to be
 * measured rather than animated in percentages — `x: "100%"` in framer-motion
 * is 100% of the *knob*, not of the rail it runs along.
 */
function useTrackWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function TierRow({
  name,
  tier,
  use,
  played,
  reduced,
}: {
  name: SpringTierName;
  tier: SpringTier;
  use: string;
  played: boolean;
  reduced: boolean;
}) {
  const [trackRef, trackWidth] = useTrackWidth();
  const travel = Math.max(0, trackWidth - KNOB_SIZE);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-mono text-foreground text-xs">spring.{name}</span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {tier.visualDuration}s · bounce {tier.bounce}
        </span>
      </div>

      {/* The rail is the substrate; the knob is what lifts off it. */}
      <div
        ref={trackRef}
        className="relative h-8 overflow-visible rounded-full bg-muted"
      >
        <motion.div
          className="absolute top-1/2 left-0 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
          animate={{ x: played ? travel : 0 }}
          // The return leg is a cut, not an animation. `animate` alone would
          // send the knob back to 0 on the *tier's own spring*, and the two
          // frames the reset holds for are a fraction of that — so the knob
          // would retreat a tenth of the rail and spring back from there,
          // demonstrating a twelfth of the distance it claims to cross. The
          // double requestAnimationFrame is what buys two committed renders;
          // this is what makes the first of them land at zero.
          transition={reduced || !played ? { duration: 0 } : tier}
        >
          {name.charAt(0).toUpperCase()}
        </motion.div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">{use}</p>
    </div>
  );
}

/** `motionForOffset` maps elevation onto the first three tiers — never playful. */
function OffsetRow({
  offset,
  label,
  played,
  reduced,
}: {
  offset: number;
  label: string;
  played: boolean;
  reduced: boolean;
}) {
  const tier = motionForOffset(offset);
  const tierName = (Object.keys(spring) as SpringTierName[]).find(
    (key) => spring[key] === tier,
  );

  return (
    <motion.div
      animate={
        played
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0.35, y: 8, scale: 0.98 }
      }
      transition={reduced ? { duration: 0 } : tier}
    >
      <Elevated
        offset={offset}
        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
      >
        <span className="text-foreground text-xs">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          offset {offset} → {tierName}
        </span>
      </Elevated>
    </motion.div>
  );
}

export default function MotionTokensDemo() {
  const reduced = useReducedMotion() ?? false;
  const [played, setPlayed] = useState(false);

  // First paint lands at rest; the replay button is what puts it in motion, so
  // a reader who arrives mid-scroll never misses the arrival.
  useEffect(() => {
    const timer = setTimeout(() => setPlayed(true), 320);
    return () => clearTimeout(timer);
  }, []);

  const replay = () => {
    setPlayed(false);
    // One frame at rest before travelling again, otherwise React batches the
    // two updates into no change at all. Landing that frame *at* zero is the
    // transition override on the knob, not this.
    requestAnimationFrame(() => requestAnimationFrame(() => setPlayed(true)));
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground text-sm">Seven tiers</p>
          <p className="text-muted-foreground text-xs">
            Same distance, seven characters. Watch them land.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={replay}>
          <RotateCcw aria-hidden="true" />
          Replay
        </Button>
      </div>

      <Elevated offset={1} className="space-y-5 rounded-2xl p-4">
        {TIERS.map((entry) => (
          <TierRow
            key={entry.name}
            {...entry}
            played={played}
            reduced={reduced}
          />
        ))}
      </Elevated>

      <div className="space-y-2.5">
        <p className="text-muted-foreground text-xs">
          <span className="font-mono text-foreground">motionForOffset</span> —
          how far a surface lifts decides how it moves.
        </p>
        <Elevated offset={1} className="space-y-2.5 rounded-2xl p-3">
          <OffsetRow
            offset={1}
            label="Inline panel"
            played={played}
            reduced={reduced}
          />
          <OffsetRow
            offset={2}
            label="Dropdown / popover"
            played={played}
            reduced={reduced}
          />
          <OffsetRow
            offset={4}
            label="Dialog"
            played={played}
            reduced={reduced}
          />
        </Elevated>
      </div>
    </div>
  );
}
