"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Terminal } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";

import { copyToClipboard } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export type CopyInstallButtonProps = Omit<
  ComponentProps<"button">,
  "onClick" | "children"
> & {
  command: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyInstallButton({
  command,
  label = "Copy install",
  copiedLabel = "Copied",
  className,
  ...props
}: CopyInstallButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      data-slot="copy-install-button"
      aria-label={`Copy install command`}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const success = await copyToClipboard(command);
        if (success) {
          setCopied(true);
        }
      }}
      className={cn(
        "group/copy inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-xs outline-none",
        "transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <span
        className="relative grid size-4 place-items-center"
        aria-hidden="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
              }
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center text-primary"
            >
              <Check className="size-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="terminal"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
              }
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center"
            >
              <Terminal className="size-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="tabular-nums">{copied ? copiedLabel : label}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Install command copied to clipboard" : ""}
      </span>
    </button>
  );
}
