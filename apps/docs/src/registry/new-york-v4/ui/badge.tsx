"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";

export const badgeVariants = tv({
  base: [
    "group/badge inline-flex min-w-0 shrink-0 items-center justify-center overflow-hidden border font-medium leading-none",
    // `hover-lift` owns the transition list as well as the timing; a badge
    // that is not interactive simply never sets --lift above 0.
    "hover-lift [--lift:0px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ],

  variants: {
    variant: {
      default:
        "border-border/0 bg-primary text-primary-foreground hover:bg-primary/90",

      secondary:
        "border-border/0 bg-secondary text-secondary-foreground hover:bg-muted",

      destructive:
        "border-border bg-muted text-destructive shadow-[inset_0_1px_0_var(--color-border)] hover:bg-secondary",

      outline: "border-border bg-muted/0 text-foreground hover:bg-muted",

      ghost:
        "border-border/0 bg-muted/0 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",

      soft: "border-border/0 bg-muted text-muted-foreground hover:text-foreground",

      dotted:
        "border-dashed border-border bg-muted/0 text-foreground hover:bg-muted",

      surface:
        "border-border bg-secondary text-secondary-foreground shadow-[0_1px_0_var(--color-border)] hover:bg-muted",

      inset:
        "border-border bg-muted text-foreground shadow-[inset_0_1px_0_var(--color-border),inset_0_-1px_0_var(--color-border)] hover:bg-secondary",

      tonal:
        "border-border/70 bg-primary/10 text-foreground shadow-[inset_0_1px_0_var(--color-border)] hover:bg-primary/10",

      muted:
        "border-border/70 bg-muted text-muted-foreground hover:text-foreground",

      success:
        "border-border bg-primary/10 text-foreground shadow-[inset_0_1px_0_var(--color-border)] hover:bg-primary/10",

      warning:
        "border-border bg-secondary text-foreground shadow-[inset_0_1px_0_var(--color-border)] hover:bg-muted",

      info: "border-border/70 bg-secondary text-secondary-foreground hover:bg-muted",

      pending:
        "border-dashed border-border bg-muted text-muted-foreground hover:text-foreground",

      pulse:
        "border-border bg-muted text-foreground shadow-[inset_0_1px_0_var(--color-border)] hover:bg-secondary",

      live: "border-border bg-primary/10 text-foreground hover:bg-primary/10",

      count:
        "min-w-5 rounded-full border-border bg-secondary px-1.5 text-secondary-foreground tabular-nums hover:bg-muted",

      keyboard:
        "border-border bg-muted px-1.5 font-mono text-muted-foreground shadow-[inset_0_-1px_0_var(--color-border)] hover:bg-secondary hover:text-foreground",

      beta: "border-border/70 bg-secondary text-muted-foreground uppercase tracking-wide hover:bg-muted hover:text-foreground",

      new: "border-border bg-primary/10 text-foreground uppercase tracking-wide hover:bg-primary/10",
    },
    size: {
      xs: "h-4 gap-1 px-1.5 text-[10px]",
      sm: "h-5 gap-1 px-2 text-[11px]",
      md: "h-6 gap-1.5 px-2.5 text-xs",
      lg: "h-7 gap-1.5 px-3 text-sm",
    },
    shape: {
      pill: "rounded-full",
      rounded: "rounded-md",
      square: "rounded-sm",
      dot: "rounded-full pl-1.5",
    },
    interactive: {
      true: [
        // 1px, not the 2px a button gets: a badge is small enough that the
        // full lift reads as the row reflowing.
        "cursor-pointer select-none [--lift:1px] active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-50",
      ],
    },
    selected: {
      true: "border-border bg-muted text-foreground shadow-[inset_0_1px_0_var(--color-border)]",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "sm",
    shape: "rounded",
  },

  compoundVariants: [
    {
      variant: "count",
      shape: "rounded",
      class: "rounded-full",
    },
  ],
});

type BadgeRootProps = Omit<ComponentProps<"span">, "children" | "color"> &
  Omit<ComponentProps<"button">, "children" | "className" | "color">;

export type BadgeProps = BadgeRootProps &
  VariantProps<typeof badgeVariants> & {
    children?: ReactNode;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    dot?: boolean;
    pulse?: boolean;
    count?: ReactNode;
    dismissible?: boolean;
    dismissLabel?: string;
    onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
  };

function BadgeDot({ pulse }: { pulse?: boolean }) {
  return (
    <span
      data-slot="badge-dot"
      data-pulse={pulse ? "" : undefined}
      className={twMerge(
        "relative size-1.5 shrink-0 rounded-full bg-current opacity-70",
        pulse &&
          "after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-30 after:animate-ping motion-reduce:after:animate-none",
      )}
      aria-hidden="true"
    />
  );
}

function BadgeIcon({ children }: { children: ReactNode }) {
  return (
    <span
      data-slot="badge-icon"
      className="inline-flex shrink-0 items-center justify-center transition-transform duration-200 ease-spring group-hover/badge:scale-105 motion-reduce:transition-none [&_svg]:size-3 [&_svg]:shrink-0"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function BadgeDismiss({
  label,
  onDismiss,
  disabled,
}: {
  label: string;
  onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="badge-dismiss"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onDismiss?.(event);
      }}
      className="group/dismiss -mr-1 inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color,transform,opacity] duration-200 ease-spring hover:bg-muted hover:text-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <span className="relative size-3" aria-hidden="true">
        <span className="absolute top-1/2 left-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current transition-transform duration-200 group-hover/dismiss:rotate-[50deg]" />
        <span className="absolute top-1/2 left-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current transition-transform duration-200 group-hover/dismiss:-rotate-[50deg]" />
      </span>
    </button>
  );
}

export function Badge({
  className,
  variant,
  size,
  shape,
  interactive = false,
  selected,
  iconLeft,
  iconRight,
  dot,
  pulse,
  count,
  dismissible,
  dismissLabel = "Remove badge",
  onDismiss,
  children,
  disabled,
  type = "button",
  onClick,
  ...props
}: BadgeProps) {
  const substrate = useSurface();
  const isLive = variant === "live" || variant === "pulse";
  const showDot = Boolean(dot || pulse || isLive || shape === "dot");
  const showPulse = Boolean(pulse || isLive);
  const content = count ?? children;
  const surfaceClassName =
    variant === "surface"
      ? surfaceClasses(Math.min(substrate + 1, 8), substrate)
      : variant === "inset"
        ? surfaceClasses(Math.max(substrate - 1, 1), substrate)
        : undefined;
  const badgeClassName = twMerge(
    badgeVariants({ variant, size, shape, interactive, selected }),
    surfaceClassName,
    className,
  );

  const badgeContent = (
    <>
      {showDot ? <BadgeDot pulse={showPulse} /> : null}
      {iconLeft ? <BadgeIcon>{iconLeft}</BadgeIcon> : null}
      {content !== undefined && content !== null ? (
        <span className="min-w-0 truncate">{content}</span>
      ) : null}
      {iconRight ? <BadgeIcon>{iconRight}</BadgeIcon> : null}
    </>
  );

  if (interactive && !dismissible) {
    return (
      <button
        data-slot="badge"
        data-selected={selected ? "" : undefined}
        disabled={disabled}
        type={type}
        onClick={onClick}
        className={badgeClassName}
        {...props}
      >
        {badgeContent}
      </button>
    );
  }

  return (
    <span
      data-slot="badge"
      data-selected={selected ? "" : undefined}
      className={badgeClassName}
      {...props}
    >
      {interactive ? (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className="inline-flex min-w-0 items-center gap-[inherit] rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {badgeContent}
        </button>
      ) : (
        badgeContent
      )}
      {dismissible ? (
        <BadgeDismiss
          label={dismissLabel}
          onDismiss={onDismiss}
          disabled={disabled}
        />
      ) : null}
    </span>
  );
}
