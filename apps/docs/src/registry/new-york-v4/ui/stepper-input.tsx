"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  attentionShake,
  spring,
} from "@/registry/new-york-v4/lib/motion-tokens";
import {
  SURFACE_BG,
  SURFACE_HOVER_SHADOW,
  surfaceClasses,
} from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const MotionElevated = motion.create(Elevated);

export const stepperInputVariants = tv({
  base: [
    "not-prose inline-flex items-stretch overflow-hidden rounded-lg border border-border/70",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
    "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  ],
  variants: {
    size: {
      sm: "h-8 text-sm",
      md: "h-10 text-base",
      lg: "h-12 text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// Hold-to-repeat: a beat before the first repeat, then fire faster each tick
// until it tops out.
const HOLD_DELAY_MS = 400;
const REPEAT_START_MS = 140;
const REPEAT_MIN_MS = 60;
const REPEAT_ACCEL = 0.82;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function decimalsOf(step: number) {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

type HoldHandlers = {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
};

/**
 * A `−` / `+` key. It reads its own rung off the field's substrate and sits one
 * step up the ladder, so it reads as a raised key against the field surface in
 * either theme; `hover-lift` floats it a further pixel + shadow step under the
 * cursor and presses it back in on tap.
 */
function StepKey({
  edge,
  icon,
  disabled,
  handlers,
}: {
  edge: "left" | "right";
  icon: React.ReactNode;
  disabled: boolean;
  handlers: HoldHandlers;
}) {
  const level = useSurface();
  const keyLevel = Math.min(level + 1, 8);

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      disabled={disabled}
      className={twMerge(
        "hover-lift [--lift:1px] grid aspect-square h-full place-items-center text-muted-foreground outline-none",
        surfaceClasses(keyLevel),
        SURFACE_HOVER_SHADOW[Math.min(keyLevel + 1, 8)],
        "hover:text-foreground focus-visible:text-foreground active:scale-95",
        "disabled:pointer-events-none disabled:text-muted-foreground/40",
        edge === "left"
          ? "border-border/60 border-r"
          : "border-border/60 border-l",
        "[&_svg]:size-[1.1em]",
      )}
      {...handlers}
    >
      {icon}
    </button>
  );
}

export type StepperInputProps = Omit<
  HTMLMotionProps<"div">,
  "onChange" | "defaultValue"
> &
  VariantProps<typeof stepperInputVariants> & {
    /** Controlled value. */
    value?: number;
    /** Initial value when uncontrolled. */
    defaultValue?: number;
    /** Fires with the clamped, snapped value. */
    onValueChange?: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    /** Bigger jump for PageUp / PageDown. Defaults to `step * 10`. */
    largeStep?: number;
    disabled?: boolean;
    readOnly?: boolean;
    /** Render the value, e.g. as currency. Defaults to a fixed-decimal string. */
    formatValue?: (value: number) => string;
    /** Name for a hidden input, so the value posts inside a form. */
    name?: string;
  };

/**
 * A number field driven by its `−` / `+` controls: the value rolls in the
 * direction it changed, the buttons repeat (and accelerate) while held, and the
 * field shakes once when a press runs into `min` / `max`.
 *
 * Surface: the field is an `Elevated` one step above its substrate; the keys
 * sit a further step up (raised), and the value well drops back to the
 * substrate — so the control has real depth on any rung of the ladder, in
 * either theme, without a single hard-coded background.
 *
 * The display is an ARIA `spinbutton` — arrows step, PageUp/PageDown take the
 * large step, Home/End jump to the bounds. Under `prefers-reduced-motion` the
 * roll and the shake are dropped; the number just updates.
 */
export function StepperInput({
  className,
  size = "md",
  value,
  defaultValue = 0,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  largeStep,
  disabled = false,
  readOnly = false,
  formatValue,
  name,
  ...props
}: StepperInputProps) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const [internal, setInternal] = useState(() => clamp(defaultValue, min, max));
  const current = clamp(value ?? internal, min, max);
  const prev = useRef(current);
  // +1 rolled up, -1 rolled down — drives which way the digits slide.
  const direction = current >= prev.current ? 1 : -1;
  useEffect(() => {
    prev.current = current;
  }, [current]);

  const interactive = !disabled && !readOnly;
  const decimals = decimalsOf(step);
  const big = largeStep ?? step * 10;
  const label = formatValue ? formatValue(current) : current.toFixed(decimals);

  const bump = useCallback(
    (delta: number) => {
      const raw = current + delta;
      const snapped = clamp(
        Math.round(raw / step) * step,
        min === Number.NEGATIVE_INFINITY ? raw : min,
        max === Number.POSITIVE_INFINITY ? raw : max,
      );
      if (snapped === current) {
        if (!reduce) controls.start(attentionShake.shake);
        return;
      }
      if (value === undefined) setInternal(snapped);
      onValueChange?.(snapped);
    },
    [controls, current, max, min, onValueChange, reduce, step, value],
  );

  // One press → one `bump`, then a delayed, accelerating repeat while held.
  const holdRef = useRef<{
    delay?: ReturnType<typeof setTimeout>;
    tick?: ReturnType<typeof setTimeout>;
  }>({});

  const stopHold = useCallback(() => {
    clearTimeout(holdRef.current.delay);
    clearTimeout(holdRef.current.tick);
    holdRef.current = {};
  }, []);

  const startHold = useCallback(
    (delta: number) => {
      if (!interactive) return;
      bump(delta);
      holdRef.current.delay = setTimeout(() => {
        let wait = REPEAT_START_MS;
        const run = () => {
          bump(delta);
          wait = Math.max(REPEAT_MIN_MS, wait * REPEAT_ACCEL);
          holdRef.current.tick = setTimeout(run, wait);
        };
        run();
      }, HOLD_DELAY_MS);
    },
    [bump, interactive],
  );

  useEffect(() => stopHold, [stopHold]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!interactive) return;
    const map: Record<string, number> = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: big,
      PageDown: -big,
    };
    if (event.key in map) {
      event.preventDefault();
      bump(map[event.key]);
    } else if (event.key === "Home" && min !== Number.NEGATIVE_INFINITY) {
      event.preventDefault();
      bump(min - current);
    } else if (event.key === "End" && max !== Number.POSITIVE_INFINITY) {
      event.preventDefault();
      bump(max - current);
    }
  };

  const holdHandlers = (delta: number): HoldHandlers => ({
    onPointerDown: (event) => {
      event.preventDefault();
      startHold(delta);
    },
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
  });

  return (
    <MotionElevated
      offset={1}
      animate={controls}
      data-slot="stepper-input"
      data-disabled={disabled}
      className={twMerge(stepperInputVariants({ size }), className)}
      {...props}
    >
      <StepKey
        edge="left"
        icon={<Minus />}
        disabled={!interactive || current <= min}
        handlers={holdHandlers(-step)}
      />

      <SpinValue
        current={current}
        label={label}
        direction={direction}
        min={min}
        max={max}
        interactive={interactive}
        disabled={disabled}
        readOnly={readOnly}
        reduce={!!reduce}
        ariaLabel={props["aria-label"]}
        onKeyDown={onKeyDown}
      />

      <StepKey
        edge="right"
        icon={<Plus />}
        disabled={!interactive || current >= max}
        handlers={holdHandlers(step)}
      />

      {name && <input type="hidden" name={name} value={current} />}
    </MotionElevated>
  );
}

/**
 * The value well. Sits one rung *below* the field — back on the substrate the
 * field itself lifted off of — so the digits read as recessed between the two
 * raised keys.
 */
function SpinValue({
  current,
  label,
  direction,
  min,
  max,
  interactive,
  disabled,
  readOnly,
  reduce,
  ariaLabel,
  onKeyDown,
}: {
  current: number;
  label: string;
  direction: number;
  min: number;
  max: number;
  interactive: boolean;
  disabled: boolean;
  readOnly: boolean;
  reduce: boolean;
  ariaLabel?: string;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) {
  const level = useSurface();
  const wellBg = SURFACE_BG[Math.max(1, level - 1)];

  return (
    <div
      role="spinbutton"
      tabIndex={interactive ? 0 : -1}
      aria-valuenow={current}
      aria-valuemin={min === Number.NEGATIVE_INFINITY ? undefined : min}
      aria-valuemax={max === Number.POSITIVE_INFINITY ? undefined : max}
      aria-valuetext={label}
      aria-label={ariaLabel ?? "Value"}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      onKeyDown={onKeyDown}
      className={twMerge(
        "relative grid min-w-[2.75em] flex-1 place-items-center overflow-hidden px-2",
        "font-medium tabular-nums outline-none focus-visible:text-foreground",
        wellBg,
      )}
    >
      {reduce ? (
        <span>{label}</span>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={{ y: `${direction * 100}%`, opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: `${direction * -100}%`, opacity: 0 }}
            transition={spring.fast}
            className="col-start-1 row-start-1"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}
