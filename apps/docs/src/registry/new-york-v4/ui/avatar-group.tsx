"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ComponentProps, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { spring, stagger } from "@/registry/new-york-v4/lib/motion-tokens";

export const avatarGroupVariants = tv({
  base: [
    "group/avatars not-prose relative isolate flex w-fit list-none items-center",
  ],
  variants: {
    size: {
      sm: "text-[0.62rem]",
      md: "text-[0.72rem]",
      lg: "text-[0.82rem]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// diameter / overlap pull / open-state spread, all in px so Framer interpolates
// the x offset cleanly (a `calc()` string would not tween).
const SIZES = {
  sm: { d: 28, gap: 10, spread: 15 },
  md: { d: 36, gap: 13, spread: 21 },
  lg: { d: 44, gap: 16, spread: 26 },
} as const;

export type AvatarGroupItem = {
  /** Image URL. Falls back to initials when absent or on load error. */
  src?: string;
  /** Full name — used for the alt text, the title, and the hover label. */
  name: string;
  /** Explicit initials. Derived from `name` when omitted. */
  fallback?: string;
};

export type AvatarGroupProps = Omit<
  ComponentProps<"ul">,
  "children" | "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"
> &
  VariantProps<typeof avatarGroupVariants> & {
    items: AvatarGroupItem[];
    /** Show at most this many avatars; the rest collapse into a +N chip. */
    max?: number;
    /** Fan the stack apart on hover / focus. `true` by default. */
    spreadOnHover?: boolean;
    /** Float each name above its avatar while the stack is open. `true` by default. */
    showLabels?: boolean;
    "aria-label"?: string;
  };

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarGroup({
  className,
  size = "md",
  items,
  max,
  spreadOnHover = true,
  showLabels = true,
  "aria-label": ariaLabel,
  ...props
}: AvatarGroupProps) {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const dims = SIZES[size ?? "md"];
  const visible = typeof max === "number" ? items.slice(0, max) : items;
  const overflow = items.length - visible.length;

  // The spread is the whole interaction — with it suppressed there is nothing
  // to open, so the handlers just no-op.
  const canSpread = spreadOnHover && !shouldReduceMotion;
  const spread = canSpread && open;

  const cells: Array<
    | { kind: "avatar"; item: AvatarGroupItem; index: number }
    | { kind: "overflow"; index: number }
  > = [
    ...visible.map((item, index) => ({ kind: "avatar" as const, item, index })),
    ...(overflow > 0
      ? [{ kind: "overflow" as const, index: visible.length }]
      : []),
  ];

  const closeAll = () => {
    setOpen(false);
    setHovered(null);
  };

  return (
    <ul
      aria-label={ariaLabel ?? "People"}
      data-slot="avatar-group"
      data-open={spread || undefined}
      className={twMerge(avatarGroupVariants({ size }), className)}
      onPointerEnter={() => canSpread && setOpen(true)}
      onPointerLeave={closeAll}
      onFocusCapture={() => canSpread && setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeAll();
      }}
      {...props}
    >
      {cells.map((cell) => {
        const isHovered = hovered === cell.index;
        const clearHover = () =>
          setHovered((current) => (current === cell.index ? null : current));
        return (
          <motion.li
            key={cell.kind === "avatar" ? cell.item.name : "overflow"}
            className="relative shrink-0"
            style={{
              width: dims.d,
              height: dims.d,
              // Overlap: every cell after the first pulls left onto its
              // neighbour. Opening cancels it out via the x offset.
              marginLeft: cell.index === 0 ? 0 : -dims.gap,
              zIndex: isHovered ? 50 : 40 - cell.index,
            }}
            initial={false}
            animate={{
              x: spread ? cell.index * dims.spread : 0,
              y: isHovered && spread ? -4 : 0,
              scale: isHovered && spread ? 1.06 : 1,
            }}
            transition={{
              x: {
                type: "spring",
                visualDuration: spring.moderate.visualDuration,
                bounce: spring.moderate.bounce,
                // Staggered so the fan unrolls left-to-right instead of snapping.
                delay: spread ? cell.index * stagger.fast : 0,
              },
              y: spring.fast,
              scale: spring.fast,
            }}
            onPointerEnter={() => setHovered(cell.index)}
            onPointerLeave={clearHover}
          >
            {cell.kind === "avatar" ? (
              <Avatar
                item={cell.item}
                onFocus={() => setHovered(cell.index)}
                onBlur={clearHover}
              />
            ) : (
              <span
                className="grid size-full select-none place-items-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background"
                title={`${overflow} more`}
              >
                +{overflow}
              </span>
            )}

            <AnimatePresence>
              {showLabels && spread && isHovered && cell.kind === "avatar" ? (
                <motion.span
                  key="label"
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={spring.fast}
                  className="-translate-x-1/2 pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-50 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 font-medium text-[0.7rem] text-background shadow-sm"
                >
                  {cell.item.name}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}

function Avatar({
  item,
  onFocus,
  onBlur,
}: {
  item: AvatarGroupItem;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const initials = item.fallback ?? initialsOf(item.name);

  return (
    <button
      type="button"
      title={item.name}
      aria-label={item.name}
      onFocus={onFocus}
      onBlur={onBlur}
      className="block size-full overflow-hidden rounded-full outline-none ring-2 ring-background focus-visible:ring-2 focus-visible:ring-ring"
    >
      {item.src && !broken ? (
        // biome-ignore lint/performance/noImgElement: registry components must work outside Next.js.
        <img
          src={item.src}
          alt={item.name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="grid size-full select-none place-items-center bg-secondary font-semibold text-secondary-foreground">
          {initials}
        </span>
      )}
    </button>
  );
}
