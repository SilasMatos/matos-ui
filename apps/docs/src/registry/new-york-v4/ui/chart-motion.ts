"use client";

import {
  duration,
  ease,
  spring,
  stagger,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";

/**
 * Shared motion for the SVG chart family, so twelve charts move on one system
 * instead of twelve hand-tuned timings.
 *
 * - A chart *tooltip* is a popover: it sits `offset` 2 above whatever substrate
 *   the chart is on, and it lands on the `fast` tier because a reading that
 *   trails the cursor reads as lag.
 * - An *accent* — a point growing, a bar highlighting, a ring blooming under
 *   hover — is micro-feedback, also `fast`.
 * - A *draw-on* — a line, an area, a bar revealing itself — is a shape over
 *   time, so it is a tween on `ease.decelerate`. Its length is data-scaled by
 *   the caller (a longer series draws longer); only the curve is fixed here.
 * - A whole chart *settling in* on scroll rides the same decelerate tween at
 *   the `slow` duration.
 */

/** The tooltip surface: `surfaceClasses` at the conventional popover offset. */
export function useChartTooltipSurface(): { level: number; className: string } {
  const level = Math.min(useSurface() + 2, 8);
  return { level, className: surfaceClasses(level) };
}

/** Tooltip enter/exit — spread onto the tooltip's `motion` element. */
export const chartTooltipMotion = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98, transition: spring.fast.exit },
  transition: spring.fast,
} as const;

/** Point / bar / segment accent under hover, focus or selection. */
export const chartAccentTransition = spring.fast;

/** A cursor line or crosshair fading in with the pointer. */
export const chartCursorTransition = {
  duration: duration.fast,
  ease: ease.standard,
};

/** Per-mark delay when a series staggers itself in (bars, points, bands). */
export const chartStaggerStep = stagger.moderate;

/** Tighter step for a dense grid or diagonal wave (a heatmap filling in), where
 *  `chartStaggerStep` across dozens of cells would drag. */
export const chartCascadeStep = stagger.fast;

/**
 * The draw-on transition. Pass the data-scaled length in seconds; the ease is
 * always `decelerate` so the reveal glides to a stop.
 */
export function chartDraw(seconds: number = duration.slow) {
  return { duration: seconds, ease: ease.decelerate } as const;
}

/** A whole chart or a band settling in when it scrolls into view. */
export const chartRevealTransition = {
  duration: duration.slow,
  ease: ease.decelerate,
} as const;
