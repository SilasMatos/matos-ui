"use client";

import { Elevated } from "@/registry/new-york-v4/ui/elevated";
import {
  ThemeTogglerButton,
  type ThemeTogglerButtonVariant,
} from "@/registry/new-york-v4/ui/theme-toggler-button";

const variants: { variant: ThemeTogglerButtonVariant; label: string }[] = [
  { variant: "circle", label: "Circle" },
  { variant: "circle-blur", label: "Circle blur" },
  { variant: "iris", label: "Iris" },
  { variant: "rectangle", label: "Rectangle" },
  { variant: "zoom", label: "Zoom" },
  { variant: "fade", label: "Fade" },
  { variant: "polygon", label: "Polygon" },
  { variant: "diagonal", label: "Diagonal" },
  { variant: "slide", label: "Slide" },
  { variant: "blinds", label: "Blinds" },
];

export default function ThemeTogglerButtonDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {variants.map(({ variant, label }) => (
          <Elevated
            key={variant}
            offset={1}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl px-4 py-3"
          >
            <ThemeTogglerButton
              variant={variant}
              aria-label={`Toggle theme (${label})`}
            />
            <span className="text-muted-foreground text-xs">{label}</span>
          </Elevated>
        ))}
      </div>

      <Elevated
        offset={1}
        className="flex flex-wrap items-center justify-center gap-3 rounded-xl px-4 py-3"
      >
        <ThemeTogglerButton size="sm" variant="polygon" direction="ltr" />
        <ThemeTogglerButton size="md" variant="blinds" direction="rtl" />
        <ThemeTogglerButton size="lg" variant="diagonal" direction="ttb" />
        <ThemeTogglerButton
          size="icon"
          variant="circle-blur"
          direction="btt"
          modes={["light", "dark", "system"]}
        />
      </Elevated>
    </div>
  );
}
