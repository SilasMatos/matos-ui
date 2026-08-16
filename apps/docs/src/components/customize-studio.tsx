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
              const swatch =
                item.cssVars[isDark ? "dark" : "light"].primary ?? "";
              return (
                <Elevated
                  key={item.name}
                  offset={1}
                  className={cn(
                    "rounded-xl transition-shadow duration-200",
                    selected && "ring-2 ring-ring",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPalette(item.name)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className="size-5 shrink-0 rounded-full"
                      // Swatch is the palette's real `primary`, read straight
                      // from the registry — never a hand-picked stand-in.
                      style={{ background: swatch }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {paletteLabel(item.name)}
                    </span>
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-foreground" />
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
                  className={cn(
                    "rounded-xl transition-shadow duration-200",
                    selected && "ring-2 ring-ring",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRadius(item.id)}
                    className="flex w-full flex-col items-center gap-2 rounded-xl px-2 py-2.5 outline-none transition-colors hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring"
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
          <Badge variant="secondary">+12%</Badge>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-[68%] rounded-full bg-primary" />
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
