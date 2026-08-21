"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useThemeCustomizer } from "@/hooks/use-theme-customizer";
import { Link } from "@/i18n/navigation";
import { PALETTES, paletteLabel, RADIUS_PRESETS } from "@/lib/theme-customizer";
import { cn } from "@/lib/utils";
import {
  spring,
  useExitAnimation,
} from "@/registry/new-york-v4/lib/motion-tokens";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Elevated } from "@/registry/new-york-v4/ui/elevated";

export function CustomizeMenu() {
  const [open, setOpen] = useState(false);
  const { mounted, onAnimationComplete } = useExitAnimation(
    open,
    spring.moderate,
  );
  const { isDark, paletteName, radiusId, setPalette, setRadius } =
    useThemeCustomizer();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Dismiss on outside click / Escape. Kept local rather than pulling in a
  // portal primitive: the panel is anchored to the trigger and never needs to
  // escape the header's stacking context.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Customize theme"
        className="size-8"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
      </Button>

      {mounted ? (
        <motion.div
          id={panelId}
          role="dialog"
          aria-label="Customize theme"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={
            open
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: -4, scale: 0.98 }
          }
          transition={spring.moderate}
          onAnimationComplete={onAnimationComplete}
        >
          <Elevated offset={2} className="rounded-xl p-3">
            <SectionLabel>Palette</SectionLabel>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {PALETTES.map((item) => {
                const selected = item.name === paletteName;
                const vars = item.cssVars[isDark ? "dark" : "light"];
                const swatch = vars.primary ?? "";
                return (
                  <Elevated
                    key={item.name}
                    offset={1}
                    hoverLift
                    className={cn("rounded-lg", selected && "ring-2 ring-ring")}
                  >
                    <button
                      type="button"
                      aria-pressed={selected}
                      title={paletteLabel(item.name)}
                      onClick={() => setPalette(item.name)}
                      className="grid w-full place-items-center rounded-lg py-2 outline-none transition-colors duration-moderate ease-spring hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-5 place-items-center rounded-full"
                        style={{ background: swatch }}
                      >
                        {selected ? (
                          // The palette's own foreground, not `background`:
                          // light primaries (amber, lime) leave a white check
                          // barely visible on their own swatch.
                          <Check
                            className="size-3"
                            style={{ color: vars["primary-foreground"] }}
                          />
                        ) : null}
                      </span>
                      <span className="sr-only">{paletteLabel(item.name)}</span>
                    </button>
                  </Elevated>
                );
              })}
            </div>

            <div className="mt-3">
              <SectionLabel>Radius</SectionLabel>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {RADIUS_PRESETS.map((item) => {
                  const selected = item.id === radiusId;
                  return (
                    <Elevated
                      key={item.id}
                      offset={1}
                      hoverLift
                      className={cn(
                        "rounded-lg",
                        selected && "ring-2 ring-ring",
                      )}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setRadius(item.id)}
                        className="flex w-full flex-col items-center gap-1 rounded-lg py-1.5 outline-none transition-colors duration-moderate ease-spring hover:bg-foreground/8 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          aria-hidden="true"
                          className="size-4 border-2 border-foreground/45"
                          style={{ borderRadius: item.value }}
                        />
                        <span className="font-medium text-[10px] text-foreground">
                          {item.label}
                        </span>
                      </button>
                    </Elevated>
                  );
                })}
              </div>
            </div>

            <Link
              href="/customize"
              onClick={close}
              className="mt-3 inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Full customization
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </Elevated>
        </motion.div>
      ) : null}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-[0.6rem] text-muted-foreground uppercase tracking-[0.16em]">
      {children}
    </p>
  );
}
