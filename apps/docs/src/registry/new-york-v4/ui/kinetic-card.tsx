"use client";

import { motion } from "framer-motion";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const kineticCardVariants = tv({
  base: [
    "group relative isolate w-full overflow-hidden rounded-[20px] border border-border",
    "bg-card text-card-foreground shadow-xs transition-colors",
  ],
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[420px]",
      lg: "max-w-[520px]",
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
    size: "md",
    tone: "default",
  },
});

export const kineticCardHeaderVariants = tv({
  base: "relative z-10 flex items-start justify-between gap-4 px-5 pt-5",
});

export const kineticCardContentVariants = tv({
  base: "relative z-10 px-5 py-4",
});

export const kineticCardFooterVariants = tv({
  base: "relative z-10 flex items-center justify-between gap-3 px-5 pt-1 pb-5",
});

type KineticCardStyle = CSSProperties & {
  "--kinetic-color": string;
  "--kinetic-soft": string;
  "--kinetic-line": string;
};

const toneVars = {
  default: {
    "--kinetic-color": "var(--muted-foreground)",
    "--kinetic-soft":
      "color-mix(in oklch, var(--muted-foreground) 18%, transparent)",
    "--kinetic-line":
      "color-mix(in oklch, var(--muted-foreground) 26%, transparent)",
  },
  primary: {
    "--kinetic-color": "var(--primary)",
    "--kinetic-soft": "color-mix(in oklch, var(--primary) 18%, transparent)",
    "--kinetic-line": "color-mix(in oklch, var(--primary) 30%, transparent)",
  },
  accent: {
    "--kinetic-color": "var(--chart-2)",
    "--kinetic-soft": "color-mix(in oklch, var(--chart-2) 20%, transparent)",
    "--kinetic-line": "color-mix(in oklch, var(--chart-2) 32%, transparent)",
  },
  destructive: {
    "--kinetic-color": "var(--destructive)",
    "--kinetic-soft":
      "color-mix(in oklch, var(--destructive) 16%, transparent)",
    "--kinetic-line":
      "color-mix(in oklch, var(--destructive) 28%, transparent)",
  },
} satisfies Record<string, KineticCardStyle>;

const beamVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: (delay: number) => ({
    pathLength: [0, 1, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: [0.16, 1, 0.3, 1] as const,
      delay,
    },
  }),
};

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
  style,
  ...props
}: KineticCardProps) {
  return (
    <div
      data-slot="kinetic-card"
      className={twMerge(kineticCardVariants({ size, tone }), className)}
      style={{ ...toneVars[tone ?? "default"], ...style }}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--kinetic-soft), transparent 32%), radial-gradient(circle at 80% 0%, color-mix(in oklch, var(--kinetic-color) 12%, transparent), transparent 30%)",
          backgroundSize: "160% 160%",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--kinetic-line) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <motion.svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full text-[var(--kinetic-color)]"
        fill="none"
        viewBox="0 0 420 260"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M-20 72 C84 34 142 122 224 86 C306 50 342 18 440 42"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          variants={beamVariants}
          initial="initial"
          animate="animate"
          custom={0}
        />
        <motion.path
          d="M-12 190 C82 146 126 224 226 178 C306 142 348 132 432 160"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          variants={beamVariants}
          initial="initial"
          animate="animate"
          custom={1.2}
        />
      </motion.svg>

      {badge && (
        <div className="absolute top-4 right-4 z-20 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
          {badge}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
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
