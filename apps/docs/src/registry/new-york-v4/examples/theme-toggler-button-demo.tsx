"use client";

import {
  ThemeTogglerButton,
  type ThemeTogglerButtonVariant,
} from "@/registry/new-york-v4/ui/theme-toggler-button";

const variants: { variant: ThemeTogglerButtonVariant; label: string }[] = [
  { variant: "circle", label: "Circle" },
  { variant: "circle-blur", label: "Circle blur" },
  { variant: "iris", label: "Iris" },
  { variant: "polygon", label: "Polygon" },
  { variant: "slide", label: "Slide" },
  { variant: "fade", label: "Fade" },
];

export default function ThemeTogglerButtonDemo() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        {variants.map(({ variant, label }) => (
          <div
            key={variant}
            className="flex flex-col items-center gap-2 rounded-lg border border-border/60 px-4 py-3"
          >
            <ThemeTogglerButton
              variant={variant}
              aria-label={`Toggle theme (${label})`}
            />
            <span className="text-muted-foreground text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-border/60 border-t pt-4">
        <ThemeTogglerButton size="sm" variant="polygon" direction="ltr" />
        <ThemeTogglerButton size="md" variant="polygon" direction="rtl" />
        <ThemeTogglerButton size="lg" variant="slide" direction="ttb" />
        <ThemeTogglerButton
          size="icon"
          variant="circle-blur"
          direction="btt"
          modes={["light", "dark", "system"]}
        />
      </div>
    </div>
  );
}
