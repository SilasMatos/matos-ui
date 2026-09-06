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

// A short, curated set — vibrant, distinct, and tuned for a dark UI. Every
// palette is a single identity hue expressed as a coherent scale, mapped onto
// the tokens the system already ships. No new token names, no per-component
// hardcodes.
//
//   primary            → the identity, ~shade 500/600. `primary-foreground` is
//                        white on the deep colours and near-black only where the
//                        primary itself is a bright, light colour (lume).
//   accent             → a wash of the hue: near-white in light mode, a deep
//                        low-luminance tint in dark mode (never grey).
//   accent-foreground  → a *bright* tint of the same hue, so a chip painted with
//                        `bg-accent text-accent-foreground` reads as
//                        "dark colour block, light colour text".
//   ring               → the identity at 50% alpha, for focus rings.
//   chart-1..5         → a real light→deep ramp of the one hue (≈300 → ≈700), so
//                        bars, bullets and segments show depth instead of one
//                        repeated tone.
//   sidebar-*          → mirrors primary.
//
// `palette-ink` stays first — it is the default.
const paletteItems = [
  // Ink — sophisticated graphite / zinc. Near-neutral with a faint cool cast;
  // the chart ramp is a clean greyscale so a five-series chart reads without
  // colour.
  palette("palette-ink", {
    light: {
      primary: "oklch(0.31 0.006 286)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.965 0.003 286)",
      "accent-foreground": "oklch(0.34 0.008 286)",
      ring: "oklch(0.62 0.01 286 / 0.5)",
      "chart-1": "oklch(0.34 0.006 286)",
      "chart-2": "oklch(0.47 0.008 286)",
      "chart-3": "oklch(0.59 0.01 286)",
      "chart-4": "oklch(0.71 0.01 286)",
      "chart-5": "oklch(0.83 0.008 286)",
      "sidebar-primary": "oklch(0.31 0.006 286)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.62 0.01 286 / 0.5)",
    },
    dark: {
      primary: "oklch(0.92 0.004 286)",
      "primary-foreground": "oklch(0.21 0.006 286)",
      accent: "oklch(0.27 0.006 286)",
      "accent-foreground": "oklch(0.9 0.004 286)",
      ring: "oklch(0.55 0.01 286 / 0.5)",
      "chart-1": "oklch(0.92 0.004 286)",
      "chart-2": "oklch(0.8 0.006 286)",
      "chart-3": "oklch(0.68 0.008 286)",
      "chart-4": "oklch(0.56 0.008 286)",
      "chart-5": "oklch(0.45 0.008 286)",
      "sidebar-primary": "oklch(0.92 0.004 286)",
      "sidebar-primary-foreground": "oklch(0.21 0.006 286)",
      "sidebar-ring": "oklch(0.55 0.01 286 / 0.5)",
    },
  }),
  // Lume — energetic lime / chartreuse / acid green. Bright and light, so the
  // foreground is near-black.
  palette("palette-lume", {
    light: {
      primary: "oklch(0.88 0.21 128)",
      "primary-foreground": "oklch(0.24 0.06 128)",
      accent: "oklch(0.96 0.06 128)",
      "accent-foreground": "oklch(0.42 0.13 128)",
      ring: "oklch(0.88 0.21 128 / 0.5)",
      "chart-1": "oklch(0.94 0.13 128)",
      "chart-2": "oklch(0.9 0.19 128)",
      "chart-3": "oklch(0.85 0.21 128)",
      "chart-4": "oklch(0.77 0.2 128)",
      "chart-5": "oklch(0.68 0.17 128)",
      "sidebar-primary": "oklch(0.88 0.21 128)",
      "sidebar-primary-foreground": "oklch(0.24 0.06 128)",
      "sidebar-ring": "oklch(0.88 0.21 128 / 0.5)",
    },
    dark: {
      primary: "oklch(0.88 0.22 128)",
      "primary-foreground": "oklch(0.22 0.06 128)",
      accent: "oklch(0.29 0.06 128)",
      "accent-foreground": "oklch(0.9 0.16 128)",
      ring: "oklch(0.88 0.22 128 / 0.5)",
      "chart-1": "oklch(0.94 0.14 128)",
      "chart-2": "oklch(0.89 0.2 128)",
      "chart-3": "oklch(0.82 0.21 128)",
      "chart-4": "oklch(0.74 0.19 128)",
      "chart-5": "oklch(0.65 0.16 128)",
      "sidebar-primary": "oklch(0.88 0.22 128)",
      "sidebar-primary-foreground": "oklch(0.22 0.06 128)",
      "sidebar-ring": "oklch(0.88 0.22 128 / 0.5)",
    },
  }),
  // Orange — energetic, slightly red-leaning.
  palette("palette-orange", {
    light: {
      primary: "oklch(0.63 0.22 40)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.96 0.045 40)",
      "accent-foreground": "oklch(0.44 0.15 40)",
      ring: "oklch(0.63 0.22 40 / 0.5)",
      "chart-1": "oklch(0.83 0.12 40)",
      "chart-2": "oklch(0.75 0.18 40)",
      "chart-3": "oklch(0.66 0.22 40)",
      "chart-4": "oklch(0.57 0.2 40)",
      "chart-5": "oklch(0.49 0.16 40)",
      "sidebar-primary": "oklch(0.63 0.22 40)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.63 0.22 40 / 0.5)",
    },
    dark: {
      primary: "oklch(0.64 0.21 40)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.28 0.06 40)",
      "accent-foreground": "oklch(0.83 0.13 40)",
      ring: "oklch(0.64 0.21 40 / 0.5)",
      "chart-1": "oklch(0.86 0.11 40)",
      "chart-2": "oklch(0.78 0.16 40)",
      "chart-3": "oklch(0.69 0.2 40)",
      "chart-4": "oklch(0.6 0.2 40)",
      "chart-5": "oklch(0.52 0.17 40)",
      "sidebar-primary": "oklch(0.64 0.21 40)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.64 0.21 40 / 0.5)",
    },
  }),
  // Rose — vivid magenta-pink, never pastel.
  palette("palette-rose", {
    light: {
      primary: "oklch(0.58 0.24 8)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.96 0.04 8)",
      "accent-foreground": "oklch(0.44 0.17 8)",
      ring: "oklch(0.58 0.24 8 / 0.5)",
      "chart-1": "oklch(0.82 0.11 8)",
      "chart-2": "oklch(0.73 0.18 8)",
      "chart-3": "oklch(0.63 0.24 8)",
      "chart-4": "oklch(0.54 0.24 8)",
      "chart-5": "oklch(0.46 0.2 8)",
      "sidebar-primary": "oklch(0.58 0.24 8)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.58 0.24 8 / 0.5)",
    },
    dark: {
      primary: "oklch(0.6 0.24 8)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.28 0.07 8)",
      "accent-foreground": "oklch(0.83 0.12 8)",
      ring: "oklch(0.6 0.24 8 / 0.5)",
      "chart-1": "oklch(0.85 0.1 8)",
      "chart-2": "oklch(0.76 0.16 8)",
      "chart-3": "oklch(0.67 0.23 8)",
      "chart-4": "oklch(0.58 0.24 8)",
      "chart-5": "oklch(0.5 0.21 8)",
      "sidebar-primary": "oklch(0.6 0.24 8)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.6 0.24 8 / 0.5)",
    },
  }),
  // Emerald — intense jewel green.
  palette("palette-emerald", {
    light: {
      primary: "oklch(0.64 0.16 162)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.96 0.04 162)",
      "accent-foreground": "oklch(0.4 0.11 162)",
      ring: "oklch(0.64 0.16 162 / 0.5)",
      "chart-1": "oklch(0.83 0.1 162)",
      "chart-2": "oklch(0.74 0.14 162)",
      "chart-3": "oklch(0.66 0.16 162)",
      "chart-4": "oklch(0.57 0.15 162)",
      "chart-5": "oklch(0.49 0.12 162)",
      "sidebar-primary": "oklch(0.64 0.16 162)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.64 0.16 162 / 0.5)",
    },
    dark: {
      primary: "oklch(0.72 0.17 162)",
      "primary-foreground": "oklch(0.2 0.04 162)",
      accent: "oklch(0.28 0.05 162)",
      "accent-foreground": "oklch(0.85 0.14 162)",
      ring: "oklch(0.72 0.17 162 / 0.5)",
      "chart-1": "oklch(0.88 0.1 162)",
      "chart-2": "oklch(0.8 0.14 162)",
      "chart-3": "oklch(0.72 0.16 162)",
      "chart-4": "oklch(0.63 0.15 162)",
      "chart-5": "oklch(0.54 0.13 162)",
      "sidebar-primary": "oklch(0.72 0.17 162)",
      "sidebar-primary-foreground": "oklch(0.2 0.04 162)",
      "sidebar-ring": "oklch(0.72 0.17 162 / 0.5)",
    },
  }),
  // Azure — electric modern blue.
  palette("palette-azure", {
    light: {
      primary: "oklch(0.55 0.22 256)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.96 0.04 256)",
      "accent-foreground": "oklch(0.42 0.16 256)",
      ring: "oklch(0.55 0.22 256 / 0.5)",
      "chart-1": "oklch(0.81 0.09 256)",
      "chart-2": "oklch(0.71 0.15 256)",
      "chart-3": "oklch(0.61 0.21 256)",
      "chart-4": "oklch(0.52 0.22 256)",
      "chart-5": "oklch(0.44 0.18 256)",
      "sidebar-primary": "oklch(0.55 0.22 256)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.55 0.22 256 / 0.5)",
    },
    dark: {
      primary: "oklch(0.58 0.22 256)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.28 0.07 256)",
      "accent-foreground": "oklch(0.83 0.11 256)",
      ring: "oklch(0.58 0.22 256 / 0.5)",
      "chart-1": "oklch(0.85 0.09 256)",
      "chart-2": "oklch(0.76 0.15 256)",
      "chart-3": "oklch(0.67 0.2 256)",
      "chart-4": "oklch(0.58 0.22 256)",
      "chart-5": "oklch(0.5 0.19 256)",
      "sidebar-primary": "oklch(0.58 0.22 256)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.58 0.22 256 / 0.5)",
    },
  }),
  // Violet — strong, modern, slightly blue-leaning purple.
  palette("palette-violet", {
    light: {
      primary: "oklch(0.56 0.24 288)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.96 0.04 288)",
      "accent-foreground": "oklch(0.42 0.18 288)",
      ring: "oklch(0.56 0.24 288 / 0.5)",
      "chart-1": "oklch(0.82 0.1 288)",
      "chart-2": "oklch(0.72 0.16 288)",
      "chart-3": "oklch(0.62 0.23 288)",
      "chart-4": "oklch(0.54 0.24 288)",
      "chart-5": "oklch(0.46 0.2 288)",
      "sidebar-primary": "oklch(0.56 0.24 288)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.56 0.24 288 / 0.5)",
    },
    dark: {
      primary: "oklch(0.58 0.24 288)",
      "primary-foreground": "oklch(0.985 0 0)",
      accent: "oklch(0.28 0.07 288)",
      "accent-foreground": "oklch(0.84 0.11 288)",
      ring: "oklch(0.58 0.24 288 / 0.5)",
      "chart-1": "oklch(0.85 0.1 288)",
      "chart-2": "oklch(0.76 0.16 288)",
      "chart-3": "oklch(0.68 0.21 288)",
      "chart-4": "oklch(0.59 0.24 288)",
      "chart-5": "oklch(0.51 0.21 288)",
      "sidebar-primary": "oklch(0.58 0.24 288)",
      "sidebar-primary-foreground": "oklch(0.985 0 0)",
      "sidebar-ring": "oklch(0.58 0.24 288 / 0.5)",
    },
  }),
] satisfies PaletteItem[];

export const palettes = paletteItems as unknown as Registry["items"];
