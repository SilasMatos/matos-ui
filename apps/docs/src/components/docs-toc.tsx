"use client";

import { AnimatePresence, motion } from "framer-motion";
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

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
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
        className="mb-3 px-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/60"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        On this page
      </motion.p>

      <div className="border-l border-border">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          {toc.map((item) => {
            const isActive = item.url === `#${activeHeading}`;
            return (
              <motion.a
                key={item.url}
                href={item.url}
                variants={itemVariants}
                className={cn(
                  "relative -ml-px flex items-center border-l-2 py-1 pr-3 text-[0.78rem] leading-snug no-underline transition-colors",
                  item.depth === 3 && "pl-5",
                  item.depth === 4 && "pl-7",
                  item.depth <= 2 && "pl-3",
                  isActive
                    ? "font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                {/* Animated border indicator using layoutId */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="toc-active-line"
                      className="absolute -left-[2px] top-0 h-full w-[2px] rounded-full bg-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        layout: { type: "spring", stiffness: 380, damping: 32 },
                        opacity: { duration: 0.15 },
                      }}
                    />
                  )}
                </AnimatePresence>
                {item.title}
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
