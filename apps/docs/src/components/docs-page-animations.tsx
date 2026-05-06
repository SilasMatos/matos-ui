"use client";

import { motion, type Variants } from "framer-motion";
import type * as React from "react";

const smoothEase = [0.25, 0.46, 0.45, 0.94] as const;

const headerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0 },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: smoothEase },
  },
};

const bodyVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", delay: 0.18 },
  },
};

const bottomNavVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.35 },
  },
};

export function DocsPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col gap-1.5"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-start justify-between gap-4">
        <motion.h1
          variants={lineVariants}
          className="scroll-m-24 text-2xl font-semibold tracking-tight"
        >
          {title}
        </motion.h1>
        {actions && (
          <motion.div
            variants={lineVariants}
            className="flex shrink-0 items-center gap-1.5 pt-0.5"
          >
            {actions}
          </motion.div>
        )}
      </div>
      {description && (
        <motion.p
          variants={lineVariants}
          className="text-sm text-muted-foreground leading-relaxed md:max-w-[85%]"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

export function DocsPageBody({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={bodyVariants}
      initial="hidden"
      animate="visible"
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

export function DocsPageBottomNav({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={bottomNavVariants}
      initial="hidden"
      animate="visible"
      className="flex h-12 w-full items-center gap-2 border-t border-border pt-4"
    >
      {children}
    </motion.div>
  );
}
