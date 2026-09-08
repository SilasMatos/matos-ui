"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  ease,
  spring,
  stagger,
} from "@/registry/new-york-v4/lib/motion-tokens";

export const ratingVariants = tv({
  base: [
    "not-prose inline-flex items-center outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
    "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  ],
  variants: {
    size: {
      sm: "gap-0.5",
      md: "gap-1",
      lg: "gap-1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const starSize: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export type RatingProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> &
  VariantProps<typeof ratingVariants> & {
    /** Number of stars. */
    max?: number;
    /** Controlled value (0–`max`). */
    value?: number;
    /** Initial value when uncontrolled. */
    defaultValue?: number;
    /** Fires with the committed rating; `0` when the reader clears it. */
    onValueChange?: (value: number) => void;
    /** Allow half-star precision on hover, click and keyboard. */
    allowHalf?: boolean;
    /** Render the stars without interaction. */
    readOnly?: boolean;
    /** Disable interaction and dim the control. */
    disabled?: boolean;
    /** Print the numeric value next to the stars. */
    showValue?: boolean;
    /** Name for a hidden input, so the value posts inside a form. */
    name?: string;
  };

/**
 * A star rating whose fill sweeps out from the pointer and whose committed star
 * pops on the `fast` spring. Hover previews, click commits, clicking the active
 * star clears it. Keyboard: arrows adjust by one step (half a star when
 * `allowHalf`), Home/End jump to the ends.
 *
 * Motion is all token-driven and folds away under `prefers-reduced-motion` —
 * the fill still changes colour, it just stops scaling and rippling.
 */
export function Rating({
  className,
  size = "md",
  max = 5,
  value,
  defaultValue = 0,
  onValueChange,
  allowHalf = false,
  readOnly = false,
  disabled = false,
  showValue = false,
  name,
  onKeyDown,
  ...props
}: RatingProps) {
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  // Bumped on every commit so the landed star replays its pop keyframe without
  // an AnimatePresence round-trip.
  const [pulse, setPulse] = useState(0);

  const interactive = !readOnly && !disabled;
  const step = allowHalf ? 0.5 : 1;
  const current = clamp(value ?? internal, 0, max);
  const display = hover ?? current;

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(Math.round(next / step) * step, 0, max);
      if (value === undefined) setInternal(snapped);
      setPulse((n) => n + 1);
      onValueChange?.(snapped);
    },
    [max, onValueChange, step, value],
  );

  // Which fraction of star `index` (0-based) is filled right now.
  const fillOf = (index: number) => clamp(display - index, 0, 1);

  // Pointer position inside a star → does it land on the left (half) or the
  // whole star. Only consulted when `allowHalf`.
  const valueFromPointer = (index: number, event: React.PointerEvent) => {
    if (!allowHalf) return index + 1;
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeft = event.clientX - rect.left < rect.width / 2;
    return index + (isLeft ? 0.5 : 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!interactive || event.defaultPrevented) return;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        commit(current + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        commit(current - step);
        break;
      case "Home":
        event.preventDefault();
        commit(step);
        break;
      case "End":
        event.preventDefault();
        commit(max);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="slider"
      aria-label={props["aria-label"] ?? "Rating"}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={`${current} out of ${max}`}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      tabIndex={interactive ? 0 : -1}
      data-slot="rating"
      data-disabled={disabled}
      onKeyDown={handleKeyDown}
      onPointerLeave={() => setHover(null)}
      className={twMerge(ratingVariants({ size }), className)}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => {
        const fill = fillOf(index);
        const isActive = pulse > 0 && Math.ceil(display) === index + 1;
        // Ripple the fill out from the boundary the pointer/value sits on.
        const delay =
          reduce || hover === null
            ? 0
            : Math.abs(index - (display - 1)) * stagger.fast;

        return (
          <motion.button
            // biome-ignore lint/suspicious/noArrayIndexKey: star slots are static and positional
            key={index}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            disabled={disabled || readOnly}
            className="relative block cursor-pointer text-muted-foreground/35 disabled:cursor-default"
            onPointerMove={(event) =>
              interactive && setHover(valueFromPointer(index, event))
            }
            onPointerDown={(event) => {
              if (!interactive) return;
              const next = valueFromPointer(index, event);
              // Tapping the star the rating already rests on clears it.
              commit(next === current ? 0 : next);
            }}
            animate={
              reduce || !isActive ? { scale: 1 } : { scale: [1, 1.25, 1] }
            }
            transition={
              isActive
                ? { duration: 0.34, ease: ease.standard, times: [0, 0.35, 1] }
                : { duration: 0 }
            }
          >
            <Star className={twMerge(starSize[size ?? "md"], "stroke-[1.5]")} />
            <motion.span
              className="pointer-events-none absolute top-0 left-0 h-full overflow-hidden text-primary"
              initial={false}
              animate={{ width: `${fill * 100}%` }}
              transition={
                reduce ? { duration: 0.12 } : { ...spring.fast, delay }
              }
            >
              <Star
                className={twMerge(
                  starSize[size ?? "md"],
                  "fill-primary stroke-[1.5]",
                )}
              />
            </motion.span>
          </motion.button>
        );
      })}

      {showValue && (
        <span className="ml-2 text-sm tabular-nums text-muted-foreground">
          {current.toFixed(allowHalf ? 1 : 0)}
        </span>
      )}

      {name && <input type="hidden" name={name} value={current} />}
    </div>
  );
}
