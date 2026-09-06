"use client";

import { motion } from "framer-motion";
import { type RefObject, useEffect, useRef, useState } from "react";

import {
  CURSOR_TRAVEL_MS,
  GuidedCursor,
  useGuidedCursor,
} from "@/components/guided-cursor";
import { useAmbientLoop } from "@/hooks/use-ambient-loop";
import {
  type SpringTier,
  type SpringTierName,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";

/**
 * Every tier, in the order the token file declares them — fast → playful is
 * already the order that reads as a ramp, and taking it from `Object.keys`
 * rather than from a hand-written list means a sixth tier shows up here the
 * day it is added instead of the day someone remembers this file exists.
 */
const TIER_NAMES = Object.keys(spring) as SpringTierName[];

const KNOB_SIZE = 28;

/**
 * How long the row of knobs holds at the far end before the loop resets them.
 *
 * The cycle is that rest plus the slowest tier's own visual duration, derived
 * rather than typed: `spring.morph` takes 0.75s to arrive where `spring.fast`
 * takes 0.15s, and a fixed cycle length tuned against the fast one would
 * restart the morph while it was still travelling. Retuning any tier keeps the
 * rest beat the reader actually perceives constant.
 *
 * `visualDuration` leaves the settling tail outside the number, so the rest is
 * nominally that much shorter than it looks here — at 3.4s against a tail
 * measured in tens of milliseconds, that is well inside the margin.
 */
const REST_MS = 3400;
const SLOWEST_MS = Math.round(
  Math.max(...TIER_NAMES.map((name) => spring[name].visualDuration)) * 1000,
);
const CYCLE_MS = SLOWEST_MS + REST_MS;

/** First run waits a beat after the section scrolls in, so the reader's eye has
 *  arrived before the knobs leave. */
const KICKOFF_MS = 320;

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
  played,
  reduced,
  knobRef,
}: {
  name: SpringTierName;
  tier: SpringTier;
  played: boolean;
  reduced: boolean;
  knobRef?: RefObject<HTMLDivElement | null>;
}) {
  const [trackRef, trackWidth] = useTrackWidth();
  const travel = Math.max(0, trackWidth - KNOB_SIZE);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="font-mono text-foreground text-xs">spring.{name}</span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {tier.visualDuration}s · bounce {tier.bounce}
        </span>
      </div>

      {/* The rail is the substrate; the knob is what lifts off it.
       *
       * `bg-foreground/10` rather than the `bg-muted` its docs counterpart
       * uses: that demo sits on a level-1 preview surface, this one sits inside
       * a level-2 `Elevated`, and in dark mode `--muted` (L* 0.269) and
       * `--surface-2` (L* 0.26) are the same colour — the rails simply vanished.
       * An alpha of the foreground is the one fill that stays a fixed distance
       * from whatever surface it is dropped onto, in either theme. */}
      <div
        ref={trackRef}
        className="relative h-7 overflow-visible rounded-full bg-foreground/10"
      >
        <motion.div
          ref={knobRef}
          className="absolute top-1/2 left-0 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground"
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
    </div>
  );
}

/**
 * The docs' `examples/motion-tokens-demo.tsx` with its Replay button taken away
 * and a clock put in its place.
 *
 * That demo is driven by a reader who chose to press a button, so it can afford
 * to sit still until they do. On the home page nobody is going to press
 * anything, and five knobs parked at the end of five rails say nothing at all —
 * the tiers only exist as characters while they are moving. So the same play,
 * the same reset, once every `CYCLE_MS`.
 *
 * The reset is the part that has to be exactly the button's: drop to `x: 0` and
 * let two frames pass before travelling again. Retargeting a spring that is
 * still in flight produces a blend of the two, which is precisely the thing
 * this demo claims each tier does not do — a loop that skipped the double
 * `requestAnimationFrame` would be five knobs demonstrating one shared,
 * invented character.
 */
export function MotionTiersDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { cycling, shouldReduceMotion } = useAmbientLoop(stageRef);
  const [played, setPlayed] = useState(false);
  const firstKnobRef = useRef<HTMLDivElement>(null);

  const cursor = useGuidedCursor(stageRef, { active: cycling });
  const { moveTo, click, reset } = cursor;

  useEffect(() => {
    if (!cycling) {
      reset();
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;
    let launch: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const play = () => {
      setPlayed(false);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => setPlayed(true));
      });
    };

    // The pointer flicks the top knob and *all five* leave together — the
    // comparison only works if they share a start line, so one tap stands in
    // for a "go" the removed Replay button used to be.
    const run = () => {
      moveTo(firstKnobRef, 500);
      launch = setTimeout(() => {
        click();
        play();
      }, CURSOR_TRAVEL_MS);
    };

    // The interval is armed from inside the kickoff rather than alongside it,
    // so the gap between the first play and the second is a full cycle. Two
    // timers started together would put the second play KICKOFF_MS early and
    // only that once, which reads as the loop stumbling on its first step.
    const kickoff = setTimeout(() => {
      run();
      interval = setInterval(run, CYCLE_MS);
    }, KICKOFF_MS);

    return () => {
      clearTimeout(kickoff);
      if (launch) clearTimeout(launch);
      if (interval) clearInterval(interval);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [cycling, moveTo, click, reset]);

  // Reduced motion parks the knobs at the end of the rail rather than the
  // start: at rest they are five identical dots either way, but at the far end
  // the rails read as distances that have been crossed rather than as five
  // things waiting for something that is never going to happen.
  const settled = shouldReduceMotion || played;

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="relative space-y-3.5"
      {...(shouldReduceMotion ? {} : cursor.bind)}
    >
      {TIER_NAMES.map((name, i) => (
        <TierRow
          key={name}
          name={name}
          tier={spring[name]}
          played={settled}
          reduced={shouldReduceMotion}
          knobRef={i === 0 ? firstKnobRef : undefined}
        />
      ))}

      {!shouldReduceMotion && (
        <GuidedCursor
          point={cursor.point}
          clicking={cursor.clicking}
          clickId={cursor.clickId}
          visible={cursor.visible}
        />
      )}
    </div>
  );
}
