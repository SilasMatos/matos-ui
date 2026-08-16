"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const spotlightCardVariants = tv({
  base: [
    "group relative w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary text-foreground transition-colors",
  ],
  variants: {
    size: {
      sm: "max-w-[300px]",
      md: "max-w-[380px]",
      lg: "max-w-[480px]",
      full: "max-w-full",
    },
    glow: {
      default: "",
      primary: "",
      accent: "",
      destructive: "",
    },
  },
  defaultVariants: {
    size: "md",
    glow: "default",
  },
});

const glowColors: Record<string, string> = {
  default: "rgba(255, 255, 255, 0.06)",
  primary: "rgba(99, 102, 241, 0.12)",
  accent: "rgba(139, 92, 246, 0.12)",
  destructive: "rgba(239, 68, 68, 0.1)",
};

const borderGlowColors: Record<string, string> = {
  default: "rgba(255, 255, 255, 0.15)",
  primary: "rgba(99, 102, 241, 0.4)",
  accent: "rgba(139, 92, 246, 0.4)",
  destructive: "rgba(239, 68, 68, 0.3)",
};

export type SpotlightCardProps = ComponentProps<"div"> &
  VariantProps<typeof spotlightCardVariants> & {
    spotlightSize?: number;
  };

export function SpotlightCard({
  className,
  size,
  glow = "default",
  spotlightSize = 350,
  children,
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(-spotlightSize);
  const mouseY = useMotionValue(-spotlightSize);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    },
    [mouseX, mouseY],
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(-spotlightSize);
    mouseY.set(-spotlightSize);
  }, [mouseX, mouseY, spotlightSize]);

  const spotlightColor = glowColors[glow ?? "default"];
  const borderColor = borderGlowColors[glow ?? "default"];

  const spotlightBackground = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;
  const borderBackground = useMotionTemplate`radial-gradient(${spotlightSize * 0.8}px circle at ${mouseX}px ${mouseY}px, ${borderColor}, transparent 80%)`;

  return (
    <div
      data-slot="spotlight-card"
      className={twMerge(spotlightCardVariants({ size, glow }), className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: borderBackground }}
        aria-hidden="true"
      />

      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlightBackground }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export const spotlightCardHeaderVariants = tv({
  base: ["px-5 pt-5 pb-2"],
});

export type SpotlightCardHeaderProps = ComponentProps<"div"> &
  VariantProps<typeof spotlightCardHeaderVariants>;

export function SpotlightCardHeader({
  className,
  ...props
}: SpotlightCardHeaderProps) {
  return (
    <div
      data-slot="spotlight-card-header"
      className={twMerge(spotlightCardHeaderVariants(), className)}
      {...props}
    />
  );
}

export const spotlightCardContentVariants = tv({
  base: ["px-5 py-3"],
});

export type SpotlightCardContentProps = ComponentProps<"div"> &
  VariantProps<typeof spotlightCardContentVariants>;

export function SpotlightCardContent({
  className,
  ...props
}: SpotlightCardContentProps) {
  return (
    <div
      data-slot="spotlight-card-content"
      className={twMerge(spotlightCardContentVariants(), className)}
      {...props}
    />
  );
}

export const spotlightCardFooterVariants = tv({
  base: ["flex items-center gap-2 px-5 pt-2 pb-5"],
});

export type SpotlightCardFooterProps = ComponentProps<"div"> &
  VariantProps<typeof spotlightCardFooterVariants>;

export function SpotlightCardFooter({
  className,
  ...props
}: SpotlightCardFooterProps) {
  return (
    <div
      data-slot="spotlight-card-footer"
      className={twMerge(spotlightCardFooterVariants(), className)}
      {...props}
    />
  );
}
