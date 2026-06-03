"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const outerCardBackground =
  "url('data:image/svg+xml,%3Csvg width=%2248%22 height=%2248%22 viewBox=%220 0 48 48%22 xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22%3E%3Cg opacity=%220.18%22%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 11H11V12H12V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 23H11V24H12V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M11 35H12V36H11V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 47H11V48H12V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M23 11H24V12H23V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M24 23H23V24H24V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M23 35H24V36H23V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M24 47H23V48H24V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M35 11H36V12H35V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M36 23H35V24H36V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M35 35H36V36H35V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M36 47H35V48H36V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M47 11H48V12H47V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M48 23H47V24H48V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M47 35H48V36H47V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M48 47H47V48H48V47Z%22 fill=%22%23A1A1AA%22/%3E%3C/g%3E%3C/svg%3E')";

export const kineticCardVariants = tv({
  base: [
    "not-prose relative w-full overflow-hidden rounded-2xl border border-border",
    "bg-muted text-foreground",
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
  base: "relative z-10 flex items-start justify-between gap-3 px-4 pt-4 pb-2",
});

export const kineticCardContentVariants = tv({
  base: [
    "relative z-10 mx-2 mb-2 overflow-hidden rounded-xl border border-border/60",
    "bg-card p-4",
  ],
});

export const kineticCardFooterVariants = tv({
  base: "relative z-10 flex items-center justify-between gap-3 px-4 pt-2 pb-4 text-xs",
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

export type KineticCardProps = HTMLMotionProps<"div"> &
  VariantProps<typeof kineticCardVariants> & {
    badge?: ReactNode;
    children?: ReactNode;
  };

export function KineticCard({
  className,
  style,
  size,
  tone = "default",
  badge,
  children,
  ...props
}: KineticCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const toneStyle = toneStyles[tone ?? "default"];

  return (
    <motion.div
      data-slot="kinetic-card"
      className={twMerge(kineticCardVariants({ size, tone }), className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundImage: outerCardBackground,
        backgroundRepeat: "repeat",
        backgroundSize: "48px 48px",
        backgroundClip: "padding-box",
        ...style,
      }}
      {...props}
    >
      {!badge ? (
        <div
          aria-hidden="true"
          className="absolute right-4 top-4 z-10 flex items-center gap-1.5"
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
      ) : null}

      {badge ? (
        <div
          data-slot="kinetic-card-badge"
          className={twMerge(
            "absolute right-3 top-3 z-20 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4",
            toneStyle.badge,
          )}
        >
          {badge}
        </div>
      ) : null}

      {children}
    </motion.div>
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
