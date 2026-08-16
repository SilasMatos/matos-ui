"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, LayoutGrid, Search, X } from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";

import { blockComponents } from "@/components/block-previews";
import { CopyInstallButton } from "@/components/copy-install-button";
import { Link } from "@/i18n/navigation";
import {
  type BlockCategory,
  type BlockMeta,
  blockCategories,
  blockCollection,
  getBlockInstallCommand,
} from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { motionForOffset } from "@/registry/new-york-v4/lib/motion-tokens";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.985,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
};

export function BlocksShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<BlockCategory>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return blockCollection.filter((block) => {
      const matchesCategory =
        activeCategory === "All" || block.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      const haystack = [
        block.name,
        block.description,
        block.category,
        ...block.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [activeCategory, query]);

  return (
    <section className="not-prose space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <LayoutGrid className="size-3.5" aria-hidden="true" />
          Registry
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Blocks
            </h1>
            <p className="mt-3 text-balance text-base leading-7 text-muted-foreground">
              Ready-made interface compositions built from Matos UI components.
              Preview, copy the code, or install a full block with a single
              command.
            </p>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {blockCollection.length}{" "}
            {blockCollection.length === 1 ? "block" : "blocks"} available
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 border-border border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter blocks by category"
          className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/45 p-1"
        >
          {blockCategories.map((category) => {
            const active = category === activeCategory;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "relative min-h-8 shrink-0 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="blocks-filter-indicator"
                    className="absolute inset-0 rounded-lg border border-border bg-card shadow-xs"
                    transition={
                      shouldReduceMotion ? { duration: 0 } : motionForOffset(1)
                    }
                  />
                ) : null}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blocks…"
            aria-label="Search blocks"
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <motion.div
        layout={!shouldReduceMotion}
        className="grid gap-4 md:grid-cols-2"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              reducedMotion={Boolean(shouldReduceMotion)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <BlocksEmptyState
          onReset={() => {
            setQuery("");
            setActiveCategory("All");
          }}
        />
      ) : null}
    </section>
  );
}

function BlockCard({
  block,
  index,
  reducedMotion,
}: {
  block: BlockMeta;
  index: number;
  reducedMotion: boolean;
}) {
  const Preview: ComponentType | undefined = blockComponents[block.id];
  const href = `/blocks/${block.id}` as const;

  return (
    <motion.article
      data-slot="block-card"
      layout={!reducedMotion}
      variants={reducedMotion ? undefined : cardVariants}
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      exit={reducedMotion ? undefined : "exit"}
      transition={{
        layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.24),
      }}
      className="group relative flex flex-col"
    >
      {/* The card is the navigation frame (surface-2); the preview well below
          is a step above it (surface-3), so the live block render reads as
          content sitting *in* the card rather than as more card. */}
      <Elevated
        offset={1}
        className="relative flex flex-1 flex-col overflow-hidden rounded-2xl"
      >
        {/* Stretched navigation link — covers the whole card. */}
        <Link
          href={href}
          aria-label={`Open ${block.name} block`}
          className="absolute inset-0 z-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        <Elevated
          offset={1}
          className="pointer-events-none relative z-0 h-[240px] overflow-hidden rounded-none"
        >
          {Preview ? (
            <div
              inert
              aria-hidden="true"
              className="absolute inset-0 origin-top overflow-hidden p-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]"
            >
              <Preview />
            </div>
          ) : null}
          {/* Fades to the preview well's own surface, not the card's. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface-3 via-surface-3/70 to-transparent"
          />
        </Elevated>

        <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {block.name}
                </h3>
                <span className="shrink-0 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {block.category}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">
                {block.description}
              </p>
            </div>
          </div>

          {/* Tags are secondary: they hold their layout slot but only surface
              on hover/focus, so the grid reads quietly at rest. */}
          <div
            className={cn(
              "flex flex-wrap gap-1.5 transition-opacity duration-200",
              reducedMotion
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            {block.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground",
                "transition-colors duration-200 group-hover:text-foreground",
              )}
            >
              Open block
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
            <div
              className={cn(
                "pointer-events-auto relative z-10 transition-opacity duration-200",
                reducedMotion
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
              )}
            >
              <CopyInstallButton command={getBlockInstallCommand(block.id)} />
            </div>
          </div>
        </div>
      </Elevated>
    </motion.article>
  );
}

function BlocksEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center"
    >
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
          <Search className="size-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          No blocks found
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No blocks match your search or filter. Try a different keyword or
          category.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          Reset filters
        </button>
      </div>
    </motion.div>
  );
}
