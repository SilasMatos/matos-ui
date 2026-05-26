"use client";

import { type MotionProps, motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export const formSectionVariants = tv({
  slots: {
    root: [
      "not-prose rounded-2xl border border-border bg-muted/40 p-2 text-foreground",
      "transition-[border-color,box-shadow] duration-300 ease-out",
    ],
    inner: "rounded-xl border border-border bg-background p-4 shadow-xs sm:p-5",
    header: "mb-4 flex items-start justify-between gap-3",
    title: "text-sm font-semibold tracking-tight text-foreground",
    description: "mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground",
    footer:
      "mt-5 flex flex-wrap items-center justify-between gap-3 border-border border-t pt-4",
  },
  variants: {
    size: {
      compact: { inner: "p-3.5 sm:p-4", header: "mb-3", footer: "mt-4 pt-3" },
      default: {},
      roomy: { inner: "p-5 sm:p-6", header: "mb-5", footer: "mt-6 pt-5" },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type FormSectionProps = Omit<
  ComponentProps<"section">,
  keyof MotionProps
> &
  VariantProps<typeof formSectionVariants> & {
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
  };

export function FormSection({
  className,
  size = "default",
  title,
  description,
  actions,
  footer,
  children,
  ...props
}: FormSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = formSectionVariants({ size });

  return (
    <motion.section
      data-slot="form-section"
      className={twMerge(styles.root(), className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      <div data-slot="form-section-inner" className={styles.inner()}>
        {title || description || actions ? (
          <header data-slot="form-section-header" className={styles.header()}>
            <div>
              {title ? (
                <h3 data-slot="form-section-title" className={styles.title()}>
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p
                  data-slot="form-section-description"
                  className={styles.description()}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </header>
        ) : null}
        {children}
        {footer ? (
          <footer data-slot="form-section-footer" className={styles.footer()}>
            {footer}
          </footer>
        ) : null}
      </div>
    </motion.section>
  );
}
