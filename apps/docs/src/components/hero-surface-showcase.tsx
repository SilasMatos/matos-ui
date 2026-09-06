"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import {
  CURSOR_TRAVEL_MS,
  GuidedCursor,
  useGuidedCursor,
} from "@/components/guided-cursor";
import { usePageVisible } from "@/hooks/use-ambient-loop";
import { cn } from "@/lib/utils";
import {
  liftVariants,
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import {
  SURFACE_SHADOW,
  surfaceClasses,
} from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

type ShowcaseState = "surface" | "segmented" | "popover" | "dialog";

/**
 * Four identities, the two foundations twice each. `surface` and `popover` are
 * the elevation ladder: a passive nested stack, then that same stack opened as
 * a menu on an `Elevated` at offset 2. `segmented` and `dialog` are the motion
 * tokens: a segmented control whose active pill glides between options on the
 * `moderate` tier (a shared-`layoutId` slide, the same move `ui/motion-tabs`
 * makes), then an `Elevated` dialog at offset 4 whose copy settles on `slow`.
 * Between `popover` (surface-3) and `dialog` (surface-5) the rung of the ladder
 * is meant to be visible.
 *
 * Order is chosen for area, not silhouette: the sizes are roughly
 * segmented (~17k px²) < surface (~26k) < popover (~34k) < dialog (~51k), and
 * the cycle runs surface → segmented → popover → dialog → surface so the
 * smallest state always sits between two larger ones and the largest between
 * two smaller ones. That keeps every morph to a partial step — the widest jump
 * is segmented → popover at ~2×, against a full range of ~3× — and never lets
 * one run the whole range at once, which is what a widest-to-narrowest wrap
 * used to do and what read as the surface snapping rather than morphing.
 * popover → dialog is a width-only morph: the two share a height, and only the
 * box getting wider distinguishes the menu from the dialog it could sit inside.
 */
const NEXT_STATE: Record<ShowcaseState, ShowcaseState> = {
  surface: "segmented",
  segmented: "popover",
  popover: "dialog",
  dialog: "surface",
};

/**
 * Only width and height change between states.
 *
 * `rounded-3xl` resolves to ~28px here, at or above half the 56px height of the
 * `segmented` state, so the browser clamps that one into a true pill on its
 * own. Every other state is tall enough that the same single radius token reads
 * as a rounded rectangle. The radius therefore never has to interpolate across
 * the four shapes, and an interpolating radius is the usual reason a shape
 * morph develops a visible kink in its corners halfway through.
 *
 * Heights stay within one frame: `popover` and `dialog` are the tallest at
 * 176px, under the 192px fixed frame below — re-check that when a state's
 * height changes.
 */
const STATE_SHAPE: Record<ShowcaseState, string> = {
  surface: "size-40",
  segmented: "h-14 w-[19rem] sm:w-80",
  popover: "h-44 w-48",
  dialog: "h-44 w-[18rem] sm:w-80",
};

/** How long each identity holds before the next morph. Long enough that the
 *  surface reads as *being* a thing rather than cycling through things.
 *
 *  Raised from 2800 when `spring.morph` was recalibrated from 0.52s to a 0.75s
 *  visual duration. The dwell is not the transition: it is what is left of the
 *  cycle once the morph, the content fade-in that waits for it, and the fade-out
 *  that precedes the next one have all taken their share. Leaving it at 2800
 *  would have spent 230ms of that remainder on the longer morph and left the
 *  surface visibly hurrying from one identity to the next — the failure mode
 *  this constant exists to prevent, arrived at by changing a different one. */
const DWELL_MS = 3200;

/** The quick ease-out used when the wind-up releases back to rest. */
const REST_TRAVEL_S = 0.12;

/**
 * Anticipation: the surface draws in a little over the last beat of every dwell,
 * so the morph is announced rather than sprung — the shape stops being something
 * that happens *to* the surface and starts being something it does.
 *
 * 0.985 is deep enough to be felt and shallow enough not to be seen: a wind-up
 * any deeper would read as a press, which is the wrong cue right before the
 * surface lands on the `dialog` state, whose action row already looks pressable.
 */
const ANTICIPATION_LEAD_MS = 350;
const ANTICIPATION_AT_MS = DWELL_MS - ANTICIPATION_LEAD_MS;
const ANTICIPATION_SCALE = 0.985;
/** Fills the whole lead rather than snapping and waiting: at a 0.12s travel
 *  the surface would arrive at ANTICIPATION_SCALE with 230ms still to run and
 *  simply sit there, which is a smaller box, not a wind-up. `easeIn` for the
 *  same reason — the draw-in should accelerate into the morph, so the morph
 *  reads as the release of something that was being loaded. */
const ANTICIPATION_TRAVEL_S = ANTICIPATION_LEAD_MS / 1000;

const MORPH_MS = Math.round(spring.morph.visualDuration * 1000);

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
const CONTENT_IN_DELAY_S = spring.morph.visualDuration + 0.03;
const CONTENT_IN_S = 0.2;

/**
 * The mirror of CONTENT_IN_DELAY_S on the way out, and the fix for the one
 * artefact that made the whole cycle read as broken rather than merely quick.
 *
 * `layout` animates the transform, not the box: the DOM box snaps to the next
 * state's width on the very first frame and Framer scales it back so it *looks*
 * unchanged. So for the length of the exit the label was living inside a box
 * that had already shrunk — and a label in normal flow does what any label does
 * when it stops fitting. Leaving the `dialog` state, its action row wrapped and
 * dragged the arrow down with it, visibly, on every single cycle.
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

/**
 * When the guided pointer may start operating a state: the content mounts
 * `CONTENT_IN_DELAY_S` after the state flips (it waits out the morph) and
 * fades over `CONTENT_IN_S`, so before that sum there is nothing on screen to
 * aim at. Derived, not typed, for the same reason every other delay in this
 * file is — retuning `spring.morph` moves this with it.
 */
const CURSOR_START_MS =
  Math.round((CONTENT_IN_DELAY_S + CONTENT_IN_S) * 1000) + 60;
/** Beat between pointer hops while it scans the menu rows before choosing one. */
const CURSOR_SCAN_MS = 360;
/** Beat between the pointer brushing the dismiss control and the primary action,
 *  and between the two segments it visits in the `segmented` state. */
const CURSOR_HOP_MS = 500;
/** The menu row the pointer lands on each time the `popover` state comes round;
 *  it is re-selected from a different default so the choice is a visible move. */
const CURSOR_MENU_PICK = 0;
const CURSOR_MENU_REST = 2;
/** The segment the pointer drives the control to, from its resting one — again
 *  so the active pill visibly slides rather than sitting where it already was. */
const CURSOR_SEG_PICK = 2;
const CURSOR_SEG_REST = 0;

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
  registerTarget,
}: {
  steps: number;
  shouldReduceMotion: boolean;
  registerTarget?: (key: string, el: HTMLElement | null) => void;
}) {
  if (steps <= 0) {
    return (
      <motion.div
        ref={(el) => registerTarget?.("core", el)}
        className="size-8 rounded-lg bg-surface-4 shadow-surface-4"
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
      className="flex items-center justify-center rounded-2xl p-3.5"
    >
      <HeroLadder
        steps={steps - 1}
        shouldReduceMotion={shouldReduceMotion}
        registerTarget={registerTarget}
      />
    </Elevated>
  );
}

/**
 * The `segmented` state: a compact segmented control, the plainest surface for
 * the motion tokens to speak through. The active pill is a shared-`layoutId`
 * element on `spring.moderate` — the exact move `ui/motion-tabs` makes for its
 * indicator — so when the guided pointer taps another segment the pill glides
 * across rather than cutting. The track is `bg-muted` and the pill `bg-background`
 * so the selection reads as raised off it, the same figure/ground the real
 * component uses.
 */
function SegmentedContent({
  segments,
  active,
  registerTarget,
}: {
  segments: string[];
  active: number;
  registerTarget: (key: string, el: HTMLElement | null) => void;
}) {
  return (
    <div className="flex w-full items-center px-4">
      <div className="relative flex w-full gap-1 rounded-2xl border border-border/60 bg-muted/50 p-1">
        {segments.map((segment, index) => (
          <button
            key={segment}
            type="button"
            tabIndex={-1}
            ref={(el) => registerTarget(`seg-${index}`, el)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-center font-medium text-xs transition-colors",
              index === active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {index === active && (
              <motion.span
                layoutId="hero-segmented-indicator"
                className="absolute inset-0 rounded-xl border border-border bg-background shadow-xs"
                transition={spring.moderate}
              />
            )}
            <span className="relative z-10">{segment}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The `popover` state: the level-1 surface opens a real menu on an `Elevated` at
 * the conventional offset of 2, so the panel resolves to surface-3 — a visible
 * rung above the base, and a visible rung below the `dialog` state's surface-5.
 * It is inset from the morph box rather than full-bleed so that in light mode,
 * where a rung is carried by shadow rather than fill, `--shadow-3`'s ring and
 * near drops have room to show against the surface-1 frame instead of being
 * clipped at the box edge.
 *
 * The rows are a real `staggerContainer` + `liftVariants(2)` — offset 2 resolves
 * to the `moderate` tier through `motionForOffset`, so the menu lands with the
 * exact timing a Matos UI dropdown would. `delayChildren` waits out the morph
 * so the stagger is seen against a box that has stopped moving.
 *
 * The selected row (`bg-accent` + check) and the hovered row (`bg-foreground/6`)
 * are both driven by the guided pointer: it scans the rows and clicks one, and
 * the selection lands where it clicked.
 */
function PopoverContent({
  items,
  hoveredRow,
  selectedRow,
  registerTarget,
}: {
  items: string[];
  hoveredRow: number | null;
  selectedRow: number;
  registerTarget: (key: string, el: HTMLElement | null) => void;
}) {
  return (
    <Elevated
      offset={2}
      className="absolute inset-2.5 flex flex-col justify-center rounded-2xl p-2"
    >
      <motion.ul
        className="flex w-full flex-col gap-1 text-left"
        variants={staggerContainer("moderate", CONTENT_IN_DELAY_S)}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, index) => (
          <motion.li
            key={item}
            ref={(el) => registerTarget(`row-${index}`, el)}
            variants={liftVariants(2)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors",
              index === selectedRow
                ? "bg-accent font-medium text-accent-foreground"
                : index === hoveredRow
                  ? "bg-foreground/[0.06] text-foreground/90"
                  : "text-foreground/75",
            )}
          >
            {item}
            {index === selectedRow && <Check className="size-3.5 shrink-0" />}
          </motion.li>
        ))}
      </motion.ul>
    </Elevated>
  );
}

/**
 * The `dialog` state: the level-1 surface stands a panel up on an `Elevated` at
 * offset 4 — the conventional dialog offset — so it resolves to surface-5, two
 * rungs above the `popover` state's surface-3. Same inset from the morph box as
 * the popover, for the same reason: the light-mode rung is `--shadow-5`, and it
 * needs frame around it to read.
 *
 * `motionForOffset` maps offset 4 to the `slow` tier. Title, body and the
 * action row ride `staggerContainer("slow")` + `liftVariants(4)`, so the copy
 * settles at dialog weight. The primary action is painted, not a real button
 * (the whole showcase is `aria-hidden`); the ghost dismiss keeps the row
 * reading as a decision rather than a single call to action.
 */
function DialogContent({
  title,
  body,
  action,
  dismiss,
  registerTarget,
}: {
  title: string;
  body: string;
  action: string;
  dismiss: string;
  registerTarget: (key: string, el: HTMLElement | null) => void;
}) {
  return (
    <Elevated
      offset={4}
      className="absolute inset-2.5 flex flex-col rounded-2xl p-4 text-left"
    >
      <motion.div
        className="flex h-full w-full flex-col gap-2"
        variants={staggerContainer("slow", CONTENT_IN_DELAY_S)}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={liftVariants(4)}
          className="font-display font-semibold text-foreground text-sm"
        >
          {title}
        </motion.p>
        <motion.p
          variants={liftVariants(4)}
          className="flex-1 whitespace-normal text-muted-foreground text-xs leading-relaxed"
        >
          {body}
        </motion.p>
        <motion.div
          variants={liftVariants(4)}
          className="flex items-center justify-end gap-1.5"
        >
          <span
            ref={(el) => registerTarget("dismiss", el)}
            className="rounded-lg px-2.5 py-1.5 text-muted-foreground text-xs"
          >
            {dismiss}
          </span>
          <span
            ref={(el) => registerTarget("action", el)}
            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 font-medium text-primary-foreground text-xs"
          >
            {action}
            <ArrowRight className="size-3 shrink-0" />
          </span>
        </motion.div>
      </motion.div>
    </Elevated>
  );
}

function StateContent({
  state,
  steps,
  shouldReduceMotion,
  segments,
  activeSegment,
  actionLabel,
  menuItems,
  dialogTitle,
  dialogBody,
  dismissLabel,
  hoveredRow,
  selectedRow,
  registerTarget,
}: {
  state: ShowcaseState;
  steps: number;
  shouldReduceMotion: boolean;
  segments: string[];
  activeSegment: number;
  actionLabel: string;
  menuItems: string[];
  dialogTitle: string;
  dialogBody: string;
  dismissLabel: string;
  hoveredRow: number | null;
  selectedRow: number;
  registerTarget: (key: string, el: HTMLElement | null) => void;
}) {
  if (state === "segmented") {
    return (
      <SegmentedContent
        segments={segments}
        active={activeSegment}
        registerTarget={registerTarget}
      />
    );
  }

  if (state === "popover") {
    return (
      <PopoverContent
        items={menuItems}
        hoveredRow={hoveredRow}
        selectedRow={selectedRow}
        registerTarget={registerTarget}
      />
    );
  }

  if (state === "dialog") {
    return (
      <DialogContent
        title={dialogTitle}
        body={dialogBody}
        action={actionLabel}
        dismiss={dismissLabel}
        registerTarget={registerTarget}
      />
    );
  }

  return (
    <HeroLadder
      steps={steps}
      shouldReduceMotion={shouldReduceMotion}
      registerTarget={registerTarget}
    />
  );
}

/**
 * One surface, four identities — the two foundations, twice each.
 *
 * The elevation ladder on its own says "surfaces have depth"; it can't say
 * "and anything can be one". So the same level-1 surface holds as a block, then
 * stretches into a segmented control, opens a real `Elevated` menu at offset 2
 * (surface-3), stands up a real `Elevated` dialog at offset 4 (surface-5), and
 * comes back. The interpolation between those shapes *is* the Surface demo, and
 * the rung you can see between the menu and the dialog is the ladder itself;
 * the sliding pill in the segmented state and the stagger timing inside the
 * menu and dialog *are* the Motion demo — offset picks the tier, nothing here
 * names a spring.
 *
 * A scripted pointer (`useGuidedCursor`) operates each state while it holds —
 * sliding the segmented control between options, scanning the menu and choosing
 * a row, brushing the dialog's actions — so the surface reads as something
 * being used, not just a shape cycling. The morph itself stays on the dwell
 * timer; the pointer fills the dwell. It is not mounted under
 * `prefers-reduced-motion`.
 *
 * `aria-hidden`: the control changes nothing, the menu selects nothing, the
 * dialog dismisses nothing. It is a picture of components, not components.
 */
export function HeroSurfaceShowcase({ steps = 3 }: { steps?: number }) {
  const t = useTranslations("hero");
  const shouldReduceMotion = !!useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef);
  const pageVisible = usePageVisible();
  const [state, setState] = useState<ShowcaseState>("surface");
  const [anticipating, setAnticipating] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  // The guided pointer operates whatever the current state is showing. The
  // targets are registered by the content as it mounts (a beat after the state
  // flips — see CURSOR_START_MS), keyed by role.
  const targets = useRef<Record<string, HTMLElement | null>>({});
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState(CURSOR_MENU_REST);
  const [activeSegment, setActiveSegment] = useState(CURSOR_SEG_REST);
  // The morph flag has to fire on a *change* of state, not on every run of its
  // effect: the effect also re-runs when the cycle pauses and resumes, and on
  // mount, neither of which is a morph. Without this the surface would lift its
  // shadow on first paint and again on every scroll-back, both times with the
  // shape sitting perfectly still.
  const previousState = useRef(state);

  const cycling = !shouldReduceMotion && inView && pageVisible;

  const cursor = useGuidedCursor(frameRef, { active: cycling });
  const { moveTo, click, reset: resetCursor } = cursor;

  // Reduced motion parks on Surface — the state that carries the depth idea
  // on its own, and the one this element already was before it learned to
  // morph. Also covers the mid-cycle case: flip the OS setting while the
  // segmented control is on screen and it returns home rather than freezing there.
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

  // The pointer choreography for the current state. It re-runs on every state
  // change (and on pause/resume), starting only once CURSOR_START_MS has passed
  // so the content it aims at is mounted. Each branch has to finish inside the
  // stable window — after CURSOR_START_MS, before CONTENT_OUT_AT_MS — so the
  // longest sequence (the menu scan) uses the shortest hops.
  useEffect(() => {
    if (!cycling) {
      resetCursor();
      return;
    }

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(
        setTimeout(() => {
          if (alive) fn();
        }, ms),
      );
    };
    const g = targets.current;
    const T = CURSOR_TRAVEL_MS;

    if (state === "surface") {
      at(CURSOR_START_MS, () => moveTo(g.core, 500));
      at(CURSOR_START_MS + T, click);
    } else if (state === "segmented") {
      at(CURSOR_START_MS, () => moveTo(g[`seg-${CURSOR_SEG_REST + 1}`], 400));
      at(CURSOR_START_MS + T, () => {
        click();
        setActiveSegment(CURSOR_SEG_REST + 1);
      });
      at(CURSOR_START_MS + T + CURSOR_HOP_MS, () =>
        moveTo(g[`seg-${CURSOR_SEG_PICK}`], 400),
      );
      at(CURSOR_START_MS + T + CURSOR_HOP_MS + T, () => {
        click();
        setActiveSegment(CURSOR_SEG_PICK);
      });
    } else if (state === "popover") {
      setHoveredRow(0);
      at(CURSOR_START_MS, () => {
        moveTo(g["row-0"], 400);
        setHoveredRow(0);
      });
      at(CURSOR_START_MS + CURSOR_SCAN_MS, () => {
        moveTo(g["row-1"], 400);
        setHoveredRow(1);
      });
      at(CURSOR_START_MS + CURSOR_SCAN_MS * 2, () => {
        moveTo(g["row-2"], 400);
        setHoveredRow(2);
      });
      at(CURSOR_START_MS + CURSOR_SCAN_MS * 3, () => {
        moveTo(g[`row-${CURSOR_MENU_PICK}`], 400);
        setHoveredRow(CURSOR_MENU_PICK);
      });
      at(CURSOR_START_MS + CURSOR_SCAN_MS * 3 + T, () => {
        click();
        setSelectedRow(CURSOR_MENU_PICK);
      });
    } else if (state === "dialog") {
      at(CURSOR_START_MS, () => moveTo(g.dismiss, 400));
      at(CURSOR_START_MS + CURSOR_HOP_MS, () => moveTo(g.action, 400));
      at(CURSOR_START_MS + CURSOR_HOP_MS + T, click);
    }

    return () => {
      alive = false;
      for (const timer of timers) clearTimeout(timer);
    };
  }, [state, cycling, moveTo, click, resetCursor]);

  // Selections reset to their resting option while their state is off screen, so
  // next time it comes round the pointer's pick is a move the reader can see
  // rather than a no-op on an already-selected row or segment.
  useEffect(() => {
    if (state !== "popover") {
      setSelectedRow(CURSOR_MENU_REST);
      setHoveredRow(null);
    }
    if (state !== "segmented") {
      setActiveSegment(CURSOR_SEG_REST);
    }
  }, [state]);

  return (
    // Fixed frame, not a shrink-wrap: the surface's own height swings between
    // 176px and 56px, and the DOM applies that instantly even while Framer is
    // still animating the projection. Without a frame that never resizes,
    // every morph would shove the rest of the page up and down.
    //
    // `h-48` (192px) clears the 176px of the popover and dialog, the tallest
    // states in the cycle, with a little slack — re-check this against
    // STATE_SHAPE whenever a state's height changes, and note the failure is
    // silent: a too-short frame doesn't clip, it reflows.
    <div
      ref={frameRef}
      aria-hidden="true"
      className="relative flex h-48 w-full items-center justify-center"
      {...(shouldReduceMotion ? {} : cursor.bind)}
    >
      <SurfaceProvider value={ROOT_LEVEL}>
        <motion.div
          layout={!shouldReduceMotion}
          // Scale has two sources: the wind-up before each morph, and rest.
          animate={{ scale: anticipating ? ANTICIPATION_SCALE : 1 }}
          transition={{
            layout: spring.morph,
            scale: anticipating
              ? { duration: ANTICIPATION_TRAVEL_S, ease: "easeIn" }
              : { duration: REST_TRAVEL_S, ease: "easeOut" },
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
                    segments={t.raw("showcaseSegments") as string[]}
                    activeSegment={activeSegment}
                    actionLabel={t("showcaseAction")}
                    menuItems={t.raw("showcaseMenu") as string[]}
                    dialogTitle={t("showcaseDialogTitle")}
                    dialogBody={t("showcaseDialogBody")}
                    dismissLabel={t("showcaseDismiss")}
                    hoveredRow={hoveredRow}
                    selectedRow={selectedRow}
                    registerTarget={(key, el) => {
                      targets.current[key] = el;
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </SurfaceProvider>

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
