"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import { currentUser } from "../data";

const menuItems = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Account settings", icon: Settings },
];

export function UserMenu() {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    // Move focus into the menu when it opens.
    menuRef.current
      ?.querySelector<HTMLButtonElement>("[role='menuitem']")
      ?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-slot="user-menu" className="relative">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 4, scale: 0.98 }
            }
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-20"
          >
            {/* Popover lifts two steps off the sidebar substrate, with a
                constant popover shadow regardless of nesting depth. */}
            <Elevated
              offset={2}
              shadowLevel={4}
              className="overflow-hidden rounded-xl p-1"
            >
              <div ref={menuRef} role="menu" aria-label="Account">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-surface-5 focus-visible:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <item.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {item.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </Elevated>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 rounded-xl bg-surface-1 px-2 py-2 text-left shadow-surface-1 outline-none transition-colors hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
        >
          {currentUser.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {currentUser.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {currentUser.email}
          </span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
