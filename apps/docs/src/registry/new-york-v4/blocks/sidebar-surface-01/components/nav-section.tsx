"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import type { NavGroup } from "../data";

export type NavSectionProps = {
  group: NavGroup;
  activeId: string;
  onSelect: (id: string) => void;
};

const itemBase =
  "group/nav flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function NavSection({ group, activeId, onSelect }: NavSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);

  return (
    <div data-slot="nav-section" className="space-y-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {group.label}
        <ChevronDown
          className={twMerge(
            "size-3.5 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            key="items"
            initial={
              shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { height: "auto", opacity: 1 }
            }
            exit={
              shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-0.5 overflow-hidden"
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeId;

              const inner = (
                <>
                  <Icon
                    className={twMerge(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground group-hover/nav:text-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge variant="count" size="xs" aria-hidden="true">
                      {item.badge}
                    </Badge>
                  ) : null}
                </>
              );

              return (
                <li key={item.id}>
                  {active ? (
                    // Active item lifts one step off the sidebar substrate.
                    <Elevated offset={1} shadowLevel={2} className="rounded-lg">
                      <button
                        type="button"
                        aria-current="page"
                        onClick={() => onSelect(item.id)}
                        className={twMerge(itemBase, "text-foreground")}
                      >
                        {inner}
                      </button>
                    </Elevated>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={twMerge(
                        itemBase,
                        "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                      )}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
