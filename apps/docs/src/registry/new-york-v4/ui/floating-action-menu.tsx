"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

import {
  spring,
  staggerContainer,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export const floatingActionMenuVariants = tv({
  // `not-prose` matters: rendered inside typography styles (docs, MDX, any
  // consumer running @tailwindcss/typography) a bare <ul>/<li> picks up list
  // margins that push the actions ~16px further apart than the gap asks for.
  base: ["not-prose relative inline-flex flex-col items-center"],
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
            // Anchored on the trigger's centre line, and every <li> is exactly
            // as wide as its action button (the label is taken out of flow
            // below), so the buttons stack on one axis no matter how long the
            // labels are.
            className="absolute bottom-16 left-1/2 m-0 flex -translate-x-1/2 list-none flex-col items-center gap-2 p-0"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: staggerContainer("fast").visible,
              closed: staggerContainer("fast").hidden,
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
                    transition: spring.moderate,
                  },
                  closed: {
                    opacity: 0,
                    y: 16,
                    scale: 0.9,
                    transition: spring.fast,
                  },
                }}
                className="relative m-0 flex items-center"
              >
                <Elevated
                  offset={2}
                  className="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-foreground"
                >
                  {item.label}
                </Elevated>
                <Elevated offset={2} className="rounded-full">
                  <motion.button
                    type="button"
                    aria-label={item.label}
                    onClick={item.onClick}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    className="inline-flex size-11 items-center justify-center rounded-full text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.icon}
                  </motion.button>
                </Elevated>
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
