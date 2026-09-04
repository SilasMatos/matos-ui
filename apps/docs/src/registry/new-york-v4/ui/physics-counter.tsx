"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const physicsCounterVariants = tv({
  base: [
    "inline-flex items-baseline font-semibold tabular-nums tracking-tight",
  ],
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-4xl",
      lg: "text-6xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type PhysicsCounterProps = ComponentProps<"span"> &
  VariantProps<typeof physicsCounterVariants> & {
    value: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    stiffness?: number;
    damping?: number;
  };

export function PhysicsCounter({
  className,
  size,
  value,
  decimals = 0,
  prefix,
  suffix,
  stiffness = 90,
  damping = 18,
  ...props
}: PhysicsCounterProps) {
  const spring = useSpring(value, { stiffness, damping, mass: 1 });
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <span
      data-slot="physics-counter"
      className={twMerge(physicsCounterVariants({ size }), className)}
      {...props}
    >
      {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}
      <motion.span>{display}</motion.span>
      {suffix ? (
        <span className="ml-1 text-[0.5em] font-medium text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
