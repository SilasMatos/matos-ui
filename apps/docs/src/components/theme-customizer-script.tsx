"use client";

import { getThemeCustomizerScript } from "@/lib/theme-customizer";

/**
 * Applies the saved palette/radius before first paint, so the default theme
 * never flashes before the stored one.
 *
 * This is a client component on purpose: an inline <script> rendered directly
 * by a Server Component gets dropped from the streamed HTML, so the script
 * never ran and the values only landed after hydration. Rendering it from a
 * client component puts it in the SSR output — the same thing next-themes does
 * for its own dark/light script.
 */
export function ThemeCustomizerScript() {
  return (
    <script
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: pre-paint script
      dangerouslySetInnerHTML={{ __html: getThemeCustomizerScript() }}
    />
  );
}
