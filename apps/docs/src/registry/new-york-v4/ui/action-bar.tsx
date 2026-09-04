"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  liftVariants,
  motionForOffset,
  spring,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The bar animates *and* participates in the elevation ladder, so it has to be
// both a motion element and an <Elevated>. Wrapping one in the other would add
// a layout box between the placement classes and the flex row they lay out;
// motion.create keeps it a single node, exactly as Sheet Panel does.
const MotionElevated = motion.create(Elevated);

/** Steps above the page. The bar sits over the content it is asking about. */
const ACTION_BAR_OFFSET = 3;

/**
 * The tier is read from the offset rather than picked: how far a surface is
 * from its substrate is what decides how it moves, and this component already
 * declares that distance one line above. At offset 3 that resolves to
 * `spring.slow` — a touch of overshoot, which is what stops a bar this wide
 * from landing like a slammed drawer.
 */
const ACTION_BAR_TIER = motionForOffset(ACTION_BAR_OFFSET);

/**
 * How far the bar travels, and the one thing here not taken straight from a
 * token. `liftVariants` defaults to 4px and documents an override for surfaces
 * "large or slow enough that 4px reads as a twitch" — a full-width confirmation
 * bar is the case it means. 16px is far enough to be read as travel and short
 * enough that `spring.slow`'s 0.24s never turns the rise into a swipe.
 */
const ACTION_BAR_TRAVEL = 16;
const ACTION_BAR_SCALE = 0.98;

/**
 * A bar anchored to the bottom of the viewport arrives from the bottom of the
 * viewport: it rises into place rather than fading in from nowhere, so it reads
 * as having come from somewhere.
 *
 * The exit is the entrance played backwards rather than a second idea — it
 * returns to the same +16px it came from and leaves through the edge it arrived
 * through. It runs on the tier's *exit* duration, not its full one, because
 * `useExitAnimation` arms its unmount guard off that same number: an exit
 * animating for the longer entrance duration would be cut off mid-slide.
 *
 * `y` is a `transform`, and the `sm:-translate-x-1/2` that centres the
 * bottomCenter placement is a Tailwind v4 `translate` — a separate CSS property
 * that composes with `transform` instead of being overwritten by it. That is
 * the only reason this can animate on the same node that carries the placement
 * classes. Anything here that reaches for `x` would be fighting the centring.
 */
const actionBarMotionVariants: Variants = {
  ...liftVariants(ACTION_BAR_OFFSET, {
    y: ACTION_BAR_TRAVEL,
    scale: ACTION_BAR_SCALE,
  }),
  exit: {
    opacity: 0,
    y: ACTION_BAR_TRAVEL,
    scale: ACTION_BAR_SCALE,
    transition: { duration: ACTION_BAR_TIER.exit.duration },
  },
};

/** No travel, no scale: the bar still has to announce that it appeared, and
 *  opacity is the one channel that does not move anything. */
const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: spring.fast },
  exit: { opacity: 0, transition: { duration: spring.fast.exit.duration } },
};

export const actionBarVariants = tv({
  base: [
    "fixed z-50 flex w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-3 border sm:w-auto sm:max-w-[calc(100vw-3rem)] sm:flex-row sm:items-center",
    "supports-[backdrop-filter]:backdrop-blur-sm",
    "will-change-transform",
  ],
  variants: {
    placement: {
      bottomCenter:
        "bottom-4 right-4 left-4 translate-x-0 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
      bottomRight:
        "right-4 bottom-4 left-4 translate-x-0 sm:right-6 sm:bottom-6 sm:left-auto",
      bottomLeft:
        "bottom-4 right-4 left-4 translate-x-0 sm:bottom-6 sm:right-auto sm:left-6",
    },
    tone: {
      default: "border-border",
      destructive: "border-destructive/45",
      success: "border-primary/35",
      warning: "border-ring/50",
      info: "border-primary/30",
    },
    size: {
      sm: "rounded-lg px-3 py-2",
      md: "rounded-xl px-4 py-3",
    },
  },
  defaultVariants: {
    placement: "bottomCenter",
    tone: "default",
    size: "md",
  },
});

export interface ActionBarActions {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * The animated props framer-motion redefines. A motion element's
 * `onAnimationStart` takes a variant definition, not a DOM AnimationEvent, and
 * `onDrag*` are gesture callbacks rather than the native handlers — so the div
 * versions cannot be forwarded through and are dropped from the public surface
 * instead of being silently mistyped.
 */
type ForwardedDivProps = Omit<
  ComponentProps<"div">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
>;

type ActionBarPropsBase = ForwardedDivProps &
  VariantProps<typeof actionBarVariants> & {
    /**
     * Drives the entrance and the exit.
     *
     * Defaults to `true` so `{condition && <ActionBar />}` still works and
     * still animates in — but a bar mounted that way is torn out of the DOM the
     * instant the condition flips, and an exit animation needs the element to
     * outlive the state change. Keep the bar mounted and pass `open` to get
     * both halves of the gesture; it unmounts itself once the exit has run.
     */
    open?: boolean;
    subject?: string;
    title?: string;
    description?: string;
    icon?: ReactNode;
    ariaLabel?: string;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmLabelLoading?: string;
  };

type ActionBarPropsWithActions = ActionBarPropsBase & {
  actions: ActionBarActions;
  onConfirm?: never;
  onCancel?: never;
  isLoading?: never;
};

type ActionBarPropsLegacy = ActionBarPropsBase & {
  actions?: undefined;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export type ActionBarProps = ActionBarPropsWithActions | ActionBarPropsLegacy;

export function ActionBar(props: ActionBarProps) {
  const {
    open = true,
    subject,
    title,
    description,
    icon,

    ariaLabel = "Confirm action",
    cancelLabel = "Cancel",
    confirmLabel = "Confirm",
    confirmLabelLoading = "Processing...",
    className,
    placement,
    tone,
    size,
    ...rest
  } = props;

  const shouldReduceMotion = useReducedMotion();
  // The guard timer has to be armed off whichever exit is actually going to
  // run, or a reduced-motion bar would sit invisible for the 260ms the full
  // tier's fallback allows before anything unmounted it.
  const tier = shouldReduceMotion ? spring.fast : ACTION_BAR_TIER;
  const { mounted, onAnimationComplete } = useExitAnimation(open, tier);

  const actions: ActionBarActions =
    "actions" in props && props.actions
      ? props.actions
      : {
          onConfirm: props.onConfirm,
          onCancel: props.onCancel,
          isLoading: props.isLoading,
        };

  const isLoading = actions.isLoading ?? false;

  if (!mounted) {
    return null;
  }

  return (
    <MotionElevated
      data-slot="action-bar"
      offset={ACTION_BAR_OFFSET}
      role="dialog"
      aria-label={ariaLabel}
      data-loading={isLoading ? "" : undefined}
      variants={
        shouldReduceMotion ? reducedMotionVariants : actionBarMotionVariants
      }
      initial="hidden"
      animate={open ? "visible" : "exit"}
      onAnimationComplete={onAnimationComplete}
      className={twMerge(
        actionBarVariants({ placement, tone, size }),
        className,
      )}
      {...rest}
    >
      <div className="flex min-w-0 items-start gap-2 text-sm font-medium text-foreground sm:items-center">
        {icon}

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="break-words">
            {title ??
              (subject
                ? `Confirm action for "${subject}"?`
                : "Are you sure you want to continue?")}
          </span>

          {description && (
            <span className="mt-0.5 break-words text-muted-foreground text-xs">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          onClick={actions.onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>

        <Button
          type="button"
          variant={tone === "destructive" ? "destructive" : "default"}
          size="sm"
          className="min-w-0 flex-1 sm:flex-none"
          onClick={actions.onConfirm}
          disabled={isLoading}
        >
          {isLoading ? confirmLabelLoading : confirmLabel}
        </Button>
      </div>
    </MotionElevated>
  );
}
