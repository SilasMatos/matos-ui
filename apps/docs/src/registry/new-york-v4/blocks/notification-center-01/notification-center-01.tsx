"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, GitPullRequest, MessageSquare, Sparkles } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  slideVariants,
  spring,
  staggerContainer,
  withReducedMotion,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { surfaceClasses } from "@/registry/new-york-v4/lib/surface-classes";
import { SurfaceProvider } from "@/registry/new-york-v4/lib/surface-context";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

type Note = {
  id: string;
  icon: ReactNode;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const SEED: Note[] = [
  {
    id: "n-1",
    icon: <GitPullRequest className="size-4" aria-hidden="true" />,
    title: "Review requested on #4821",
    body: "Priya opened “Tune the morph tier for wide surfaces”.",
    time: "2m",
    unread: true,
  },
  {
    id: "n-2",
    icon: <MessageSquare className="size-4" aria-hidden="true" />,
    title: "New reply in #design-system",
    body: "“Shipping the elevation ladder doc today — final pass now.”",
    time: "18m",
    unread: true,
  },
  {
    id: "n-3",
    icon: <Sparkles className="size-4" aria-hidden="true" />,
    title: "Deploy succeeded",
    body: "matos-ui.com is live at build 2f7c1a in 41s.",
    time: "1h",
    unread: false,
  },
];

const EXTRA: Omit<Note, "id" | "unread"> = {
  icon: <Bell className="size-4" aria-hidden="true" />,
  title: "Weekly digest is ready",
  body: "3 merged PRs, 12 issues closed, 1 release cut.",
  time: "now",
};

/**
 * A notification centre built on the Surfaces system.
 *
 * The panel is the app background (level 1). Every card is an `Elevated`
 * `offset={1}`, so it reads one rung above the panel in light and dark alike,
 * and lifts another shadow step under the cursor via `hoverLift`.
 *
 * The list is a real `staggerContainer`: cards arrive on `slideVariants("top")`
 * one after another. A new notification pushes in at the top on the same
 * variant; a dismissal plays its exit (slide out, `spring.slow.exit`) before
 * `layout` closes the gap. Under `prefers-reduced-motion` every card still
 * crossfades in and out — nothing travels.
 */
export function NotificationCenter01() {
  const reduce = !!useReducedMotion();
  const idBase = useId();
  const [notes, setNotes] = useState<Note[]>(SEED);
  const addedRef = useRef(0);

  const unread = notes.filter((n) => n.unread).length;
  const enter = slideVariants("top", { distance: 18, tier: spring.moderate });
  const item = reduce ? withReducedMotion(enter) : enter;

  function add() {
    addedRef.current += 1;
    setNotes((current) => [
      { ...EXTRA, id: `${idBase}-x${addedRef.current}`, unread: true },
      ...current,
    ]);
  }

  function dismiss(id: string) {
    setNotes((current) => current.filter((n) => n.id !== id));
  }

  function markAllRead() {
    setNotes((current) => current.map((n) => ({ ...n, unread: false })));
  }

  return (
    <SurfaceProvider value={1}>
      <div
        data-slot="notification-center-01"
        className={twMerge(
          "@container/notif w-full max-w-md rounded-2xl p-3 text-foreground",
          surfaceClasses(1),
        )}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight">
              Notifications
            </span>
            {unread > 0 ? (
              <Badge variant="secondary" size="sm" className="tabular-nums">
                {unread} new
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={unread === 0}
            >
              Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={add}>
              Simulate
            </Button>
          </div>
        </div>

        <motion.ul
          className="flex flex-col gap-2 px-1 pb-1"
          variants={staggerContainer("moderate")}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {notes.map((note) => (
              <motion.li
                key={note.id}
                layout={!reduce}
                variants={item}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, x: 44, transition: spring.slow.exit }
                }
                transition={{ layout: spring.moderate }}
              >
                <Elevated
                  offset={1}
                  hoverLift
                  className="flex items-start gap-3 rounded-xl p-3"
                >
                  <span
                    className={twMerge(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      note.unread
                        ? "bg-primary/12 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {note.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground text-sm">
                        {note.title}
                      </p>
                      {note.unread ? (
                        <>
                          <span className="sr-only">Unread</span>
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                          />
                        </>
                      ) : null}
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {note.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Dismiss “${note.title}”`}
                    className="-mr-1 -mt-1 shrink-0"
                    onClick={() => dismiss(note.id)}
                  >
                    <span aria-hidden="true" className="text-base leading-none">
                      ×
                    </span>
                  </Button>
                </Elevated>
              </motion.li>
            ))}
          </AnimatePresence>

          {notes.length === 0 ? (
            <motion.li
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border/60 border-dashed py-8 text-center text-muted-foreground text-xs"
            >
              You&rsquo;re all caught up.
            </motion.li>
          ) : null}
        </motion.ul>
      </div>
    </SurfaceProvider>
  );
}
