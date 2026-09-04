// Plain module on purpose (no "use client"): the pre-paint <script> is built on
// the server, so this half must be callable from a server component. The React
// hook lives in hooks/use-theme-customizer.ts.
import { palettes } from "@/registry/registry-palettes";

// registry-palettes.ts types its export as the loose shadcn Registry["items"],
// which drops the cssVars shape. Narrow it here — reading the registry is fine,
// changing it is not.
type PaletteEntry = {
  name: string;
  cssVars: { light: Record<string, string>; dark: Record<string, string> };
};

export const PALETTES = palettes as unknown as PaletteEntry[];

export function paletteLabel(name: string) {
  const bare = name.replace(/^palette-/, "");
  return bare.charAt(0).toUpperCase() + bare.slice(1);
}

export const RADIUS_PRESETS = [
  { id: "sharp", label: "Sharp", value: "0rem" },
  { id: "subtle", label: "Subtle", value: "0.375rem" },
  { id: "default", label: "Default", value: "0.65rem" },
  { id: "round", label: "Round", value: "1rem" },
] as const;

export type RadiusId = (typeof RADIUS_PRESETS)[number]["id"];

export const STORAGE_KEY = "matos-ui:customizer";
/** next-themes' own key. The pre-paint script reads it directly instead of
 *  waiting for next-themes to run first — script order is not guaranteed. */
const THEME_STORAGE_KEY = "theme";

export type Customization = { palette: string; radius: RadiusId };

export const DEFAULT_STATE: Customization = {
  palette: PALETTES[0].name,
  radius: "default",
};

export function resolvePalette(name: string) {
  return PALETTES.find((item) => item.name === name) ?? PALETTES[0];
}

export function resolveRadius(id: RadiusId) {
  return RADIUS_PRESETS.find((item) => item.id === id) ?? RADIUS_PRESETS[2];
}

function readStored(): Customization {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<Customization>;
    return {
      palette: PALETTES.some((item) => item.name === parsed.palette)
        ? (parsed.palette as string)
        : DEFAULT_STATE.palette,
      radius: RADIUS_PRESETS.some((item) => item.id === parsed.radius)
        ? (parsed.radius as RadiusId)
        : DEFAULT_STATE.radius,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

// A module-level store rather than component state: the /customize page and the
// navbar dropdown can be on screen at the same time and must never drift apart.
// Both read this one snapshot.
let state: Customization =
  typeof window === "undefined" ? DEFAULT_STATE : readStored();
const listeners = new Set<() => void>();

export function subscribeCustomization(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCustomization() {
  return state;
}

export function getServerCustomization() {
  return DEFAULT_STATE;
}

/** Writes the choice onto <html>. Mutating custom properties is the only way
 *  real components react — Tailwind classes are static. */
export function applyCustomization(next: Customization, isDark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = resolvePalette(next.palette).cssVars[isDark ? "dark" : "light"];
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
  root.style.setProperty("--radius", resolveRadius(next.radius).value);
}

export function setCustomization(
  patch: Partial<Customization>,
  isDark: boolean,
) {
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / storage disabled: the choice still applies to this page.
  }
  applyCustomization(state, isDark);
  for (const listener of listeners) listener();
}

/**
 * Inline script for the document, run before first paint. Without it the
 * default palette/radius paints first and the saved one snaps in after
 * hydration — the same flash next-themes' own inline script exists to avoid.
 */
export function getThemeCustomizerScript() {
  const data = JSON.stringify({
    key: STORAGE_KEY,
    themeKey: THEME_STORAGE_KEY,
    palettes: Object.fromEntries(
      PALETTES.map((item) => [item.name, item.cssVars]),
    ),
    radii: Object.fromEntries(
      RADIUS_PRESETS.map((item) => [item.id, item.value]),
    ),
  });

  return `(function(){try{var d=${data};var raw=localStorage.getItem(d.key);if(!raw)return;var s=JSON.parse(raw);var el=document.documentElement;var t=localStorage.getItem(d.themeKey)||"system";var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var p=d.palettes[s.palette];if(p){var v=dark?p.dark:p.light;for(var k in v){el.style.setProperty("--"+k,v[k]);}}var r=d.radii[s.radius];if(r){el.style.setProperty("--radius",r);}}catch(e){}})();`;
}
