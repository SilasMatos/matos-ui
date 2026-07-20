"use client";

import {
  type HTMLMotionProps,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const magneticCardVariants = tv({
  base: [
    "group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground",
    "shadow-sm outline-none [transform-style:preserve-3d]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ],
  variants: {
    size: {
      sm: "max-w-[280px] p-5",
      md: "max-w-[340px] p-6",
      lg: "max-w-[420px] p-7",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type MagneticCardProps = Omit<HTMLMotionProps<"div">, "children"> &
  VariantProps<typeof magneticCardVariants> & {
    children?: ReactNode;
    intensity?: number;
    tilt?: number;
    stiffness?: number;
    damping?: number;
  };

export function MagneticCard({
  className,
  size,
  intensity = 12,
  tilt = 8,
  stiffness = 220,
  damping = 18,
  children,
  ...props
}: MagneticCardProps) {
  const config = { stiffness, damping, mass: 0.6 };

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const offsetX = useSpring(useMotionValue(0), config);
  const offsetY = useSpring(useMotionValue(0), config);
  const rotateX = useSpring(useMotionValue(0), config);
  const rotateY = useSpring(useMotionValue(0), config);

  const glowX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glowY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glowBackground = useMotionTemplate`radial-gradient(220px circle at ${glowX} ${glowY}, color-mix(in oklab, var(--ring) 22%, transparent), transparent 70%)`;

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width;
      const relY = (event.clientY - rect.top) / rect.height;

      pointerX.set(relX);
      pointerY.set(relY);
      offsetX.set((relX - 0.5) * intensity * 2);
      offsetY.set((relY - 0.5) * intensity * 2);
      rotateY.set((relX - 0.5) * tilt * 2);
      rotateX.set((0.5 - relY) * tilt * 2);
    },
    [intensity, offsetX, offsetY, pointerX, pointerY, rotateX, rotateY, tilt],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
    offsetX.set(0);
    offsetY.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }, [offsetX, offsetY, pointerX, pointerY, rotateX, rotateY]);

  return (
    <motion.div
      data-slot="magnetic-card"
      className={twMerge(magneticCardVariants({ size }), className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: offsetX, y: offsetY, rotateX, rotateY, perspective: 900 }}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      <div className="relative transform-[translateZ(40px)]">{children}</div>
    </motion.div>
  );
}
