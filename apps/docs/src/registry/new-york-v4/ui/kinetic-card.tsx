"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const kineticCardVariants = tv({
  base: [
    "not-prose w-full overflow-hidden rounded-2xl border border-border",
    "bg-secondary p-2 text-foreground",
  ],
  variants: {
    size: {
      sm: "max-w-[300px]",
      md: "max-w-[360px]",
      lg: "max-w-[440px]",
      full: "max-w-full",
    },
    tone: {
      default: "",
      primary: "",
      accent: "",
      destructive: "",
    },
  },
  defaultVariants: {
    size: undefined,
    tone: "default",
  },
});

export const kineticCardHeaderVariants = tv({
  base: "relative z-10 flex items-start justify-between gap-3 px-4 pt-4",
});

export const kineticCardContentVariants = tv({
  base: "relative z-10 px-4 py-3",
});

export const kineticCardFooterVariants = tv({
  base: "relative z-10 flex items-center justify-between gap-3 px-4 pb-4 text-xs",
});

const toneStyles = {
  default: {
    rail: "bg-muted-foreground",
    badge: "border-border/70 bg-secondary text-muted-foreground",
  },
  primary: {
    rail: "bg-primary",
    badge: "border-primary/20 bg-primary/10 text-primary",
  },
  accent: {
    rail: "bg-foreground",
    badge: "border-border/70 bg-muted text-foreground",
  },
  destructive: {
    rail: "bg-destructive",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const;

export type KineticCardProps = ComponentProps<"div"> &
  VariantProps<typeof kineticCardVariants> & {
    badge?: ReactNode;
    children?: ReactNode;
  };

export function KineticCard({
  className,
  size,
  tone = "default",
  badge,
  children,
  ...props
}: KineticCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const toneStyle = toneStyles[tone ?? "default"];

  return (
    <div
      data-slot="kinetic-card"
      className={twMerge(kineticCardVariants({ size, tone }), className)}
      {...props}
    >
      <motion.div
        data-slot="kinetic-card-panel"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
      >
        <div
          aria-hidden="true"
          className="absolute right-4 top-4 flex items-center gap-1.5"
        >
          <span className="h-px w-8 bg-border" />
          <motion.span
            className={twMerge("size-1.5 rounded-full", toneStyle.rail)}
            animate={
              shouldReduceMotion
                ? undefined
                : { x: [-10, 0, -10], opacity: [0.45, 1, 0.45] }
            }
            transition={{
              duration: 2.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        {badge ? (
          <div
            data-slot="kinetic-card-badge"
            className={twMerge(
              "absolute right-3 top-3 z-20 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              toneStyle.badge,
            )}
          >
            {badge}
          </div>
        ) : null}

        {children}
      </motion.div>
    </div>
  );
}

export type KineticCardHeaderProps = ComponentProps<"div"> &
  VariantProps<typeof kineticCardHeaderVariants>;

export function KineticCardHeader({
  className,
  ...props
}: KineticCardHeaderProps) {
  return (
    <div
      data-slot="kinetic-card-header"
      className={twMerge(kineticCardHeaderVariants(), className)}
      {...props}
    />
  );
}

export type KineticCardContentProps = ComponentProps<"div"> &
  VariantProps<typeof kineticCardContentVariants>;

export function KineticCardContent({
  className,
  ...props
}: KineticCardContentProps) {
  return (
    <div
      data-slot="kinetic-card-content"
      className={twMerge(kineticCardContentVariants(), className)}
      {...props}
    />
  );
}

export type KineticCardFooterProps = ComponentProps<"div"> &
  VariantProps<typeof kineticCardFooterVariants>;

export function KineticCardFooter({
  className,
  ...props
}: KineticCardFooterProps) {
  return (
    <div
      data-slot="kinetic-card-footer"
      className={twMerge(kineticCardFooterVariants(), className)}
      {...props}
    />
  );
}
