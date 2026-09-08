"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import {
  motionForOffset,
  spring,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import {
  SurfaceProvider,
  useSurface,
} from "@/registry/new-york-v4/lib/surface-context";

// A dropdown — offset 2, so `moderate` for the popup.
const inlineSelectMotion = motionForOffset(2);

const OpenContext = createContext(false);

const PILL_BASE =
  "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs leading-normal";
const PILL_DEFAULT = "bg-muted text-muted-foreground";

export type InlineSelectOption = {
  value: string;
  label: ReactNode;
  /** A token-based tint for this option's pill, e.g. `bg-primary/10 text-foreground`. */
  pill?: string;
  disabled?: boolean;
};

export type InlineSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: InlineSelectOption[];
  /** Accessible name for the control. */
  label: string;
  /**
   * A `layoutId` for the pill. Give it a stable id per row, and the pill
   * magic-moves on `spring.fast` when a status change re-sorts the list and the
   * row it sits in travels to its new place on `spring.moderate` — two layout
   * animations at once, at two tiers.
   */
  layoutId?: string;
  placeholder?: ReactNode;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  className?: string;
};

/**
 * A value picked in place. At rest it is just the current value as a pill — no
 * field chrome; one click opens a small menu of options, and choosing one
 * commits and closes.
 *
 * The pill carries `layout` (and an optional `layoutId`), so it settles its own
 * width when the label changes and, given a stable id per row, flies to a new
 * position on `spring.fast` while its row reorders on `spring.moderate` — the
 * two-tier magic move a sortable table needs when a status change resorts it.
 *
 * Surface: the popup climbs two rungs from wherever the control sits and keeps a
 * constant shadow weight (§2.5.5). `prefers-reduced-motion` drops the pill
 * travel and the popup's zoom; the crossfade stays.
 */
export function InlineSelect({
  value,
  onValueChange,
  options,
  label,
  layoutId,
  placeholder = "—",
  disabled = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  className,
}: InlineSelectProps) {
  const reduce = useReducedMotion();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, openProp],
  );

  const choose = useCallback(
    (next: string) => {
      onValueChange(next);
      setOpen(false);
    },
    [onValueChange, setOpen],
  );

  const current = options.find((option) => option.value === value);

  return (
    <MenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <OpenContext.Provider value={open}>
        <MenuPrimitive.Trigger
          data-slot="inline-select-trigger"
          disabled={disabled}
          aria-label={label}
          className={cn(
            "not-prose group/inline-select inline-flex w-fit items-center gap-1 rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
        >
          <motion.span
            data-slot="inline-select-pill"
            layout={!reduce}
            layoutId={layoutId}
            transition={reduce ? { duration: 0 } : spring.fast}
            className={cn(PILL_BASE, current?.pill ?? PILL_DEFAULT)}
          >
            {current ? current.label : placeholder}
          </motion.span>
          <ChevronDown
            aria-hidden="true"
            className="size-3 shrink-0 text-muted-foreground opacity-0 transition-[opacity,rotate] group-hover/inline-select:opacity-100 group-focus-visible/inline-select:opacity-100 group-data-popup-open/inline-select:rotate-180 group-data-popup-open/inline-select:opacity-100"
          />
        </MenuPrimitive.Trigger>

        <InlineSelectPopup
          value={value}
          onChoose={choose}
          options={options}
          side={side}
          align={align}
        />
      </OpenContext.Provider>
    </MenuPrimitive.Root>
  );
}

function InlineSelectPopup({
  value,
  onChoose,
  options,
  side,
  align,
}: {
  value: string;
  onChoose: (value: string) => void;
  options: InlineSelectOption[];
  side: "top" | "bottom";
  align: "start" | "center" | "end";
}) {
  const open = useContext(OpenContext);
  const substrate = useSurface();
  const level = Math.min(substrate + 2, 8);
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    inlineSelectMotion,
  );

  const style = useMemo<CSSProperties>(
    () =>
      ({
        "--motion-duration": `${inlineSelectMotion.visualDuration}s`,
        "--motion-exit-duration": `${inlineSelectMotion.exit.duration}s`,
      }) as CSSProperties,
    [],
  );

  if (!mounted) return null;

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        side={side}
        align={align}
        sideOffset={6}
      >
        <MenuPrimitive.Popup
          data-slot="inline-select-popup"
          data-surface={level}
          style={style}
          onTransitionEnd={(event) => {
            if (event.currentTarget === event.target) onAnimationComplete();
          }}
          className={cn(
            "not-prose min-w-[9rem] origin-(--transform-origin) rounded-lg border border-border/40 p-1 outline-none",
            surfaceClasses(level, 3),
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
            "duration-[var(--motion-duration)] data-ending-style:duration-[var(--motion-exit-duration)]",
            "motion-reduce:animate-none motion-reduce:transition-none",
          )}
        >
          <SurfaceProvider value={level}>
            <MenuPrimitive.RadioGroup
              value={value}
              onValueChange={(next) => {
                if (typeof next === "string") onChoose(next);
              }}
            >
              {options.map((option) => (
                <MenuPrimitive.RadioItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  closeOnClick
                  className={cn(
                    "flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
                    "data-highlighted:bg-foreground/8",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                  )}
                >
                  <span className="grid size-3.5 shrink-0 place-items-center text-foreground">
                    <MenuPrimitive.RadioItemIndicator>
                      <Check className="size-3.5" />
                    </MenuPrimitive.RadioItemIndicator>
                  </span>
                  <span className={cn(PILL_BASE, option.pill ?? PILL_DEFAULT)}>
                    {option.label}
                  </span>
                </MenuPrimitive.RadioItem>
              ))}
            </MenuPrimitive.RadioGroup>
          </SurfaceProvider>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
