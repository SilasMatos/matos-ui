"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const floatingActionMenuVariants = tv({
  base: ["relative inline-flex flex-col items-center"],
});

export type FloatingActionItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
};

export type FloatingActionMenuProps = ComponentProps<"div"> &
  VariantProps<typeof floatingActionMenuVariants> & {
    items: FloatingActionItem[];
    stiffness?: number;
    damping?: number;
  };

export function FloatingActionMenu({
  className,
  items,
  stiffness = 420,
  damping = 20,
  ...props
}: FloatingActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-slot="floating-action-menu"
      className={twMerge(floatingActionMenuVariants(), className)}
      {...props}
    >
      <AnimatePresence>
        {open ? (
          <motion.ul
            className="absolute bottom-16 flex flex-col items-center gap-3"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: { staggerChildren: 0.05, staggerDirection: -1 },
              },
              closed: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {items.map((item) => (
              <motion.li
                key={item.id}
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness, damping },
                  },
                  closed: { opacity: 0, y: 16, scale: 0.6 },
                }}
                className="flex items-center gap-2"
              >
                <span className="pointer-events-none rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-sm">
                  {item.label}
                </span>
                <motion.button
                  type="button"
                  aria-label={item.label}
                  onClick={item.onClick}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.icon}
                </motion.button>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <motion.span
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ type: "spring", stiffness, damping }}
        >
          <Plus className="size-6" aria-hidden="true" />
        </motion.span>
      </motion.button>
    </div>
  );
}
