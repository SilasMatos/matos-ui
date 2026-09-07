"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { useSurface } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export const motionTabsVariants = tv({
  base: ["w-full overflow-hidden rounded-2xl p-2 text-foreground"],
  variants: {
    size: {
      sm: "max-w-[420px]",
      md: "max-w-[620px]",
      lg: "max-w-[760px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.moderate,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.99,
    transition: spring.fast,
  },
};

const motionTabsStyle = {
  "--motion-duration": `${spring.fast.visualDuration}s`,
} as CSSProperties;

// The panel animates *and* participates in the elevation ladder, so it needs to
// be both a motion element and an <Elevated>. Wrapping one in the other would
// add a layout box; motion.create keeps it a single node.
const MotionElevated = motion.create(Elevated);

export type MotionTabItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
};

export type MotionTabsProps = Omit<ComponentProps<"div">, "defaultValue"> &
  VariantProps<typeof motionTabsVariants> & {
    items: MotionTabItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    listClassName?: string;
    panelClassName?: string;
  };

function toDomId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

function MotionTabs({
  className,
  size,
  items,
  value,
  defaultValue,
  onValueChange,
  listClassName,
  panelClassName,
  style,
  ...props
}: MotionTabsProps) {
  const shouldReduceMotion = useReducedMotion();
  const generatedId = useId().replace(/:/g, "");
  // The active-tab indicator lifts off the muted track: two rungs above the
  // substrate this component was dropped on (one for the tabs surface, one for
  // the pill sitting on it). No fixed fill.
  const indicatorLevel = Math.min(useSurface() + 2, 8);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const firstEnabled = items.find((item) => !item.disabled)?.value;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? firstEnabled ?? items[0]?.value,
  );

  const selectedValue = value ?? internalValue;
  const selectedItem =
    items.find((item) => item.value === selectedValue && !item.disabled) ??
    items.find((item) => !item.disabled) ??
    items[0];

  function setSelected(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function moveFocus(currentIndex: number, direction: 1 | -1) {
    if (!items.length) {
      return;
    }

    let nextIndex = currentIndex;

    for (let step = 0; step < items.length; step += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;
      const nextItem = items[nextIndex];

      if (!nextItem?.disabled) {
        setSelected(nextItem.value);
        buttonRefs.current[nextIndex]?.focus();
        return;
      }
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(index, 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(index, -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const nextIndex = items.findIndex((item) => !item.disabled);
      const nextItem = items[nextIndex];

      if (nextItem) {
        setSelected(nextItem.value);
        buttonRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (event.key === "End") {
      event.preventDefault();

      let nextIndex = -1;
      for (let index = items.length - 1; index >= 0; index -= 1) {
        if (!items[index]?.disabled) {
          nextIndex = index;
          break;
        }
      }

      const nextItem = items[nextIndex];

      if (nextItem) {
        setSelected(nextItem.value);
        buttonRefs.current[nextIndex]?.focus();
      }
    }
  }

  if (!items.length) {
    return null;
  }

  return (
    <Elevated
      data-slot="motion-tabs"
      offset={1}
      className={twMerge(motionTabsVariants({ size }), className)}
      style={{ ...motionTabsStyle, ...style }}
      {...props}
    >
      <div
        data-slot="motion-tabs-list"
        role="tablist"
        aria-orientation="horizontal"
        className={twMerge(
          "relative flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-1",
          "supports-[scrollbar-width:none]:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          listClassName,
        )}
      >
        {items.map((item, index) => {
          const isSelected = item.value === selectedItem?.value;
          const itemDomId = `${generatedId}-${toDomId(item.value)}`;

          return (
            <motion.button
              key={item.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${itemDomId}-trigger`}
              aria-controls={`${itemDomId}-panel`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              data-slot="motion-tabs-trigger"
              data-active={isSelected ? "" : undefined}
              onClick={() => setSelected(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              whileTap={
                item.disabled || shouldReduceMotion
                  ? undefined
                  : { scale: 0.98 }
              }
              className={twMerge(
                "group relative flex h-10 min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-lg px-3",
                // hover-lift owns the 1px float and its curve, touch guard and
                // reduced-motion guard — the DESIGN 3.9 way, not a raw whileHover.
                "hover-lift [--lift:1px] text-sm font-medium outline-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-45",
                isSelected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isSelected ? (
                <motion.span
                  layoutId={`${generatedId}-motion-tabs-indicator`}
                  data-slot="motion-tabs-indicator"
                  data-surface={indicatorLevel}
                  className={twMerge(
                    "absolute inset-0 rounded-lg",
                    surfaceClasses(indicatorLevel),
                  )}
                  transition={spring.fast}
                />
              ) : null}

              {item.icon ? (
                <motion.span
                  aria-hidden="true"
                  data-slot="motion-tabs-icon"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: isSelected ? 1.05 : 1,
                          rotate: isSelected ? 0 : -2,
                        }
                  }
                  transition={spring.fast}
                  className={twMerge(
                    "relative z-10 flex items-center text-muted-foreground transition-colors duration-[var(--motion-duration)]",
                    "group-data-[active]:text-primary [&_svg]:size-4",
                  )}
                >
                  {item.icon}
                </motion.span>
              ) : null}

              <span className="relative z-10 truncate">{item.label}</span>

              {item.badge ? (
                <motion.span
                  data-slot="motion-tabs-badge"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: isSelected ? 1 : 0.94,
                          opacity: isSelected ? 1 : 0.72,
                        }
                  }
                  transition={spring.fast}
                  className="relative z-10 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {item.badge}
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {selectedItem?.content ? (
        <AnimatePresence mode="wait" initial={false}>
          <MotionElevated
            key={selectedItem.value}
            offset={1}
            data-slot="motion-tabs-panel"
            role="tabpanel"
            id={`${generatedId}-${toDomId(selectedItem.value)}-panel`}
            aria-labelledby={`${generatedId}-${toDomId(
              selectedItem.value,
            )}-trigger`}
            variants={panelVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            exit={shouldReduceMotion ? undefined : "exit"}
            className={twMerge("mt-2 rounded-xl p-4", panelClassName)}
          >
            {selectedItem.description ? (
              <p
                data-slot="motion-tabs-description"
                className="mb-3 text-muted-foreground text-sm leading-relaxed"
              >
                {selectedItem.description}
              </p>
            ) : null}
            {selectedItem.content}
          </MotionElevated>
        </AnimatePresence>
      ) : null}
    </Elevated>
  );
}

export { MotionTabs };
