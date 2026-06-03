"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

const outerCardBackground =
  "url('data:image/svg+xml,%3Csvg width=%2248%22 height=%2248%22 viewBox=%220 0 48 48%22 xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22%3E%3Cg opacity=%220.18%22%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 11H11V12H12V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 23H11V24H12V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M11 35H12V36H11V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M12 47H11V48H12V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M23 11H24V12H23V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M24 23H23V24H24V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M23 35H24V36H23V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M24 47H23V48H24V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M35 11H36V12H35V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M36 23H35V24H36V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M35 35H36V36H35V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M36 47H35V48H36V47Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M47 11H48V12H47V11Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M48 23H47V24H48V23Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M47 35H48V36H47V35Z%22 fill=%22%23A1A1AA%22/%3E%3Cpath fill-rule=%22evenodd%22 clip-rule=%22evenodd%22 d=%22M48 47H47V48H48V47Z%22 fill=%22%23A1A1AA%22/%3E%3C/g%3E%3C/svg%3E')";

export const formSectionVariants = tv({
  slots: {
    root: [
      "not-prose overflow-hidden rounded-2xl border border-border bg-muted text-foreground",
      "transition-[border-color,box-shadow] duration-300 ease-in-out",
    ],
    inner: "mx-0.5 overflow-hidden rounded-xl  bg-background p-4 sm:p-5",
    header: "flex items-start justify-between gap-3 px-4 pt-4 pb-2 sm:px-5",
    title: "text-sm font-semibold tracking-tight text-foreground",
    description: "mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground",
    footer:
      "flex flex-wrap items-center justify-between gap-3 px-4 pt-2 pb-4 sm:px-5",
  },
  variants: {
    size: {
      compact: {
        inner: "p-3.5 sm:p-4",
        header: "px-3.5 pt-3.5 pb-2 sm:px-4",
        footer: "px-3.5 pt-2 pb-3.5 sm:px-4",
      },
      default: {},
      roomy: {
        inner: "p-5 sm:p-6",
        header: "px-5 pt-5 pb-3 sm:px-6",
        footer: "px-5 pt-3 pb-5 sm:px-6",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type FormSectionProps = HTMLMotionProps<"section"> &
  VariantProps<typeof formSectionVariants> & {
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
  };

export function FormSection({
  className,
  style,
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
  const hasHeader = Boolean(title || description || actions);

  return (
    <motion.section
      data-slot="form-section"
      className={twMerge(styles.root(), className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.4, 0, 0.2, 1] }}
      style={{
        backgroundImage: outerCardBackground,
        backgroundRepeat: "repeat",
        backgroundSize: "48px 48px",
        backgroundClip: "padding-box",
        ...style,
      }}
      {...props}
    >
      {hasHeader ? (
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
      <div
        data-slot="form-section-inner"
        className={twMerge(
          styles.inner(),
          !hasHeader && "mt-2",
          !footer && "mb-2",
        )}
      >
        {children}
      </div>
      {footer ? (
        <footer data-slot="form-section-footer" className={styles.footer()}>
          {footer}
        </footer>
      ) : null}
    </motion.section>
  );
}
