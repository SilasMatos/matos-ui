"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const commandDockVariants = tv({
  slots: {
    root: "relative isolate flex w-full flex-col items-center gap-3",
    panel: [
      "relative min-h-[112px] w-full max-w-[520px] overflow-hidden rounded-2xl border border-border",
      "bg-card/90 p-4 text-card-foreground shadow-sm backdrop-blur-xl",
    ],
    dock: [
      "relative flex max-w-full items-end gap-1.5 overflow-x-auto rounded-[24px] border border-border",
      "bg-background/75 px-2.5 py-2 shadow-lg backdrop-blur-xl",
      "supports-[backdrop-filter]:bg-background/55",
    ],
    item: [
      "group relative grid size-12 shrink-0 place-items-center rounded-2xl border border-transparent",
      "text-muted-foreground outline-none transition-colors duration-200",
      "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[active=true]:text-foreground",
    ],
    icon: [
      "relative z-10 grid size-10 place-items-center rounded-xl border border-border/70",
      "bg-card shadow-xs transition-colors duration-200",
      "group-data-[active=true]:border-primary/30 group-data-[active=true]:bg-primary/10",
    ],
  },
  variants: {
    size: {
      sm: {
        dock: "gap-1 rounded-[20px] px-2 py-1.5",
        item: "size-10 rounded-xl",
        icon: "size-8 rounded-lg",
      },
      md: {},
      lg: {
        dock: "gap-2 rounded-[28px] px-3 py-2.5",
        item: "size-14 rounded-[20px]",
        icon: "size-12 rounded-2xl",
      },
    },
    align: {
      center: "items-center",
      start: "items-start",
      end: "items-end",
    },
  },
  defaultVariants: {
    size: "md",
    align: "center",
  },
});

export type CommandDockAction = {
  id: string;
  label: string;
  icon: ReactNode;
  description?: string;
  badge?: string;
  shortcut?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  disabled?: boolean;
};

export type CommandDockProps = Omit<ComponentProps<"div">, "onSelect"> &
  VariantProps<typeof commandDockVariants> & {
    actions: CommandDockAction[];
    activeId?: string;
    defaultActiveId?: string;
    onSelect?: (action: CommandDockAction) => void;
    panelTitle?: string;
    panelDescription?: string;
    ariaLabel?: string;
    showPanel?: boolean;
  };

const toneClassName: Record<NonNullable<CommandDockAction["tone"]>, string> = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

const spring = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.9,
} as const;

const panelSpring = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.86,
} as const;

const smoothEase = [0.22, 1, 0.36, 1] as const;
const snappyEase = [0.2, 0, 0, 1] as const;

function getNeighborScale(index: number, activeIndex: number | null) {
  if (activeIndex === null) {
    return 1;
  }

  const distance = Math.abs(index - activeIndex);

  if (distance === 0) {
    return 1.16;
  }

  if (distance === 1) {
    return 1.075;
  }

  if (distance === 2) {
    return 1.025;
  }

  return 1;
}

export function CommandDock({
  actions,
  activeId,
  defaultActiveId,
  onSelect,
  panelTitle = "Command ready",
  panelDescription = "Select an action to reveal contextual controls.",
  ariaLabel = "Command dock",
  showPanel = true,
  className,
  size,
  align,
  ...props
}: CommandDockProps) {
  const styles = commandDockVariants({ size, align });
  const shouldReduceMotion = useReducedMotion();
  const panelId = useId();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? actions[0]?.id,
  );

  const selectedId = activeId ?? internalActiveId;
  const previewId = hoveredId ?? selectedId;
  const activeAction = useMemo(
    () => actions.find((action) => action.id === previewId) ?? actions[0],
    [actions, previewId],
  );
  const activeIndex = actions.findIndex((action) => action.id === previewId);
  const focusIndex = activeIndex >= 0 ? activeIndex : null;

  function handleSelect(action: CommandDockAction) {
    if (action.disabled) {
      return;
    }

    if (activeId === undefined) {
      setInternalActiveId(action.id);
    }

    onSelect?.(action);
  }

  return (
    <div
      data-slot="command-dock"
      className={twMerge(styles.root(), className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {showPanel && activeAction ? (
          <motion.div
            key={activeAction.id}
            id={panelId}
            data-slot="command-dock-panel"
            className={styles.panel()}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.992, filter: "blur(4px)" }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.996, filter: "blur(3px)" }
            }
            transition={panelSpring}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-80"
              animate={
                shouldReduceMotion
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "100% 50%"] }
              }
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
              style={{
                backgroundImage:
                  "linear-gradient(110deg, transparent, color-mix(in oklch, var(--primary) 12%, transparent), transparent)",
                backgroundSize: "220% 100%",
              }}
            />

            <div className="flex items-start gap-3">
              <motion.div
                className={twMerge(
                  "grid size-11 shrink-0 place-items-center rounded-2xl border border-border bg-background shadow-xs",
                  toneClassName[activeAction.tone ?? "default"],
                )}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -2, 0], scale: [1, 1.035, 1] }
                }
                transition={{ duration: 0.46, ease: smoothEase }}
              >
                {activeAction.icon}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {panelTitle}
                  </p>
                  {activeAction.badge ? (
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {activeAction.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1 text-base font-semibold tracking-tight">
                  {activeAction.label}
                </h3>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  {activeAction.description ?? panelDescription}
                </p>
              </div>

              {activeAction.shortcut ? (
                <kbd className="hidden rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground shadow-xs sm:inline-flex">
                  {activeAction.shortcut}
                </kbd>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        data-slot="command-dock-bar"
        role="toolbar"
        aria-label={ariaLabel}
        className={styles.dock()}
        onMouseLeave={() => setHoveredId(null)}
        layout
        transition={spring}
      >
        {actions.map((action, index) => {
          const isActive = selectedId === action.id;
          const isPreview = previewId === action.id;
          const scale = shouldReduceMotion
            ? 1
            : getNeighborScale(index, focusIndex);

          return (
            <motion.button
              type="button"
              key={action.id}
              aria-label={action.label}
              aria-describedby={showPanel ? panelId : undefined}
              aria-pressed={isActive}
              disabled={action.disabled}
              data-active={isActive}
              data-preview={isPreview}
              data-slot="command-dock-item"
              className={twMerge(
                styles.item(),
                action.disabled
                  ? "cursor-not-allowed opacity-45"
                  : "cursor-pointer",
              )}
              onClick={() => handleSelect(action)}
              onFocus={() => setHoveredId(action.id)}
              onMouseEnter={() => setHoveredId(action.id)}
              onBlur={() => setHoveredId(null)}
              animate={{
                scale,
                y: shouldReduceMotion ? 0 : isPreview ? -5 : 0,
              }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97, y: -1 }}
              transition={spring}
            >
              <motion.span
                data-slot="command-dock-icon"
                className={twMerge(
                  styles.icon(),
                  toneClassName[action.tone ?? "default"],
                )}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        boxShadow: isPreview
                          ? "0 14px 30px color-mix(in oklch, var(--foreground) 12%, transparent)"
                          : "0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent)",
                      }
                }
                transition={{ duration: 0.28, ease: smoothEase }}
              >
                {action.icon}
              </motion.span>

              <AnimatePresence>
                {isPreview ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute -top-2 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-full bg-primary/70 blur-[1px]"
                    initial={{ opacity: 0, scaleX: 0.4 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.4 }}
                    transition={{ duration: 0.22, ease: snappyEase }}
                  />
                ) : null}
              </AnimatePresence>

              {isActive ? (
                <motion.span
                  layoutId="command-dock-active-dot"
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary"
                  transition={spring}
                />
              ) : null}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
