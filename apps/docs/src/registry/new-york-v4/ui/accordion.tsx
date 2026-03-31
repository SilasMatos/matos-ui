"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type AccordionContextType = {
  openItems: string[];
  toggleItem: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export interface AccordionProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

export function Accordion({ children, className, ...props }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = React.useCallback((value: string) => {
    setOpenItems((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  }, []);

  const value = React.useMemo(
    () => ({ openItems, toggleItem }),
    [openItems, toggleItem],
  );

  return (
    <AccordionContext.Provider value={value}>
      <div
        data-slot="accordion"
        className={cn("w-full space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLMotionProps<"div"> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({
  value: _value,
  children,
  className,
  ...props
}: AccordionItemProps) {
  return (
    <motion.div
      layout
      data-slot="accordion-item"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface AccordionTriggerProps extends React.ComponentProps<"button"> {
  value: string;
  children: React.ReactNode;
}

export function AccordionTrigger({
  value,
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context)
    throw new Error("AccordionTrigger must be used within Accordion");

  const isOpen = context.openItems.includes(value);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        context.toggleItem(value);
      }
    },
    [context, value],
  );

  return (
    <button
      type="button"
      data-slot="accordion-trigger"
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={isOpen}
      onClick={() => context.toggleItem(value)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full items-center justify-between px-4 py-2 text-left outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        isOpen ? "bg-accent" : "hover:bg-accent",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{children}</span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </motion.div>
    </button>
  );
}

export interface AccordionContentProps extends HTMLMotionProps<"div"> {
  value: string;
  children: React.ReactNode;
}

export function AccordionContent({
  value,
  children,
  className,
  ...props
}: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context)
    throw new Error("AccordionContent must be used within Accordion");

  const isOpen = context.openItems.includes(value);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          layout
          data-slot="accordion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className={cn("overflow-hidden", className)}
          {...props}
        >
          <div className="bg-accent px-4 pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
