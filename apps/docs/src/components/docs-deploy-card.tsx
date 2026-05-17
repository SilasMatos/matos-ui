"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardIcon,
  PackageIcon,
} from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york-v4/ui/button";

type DocsDeployCardProps = {
  className?: string;
};

const registryUrl = "https://matos-ui.com/r/all.json";

const packageManagers = [
  {
    id: "npm",
    label: "npm",
    command: `npx shadcn@latest add ${registryUrl}`,
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: `pnpm dlx shadcn@latest add ${registryUrl}`,
  },
  {
    id: "yarn",
    label: "yarn",
    command: `yarn dlx shadcn@latest add ${registryUrl}`,
  },
  {
    id: "bun",
    label: "bun",
    command: `bunx shadcn@latest add ${registryUrl}`,
  },
] as const;

type PackageManager = (typeof packageManagers)[number]["id"];

export function DocsDeployCard({ className }: DocsDeployCardProps) {
  const [copied, setCopied] = useState(false);
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");
  const shouldReduceMotion = useReducedMotion();
  const selectedPackageManager =
    packageManagers.find((item) => item.id === packageManager) ??
    packageManagers[0];

  async function copyCommand() {
    await navigator.clipboard.writeText(selectedPackageManager.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <motion.div
      data-slot="docs-deploy-card"
      className={cn(
        "group relative mt-3 overflow-hidden rounded-xl border border-border/70 bg-card p-4 text-sm shadow-xs",
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
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
        style={{ transformOrigin: "center" }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start gap-3">
        <motion.span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-secondary text-foreground/75"
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 520, damping: 24 }}
          aria-hidden="true"
        >
          <PackageIcon className="size-4" />
        </motion.span>
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">
            Install Matos UI
          </p>
          <p className="mt-1.5 leading-5 text-muted-foreground">
            Choose a package manager and copy one command for every component.
          </p>
        </div>
      </div>

      <div
        className="relative z-10 mt-4 grid grid-cols-4 gap-1 rounded-lg border border-border/70 bg-secondary p-1"
        role="radiogroup"
        aria-label="Package manager"
      >
        {packageManagers.map((item) => {
          const isSelected = item.id === packageManager;

          return (
            <motion.button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "relative h-7 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "text-foreground",
              )}
              onClick={() => setPackageManager(item.id)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            >
              {isSelected ? (
                <motion.span
                  layoutId="docs-deploy-package-manager"
                  className="absolute inset-0 rounded-md border border-border/70 bg-card shadow-xs"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                    mass: 0.7,
                  }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-2">
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : copied
                ? { scale: [1, 1.04, 1] }
                : { scale: 1 }
          }
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
        >
          <Button
            type="button"
            size="sm"
            variant={copied ? "secondary" : "outline"}
            className="h-7 min-w-20 gap-1.5 px-2.5 text-xs shadow-none"
            onClick={copyCommand}
            aria-label={`Copy ${selectedPackageManager.label} install command`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "copied" : "copy"}
                className="inline-flex items-center gap-1.5"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 3, scale: 0.96 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 0, y: -3, scale: 0.96 }
                }
                transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              >
                {copied ? (
                  <CheckIcon className="size-3.5" aria-hidden="true" />
                ) : (
                  <ClipboardIcon className="size-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
        <span className="sr-only">{selectedPackageManager.command}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground shadow-none hover:text-foreground"
          render={<Link href="/docs/components" />}
          nativeButton={false}
        >
          Registry
          <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </motion.div>
  );
}
