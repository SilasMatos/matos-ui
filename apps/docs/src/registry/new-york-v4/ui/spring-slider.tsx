"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const springSliderVariants = tv({
  base: ["group relative w-full touch-none select-none"],
  variants: {
    size: {
      sm: "max-w-[220px]",
      md: "max-w-[320px]",
      lg: "max-w-[420px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export type SpringSliderProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> &
  VariantProps<typeof springSliderVariants> & {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    value?: number;
    onValueChange?: (value: number) => void;
    stiffness?: number;
    damping?: number;
  };

export function SpringSlider({
  className,
  size,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  value,
  onValueChange,
  stiffness = 380,
  damping = 24,
  ...props
}: SpringSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const current = value ?? internalValue;

  const progress = useMotionValue((current - min) / (max - min));
  const springProgress = useSpring(progress, { stiffness, damping, mass: 0.7 });

  const fillWidth = useTransform(
    springProgress,
    (p) => `${clamp(p, 0, 1) * 100}%`,
  );
  const thumbLeft = useTransform(
    springProgress,
    (p) => `${clamp(p, 0, 1) * 100}%`,
  );
  const thumbScale = useTransform(springProgress, () => (dragging ? 1.15 : 1));

  useEffect(() => {
    progress.set((current - min) / (max - min));
  }, [current, min, max, progress]);

  const commit = useCallback(
    (next: number) => {
      const snapped = clamp(Math.round(next / step) * step, min, max);
      if (value === undefined) {
        setInternalValue(snapped);
      }
      onValueChange?.(snapped);
    },
    [max, min, onValueChange, step, value],
  );

  const setFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      commit(min + ratio * (max - min));
    },
    [commit, max, min],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setFromClientX(event.clientX);
    },
    [dragging, setFromClientX],
  );

  const stopDragging = useCallback(() => setDragging(false), []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        commit(current + step);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        commit(current - step);
      }
    },
    [commit, current, step],
  );

  return (
    <div
      data-slot="spring-slider"
      className={twMerge(springSliderVariants({ size }), className)}
      {...props}
    >
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={handleKeyDown}
        className="relative flex h-6 cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
      >
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: fillWidth }}
          />
        </div>
        <motion.div
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background shadow-md"
          style={{ left: thumbLeft, scale: thumbScale }}
        >
          <span className="absolute inset-1.5 rounded-full bg-primary" />
        </motion.div>
      </div>
    </div>
  );
}
