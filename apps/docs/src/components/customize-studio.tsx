"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { useThemeCustomizer } from "@/hooks/use-theme-customizer";
import { PALETTES, paletteLabel, RADIUS_PRESETS } from "@/lib/theme-customizer";
import { cn } from "@/lib/utils";
import { motionForOffset } from "@/registry/new-york-v4/lib/motion-tokens";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export function CustomizeStudio() {
  const {
    isDark,
    paletteName,
    radiusId,
    palette,
    radius,
    setPalette,
    setRadius,
    installCommand,
    radiusSnippet,
  } = useThemeCustomizer();

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-5">
        <Elevated offset={1} className="rounded-2xl p-4 sm:p-5">
          <SectionLabel>Palette</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PALETTES.map((item) => {
              const selected = item.name === paletteName;
              const vars = item.cssVars[isDark ? "dark" : "light"];
              // A light → identity → deep stop of the one hue, straight from the
              // registry ramp — shows the palette *is* a scale, not a flat tone.
              // De-duped: a few palettes reuse one value for two stops, and a
              // repeated colour is both an invisible stripe and a key collision.
              const swatches = [
                ...new Set(
                  [vars["chart-1"], vars.primary, vars["chart-5"]].filter(
                    Boolean,
                  ),
                ),
              ];
              return (
                <Elevated
                  key={item.name}
                  offset={1}
                  hoverLift
                  className={cn(
                    "rounded-xl",
                    selected && "ring-1 ring-primary/60",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPalette(item.name)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm outline-none transition-colors duration-moderate ease-spring focus-visible:ring-2 focus-visible:ring-primary/50",
                      selected
                        ? "border-primary/70 bg-primary/10 hover:bg-primary/[0.15]"
                        : "border-transparent hover:bg-foreground/8",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-10 shrink-0 overflow-hidden rounded-full"
                    >
                      {swatches.map((color) => (
                        <span
                          key={color}
                          className="h-full flex-1"
                          style={{ background: color }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {paletteLabel(item.name)}
                    </span>
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-foreground/70" />
                    ) : null}
                  </button>
                </Elevated>
              );
            })}
          </div>
        </Elevated>

        <Elevated offset={1} className="rounded-2xl p-4 sm:p-5">
          <SectionLabel>Radius</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RADIUS_PRESETS.map((item) => {
              const selected = item.id === radiusId;
              return (
                <Elevated
                  key={item.id}
                  offset={1}
                  hoverLift
                  className={cn("rounded-xl", selected && "ring-2 ring-ring")}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRadius(item.id)}
                    className="flex w-full flex-col items-center gap-2 rounded-xl px-2 py-2.5 outline-none transition-colors duration-moderate ease-spring hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className="size-6 border-2 border-foreground/45"
                      style={{ borderRadius: item.value }}
                    />
                    <span className="font-medium text-[11px] text-foreground">
                      {item.label}
                    </span>
                  </button>
                </Elevated>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground leading-snug">
            Every corner in the system derives from this one value — the{" "}
            <code className="font-mono">sm/md/lg/xl/2xl/3xl</code> steps are{" "}
            <code className="font-mono">calc()</code> on top of it.
          </p>
        </Elevated>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-7">
        <Elevated offset={1} className="rounded-2xl p-4 sm:p-5">
          <SectionLabel>Live preview</SectionLabel>
          <motion.div
            key={`${palette.name}-${radius.id}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionForOffset(1)}
            className="mt-3"
          >
            <PreviewCard />
          </motion.div>
        </Elevated>

        <Elevated offset={1} className="rounded-2xl p-4 sm:p-5">
          <SectionLabel>Install</SectionLabel>
          <div className="mt-3 flex flex-col gap-3">
            <OutputBlock
              caption={`${paletteLabel(palette.name)} palette — CLI`}
              value={installCommand}
            />
            <OutputBlock
              caption={`${radius.label} radius — paste into your globals.css`}
              value={radiusSnippet}
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground leading-snug">
            Radius is a single custom property, not a registry item — there is
            nothing to install for it, just the snippet above.
          </p>
        </Elevated>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-[0.64rem] text-muted-foreground uppercase tracking-[0.16em]">
      {children}
    </p>
  );
}

function OutputBlock({ caption, value }: { caption: string; value: string }) {
  return (
    <Elevated offset={1} className="overflow-hidden rounded-xl">
      <div className="flex items-start justify-between gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">
            {caption}
          </p>
          <pre className="mt-1 overflow-x-auto font-mono text-[12px] text-foreground leading-relaxed">
            <code>{value}</code>
          </pre>
        </div>
        <CopyButton value={value} size="icon-sm" className="shrink-0" />
      </div>
    </Elevated>
  );
}

// The five chart tokens ship with every palette but nothing in the preview used
// to reference them, so half of what a palette changes was invisible. Class
// names stay literal — Tailwind cannot see an interpolated `bg-chart-${n}`.
const SERIES = [
  { label: "Direct", value: 38, className: "bg-chart-1" },
  { label: "Search", value: 24, className: "bg-chart-2" },
  { label: "Social", value: 18, className: "bg-chart-3" },
  { label: "Email", value: 12, className: "bg-chart-4" },
  { label: "Other", value: 8, className: "bg-chart-5" },
] as const;

/** Small, realistic composition — not a lone control floating on a canvas. */
function PreviewCard() {
  return (
    <Elevated offset={1} className="rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Elevated
            offset={1}
            className="grid size-10 shrink-0 place-items-center rounded-xl font-semibold text-foreground text-sm"
          >
            MU
          </Elevated>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground text-sm">
              Matos workspace
            </p>
            <p className="truncate text-muted-foreground text-xs">
              4 members · updated 2m ago
            </p>
          </div>
        </div>
        <Badge>Pro</Badge>
      </div>

      <Elevated offset={1} className="mt-4 rounded-xl p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Monthly usage</p>
            <p className="mt-1 font-semibold text-2xl text-foreground tracking-[-0.03em]">
              68%
            </p>
          </div>
          <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-[11px] text-accent-foreground">
            +12%
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
          <div className="h-full w-[68%] rounded-full bg-primary" />
        </div>
      </Elevated>

      <Elevated offset={1} className="mt-3 rounded-xl p-3">
        <p className="text-muted-foreground text-xs">Traffic by source</p>
        <div className="mt-2 flex h-2 w-full gap-0.5">
          {SERIES.map((item) => (
            <span
              key={item.label}
              aria-hidden="true"
              className={cn("h-full rounded-full", item.className)}
              style={{ width: `${item.value}%` }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
          {SERIES.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", item.className)}
              />
              {item.label}
            </span>
          ))}
        </div>
      </Elevated>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm">
          Upgrade plan
          <ArrowUpRight data-icon="inline-end" />
        </Button>
        <Button size="sm" variant="ghost">
          Not now
        </Button>
      </div>
    </Elevated>
  );
}
