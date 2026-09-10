"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { MenuIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  duration,
  ease,
  spring,
  stagger,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu";

/**
 * Tracks which heading the reader is on. Keeps a live set of every heading
 * currently in the viewport and reports the first one in document order, so a
 * long section that fills the screen still counts as "active" and the marker
 * doesn't jump to a heading further down that also happens to be intersecting.
 */
function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!itemIds.length) return;

    const visible = new Set<string>();

    const pick = () => {
      // The last section often can't scroll high enough to trip the observer,
      // so it would never light up — snap to it once the page bottoms out.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveId(itemIds[itemIds.length - 1] ?? null);
        return;
      }
      const first = itemIds.find((id) => visible.has(id));
      if (first) setActiveId(first);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        pick();
      },
      // Fire while a heading sits in the upper third of the viewport — the band
      // the eye actually reads from.
      { rootMargin: "0% 0% -66% 0%" },
    );

    for (const id of itemIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    window.addEventListener("scroll", pick, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, [itemIds]);

  return activeId;
}

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger.fast, delayChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 2 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: ease.decelerate },
  },
};

export function DocsTableOfContents({
  toc,
  variant = "list",
  className,
}: {
  toc: {
    title?: React.ReactNode;
    url: string;
    depth: number;
  }[];
  variant?: "dropdown" | "list";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const reduce = Boolean(useReducedMotion());
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeHeading = useActiveItem(itemIds) ?? itemIds[0];

  if (!toc?.length) return null;

  if (variant === "dropdown") {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn("h-8 md:h-7", className)}
            >
              <MenuIcon /> On This Page
            </Button>
          }
        />
        <DropdownMenuContent
          align="start"
          className="no-scrollbar max-h-[70svh]"
        >
          {toc.map((item) => (
            <DropdownMenuItem
              key={item.url}
              render={<a href={item.url}>{item.title}</a>}
              onClick={() => setOpen(false)}
              data-depth={item.depth}
              className="data-[depth=3]:pl-6 data-[depth=4]:pl-8"
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const activeIndex = itemIds.indexOf(activeHeading);
  // How far down the list the reader has travelled, as a fraction. Drives the
  // rail's fill: an approximate "you are here" that the thumb then pins exactly.
  const progress =
    toc.length > 1 && activeIndex >= 0
      ? (activeIndex + 1) / toc.length
      : toc.length <= 1
        ? 1
        : 0;

  return (
    <motion.nav
      aria-label="On this page"
      className={cn("relative text-sm", className)}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: duration.moderate, ease: ease.decelerate }
      }
    >
      <p className="mb-3 pl-4 font-medium text-muted-foreground text-xs">
        On This Page
      </p>

      <motion.div
        variants={listVariants}
        initial={reduce ? false : "hidden"}
        animate="visible"
        className="relative flex flex-col"
      >
        {/* The rail the whole list hangs off. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-0 w-px bg-border"
        />
        {/* Reading progress, filling the rail from the top as you scroll. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-0 w-px origin-top bg-foreground/25"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: progress }}
          transition={reduce ? { duration: 0 } : spring.moderate}
        />

        {toc.map((item) => {
          const id = item.url.replace("#", "");
          const isActive = id === activeHeading;
          return (
            <motion.a
              key={item.url}
              href={item.url}
              data-active={isActive || undefined}
              variants={reduce ? undefined : itemVariants}
              className={cn(
                "group/toc-item relative flex min-h-8 items-center rounded-md py-1 pr-2 text-[0.8125rem] leading-snug no-underline outline-none transition-colors duration-200 motion-reduce:transition-none",
                "focus-visible:ring-2 focus-visible:ring-ring/40",
                item.depth <= 2 && "pl-4",
                item.depth === 3 && "pl-7",
                item.depth >= 4 && "pl-10",
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground/70 hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="toc-thumb"
                  aria-hidden="true"
                  className="absolute inset-y-1.5 left-[-0.5px] w-[2px] rounded-full bg-foreground"
                  transition={reduce ? { duration: 0 } : spring.moderate}
                />
              )}
              <motion.span
                className="relative"
                animate={{ x: isActive && !reduce ? 3 : 0 }}
                transition={reduce ? { duration: 0 } : spring.fast}
              >
                {item.title}
              </motion.span>
            </motion.a>
          );
        })}
      </motion.div>
    </motion.nav>
  );
}
