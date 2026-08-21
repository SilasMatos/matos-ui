"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import {
  SURFACE_HOVER_SHADOW,
  surfaceClasses,
} from "@/registry/new-york-v4/lib/surface-classes";
import {
  SurfaceProvider,
  useSurface,
} from "@/registry/new-york-v4/lib/surface-context";

interface ElevatedProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Steps above the current substrate.
   *
   * The component's own surface level becomes `min(substrate + offset, 8)`
   * and is re-provided to descendants via SurfaceProvider, so further
   * nesting walks up the ladder automatically.
   *
   * Conventional offsets:
   *   2 — dropdown / popover / select menu
   *   4 — dialog / modal
   */
  offset: number;
  /**
   * Override for the shadow level. Defaults to the computed surface level.
   *
   * Pass a fixed value when the component should keep a constant shadow
   * weight regardless of how deeply it's nested — e.g. a dropdown always
   * reads `shadow-surface-3` whether it opens on the page or inside a
   * dialog, even though its background tracks the substrate.
   */
  shadowLevel?: number;
  /**
   * Lifts one shadow step and 2px on hover — for a surface that is itself
   * the clickable target (a card, a swatch tile), not a wrapper around a
   * separately-styled button. Off by default: most `Elevated` uses are
   * passive containers, and lifting those on hover would read as false
   * affordance.
   *
   * Timing comes from the shared spring tokens (registry/.../motion-tokens),
   * the same ones Button's own hover lift uses, so every elevated surface
   * settles at the same rate rather than each picking its own.
   */
  hoverLift?: boolean;
  children?: ReactNode;
}

const Elevated = forwardRef<HTMLDivElement, ElevatedProps>(
  (
    { offset, shadowLevel, hoverLift = false, className, children, ...props },
    ref,
  ) => {
    const substrate = useSurface();
    const level = Math.min(substrate + offset, 8);
    const restShadowLevel = shadowLevel ?? level;
    const hoverShadowLevel = Math.round(
      Math.max(1, Math.min(8, restShadowLevel + 1)),
    );
    return (
      <SurfaceProvider value={level}>
        <div
          ref={ref}
          data-slot="elevated"
          data-surface={level}
          className={cn(
            surfaceClasses(level, restShadowLevel),
            hoverLift && [
              "transition-[transform,box-shadow] duration-moderate ease-spring",
              "hover:-translate-y-0.5",
              SURFACE_HOVER_SHADOW[hoverShadowLevel],
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            ],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SurfaceProvider>
    );
  },
);
Elevated.displayName = "Elevated";

export { Elevated };
