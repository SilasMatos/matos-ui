"use client";

import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef } from "react";

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

/** Safety net for the rare case a click arms a transition but no navigation
 *  ever lands (Link declines to navigate, the push gets superseded, …) — the
 *  same guarded-unmount shape as motion-tokens.ts's exitFallbackMs, so the
 *  page doesn't sit "mid transition" forever. */
const TRANSITION_FALLBACK_MS = 1200;

/**
 * Wraps route navigation in the native View Transitions API — the same
 * primitive theme-toggler-button.tsx uses for its reveal, applied here to
 * page changes instead of a theme swap. Timing comes from global.css's
 * `::view-transition-old(root)/::view-transition-new(root)` rule (the
 * duration-slow/ease-spring motion tokens), not a value picked here.
 *
 * Deliberately does not intercept the click or call `preventDefault`. App
 * Router's <Link> already owns navigation (and often extra onClick side
 * effects, e.g. closing a mobile drawer) in its own bubble-phase handler.
 * Racing that would mean either fighting it with `stopPropagation` — which
 * silences every other click handler on the page, not just Link's — or
 * reimplementing navigation ourselves. Instead: arm a transition on click
 * whose "new state" promise stays pending, let Link navigate completely
 * normally, and resolve that promise once the route actually changes (a
 * `useLayoutEffect` on `pathname`, so the DOM has already committed).
 */
export function PageTransitions() {
  const pathname = usePathname();
  const resolveRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  useLayoutEffect(() => {
    settle();
  }, [settle]);

  useLayoutEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${url.pathname}${url.search}`;
      if (next === current) return; // same page — a #hash link, nothing to transition

      const doc = document as DocumentWithViewTransitions;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (typeof doc.startViewTransition !== "function" || prefersReducedMotion)
        return;

      settle(); // in case a previous arm never landed
      doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            timeoutRef.current = setTimeout(settle, TRANSITION_FALLBACK_MS);
          }),
      );
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [settle]);

  return null;
}
