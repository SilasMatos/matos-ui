"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileCode } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export type BlockCodeFile = {
  path: string;
  code: string;
  rendered: ReactNode;
  isMain: boolean;
};

export function BlockCodeTabs({ files }: { files: BlockCodeFile[] }) {
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId().replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState(0);
  const active = files[activeIndex] ?? files[0];

  if (!files.length) {
    return null;
  }

  return (
    <div
      data-slot="block-code-tabs"
      className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-center gap-2 border-border/60 border-b bg-muted/30 px-2 py-1.5">
        <div
          role="tablist"
          aria-label="Block files"
          className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          {files.map((file, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={file.path}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId={`${baseId}-code-tab-indicator`}
                    className="absolute inset-0 rounded-lg border border-border bg-background shadow-xs"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 480, damping: 38 }
                    }
                  />
                ) : null}
                <FileCode
                  className="relative z-10 size-3.5"
                  aria-hidden="true"
                />
                <span className="relative z-10 whitespace-nowrap font-mono">
                  {file.path}
                </span>
                {file.isMain ? (
                  <span className="relative z-10 rounded border border-border bg-muted px-1 py-px text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    entry
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <CopyButton
          value={active.code}
          variant="ghost"
          className="shrink-0 text-muted-foreground"
        />
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable scroll region so keyboard users can scroll long code
        tabIndex={0}
        className="min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.path}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="[&_pre]:my-0 [&_pre]:max-h-none [&_pre]:rounded-none [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:text-[13px]"
          >
            {active.rendered}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
