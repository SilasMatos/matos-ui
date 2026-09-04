"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Eye,
  type LucideIcon,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { blockComponents } from "@/components/block-previews";
import { CodeBlockCommand } from "@/components/code-block-command";
import { CopyInstallButton } from "@/components/copy-install-button";
import { Link } from "@/i18n/navigation";
import type { BlockMeta } from "@/lib/blocks";
import { cn } from "@/lib/utils";

type Viewport = "mobile" | "tablet" | "desktop" | "full" | "free";
type ViewTab = "preview" | "code";

const VIEWPORT_WIDTHS: Record<"mobile" | "tablet" | "desktop", number> = {
  mobile: 390,
  tablet: 768,
  desktop: 1280,
};

const viewportButtons: {
  value: Exclude<Viewport, "free">;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "full", label: "Full width", icon: Maximize2 },
];

const MIN_WIDTH = 320;

function computeTargetWidth(mode: Viewport, stageWidth: number) {
  if (mode === "full" || mode === "free") {
    return stageWidth;
  }
  return Math.min(VIEWPORT_WIDTHS[mode], stageWidth);
}

export type BlockViewerProps = {
  block: BlockMeta;
  installCommand: string;
  codePanel: ReactNode;
};

export function BlockViewer({
  block,
  installCommand,
  codePanel,
}: BlockViewerProps) {
  const shouldReduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<ViewTab>("preview");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [stageWidth, setStageWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({ startX: 0, startWidth: 0 });

  const Preview = blockComponents[block.id];

  // Track the available stage width so viewport sizes stay clamped and responsive.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setStageWidth(Math.round(next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep the frame width in sync with the selected viewport (not while dragging).
  useEffect(() => {
    if (stageWidth === 0 || viewport === "free") {
      return;
    }
    setWidth(computeTargetWidth(viewport, stageWidth));
  }, [viewport, stageWidth]);

  const clampWidth = useCallback(
    (value: number) => {
      const max = stageWidth || value;
      return Math.max(MIN_WIDTH, Math.min(value, max));
    },
    [stageWidth],
  );

  function handleDragStart(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { startX: event.clientX, startWidth: width };
    setDragging(true);
    setViewport("free");
  }

  function handleDragMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging) {
      return;
    }
    const delta = (event.clientX - dragState.current.startX) * 2;
    setWidth(clampWidth(dragState.current.startWidth + delta));
  }

  function handleDragEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function handleHandleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 96 : 32;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setViewport("free");
      setWidth((current) => clampWidth((current || stageWidth) - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setViewport("free");
      setWidth((current) => clampWidth((current || stageWidth) + step));
    }
  }

  const resolvedWidth = width || stageWidth;
  const frameWidth = resolvedWidth ? `${resolvedWidth}px` : "100%";

  return (
    <div data-slot="block-viewer" className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/blocks"
          className="inline-flex items-center gap-1.5 rounded-lg font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Blocks
        </Link>
        <span aria-hidden="true">/</span>
        <span>{block.category}</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground/80">{block.name}</span>
      </div>

      <div className="flex flex-col gap-4 border-border border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {block.name}
            </h1>
            {block.isNew ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                New
              </span>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {block.description}
          </p>
        </div>
        <CopyInstallButton
          command={installCommand}
          label="Copy install command"
          className="h-9 self-start px-3.5 lg:self-auto"
        />
      </div>

      <div
        data-slot="block-viewer-toolbar"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div
          role="tablist"
          aria-label="Preview or code"
          className="relative flex items-center gap-0.5 self-start rounded-xl border border-border bg-muted/45 p-1"
        >
          {(
            [
              { value: "preview", label: "Preview", icon: Eye },
              { value: "code", label: "Code", icon: Code2 },
            ] as const
          ).map((option) => {
            const active = option.value === tab;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(option.value)}
                className={cn(
                  "relative inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="block-view-indicator"
                    className="absolute inset-0 rounded-lg border border-border bg-card shadow-xs"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <option.icon
                  className="relative z-10 size-4"
                  aria-hidden="true"
                />
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {tab === "preview" ? (
            <motion.div
              key="viewport-controls"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <span className="hidden min-w-14 text-right text-xs text-muted-foreground tabular-nums sm:inline">
                {resolvedWidth ? `${resolvedWidth}px` : ""}
              </span>
              <div
                role="tablist"
                aria-label="Preview viewport"
                className="relative flex items-center gap-0.5 rounded-xl border border-border bg-muted/45 p-1"
              >
                {viewportButtons.map((option) => {
                  const active = option.value === viewport;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={option.label}
                      title={option.label}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                      onClick={() => setViewport(option.value)}
                      className={cn(
                        "relative grid size-8 place-items-center rounded-lg outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="block-viewport-indicator"
                          className="absolute inset-0 rounded-lg border border-border bg-card shadow-xs"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 440, damping: 34 }
                          }
                        />
                      ) : null}
                      <option.icon
                        className="relative z-10 size-4"
                        aria-hidden="true"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "preview" ? (
            <motion.div
              key="preview"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                ref={stageRef}
                data-slot="block-preview-stage"
                className="relative overflow-hidden rounded-2xl border border-border bg-muted/15 p-3 dark:bg-background sm:p-4"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_center,color-mix(in_oklab,var(--muted)_26%,transparent)_0,transparent_46%)]"
                />
                <div
                  style={{
                    width: frameWidth,
                    transitionDuration:
                      dragging || shouldReduceMotion ? "0ms" : undefined,
                  }}
                  className={cn(
                    "relative mx-auto",
                    !dragging &&
                      !shouldReduceMotion &&
                      "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  )}
                >
                  <div className="not-prose isolate overflow-hidden rounded-xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    {Preview ? <Preview /> : null}
                  </div>

                  <button
                    type="button"
                    aria-label="Resize preview width"
                    onPointerDown={handleDragStart}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onKeyDown={handleHandleKeyDown}
                    className={cn(
                      "group absolute -right-3 top-1/2 hidden h-16 w-6 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-full outline-none md:grid",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <span className="h-10 w-1.5 rounded-full border border-border bg-card shadow-sm transition-colors duration-200 group-hover:bg-muted group-focus-visible:bg-muted" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[720px]"
            >
              {codePanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Installation
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <CodeBlockCommand command={installCommand} />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Installs the block and its Matos UI dependencies into your project
            via the shadcn CLI.
          </p>
        </section>

        <section className="space-y-4">
          <div className="space-y-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Matos UI components
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {block.matosComponents.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground shadow-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Dependencies
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {block.dependencies.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-lg border border-border/70 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
