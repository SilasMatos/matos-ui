"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CornerDownLeft,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  UserPlus,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  directionalVariants,
  liftVariants,
  spring,
  staggerContainer,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

// The palette panel animates its entrance *and* sits on the elevation ladder,
// so it has to be a motion element and an `Elevated` at once — wrapping one in
// the other would add a layout box. Same reason for the moving highlight below.
const MotionElevated = motion.create(Elevated);

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  group: "Actions" | "Go to";
};

const COMMANDS: Command[] = [
  {
    id: "new-project",
    label: "Create project",
    hint: "P",
    icon: <Plus className="size-4" aria-hidden="true" />,
    group: "Actions",
  },
  {
    id: "invite",
    label: "Invite teammate",
    hint: "I",
    icon: <UserPlus className="size-4" aria-hidden="true" />,
    group: "Actions",
  },
  {
    id: "new-doc",
    label: "New document",
    hint: "D",
    icon: <FileText className="size-4" aria-hidden="true" />,
    group: "Actions",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    hint: "G D",
    icon: <LayoutDashboard className="size-4" aria-hidden="true" />,
    group: "Go to",
  },
  {
    id: "settings",
    label: "Settings",
    hint: "G S",
    icon: <Settings className="size-4" aria-hidden="true" />,
    group: "Go to",
  },
];

/**
 * A command palette that spells out the Surfaces composition rule.
 *
 * The frame is the app background (level 1). The palette is an `Elevated`
 * `offset={4}` — the conventional dialog offset — so it resolves to surface-5
 * over a dimmed scrim. The highlighted row is a second `Elevated`, `offset={1}`
 * *inside* the palette, so it lands at surface-6: a popover-weight surface
 * nested in a dialog-weight one, each reading its own substrate, in light and
 * dark. Arrow keys slide that highlight between rows on the `moderate` tier
 * (a shared `layoutId`), the rows stagger in on `liftVariants(4)`, and the
 * panel enters with `directionalVariants("bottom")`.
 *
 * Under `prefers-reduced-motion` the panel crossfades, the rows crossfade in
 * place, and the highlight jumps rather than slides.
 */
export function CommandMenu01() {
  const reduce = !!useReducedMotion();
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? COMMANDS.filter((command) => command.label.toLowerCase().includes(q))
      : COMMANDS;
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<Command["group"], Command[]>();
    for (const command of results) {
      const list = map.get(command.group) ?? [];
      list.push(command);
      map.set(command.group, list);
    }
    return [...map.entries()];
  }, [results]);

  const clampedActive = Math.min(active, Math.max(0, results.length - 1));
  const panelEnter = directionalVariants("bottom", spring.slow);

  function move(delta: number) {
    if (results.length === 0) return;
    setActive((current) => {
      const base = Math.min(current, results.length - 1);
      return (base + delta + results.length) % results.length;
    });
  }

  return (
    <SurfaceProvider value={1}>
      <div
        data-slot="command-menu-01"
        className={twMerge(
          "@container/cmd relative w-full overflow-hidden rounded-2xl p-4 text-foreground",
          surfaceClasses(1),
        )}
      >
        {/* A hint of the app underneath, so the scrim and the lift read. */}
        <div aria-hidden="true" className="space-y-2 opacity-60">
          <div className="h-2.5 w-1/3 rounded-full bg-muted" />
          <div className="h-2 w-2/3 rounded-full bg-muted/70" />
          <div className="h-2 w-1/2 rounded-full bg-muted/70" />
        </div>

        <div className="pointer-events-none flex min-h-[19rem] items-start justify-center pt-6">
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className={twMerge(
              "absolute inset-0 bg-foreground/8 transition-opacity",
              open ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />

          <AnimatePresence initial={false}>
            {open ? (
              <MotionElevated
                key="palette"
                offset={4}
                tabIndex={0}
                role="listbox"
                aria-label="Command palette"
                variants={reduce ? withReducedMotion(panelEnter) : panelEnter}
                initial="hidden"
                animate="visible"
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, transition: spring.slow.exit }
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    move(1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    move(-1);
                  } else if (event.key === "Escape") {
                    setOpen(false);
                  }
                }}
                className="pointer-events-auto relative z-10 w-full max-w-md overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5 border-border/60 border-b px-3.5 py-3">
                  <Search
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    placeholder="Type a command or search…"
                    aria-label="Search commands"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="rounded border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>

                <motion.div
                  className="max-h-64 space-y-3 overflow-y-auto p-2"
                  variants={staggerContainer("moderate", reduce ? 0 : 0.06)}
                  initial="hidden"
                  animate="visible"
                >
                  {groups.map(([group, items]) => (
                    <div key={group}>
                      <p className="px-2 pb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-widest">
                        {group}
                      </p>
                      <div className="space-y-0.5">
                        {items.map((command) => {
                          const index = results.indexOf(command);
                          const isActive = index === clampedActive;
                          return (
                            <motion.button
                              key={command.id}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              variants={
                                reduce
                                  ? withReducedMotion(liftVariants(4))
                                  : liftVariants(4)
                              }
                              onMouseMove={() => setActive(index)}
                              onFocus={() => setActive(index)}
                              className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none"
                            >
                              {isActive ? (
                                <MotionElevated
                                  layoutId="command-active"
                                  offset={1}
                                  aria-hidden="true"
                                  transition={
                                    reduce ? { duration: 0 } : spring.moderate
                                  }
                                  className="absolute inset-0 rounded-lg"
                                />
                              ) : null}
                              <span
                                className={twMerge(
                                  "relative z-10 shrink-0",
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {command.icon}
                              </span>
                              <span className="relative z-10 min-w-0 flex-1 truncate text-foreground">
                                {command.label}
                              </span>
                              <kbd className="relative z-10 shrink-0 font-mono text-[11px] text-muted-foreground">
                                {command.hint}
                              </kbd>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {results.length === 0 ? (
                    <p className="px-3 py-6 text-center text-muted-foreground text-sm">
                      No commands match &ldquo;{query}&rdquo;.
                    </p>
                  ) : null}
                </motion.div>

                <div className="flex items-center justify-between border-border/60 border-t px-3.5 py-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="size-3" aria-hidden="true" />
                    to run
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-mono">↑ ↓</span> to navigate
                  </span>
                </div>
              </MotionElevated>
            ) : (
              <motion.button
                key="trigger"
                type="button"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setOpen(true)}
                className="pointer-events-auto relative z-10 flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-muted-foreground text-sm shadow-surface-2 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="size-4" aria-hidden="true" />
                Open command menu
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SurfaceProvider>
  );
}
