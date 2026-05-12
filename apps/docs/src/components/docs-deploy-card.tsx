"use client";

import { motion } from "framer-motion";
import { ArrowUpRightIcon, RocketIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function DocsDeployCard({ className }: { className?: string }) {
  return (
    <motion.div
      data-slot="docs-deploy-card"
      className={cn(
        "group relative mt-3 overflow-hidden rounded-xl border border-border/70 bg-foreground/[0.035] p-5 text-sm dark:bg-white/[0.045]",
        className,
      )}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 30,
        mass: 0.75,
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/35 to-transparent dark:via-white/40"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
        style={{ transformOrigin: "center" }}
        aria-hidden="true"
      />
      <motion.span
        className="pointer-events-none absolute inset-y-0 -left-16 w-12 bg-linear-to-r from-transparent via-foreground/8 to-transparent opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:translate-x-80 group-hover:opacity-100 dark:via-white/10"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start gap-3">
        <motion.span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground/75"
          whileHover={{ rotate: -6, scale: 1.04 }}
          transition={{ type: "spring", stiffness: 520, damping: 24 }}
          aria-hidden="true"
        >
          <RocketIcon className="size-4" />
        </motion.span>
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">
            Deploy your Matos UI app
          </p>
          <p className="mt-2 leading-5 text-foreground/65">
            Ship polished dashboards and docs with reusable registry components.
          </p>
        </div>
      </div>

      <motion.a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer"
        className="relative z-10 mt-4 inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        whileTap={{ scale: 0.97 }}
      >
        Deploy Now
        <ArrowUpRightIcon
          className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </motion.a>
    </motion.div>
  );
}
