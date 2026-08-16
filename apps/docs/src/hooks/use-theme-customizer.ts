"use client";

import { useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";

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
  const isDark = resolvedTheme === "dark";
  const current = useSyncExternalStore(
    subscribeCustomization,
    getCustomization,
    getServerCustomization,
  );

  // Re-apply when light/dark flips: each palette ships a different set of
  // values per mode, and the pre-paint script only ran once.
  useEffect(() => {
    if (!resolvedTheme) return;
    applyCustomization(current, isDark);
  }, [current, isDark, resolvedTheme]);

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
