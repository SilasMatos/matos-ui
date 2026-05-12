"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
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
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.18, ease: [0.2, 0, 0, 1] },
  },
};

const tocActiveSpring = {
  type: "spring" as const,
  stiffness: 480,
  damping: 34,
  mass: 0.72,
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
    <div className={cn("flex flex-col pt-4 text-sm", className)}>
      <motion.p
        className="mb-3 flex items-center gap-2 px-2 text-[0.78rem] font-semibold text-foreground/60"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <motion.span
          className="h-px w-4 bg-foreground/25"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          style={{ transformOrigin: "left" }}
          aria-hidden="true"
        />
        On This Page
      </motion.p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-0.5"
      >
        {toc.map((item) => {
          const isActive = item.url === `#${activeHeading}`;
          return (
            <motion.a
              key={item.url}
              href={item.url}
              variants={itemVariants}
              className={cn(
                "relative flex min-h-6 items-center rounded-md py-0.5 pr-2 text-[0.78rem] leading-snug no-underline transition-colors",
                item.depth === 3 && "pl-6",
                item.depth >= 4 && "pl-8",
                item.depth <= 2 && "pl-3",
                isActive
                  ? "font-medium text-foreground"
                  : "text-foreground/55 hover:text-foreground/85",
              )}
              animate={{ x: isActive ? 2 : 0 }}
              whileHover={{ x: isActive ? 3 : 2 }}
              transition={tocActiveSpring}
            >
              <AnimatePresence>
                {isActive && (
                  <>
                    <motion.span
                      layoutId="toc-active-bg"
                      className="absolute inset-0 rounded-md bg-foreground/5 dark:bg-white/8"
                      initial={{ opacity: 0, scaleX: 0.96 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.98 }}
                      transition={tocActiveSpring}
                      style={{ transformOrigin: "left" }}
                    />
                    <motion.span
                      layoutId="toc-active-pin"
                      className="absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground/70 dark:bg-white/75"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 620,
                        damping: 28,
                        mass: 0.5,
                      }}
                    />
                    <motion.span
                      layoutId="toc-active-line"
                      className="absolute left-3 top-1/2 h-px w-2 -translate-y-1/2 bg-foreground/35 dark:bg-white/45"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
                      style={{ transformOrigin: "left" }}
                    />
                  </>
                )}
              </AnimatePresence>
              <span className="relative z-10">{item.title}</span>
            </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}
