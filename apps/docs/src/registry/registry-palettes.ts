import type { Registry } from "shadcn/schema";

type PaletteItem = {
  name: string;
  type: "registry:theme";
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

function palette(name: string, cssVars: PaletteItem["cssVars"]): PaletteItem {
  return {
    name,
    type: "registry:theme",
    cssVars,
  };
}

const paletteItems = [
  palette("palette-ink", {
    light: {
      primary: "oklch(0.205 0 0)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      ring: "oklch(0.708 0 0)",
      "chart-1": "oklch(0.646 0.222 41.116)",
      "chart-2": "oklch(0.6 0.118 184.704)",
      "chart-3": "oklch(0.398 0.07 227.392)",
      "chart-4": "oklch(0.828 0.189 84.429)",
      "chart-5": "oklch(0.769 0.188 70.08)",
      "sidebar-primary": "oklch(0.205 0 0)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.708 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      "primary-foreground": "oklch(0.205 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.556 0 0)",
      "chart-1": "oklch(0.488 0.243 264.376)",
      "chart-2": "oklch(0.696 0.17 162.48)",
      "chart-3": "oklch(0.769 0.188 70.08)",
      "chart-4": "oklch(0.627 0.265 303.9)",
      "chart-5": "oklch(0.645 0.246 16.439)",
      "sidebar-primary": "oklch(0.488 0.243 264.376)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.556 0 0)",
    },
  }),
  palette("palette-violet", {
    light: {
      primary: "oklch(0.541 0.221 293)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.97 0.018 293)",
      "accent-foreground": "oklch(0.34 0.16 293)",
      ring: "oklch(0.541 0.221 293 / 0.5)",
      "chart-1": "oklch(0.541 0.221 293)",
      "chart-2": "oklch(0.6 0.15 280)",
      "chart-3": "oklch(0.7 0.12 305)",
      "chart-4": "oklch(0.75 0.1 260)",
      "chart-5": "oklch(0.6 0.18 320)",
      "sidebar-primary": "oklch(0.541 0.221 293)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.541 0.221 293 / 0.5)",
    },
    dark: {
      primary: "oklch(0.68 0.19 293)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.269 0.04 293)",
      "accent-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.68 0.19 293 / 0.5)",
      "chart-1": "oklch(0.68 0.19 293)",
      "chart-2": "oklch(0.74 0.14 280)",
      "chart-3": "oklch(0.78 0.12 305)",
      "chart-4": "oklch(0.7 0.13 260)",
      "chart-5": "oklch(0.72 0.16 320)",
      "sidebar-primary": "oklch(0.68 0.19 293)",
      "sidebar-primary-foreground": "oklch(0.145 0 0)",
      "sidebar-ring": "oklch(0.68 0.19 293 / 0.5)",
    },
  }),
  palette("palette-emerald", {
    light: {
      primary: "oklch(0.596 0.145 163)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.97 0.02 163)",
      "accent-foreground": "oklch(0.31 0.09 163)",
      ring: "oklch(0.596 0.145 163 / 0.5)",
      "chart-1": "oklch(0.596 0.145 163)",
      "chart-2": "oklch(0.64 0.13 148)",
      "chart-3": "oklch(0.71 0.11 176)",
      "chart-4": "oklch(0.76 0.1 132)",
      "chart-5": "oklch(0.55 0.14 190)",
      "sidebar-primary": "oklch(0.596 0.145 163)",
      "sidebar-primary-foreground": "oklch(0.145 0 0)",
      "sidebar-ring": "oklch(0.596 0.145 163 / 0.5)",
    },
    dark: {
      primary: "oklch(0.7 0.16 163)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.269 0.035 163)",
      "accent-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.7 0.16 163 / 0.5)",
      "chart-1": "oklch(0.7 0.16 163)",
      "chart-2": "oklch(0.74 0.13 148)",
      "chart-3": "oklch(0.78 0.11 176)",
      "chart-4": "oklch(0.72 0.13 132)",
      "chart-5": "oklch(0.67 0.14 190)",
      "sidebar-primary": "oklch(0.7 0.16 163)",
      "sidebar-primary-foreground": "oklch(0.145 0 0)",
      "sidebar-ring": "oklch(0.7 0.16 163 / 0.5)",
    },
  }),
  palette("palette-copper", {
    light: {
      primary: "oklch(0.666 0.179 58)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.97 0.025 58)",
      "accent-foreground": "oklch(0.35 0.1 58)",
      ring: "oklch(0.666 0.179 58 / 0.5)",
      "chart-1": "oklch(0.666 0.179 58)",
      "chart-2": "oklch(0.6 0.16 38)",
      "chart-3": "oklch(0.74 0.14 78)",
      "chart-4": "oklch(0.8 0.12 92)",
      "chart-5": "oklch(0.58 0.17 24)",
      "sidebar-primary": "oklch(0.666 0.179 58)",
      "sidebar-primary-foreground": "oklch(0.145 0 0)",
      "sidebar-ring": "oklch(0.666 0.179 58 / 0.5)",
    },
    dark: {
      primary: "oklch(0.72 0.17 58)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.269 0.035 58)",
      "accent-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.72 0.17 58 / 0.5)",
      "chart-1": "oklch(0.72 0.17 58)",
      "chart-2": "oklch(0.68 0.15 38)",
      "chart-3": "oklch(0.78 0.13 78)",
      "chart-4": "oklch(0.82 0.12 92)",
      "chart-5": "oklch(0.66 0.16 24)",
      "sidebar-primary": "oklch(0.72 0.17 58)",
      "sidebar-primary-foreground": "oklch(0.145 0 0)",
      "sidebar-ring": "oklch(0.72 0.17 58 / 0.5)",
    },
  }),
] satisfies PaletteItem[];

export const palettes = paletteItems as unknown as Registry["items"];
