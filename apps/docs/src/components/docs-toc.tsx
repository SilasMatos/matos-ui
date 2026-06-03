"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { MenuIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu";

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      }
    };
  }, [itemIds]);

  return activeId;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 6, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: [0.2, 0, 0, 1] },
  },
};

const tocActiveSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.68,
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
  const shouldReduceMotion = Boolean(useReducedMotion());
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);

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

  return (
    <motion.nav
      aria-label="On this page"
      className={cn(
        "relative mt-1 overflow-hidden rounded-xl border border-border/55 bg-muted/20 px-2 py-3 text-sm shadow-[0_1px_0_color-mix(in_oklab,var(--border)_30%,transparent)] dark:border-border/35 dark:bg-muted/10 dark:shadow-none",
        className,
      )}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 6, scale: 0.985, filter: "blur(3px)" }
      }
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.36, ease: [0.16, 1, 0.3, 1] }
      }
    >
      <div
        className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent"
        aria-hidden="true"
      />
      <motion.p
        className="mb-2.5 flex items-center gap-2 px-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground/55"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.28, ease: [0.2, 0, 0, 1] }
        }
      >
        <motion.span
          className="h-px w-4 bg-linear-to-r from-foreground/55 to-foreground/10"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: [0.2, 0, 0, 1] }
          }
          style={{ transformOrigin: "left" }}
          aria-hidden="true"
        />
        On This Page
      </motion.p>

      <motion.div
        variants={containerVariants}
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        className="relative flex flex-col gap-0.5 before:absolute before:inset-y-1 before:left-[0.4375rem] before:w-px before:bg-linear-to-b before:from-border/20 before:via-border/80 before:to-border/20"
      >
        {toc.map((item) => {
          const isActive = item.url === `#${activeHeading}`;
          return (
            <motion.a
              key={item.url}
              href={item.url}
              variants={shouldReduceMotion ? undefined : itemVariants}
              className={cn(
                "group/toc-item relative flex min-h-7 items-center rounded-lg py-1 pr-2 text-[0.76rem] leading-snug no-underline outline-none transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none",
                item.depth === 3 && "pl-7",
                item.depth >= 4 && "pl-9",
                item.depth <= 2 && "pl-4",
                isActive
                  ? "font-medium text-foreground"
                  : "text-foreground/55 hover:bg-foreground/[0.035] hover:text-foreground/85",
              )}
            >
              <AnimatePresence initial={false}>
                {isActive && (
                  <>
                    <motion.span
                      layoutId="toc-active-bg"
                      className="absolute inset-0 overflow-hidden rounded-lg border border-border/55 bg-background/75 shadow-[0_5px_16px_-12px_color-mix(in_oklab,var(--foreground)_65%,transparent)] dark:border-white/10 dark:bg-white/[0.07]"
                      initial={
                        shouldReduceMotion
                          ? false
                          : { opacity: 0, scaleX: 0.96 }
                      }
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.98 }}
                      transition={
                        shouldReduceMotion ? { duration: 0 } : tocActiveSpring
                      }
                      style={{ transformOrigin: "left" }}
                    >
                      <motion.span
                        className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-foreground/[0.07] to-transparent"
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.22, delay: 0.04 }
                        }
                      />
                    </motion.span>
                    <motion.span
                      layoutId="toc-active-pin"
                      className="absolute left-[0.1875rem] top-1/2 z-20 size-2 -translate-y-1/2 rounded-full border border-background bg-foreground shadow-[0_0_0_3px_color-mix(in_oklab,var(--foreground)_14%,transparent)] dark:border-black/70 dark:bg-white/90"
                      initial={
                        shouldReduceMotion ? false : { scale: 0.45, opacity: 0 }
                      }
                      animate={
                        shouldReduceMotion
                          ? { scale: 1, opacity: 1 }
                          : { scale: [0.65, 1.16, 1], opacity: 1 }
                      }
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                    <motion.span
                      layoutId="toc-active-line"
                      className="absolute left-3 top-1/2 z-10 h-px w-2 -translate-y-1/2 bg-linear-to-r from-foreground/65 to-foreground/15"
                      initial={
                        shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }
                      }
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.2,
                        ease: [0.2, 0, 0, 1],
                      }}
                      style={{ transformOrigin: "left" }}
                    />
                  </>
                )}
              </AnimatePresence>
              <motion.span
                className="relative z-10"
                animate={{ x: isActive && !shouldReduceMotion ? 2 : 0 }}
                whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                transition={
                  shouldReduceMotion ? { duration: 0 } : tocActiveSpring
                }
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
