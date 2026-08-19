"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { spring } from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const MotionElevated = motion.create(Elevated);

type ExpandableListContextValue = {
  openValues: Set<string>;
  toggle: (value: string) => void;
  registerItem: (value: string, node: HTMLButtonElement | null) => void;
  focusAdjacent: (value: string, direction: 1 | -1) => void;
};

const ExpandableListContext = createContext<ExpandableListContextValue | null>(
  null,
);

function useExpandableListContext(component: string) {
  const context = useContext(ExpandableListContext);
  if (!context) {
    throw new Error(`${component} must be used within an <ExpandableList>.`);
  }
  return context;
}

export interface ExpandableListProps {
  children: ReactNode;
  /** Item values expanded on mount. Any number of items can stay open at once. */
  defaultOpenValues?: string[];
  className?: string;
}

export function ExpandableList({
  children,
  defaultOpenValues = [],
  className,
}: ExpandableListProps) {
  const [openValues, setOpenValues] = useState<Set<string>>(
    () => new Set(defaultOpenValues),
  );
  // Registration order, not DOM order, drives arrow-key navigation — items
  // register on mount, so this stays correct even if the list reorders.
  const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);

  const toggle = useCallback((value: string) => {
    setOpenValues((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const registerItem = useCallback(
    (value: string, node: HTMLButtonElement | null) => {
      if (node) {
        itemsRef.current.set(value, node);
        if (!orderRef.current.includes(value)) {
          orderRef.current.push(value);
        }
      } else {
        itemsRef.current.delete(value);
        orderRef.current = orderRef.current.filter(
          (current) => current !== value,
        );
      }
    },
    [],
  );

  const focusAdjacent = useCallback((value: string, direction: 1 | -1) => {
    const order = orderRef.current;
    const index = order.indexOf(value);
    if (index === -1 || order.length === 0) return;
    const nextIndex = (index + direction + order.length) % order.length;
    const nextValue = order[nextIndex];
    if (nextValue) {
      itemsRef.current.get(nextValue)?.focus();
    }
  }, []);

  const contextValue = useMemo<ExpandableListContextValue>(
    () => ({ openValues, toggle, registerItem, focusAdjacent }),
    [openValues, toggle, registerItem, focusAdjacent],
  );

  return (
    <ExpandableListContext.Provider value={contextValue}>
      <ul
        data-slot="expandable-list"
        className={cn("flex list-none flex-col gap-2", className)}
      >
        {children}
      </ul>
    </ExpandableListContext.Provider>
  );
}

export interface ExpandableListItemProps {
  value: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ExpandableListItem({
  value,
  title,
  children,
  className,
}: ExpandableListItemProps) {
  const { openValues, toggle, registerItem, focusAdjacent } =
    useExpandableListContext("ExpandableListItem");
  const open = openValues.has(value);
  const shouldReduceMotion = useReducedMotion();
  const triggerId = useId();
  const panelId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAdjacent(value, 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAdjacent(value, -1);
    }
    // Enter/Space activate the button natively — nothing to add here.
  }

  return (
    // `layout` on this wrapper is what animates the height change: the
    // panel below only fades/slides its own opacity, and Framer's FLIP
    // measurement turns that size delta into a smooth resize — no raw
    // `height: auto` tween, which never actually settles cleanly.
    <motion.li
      layout={!shouldReduceMotion}
      data-slot="expandable-list-item"
      className={cn("overflow-hidden rounded-xl bg-muted/30", className)}
    >
      <button
        ref={(node) => registerItem(value, node)}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => toggle(value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground outline-none",
          "transition-colors duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : spring.fast}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <MotionElevated
            key="panel"
            offset={1}
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={shouldReduceMotion ? { duration: 0 } : spring.moderate}
            className="rounded-none p-4 text-sm leading-relaxed text-muted-foreground"
          >
            {children}
          </MotionElevated>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}
