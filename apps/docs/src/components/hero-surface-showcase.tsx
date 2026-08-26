"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, ArrowUp, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import {
  SURFACE_SHADOW,
  surfaceClasses,
} from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

type ShowcaseState = "surface" | "input" | "metric" | "avatar" | "button";

/**
 * Ordered so no two neighbours share a silhouette and no single morph has to
 * cross the whole range at once: square → wide pill → portrait card → small
 * circle → short pill → back to square. The circle sits between the two most
 * extreme shapes deliberately, since a portrait card collapsing straight into
 * a landscape pill is the one pair that reads as a glitch rather than a change.
 */
const NEXT_STATE: Record<ShowcaseState, ShowcaseState> = {
  surface: "input",
  input: "metric",
  metric: "avatar",
  avatar: "button",
  button: "surface",
};

/**
 * Only width and height change between states.
 *
 * `rounded-3xl` resolves to 28.4px here, which is at or above half the height
 * of the input (56px), the avatar (56px) and the button (48px), so the browser
 * clamps each of those into a true pill — or, at w = h, a true circle — on its
 * own. The radius therefore never has to interpolate across any of the five
 * shapes, and an interpolating radius is the usual reason a shape morph
 * develops a visible kink in its corners halfway through.
 *
 * The avatar is the state that proves the point: same single radius token as
 * the square surface, and it lands as a circle purely because width caught up
 * with height.
 */
const STATE_SHAPE: Record<ShowcaseState, string> = {
  surface: "size-28",
  input: "h-14 w-[17rem] sm:w-80",
  metric: "h-36 w-24",
  avatar: "size-14",
  button: "h-12 w-44",
};

/** Decorative, and deliberately free of a decimal separator so neither locale
 *  needs its own copy of a number nobody is meant to read as data. */
const METRIC_VALUE = "98%";
const METRIC_TREND = "+12%";

/** How long each identity holds before the next morph. Long enough that the
 *  surface reads as *being* a thing rather than cycling through things. */
const DWELL_MS = 2800;

/** The simulated press in the button state: nobody's cursor is on a
 *  decorative hero element, so the tactile half of the affordance has to be
 *  performed. Placed past the midpoint of the dwell so it lands well after
 *  the label has settled and well before the next morph starts. */
const PRESS_AT_MS = 1300;
/** The hold is deliberately longer than the travel: at equal values the
 *  surface would still be on its way down when the release began and never
 *  actually reach PRESS_SCALE, which reads as a twitch rather than a press. */
const PRESS_HOLD_MS = 150;
const PRESS_TRAVEL_S = 0.12;
const PRESS_SCALE = 0.97;

/**
 * Anticipation: the same trick as the press, generalised from one state to all
 * five. The surface draws in a little over the last beat of every dwell, so the
 * morph is announced rather than sprung — the shape stops being something that
 * happens *to* the surface and starts being something it does.
 *
 * 0.985 against the press's 0.97: this one has to be felt without being seen.
 * A wind-up as deep as a press would read as a second press, and the button
 * state would then appear to be pressed twice per cycle.
 *
 * The two gestures must not overlap, and at these values they cannot: the press
 * occupies 1300–1450ms of the dwell and the wind-up 2450–2800ms, a clear second
 * apart. Shortening DWELL_MS is the change that would collide them — the guard
 * is in the scale selection below, which lets the press win.
 */
const ANTICIPATION_LEAD_MS = 350;
const ANTICIPATION_AT_MS = DWELL_MS - ANTICIPATION_LEAD_MS;
const ANTICIPATION_SCALE = 0.985;
/** Fills the whole lead rather than snapping and waiting: at the press's 0.12s
 *  the surface would arrive at ANTICIPATION_SCALE with 230ms still to run and
 *  simply sit there, which is a smaller box, not a wind-up. `easeIn` for the
 *  same reason — the draw-in should accelerate into the morph, so the morph
 *  reads as the release of something that was being loaded. */
const ANTICIPATION_TRAVEL_S = ANTICIPATION_LEAD_MS / 1000;

const MORPH_MS = Math.round(spring.morph.duration * 1000);

/**
 * The shadow lifts a level while the shape is changing and lands again as it
 * settles — the surface takes its weight off the substrate to move, the way it
 * would if it were a real thing being repositioned.
 *
 * Half the morph, used as *both* the lift window and the cross-fade duration,
 * which puts the apex exactly at the morph's midpoint and returns the surface
 * to level 1 exactly as the shape lands: the shadow rises for MORPH_MS / 2,
 * then falls for MORPH_MS / 2. Giving the fade the full morph duration instead
 * would mean the lift only *peaks* at the moment of landing and then decays
 * into the dwell, which is the gesture backwards.
 */
const SHADOW_LIFT_MS = MORPH_MS / 2;
const SHADOW_LIFT_S = SHADOW_LIFT_MS / 1000;

/**
 * Content waits for the shape to finish before it fades in. This delay is the
 * entire difference between "fluid" and "broken" — a label fighting a box that
 * is still changing size reads as a rendering bug.
 *
 * Derived from the tier rather than typed as a number, because it is not a
 * taste value: it is the morph's own duration plus a beat. Retuning
 * `spring.morph` and leaving a hardcoded delay behind is precisely how the
 * content ends up arriving mid-transformation again.
 */
const CONTENT_IN_DELAY_S = spring.morph.duration + 0.03;
const CONTENT_IN_S = 0.2;

/**
 * The mirror of CONTENT_IN_DELAY_S on the way out, and the fix for the one
 * artefact that made the whole cycle read as broken rather than merely quick.
 *
 * `layout` animates the transform, not the box: the DOM box snaps to the next
 * state's width on the very first frame and Framer scales it back so it *looks*
 * unchanged. So for the length of the exit the label was living inside a box
 * that had already shrunk — and a label in normal flow does what any label does
 * when it stops fitting. Leaving the button state, "Get started" broke into two
 * lines and dragged its arrow down with it, visibly, on every single cycle.
 *
 * The content therefore leaves *before* the shape moves rather than with it:
 * the fade is armed a beat early in the dwell and is over by the time the state
 * flips. A transition now runs content out → shape morphs → content in, which
 * is what the entry side always did and what the exit side never had.
 *
 * The lead is the fade plus a couple of frames, so AnimatePresence's
 * `mode="wait"` has genuinely finished with the outgoing child by the time the
 * incoming one asks to mount. Any remainder there would be added to
 * CONTENT_IN_DELAY_S and land the new content late, since that delay is
 * measured from the mount and not from the state change.
 */
const CONTENT_OUT_S = 0.1;
const CONTENT_OUT_LEAD_MS = Math.round(CONTENT_OUT_S * 1000) + 20;
const CONTENT_OUT_AT_MS = DWELL_MS - CONTENT_OUT_LEAD_MS;

/**
 * Content arrives with a touch of scale as well as opacity, and leaves the same
 * way. A pure cross-fade reads as one layer being swapped for another; the
 * same fade with a little growth behind it reads as the new identity settling
 * into a box that just finished becoming its shape.
 *
 * 0.96, not the 0.98 of liftVariants: that token is calibrated for a panel that
 * is also travelling 4px, and here there is no travel for the scale to
 * accompany — the growth is the entire arrival, so it has to carry it alone.
 */
const CONTENT_IN_SCALE = 0.96;

/** A beat after the ghost text, not with it. */
const CARET_DELAY_S = CONTENT_IN_DELAY_S + 0.2;

/**
 * The input state's ghost tone, carrying both the search icon and the
 * placeholder — they inherit it together, exactly as the real search field in
 * blocks/sidebar-surface-01 puts its icon and its placeholder on one token.
 *
 * That token is `muted-foreground`, and it is the right answer *in a field*,
 * where a border, a label and a focus ring carry the field's identity next to
 * the text. Here the icon and the ghost text are the entire state, and against
 * --surface-1 they were landing at 6.8:1 while the other four states' content
 * sits at 12.3:1 (the avatar initial) to 16.9:1 (the button label, the metric
 * value). Five states of one surface should not imply that one of them is
 * subordinate to the rest; that gap was reading as exactly that.
 *
 * /70 lifts it to 8.7:1 in dark and 5.6:1 in light — still visibly a ghost,
 * still well short of the full-foreground states, but legible in the same
 * breath as them. It is also the tone the caret was already using, so the two
 * halves of the ghost now read as one element instead of the 1px caret
 * outshining the words in front of it. Keep them equal: if this moves, move
 * `Caret`'s `bg-foreground/70` with it.
 */
const INPUT_GHOST = "text-foreground/70";

/**
 * The morphing surface sits at the base of the ladder, level 1.
 *
 * `Elevated` cannot emit that level here: it computes `substrate + offset`,
 * and the substrate is already 1, so the flattest surface it can produce is
 * 2. Hand-rolling level 1 — exactly as this component's predecessor did —
 * keeps the ladder's rungs at 1 → 2 → 3 → 4 instead of shifting every step up
 * one and forcing the innermost square to be re-levelled with them.
 */
const ROOT_LEVEL = 1;

/**
 * Pauses the cycle while the tab is in the background.
 *
 * A hidden tab still runs timers, only throttled, so without this the machine
 * would bank up transitions and burn through several of them in one frame the
 * moment the tab came forward.
 */
function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return visible;
}

/**
 * Compact, ambient cousin of examples/elevated-demo.tsx's `Ladder` — the
 * same recursive "one Elevated per step" shape, scaled down and capped at a
 * handful of levels. The hero isn't the place for the full 8-level
 * explainer (that's Foundations' job); this is just a taste of the same
 * idea — alive enough to notice, quiet enough not to fight the headline.
 *
 * Only the innermost square breathes. A version where every level pulsed in
 * sequence (a wave sweeping outward → inward through the steps) was built
 * and confirmed working, but a pulse that *travels* across four nested
 * shapes reads as more animated than one that stays put, even at the same
 * low amplitude — motion changing position draws the eye more than motion
 * in place. One slow, small pulse at the core won out on "quiet enough."
 */
function HeroLadder({
  steps,
  shouldReduceMotion,
}: {
  steps: number;
  shouldReduceMotion: boolean;
}) {
  if (steps <= 0) {
    return (
      <motion.div
        className="size-7 rounded-lg bg-surface-4 shadow-surface-4"
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [1, 0.82, 1], scale: [1, 1.06, 1] }
        }
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  return (
    <Elevated
      offset={1}
      className="flex items-center justify-center rounded-2xl p-2.5"
    >
      <HeroLadder steps={steps - 1} shouldReduceMotion={shouldReduceMotion} />
    </Elevated>
  );
}

function Caret() {
  return (
    <motion.span
      // Deliberately the same tone as INPUT_GHOST — see the note there.
      className="h-4 w-px shrink-0 bg-foreground/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1.1,
        times: [0, 0.5, 0.5, 1],
        repeat: Infinity,
        ease: "linear",
        delay: CARET_DELAY_S,
      }}
    />
  );
}

/**
 * A compressed quote of ui/metric-card.tsx: eyebrow, then the value and its
 * trend badge on an inset panel. That inset panel is a real `Elevated`, not a
 * painted-on rectangle — which is the whole reason this state earns its place
 * in the cycle. It is the ladder from the Surface state, wearing a job.
 *
 * The trend badge takes the neutral branch of the real TrendBadge
 * (`bg-muted`/`text-muted-foreground`) rather than its positive one: the
 * system stays achromatic, and a hero decoration has no business implying a
 * number went up in a way a colourblind reader would have to take on faith.
 */
function MetricContent({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col gap-1.5 p-2.5">
      <span className="truncate px-1 pt-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <Elevated
        offset={1}
        className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-2"
      >
        <span className="font-semibold text-foreground text-xl leading-none tabular-nums tracking-[-0.03em]">
          {METRIC_VALUE}
        </span>
        <span className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 font-medium text-[11px] text-muted-foreground tabular-nums">
          <ArrowUp className="size-3 shrink-0" strokeWidth={2.5} />
          {METRIC_TREND}
        </span>
      </Elevated>
    </div>
  );
}

function StateContent({
  state,
  steps,
  shouldReduceMotion,
  searchLabel,
  actionLabel,
  metricLabel,
}: {
  state: ShowcaseState;
  steps: number;
  shouldReduceMotion: boolean;
  searchLabel: string;
  actionLabel: string;
  metricLabel: string;
}) {
  if (state === "input") {
    return (
      <div className={cn("flex w-full items-center gap-2.5 px-5", INPUT_GHOST)}>
        <SearchIcon className="size-4 shrink-0" />
        <span className="flex min-w-0 items-center gap-1 text-sm">
          <span className="truncate">{searchLabel}</span>
          <Caret />
        </span>
      </div>
    );
  }

  if (state === "metric") {
    return <MetricContent label={metricLabel} />;
  }

  // The brand initial rather than an icon: at 56px the circle has room for
  // exactly one glyph, and a letterform reads as an avatar where a generic
  // icon would just read as a button that lost its label.
  if (state === "avatar") {
    return (
      <span className="font-display font-semibold text-foreground/85 text-lg leading-none">
        M
      </span>
    );
  }

  if (state === "button") {
    return (
      <span className="flex items-center gap-2 px-6 font-medium text-foreground text-sm">
        {actionLabel}
        <ArrowRight className="size-4 shrink-0" />
      </span>
    );
  }

  return <HeroLadder steps={steps} shouldReduceMotion={shouldReduceMotion} />;
}

/**
 * One surface, five identities.
 *
 * The elevation ladder on its own says "surfaces have depth"; it can't say
 * "and anything can be one". So the same level-1 surface holds its shape long
 * enough to be read as a block, then stretches into a search field, stands up
 * into a metric card, closes into an avatar, flattens into a button, and comes
 * back — and the interpolation between those shapes *is* the demo, which is
 * why the content inside always waits for the box to stop moving before it
 * fades in.
 *
 * Five rather than three because three were all rounded boxes of roughly the
 * same family. The portrait card and the circle are what turn the claim from
 * "a surface can be various widths" into "a surface can be any geometry".
 *
 * `aria-hidden`: the input takes no text, the button does nothing, and the
 * metric is a number nobody measured. It is a picture of components, not
 * components.
 */
export function HeroSurfaceShowcase({ steps = 3 }: { steps?: number }) {
  const t = useTranslations("hero");
  const shouldReduceMotion = !!useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef);
  const pageVisible = usePageVisible();
  const [state, setState] = useState<ShowcaseState>("surface");
  const [pressed, setPressed] = useState(false);
  const [anticipating, setAnticipating] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  // The morph flag has to fire on a *change* of state, not on every run of its
  // effect: the effect also re-runs when the cycle pauses and resumes, and on
  // mount, neither of which is a morph. Without this the surface would lift its
  // shadow on first paint and again on every scroll-back, both times with the
  // shape sitting perfectly still.
  const previousState = useRef(state);

  const cycling = !shouldReduceMotion && inView && pageVisible;

  // Reduced motion parks on Surface — the state that carries the depth idea
  // on its own, and the one this element already was before it learned to
  // morph. Also covers the mid-cycle case: flip the OS setting while the
  // input is on screen and it returns home rather than freezing there.
  useEffect(() => {
    if (shouldReduceMotion) setState("surface");
  }, [shouldReduceMotion]);

  // Reads `state` directly rather than through a functional updater: the
  // effect genuinely depends on it, since re-arming on every state change is
  // what keeps the loop going. It also means a pause restarts the current
  // dwell from the top instead of resuming a partial one — a resumed 200ms
  // remainder would read as a glitch on scroll-back.
  //
  // The wind-up and the content-out share this effect rather than living in
  // ones of their own, because neither is a separate behaviour: both are the
  // same dwell clock read at an earlier point. Separate effects would be
  // separate places to keep `ANTICIPATION_AT_MS < CONTENT_OUT_AT_MS < DWELL_MS`
  // true, and the failure mode of them disagreeing is silent in both
  // directions — a wind-up armed for after the morph it was announcing, or a
  // fade-out that only starts once the box is already changing shape, which is
  // the bug CONTENT_OUT_AT_MS exists to prevent.
  //
  // The wind-up has no release timer, deliberately: the crouch is held until
  // the state changes and this effect re-runs, so the surface springs out of it
  // *into* the morph instead of relaxing just before it and leaving a dead beat
  // where the whole point was to have none. The fade-out is held the same way
  // and for the same reason — `setContentVisible(true)` at the top of the
  // effect is its release, which means the new identity mounts on the same tick
  // the shape starts changing, and CONTENT_IN_DELAY_S is measured from there.
  useEffect(() => {
    setAnticipating(false);
    setContentVisible(true);
    if (!cycling) return;

    const windUp = setTimeout(() => setAnticipating(true), ANTICIPATION_AT_MS);
    const clearOut = setTimeout(
      () => setContentVisible(false),
      CONTENT_OUT_AT_MS,
    );
    const advance = setTimeout(() => setState(NEXT_STATE[state]), DWELL_MS);
    return () => {
      clearTimeout(windUp);
      clearTimeout(clearOut);
      clearTimeout(advance);
    };
  }, [cycling, state]);

  useEffect(() => {
    if (!cycling || state !== "button") {
      setPressed(false);
      return;
    }

    const down = setTimeout(() => setPressed(true), PRESS_AT_MS);
    const up = setTimeout(() => setPressed(false), PRESS_AT_MS + PRESS_HOLD_MS);
    return () => {
      clearTimeout(down);
      clearTimeout(up);
    };
  }, [cycling, state]);

  useEffect(() => {
    const changed = previousState.current !== state;
    previousState.current = state;

    if (!changed || !cycling) {
      setMorphing(false);
      return;
    }

    setMorphing(true);
    const timer = setTimeout(() => setMorphing(false), SHADOW_LIFT_MS);
    return () => clearTimeout(timer);
  }, [cycling, state]);

  return (
    // Fixed frame, not a shrink-wrap: the surface's own height swings between
    // 144px and 48px, and the DOM applies that instantly even while Framer is
    // still animating the projection. Without a frame that never resizes,
    // every morph would shove the rest of the page up and down.
    //
    // `h-36` is the metric card's 144px, the tallest state in the cycle — this
    // has to be re-checked against STATE_SHAPE whenever a state is added, and
    // the failure is silent: a too-short frame doesn't clip, it reflows.
    <div
      ref={frameRef}
      aria-hidden="true"
      className="flex h-36 w-full items-center justify-center"
    >
      <SurfaceProvider value={ROOT_LEVEL}>
        <motion.div
          layout={!shouldReduceMotion}
          // One scale, three sources. The press wins a tie rather than the
          // wind-up: they cannot currently overlap, but if a shorter DWELL_MS
          // ever brought them together, a press masked by a wind-up would be a
          // gesture that visibly failed to happen, where a wind-up masked by a
          // press is one nobody was going to notice anyway.
          animate={{
            scale: pressed
              ? PRESS_SCALE
              : anticipating
                ? ANTICIPATION_SCALE
                : 1,
          }}
          transition={{
            layout: spring.morph,
            scale:
              anticipating && !pressed
                ? { duration: ANTICIPATION_TRAVEL_S, ease: "easeIn" }
                : { duration: PRESS_TRAVEL_S, ease: "easeOut" },
          }}
          className={cn(
            "relative rounded-3xl will-change-transform",
            surfaceClasses(ROOT_LEVEL),
            STATE_SHAPE[state],
          )}
        >
          {/* The lifted shadow, cross-faded over the resting one.
           *
           * Not `transition-shadow` between surfaceClasses(1) and (2), which is
           * the obvious implementation and silently does not work: the ladder
           * adds a layer per level, so --shadow-1 is one shadow and --shadow-2
           * is two (light) or three (dark, and with `inset` on some of them).
           * CSS only interpolates box-shadow lists of equal length with
           * matching `inset` flags — anything else is a discrete swap, so that
           * version hard-cuts at the halfway point instead of lifting. No two
           * adjacent levels of this ladder can ever interpolate.
           *
           * Fading a second element's shadow in over the first is the way out,
           * and it is why `overflow-hidden` moved off this element and onto the
           * clipper below: a drop shadow painted by a clipped child does not
           * leave the parent, which in light mode (where every layer of
           * --shadow-2 is an outer one) would have meant no lift at all.
           *
           * `layout` on the overlay, not just on the parent: Framer distorts an
           * un-projected child while it animates the parent's box, and this one
           * is only ever visible *during* that animation — the exact window in
           * which its radius and shadow would be seen smearing. */}
          <motion.span
            layout={!shouldReduceMotion}
            className={cn(
              "pointer-events-none absolute inset-0 rounded-3xl",
              SURFACE_SHADOW[ROOT_LEVEL + 1],
            )}
            initial={false}
            animate={{ opacity: morphing ? 1 : 0 }}
            transition={{
              layout: spring.morph,
              opacity: { duration: SHADOW_LIFT_S, ease: "easeOut" },
            }}
          />
          {/* Absolute, so the content never feeds its own width back into the
           *  box Framer is animating. The shape leads; the content follows.
           *
           *  Out of flow is not the same as out of the way, though: `inset-0`
           *  still tracks the box, and the box is what shrinks. Being absolute
           *  spares the *frame* from the content's width; it does nothing to
           *  spare the content from the frame's. That is what CONTENT_OUT_AT_MS
           *  is for — by the time this box changes size, there is nothing left
           *  inside it to squeeze.
           *
           *  `whitespace-nowrap` is the backstop, and it sits on the wrapper
           *  rather than on each state's own text because it is not a fact about
           *  any one label: it is the rule that nothing in here re-flows, ever,
           *  and on the wrapper it also covers whatever state is added next. */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" initial={false}>
              {contentVisible && (
                <motion.div
                  key={state}
                  className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
                  initial={{ opacity: 0, scale: CONTENT_IN_SCALE }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: CONTENT_IN_S,
                      delay: CONTENT_IN_DELAY_S,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: CONTENT_IN_SCALE,
                    transition: { duration: CONTENT_OUT_S },
                  }}
                >
                  <StateContent
                    state={state}
                    steps={steps}
                    shouldReduceMotion={shouldReduceMotion}
                    searchLabel={t("showcaseSearch")}
                    actionLabel={t("showcaseAction")}
                    metricLabel={t("showcaseMetricLabel")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </SurfaceProvider>
    </div>
  );
}
