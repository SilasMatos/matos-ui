"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useId, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const elasticPanelVariants = tv({
  base: [
    "overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
  ],
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[420px]",
      lg: "max-w-[520px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ElasticPanelProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof elasticPanelVariants> & {
    title: ReactNode;
    icon?: ReactNode;
    defaultOpen?: boolean;
    stiffness?: number;
    damping?: number;
  };

export function ElasticPanel({
  className,
  size,
  title,
  icon,
  defaultOpen = false,
  stiffness = 320,
  damping = 22,
  children,
  ...props
}: ElasticPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      data-slot="elastic-panel"
      className={twMerge(elasticPanelVariants({ size }), className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {icon ? (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
            {icon}
          </span>
        ) : null}
        <span className="flex-1 text-sm font-semibold">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness, damping }}
          className="text-muted-foreground"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.section
            id={contentId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness, damping, mass: 0.9 },
                opacity: { duration: 0.2, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { type: "spring", stiffness: 420, damping: 34 },
                opacity: { duration: 0.15 },
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{
                y: 0,
                transition: { type: "spring", stiffness, damping },
              }}
              exit={{ y: -8 }}
              className="border-border border-t px-5 py-4 text-sm leading-6 text-muted-foreground"
            >
              {children}
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
