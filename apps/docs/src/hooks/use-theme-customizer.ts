"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";

import { getRegistryBaseUrl } from "@/lib/site-url";
import {
  applyCustomization,
  getCustomization,
  getServerCustomization,
  type RadiusId,
  resolvePalette,
  resolveRadius,
  setCustomization,
  subscribeCustomization,
} from "@/lib/theme-customizer";

/**
 * Single source of truth for palette + radius, shared by the /customize page
 * and the navbar dropdown. Both read the same external store, so changing one
 * updates the other in place — there is never a second implementation.
 */
export function useThemeCustomizer() {
  const { resolvedTheme } = useTheme();
  // Deliberately not `resolvedTheme === "dark"` read straight into render:
  // fumadocs' provider can resolve the system theme synchronously on the
  // client's first pass (no matching guess is possible server-side), so any
  // swatch whose *inline* color depends on it — these read raw oklch strings
  // out of `cssVars`, not a `var(--token)` the CSS cascade can settle on its
  // own — hydrates mismatched. Mirroring it into state means the first
  // client render still answers "light", same as the server; the effect
  // below then corrects it one commit later, after hydration is done.
  const [isDark, setIsDark] = useState(false);
  const current = useSyncExternalStore(
    subscribeCustomization,
    getCustomization,
    getServerCustomization,
  );

  useEffect(() => {
    if (!resolvedTheme) return;
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // Re-apply when light/dark flips: each palette ships a different set of
  // values per mode, and the pre-paint script only ran once.
  useEffect(() => {
    if (!resolvedTheme) return;
    applyCustomization(current, resolvedTheme === "dark");
  }, [current, resolvedTheme]);

  const palette = resolvePalette(current.palette);
  const radius = resolveRadius(current.radius);

  return {
    isDark,
    paletteName: current.palette,
    radiusId: current.radius,
    palette,
    radius,
    setPalette: (name: string) => setCustomization({ palette: name }, isDark),
    setRadius: (id: RadiusId) => setCustomization({ radius: id }, isDark),
    installCommand: `npx shadcn add ${getRegistryBaseUrl()}/${palette.name}.json`,
    radiusSnippet: `:root {\n  --radius: ${radius.value};\n}`,
  };
}
